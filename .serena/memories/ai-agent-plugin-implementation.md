# AI Agent Plugin Implementation

## Overview
A Vue plugin for integrating an AI assistant panel into VC-Shell framework applications. The plugin provides seamless communication between the VC-Shell application and an external AI agent loaded via iframe.

## Key Features
- ENV-based configuration (`APP_AI_AGENT_URL`)
- Automatic AI button in ALL blade toolbars via wildcard "*" support
- Two operation modes:
  - **List blade** - batch operations with multiple selected items
  - **Details blade** - single object editing with preview
- Custom suggestions per blade
- Reactive data binding via unified `dataRef: Ref<T[]>` API
- Preview state support for showing changed fields
- Built-in logging via centralized logger

## File Structure
```
framework/core/plugins/ai-agent/
├── index.ts                    # Main plugin, install()
├── types.ts                    # All TypeScript interfaces and types
├── constants.ts                # Constants, message types, defaults
├── README.md                   # Documentation
├── services/
│   └── ai-agent-service.ts     # Panel state, postMessage, context management
├── composables/
│   ├── index.ts
│   ├── useAiAgent.ts           # Panel control, toolbar button registration
│   └── useAiAgentContext.ts    # Context binding + preview state
└── components/
    ├── index.ts
    ├── VcAiAgentPanel.vue      # Main panel component
    └── _internal/
        ├── VcAiAgentHeader.vue  # Panel header with close/expand buttons
        └── VcAiAgentIframe.vue  # Iframe container for chatbot
```

## Plugin Installation Flow

### 1. Plugin Registration (index.ts)
```typescript
export const aiAgentPlugin = {
  install(app: App, options: AiAgentPluginOptions = {}) {
    // Get URL from env or options
    const url = config.url || import.meta.env[AI_AGENT_URL_ENV_KEY] || "";
    
    // Skip if no URL
    if (!url) {
      logger.info("AI Agent plugin skipped: no URL configured");
      return;
    }
    
    // Merge config with defaults
    const finalConfig: IAiAgentConfig = {
      ...DEFAULT_AI_AGENT_CONFIG,
      ...config,
      url,
    };
    
    // Provide config via dependency injection
    app.config.globalProperties.$aiAgentConfig = finalConfig;
    app.provide("aiAgentConfig", finalConfig);
    app.provide("aiAgentAddGlobalToolbarButton", addGlobalToolbarButton);
  },
};
```

### 2. Service Initialization (provideAiAgentService in useAiAgent.ts)
Called from VcApp component to create and provide the service:
```typescript
export function provideAiAgentService(options?: ProvideAiAgentServiceOptions) {
  // Create service with getters for reactive context
  const service = createAiAgentService({
    userGetter: () => ({...user.value}),
    bladeGetter: () => ({...lastBlade}),
    localeGetter: () => languageService?.currentLocale.value,
    navigateToBlade: (bladeName, param, options) => {...},
    reloadBlade: () => {...},
    initialConfig: options?.config,
  });
  
  // Provide service for injection
  provide(AiAgentServiceKey, service);
  
  // Register global toolbar button with wildcard "*"
  if (addGlobalToolbarButton && toolbarService) {
    toolbarService.registerToolbarItem(
      { id, icon, title, clickHandler: () => service.togglePanel() },
      "*", // Wildcard for all blades
    );
  }
  
  return service;
}
```

### 3. Toolbar Button Registration
The toolbar service supports wildcard "*" for global buttons:
```typescript
// In toolbar-service.ts
const getToolbarItems = (bladeId: string): IToolbarItem[] => {
  const normalizedBladeId = bladeId.toLowerCase();
  const bladeItems = toolbarRegistry[normalizedBladeId] || [];
  const globalItems = toolbarRegistry["*"] || [];
  
  // Merge items, avoiding duplicates by id
  const allItems = [...bladeItems];
  for (const globalItem of globalItems) {
    if (!allItems.some((item) => item.id === globalItem.id)) {
      allItems.push(globalItem);
    }
  }
  return allItems;
};
```

## Core Service (createAiAgentService)

### State Management
```typescript
const panelState = ref<AiAgentPanelState>("closed"); // "closed" | "open" | "expanded"
const config = ref<IAiAgentConfig>({...});
const iframeRef: ShallowRef<HTMLIFrameElement | null> = shallowRef(null);
const contextItems = ref<Record<string, unknown>[]>([]);
const contextType = ref<AiAgentContextType>("list"); // "list" | "details"
const contextSuggestions = ref<ISuggestion[] | undefined>(undefined);
```

