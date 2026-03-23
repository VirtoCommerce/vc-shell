# AI Agent Plugin

Integrates an AI assistant panel (chatbot iframe) into the vc-shell application. Provides blade-aware context passing, bidirectional postMessage communication, and preview/apply workflows.

## Overview

The AI agent plugin embeds an external chatbot via an iframe panel that slides in from the right side of the application. It automatically sends the current blade context (user, active blade, selected items) to the chatbot and handles incoming commands (navigate, preview changes, download files). The plugin is optional -- if no `APP_AI_AGENT_URL` environment variable or `config.url` is provided, it silently skips installation.

## Installation / Registration

```typescript
// Option 1: Via environment variable (recommended)
// Set APP_AI_AGENT_URL in your .env file
// The framework installs the plugin automatically.

// Option 2: Explicit installation
import { aiAgentPlugin } from "@vc-shell/framework";

app.use(aiAgentPlugin, {
  config: {
    url: "https://ai.example.com/chat",
    title: "AI Assistant",
    width: 400,
  },
  addGlobalToolbarButton: true,
});
```

## API

### Plugin Options: `AiAgentPluginOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `config` | `Partial<IAiAgentConfig>` | `{}` | Panel configuration (see below) |
| `addGlobalToolbarButton` | `boolean` | `true` | Adds an AI button to every blade's toolbar |

### `IAiAgentConfig`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `url` | `string` | `""` | Chatbot iframe URL (required) |
| `title` | `string` | `"Virto OZ"` | Panel header title |
| `width` | `number` | `362` | Panel width in pixels |
| `expandedWidth` | `number` | `500` | Panel width when expanded |
| `allowedOrigins` | `string[]` | `["*"]` | Allowed origins for postMessage validation |

### Composable: `useAiAgent()`

Access the AI agent service from any component within the app.

| Return | Type | Description |
|--------|------|-------------|
| `panelState` | `Ref<"closed" \| "open" \| "expanded">` | Current panel state |
| `isOpen` | `ComputedRef<boolean>` | Whether the panel is visible |
| `isExpanded` | `ComputedRef<boolean>` | Whether the panel is in expanded mode |
| `totalItemsCount` | `ComputedRef<number>` | Number of context items |
| `config` | `Ref<IAiAgentConfig>` | Current configuration |
| `context` | `ComputedRef<IAiAgentContext>` | Full reactive context |
| `openPanel()` | `() => void` | Open the AI panel |
| `closePanel()` | `() => void` | Close the AI panel |
| `togglePanel()` | `() => void` | Toggle open/close |
| `expandPanel()` | `() => void` | Expand to larger width |
| `collapsePanel()` | `() => void` | Collapse to normal width |
| `setConfig()` | `(config: Partial<IAiAgentConfig>) => void` | Update configuration |
| `sendMessage()` | `(type, payload) => void` | Send message to chatbot iframe |
| `onMessage()` | `(handler) => () => void` | Register message handler (returns unsubscribe) |

### Composable: `useAiAgentContext(options)`

Binds blade data to the AI agent context. Call this in each blade that should participate in AI interactions.

| Option | Type | Description |
|--------|------|-------------|
| `dataRef` | `Ref<T> \| Ref<T[]>` | Data to send (single object for details, array for list) |
| `suggestions` | `ISuggestion[]` | Custom suggestion cards for the chatbot UI |

| Return | Type | Description |
|--------|------|-------------|
| `previewState.isActive` | `ComputedRef<boolean>` | Whether AI-suggested changes are being previewed |
| `previewState.changedFields` | `ComputedRef<string[]>` | List of field names with pending changes |

### PostMessage Protocol

**Shell to Chatbot:**
- `INIT_CONTEXT` -- Initial context when chatbot loads (user, blade, items, suggestions, token)
- `UPDATE_CONTEXT` -- Context updates when blade/items change

**Chatbot to Shell:**
- `CHAT_READY` -- Chatbot finished loading
- `NAVIGATE_TO_APP` -- Open a specific blade
- `PREVIEW_CHANGES` -- Preview data changes in the form
- `APPLY_CHANGES` -- Apply confirmed changes
- `RELOAD_BLADE` -- Reload the current blade
- `DOWNLOAD_FILE` -- Download a file (base64)
- `CHAT_ERROR` -- Error from chatbot

## Usage

### Binding Blade Data to AI Context

```typescript
// In a details blade
const product = ref<Product>({});
const { previewState } = useAiAgentContext({
  dataRef: product,
  suggestions: [
    { id: "translate", title: "Translate", icon: "translation", prompt: "Translate to English" },
  ],
});

// In a list blade
const { selectedItems } = useTableSelection<Order>();
useAiAgentContext({ dataRef: selectedItems });
```

### Toggling the Panel Programmatically

```typescript
const { togglePanel, isOpen } = useAiAgent();

function onAiButtonClick() {
  togglePanel();
}
```

### Listening for Chatbot Messages

```typescript
const { onMessage } = useAiAgent();

onMessage((message) => {
  if (message.type === "NAVIGATE_TO_APP") {
    console.log("Chatbot wants to navigate to:", message.payload);
  }
});
```

### Preview State Visual Feedback

```vue
<template>
  <VcInput
    v-model="product.name"
    :class="{ 'ai-preview': previewState.changedFields.value.includes('name') }"
  />
</template>
```

## Related

- `framework/core/plugins/ai-agent/services/ai-agent-service.ts` -- core service factory (`createAiAgentService`)
- `framework/core/plugins/ai-agent/composables/useAiAgentContext.ts` -- blade context binding
- `framework/core/plugins/ai-agent/components/VcAiAgentPanel.vue` -- the panel UI component
- `framework/core/plugins/ai-agent/types.ts` -- all TypeScript interfaces
- `framework/core/plugins/ai-agent/constants.ts` -- default config, message type constants