### Key Methods
- `openPanel()` / `closePanel()` / `togglePanel()` - Panel state control
- `expandPanel()` / `collapsePanel()` - Size control
- `sendMessage(type, payload)` - Send message to iframe
- `onMessage(handler)` - Register message handler (returns unsubscribe)
- `_setContextData(items, type, suggestions)` - Set context from useAiAgentContext
- `_onPreviewChanges(handler)` - Register preview changes handler

### Context Payload Building
```typescript
const buildInitContextPayload = (): IInitContextPayload => ({
  userId: userGetter()?.id || "",
  locale: localeGetter(),
  blade: toBladeContext(bladeGetter()),
  contextType: contextType.value,
  items: cloneDeep(contextItems.value), // Deep clone for postMessage
  suggestions: contextSuggestions.value ? cloneDeep(contextSuggestions.value) : undefined,
});
```

### Message Handling
```typescript
_handleIncomingMessage = (event: MessageEvent): void => {
  // Validate origin
  if (!allowedOrigins.includes("*") && !allowedOrigins.includes(event.origin)) {
    return;
  }
  
  switch (message.type) {
    case "CHAT_READY":
      sendRawMessage({ type: "INIT_CONTEXT", payload: buildInitContextPayload() });
      break;
    case "NAVIGATE_TO_APP":
      navigateToBlade(payload.bladeName, payload.param, payload.options);
      break;
    case "RELOAD_BLADE":
      reloadBlade();
      break;
    case "PREVIEW_CHANGES":
      previewChangesHandlers.forEach(handler => handler(payload));
      break;
    case "DOWNLOAD_FILE":
      downloadFile(payload);
      break;
    // ...
  }
};
```

## useAiAgentContext Composable

### Purpose
Connects blade data to AI agent context and handles preview state.

### Implementation
```typescript
export function useAiAgentContext<T>(options: UseAiAgentContextOptions<T>): UseAiAgentContextReturn {
  const { dataRef, suggestions } = options;
  const service = inject(AiAgentServiceKey);
  
  // Determine context type: array = list, object = details
  const detectedContextType = isArrayRef(dataRef) ? "list" : "details";
  
  // Watch and update context on data changes
  watch(dataRef, () => {
    const items = normalizeToArray(dataRef.value);
    service._setContextData(items, detectedContextType, suggestions);
  }, { deep: true, immediate: true });
  
  // Handle PREVIEW_CHANGES
  service._onPreviewChanges((payload) => {
    const target = getTargetForChanges(dataRef);
    Object.keys(payload.data).forEach(key => {
      target[key] = payload.data[key];
    });
    isPreviewActive.value = true;
    changedFieldsList.value = payload.changedFields || Object.keys(payload.data);
  });
  
  return {
    previewState: {
      isActive: computed(() => isPreviewActive.value),
      changedFields: computed(() => changedFieldsList.value),
    },
  };
}
```

## PostMessage Protocol

### Shell → Agent
| Type | Payload | Trigger |
|------|---------|---------|
| `INIT_CONTEXT` | `{userId, locale, blade, contextType, items, suggestions}` | On `CHAT_READY` from agent |
| `UPDATE_CONTEXT` | `{blade, contextType, items, suggestions, locale}` | On context changes |

### Agent → Shell
| Type | Payload | Action |
|------|---------|--------|
| `CHAT_READY` | - | Send `INIT_CONTEXT` |
| `PREVIEW_CHANGES` | `{data, changedFields}` | Apply preview to form |
| `APPLY_CHANGES` | `{changes}` | Apply and save changes |
| `RELOAD_BLADE` | `{clearSelection?}` | Reload current blade |
| `DOWNLOAD_FILE` | `{filename, contentType, content}` | Trigger file download |
| `NAVIGATE_TO_APP` | `{bladeName, param?, options?}` | Navigate to blade |
| `CHAT_ERROR` | `{code, message}` | Log error |

## Configuration

### IAiAgentConfig
```typescript
interface IAiAgentConfig {
  url: string;                    // AI agent iframe URL
  title?: string;                 // Panel title (default: "Virto OZ")
  width?: number;                 // Panel width (default: 350)
  expandedWidth?: number;         // Expanded width (default: 500)
  allowedOrigins?: string[];      // Allowed origins for postMessage (default: ["*"])
}
```

### Environment Variable
```env
APP_AI_AGENT_URL=https://your-ai-agent.com
```

## Usage Examples

### List Blade (Batch Operations)
```typescript
const selectedItems = ref<IItem[]>([]);
useAiAgentContext({ dataRef: selectedItems });

// On table selection change
const onSelectionChanged = (items: IItem[]) => {
  selectedItems.value = items;
};
```

### Details Blade (Single Object)
```typescript
const item = ref<IItem>({});
const aiData = ref<IItem[]>([]);

// Sync single object to array
watch(item, (val) => {
  aiData.value = val ? [val] : [];
}, { deep: true, immediate: true });

const { previewState } = useAiAgentContext({ dataRef: aiData });

// Use previewState.isActive and previewState.changedFields
```

### Custom Suggestions
```typescript
useAiAgentContext({
  dataRef: aiData,
  suggestions: [
    { id: "translate", title: "Translate", icon: "translation", prompt: "Translate..." },
    { id: "optimize", title: "Optimize SEO", icon: "search", prompt: "Optimize..." },
  ],
});
```

## Key Implementation Details

### Data Serialization for postMessage
Uses `cloneDeep` from lodash-es to ensure Vue reactive proxies are fully serialized before postMessage (structured clone algorithm cannot clone proxies).

### Reactivity in Toolbar
The toolbar uses computed property that accesses `registeredToolbarItems.length` to create reactive dependency:
```typescript
const visibleItems = computed(() => {
  void registeredToolbarItems.length; // Create reactive dependency
  return getToolbarItems().filter(...).sort(...);
});
```

### Auto-registration of Listener
Service auto-registers message listener on creation:
```typescript
// At end of createAiAgentService
_startListening();
```

### Cleanup on Unmount
useAiAgentContext cleans up on component unmount:
```typescript
onUnmounted(() => {
  stopWatch();
  unsubscribe();
  service._setContextData([], "list", undefined);
});
```

## Key Files Modified from Framework

1. `framework/index.ts` - Auto-install aiAgentPlugin in VirtoShellFramework.install()
2. `framework/core/services/toolbar-service.ts` - Wildcard "*" support
3. `framework/ui/components/organisms/vc-app/vc-app.vue` - provideAiAgentService() call
4. `framework/ui/components/organisms/vc-blade/_internal/vc-blade-toolbar/vc-blade-toolbar.vue` - Reactivity fix

## Constants (constants.ts)

```typescript
export const DEFAULT_AI_AGENT_CONFIG: IAiAgentConfig = {
  url: "",
  title: "Virto OZ",
  width: 350,
  expandedWidth: 500,
  allowedOrigins: ["*"],
};

export const AI_AGENT_URL_ENV_KEY = "APP_AI_AGENT_URL";
export const AI_AGENT_TOOLBAR_BUTTON_ID = "ai-agent-toggle";
export const AI_AGENT_TOOLBAR_BUTTON_ICON = "lucide-sparkles";
export const AI_AGENT_TOOLBAR_BUTTON_TITLE = "AI Assistant";

export const SHELL_TO_CHAT_MESSAGE_TYPES = {
  INIT_CONTEXT: "INIT_CONTEXT",
  UPDATE_CONTEXT: "UPDATE_CONTEXT",
} as const;

export const CHAT_TO_SHELL_MESSAGE_TYPES = {
  CHAT_READY: "CHAT_READY",
  NAVIGATE_TO_APP: "NAVIGATE_TO_APP",
  EXPAND_IN_CHAT: "EXPAND_IN_CHAT",
  RELOAD_BLADE: "RELOAD_BLADE",
  PREVIEW_CHANGES: "PREVIEW_CHANGES",
  APPLY_CHANGES: "APPLY_CHANGES",
  DOWNLOAD_FILE: "DOWNLOAD_FILE",
  SHOW_MORE: "SHOW_MORE",
  CHAT_ERROR: "CHAT_ERROR",
} as const;
```

## Types Reference (types.ts)

### Main Interfaces
- `IAiAgentService` - Public service interface
- `IAiAgentServiceInternal` - Extended internal interface with private methods
- `IAiAgentConfig` - Configuration interface
- `IAiAgentContext` - Full context with user, blade, items
- `IAiAgentBladeContext` - Blade info (id, name, title, param, options)
- `IAiAgentUserContext` - User info (id, userName, isAdministrator, permissions)
- `IAiAgentMessage` - Message structure (type, payload, timestamp)
- `ISuggestion` - Suggestion card (id, title, icon, iconColor, prompt)

### Payload Interfaces
- `IInitContextPayload` - INIT_CONTEXT payload
- `IUpdateContextPayload` - UPDATE_CONTEXT payload
- `IPreviewChangesPayload` - PREVIEW_CHANGES payload (data, changedFields)
- `IApplyChangesPayload` - APPLY_CHANGES payload
- `IDownloadFilePayload` - DOWNLOAD_FILE payload (filename, contentType, content)
- `INavigateToAppPayload` - NAVIGATE_TO_APP payload (bladeName, param, options)
- `IChatErrorPayload` - CHAT_ERROR payload (code, message)

### Type Aliases
- `AiAgentPanelState = "closed" | "open" | "expanded"`
- `AiAgentContextType = "list" | "details"`
- `AiAgentMessageType = string`
- `ShellToChatMessageType` - Union of shell-to-chat message types
- `ChatToShellMessageType` - Union of chat-to-shell message types
