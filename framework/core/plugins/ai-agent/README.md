# AI Agent Plugin for VC-Shell

A Vue plugin for integrating an AI assistant panel into VC-Shell applications.

## Features

- ENV-based configuration (`APP_AI_AGENT_URL`)
- Automatic AI button in blade toolbars (via wildcard "*" support)
- Two operation modes:
  - **List blade** - batch operations with multiple selected items
  - **Details blade** - single object editing with preview
- Custom suggestions per blade
- Reactive data binding between blade and agent
- Simple integration API with minimal boilerplate

## Installation

### 1. Set Environment Variable

```env
APP_AI_AGENT_URL=https://your-ai-agent-url.com
```

### 2. Install Plugin in main.ts

```typescript
import { createApp } from "vue";
import { aiAgentPlugin } from "@vc-shell/framework";

const app = createApp(App);

// Install with options (optional)
app.use(aiAgentPlugin, {
  config: {
    title: "AI Assistant",
    width: 400,
  },
  addGlobalToolbarButton: true, // default: true
});
```

## Usage

### List Blade (Batch Operations)

```typescript
// offers-list.vue
import { ref, watch } from "vue";
import { useAiAgentContext } from "@vc-shell/framework";

const selectedOffers = ref<IOffer[]>([]);

// Connect to AI agent
useAiAgentContext({ dataRef: selectedOffers });

// When table selection changes, pass full objects
const onSelectionChanged = (items: IOffer[]) => {
  selectedOffers.value = items;
};
```

### Details Blade (Single Object)

```typescript
// offers-details.vue
import { ref, watch } from "vue";
import { useAiAgentContext } from "@vc-shell/framework";

const offer = ref<IOffer>({});
const aiData = ref<IOffer[]>([]); // Always array!

// Sync single object to array
watch(
  offer,
  (val) => {
    aiData.value = val ? [val] : [];
  },
  { deep: true, immediate: true }
);

// Connect to AI agent with preview support
const { previewState } = useAiAgentContext({ dataRef: aiData });

// Use previewState.isActive to show preview indicator
// Use previewState.changedFields to highlight changed fields
```

### Custom Suggestions

```typescript
useAiAgentContext({
  dataRef: aiData,
  suggestions: [
    {
      id: "translate",
      title: "Translate description",
      icon: "translation",
      iconColor: "#FF4A4A",
      prompt: "Translate the offer description to English",
    },
    {
      id: "seo",
      title: "Optimize SEO",
      icon: "search",
      iconColor: "#57AB79",
      prompt: "Optimize SEO for this offer",
    },
  ],
});
```

### Manual Panel Control

```typescript
import { useAiAgent } from "@vc-shell/framework";

const { togglePanel, isOpen, openPanel, closePanel } = useAiAgent();

// Toggle AI panel
const handleAiClick = () => togglePanel();

// Listen for messages from AI agent
const { onMessage } = useAiAgent();
onMessage((message) => {
  if (message.type === "PREVIEW_CHANGES") {
    // Handle preview changes
  }
});
```

## API Reference

### aiAgentPlugin

Vue plugin for AI agent integration.

**Options:**

| Option                  | Type                      | Default | Description                      |
| ----------------------- | ------------------------- | ------- | -------------------------------- |
| `config`                | `Partial<IAiAgentConfig>` | `{}`    | AI agent configuration           |
| `addGlobalToolbarButton` | `boolean`                 | `true`  | Add AI button to all toolbars    |

### useAiAgentContext

Composable for binding blade data to AI agent context.

**Options:**

```typescript
interface UseAiAgentContextOptions<T = Record<string, unknown>> {
  /**
   * Ref with data - ALWAYS an array:
   * - For DETAILS blade: array with single object [item]
   * - For LIST blade: array of selected objects [item1, item2, ...]
   */
  dataRef: Ref<T[]>;

  /** Custom suggestions for this blade */
  suggestions?: ISuggestion[];
}
```

**Returns:**

```typescript
interface UseAiAgentContextReturn {
  previewState: {
    isActive: ComputedRef<boolean>;
    changedFields: ComputedRef<string[]>;
  };
}
```

### useAiAgent

Composable for panel control and communication.

**Returns:**

```typescript
interface UseAiAgentReturn {
  panelState: Ref<"closed" | "open" | "expanded">;
  config: Ref<IAiAgentConfig>;
  context: ComputedRef<IAiAgentContext>;
  isOpen: ComputedRef<boolean>;
  isExpanded: ComputedRef<boolean>;
  totalItemsCount: ComputedRef<number>;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  expandPanel: () => void;
  collapsePanel: () => void;
  setConfig: (config: Partial<IAiAgentConfig>) => void;
  sendMessage: (type: AiAgentMessageType, payload: unknown) => void;
  onMessage: (handler: (event: IAiAgentMessage) => void) => () => void;
}
```

### ISuggestion

Custom suggestion card interface.

```typescript
interface ISuggestion {
  id: string;
  title: string;
  icon: string;
  iconColor?: string;
  prompt: string;
}
```

## PostMessage Protocol

### Shell -> Agent

**INIT_CONTEXT** (on panel open)

```typescript
{
  type: "INIT_CONTEXT",
  payload: {
    userId: string,
    locale: string,
    blade: { id, name, title, param },
    items: Record<string, unknown>[], // Always array
    suggestions?: ISuggestion[],
  }
}
```

**UPDATE_CONTEXT** (on changes)

```typescript
{
  type: "UPDATE_CONTEXT",
  payload: {
    blade: { id, name, title, param },
    items: Record<string, unknown>[], // Always array of full objects
    suggestions?: ISuggestion[],
    locale?: string,
  }
}
```

### Agent -> Shell

**PREVIEW_CHANGES** (form preview)

```typescript
{
  type: "PREVIEW_CHANGES",
  payload: {
    data: Record<string, unknown>,
    changedFields?: string[],
  }
}
```

**RELOAD_BLADE** (after save)

```typescript
{
  type: "RELOAD_BLADE",
  payload: { clearSelection?: boolean }
}
```

**DOWNLOAD_FILE** (file download)

```typescript
{
  type: "DOWNLOAD_FILE",
  payload: {
    filename: string,
    contentType: string,
    content: string // base64
  }
}
```

**NAVIGATE_TO_APP** (navigation)

```typescript
{
  type: "NAVIGATE_TO_APP",
  payload: { bladeName, param?, options? }
}
```

## Architecture

```
Shell (VcApp)                          Agent (iframe)
     │                                       │
     │────── INIT_CONTEXT ─────────────────>│
     │       (userId, locale, blade, items) │
     │                                       │
     │<───── CHAT_READY ────────────────────│
     │                                       │
     │────── UPDATE_CONTEXT ───────────────>│
     │       (blade, items, suggestions)    │
     │                                       │
     │<───── PREVIEW_CHANGES ───────────────│
     │       (updates form in shell)        │
     │                                       │
     │<───── RELOAD_BLADE ──────────────────│
     │       (refreshes current blade)      │
     │                                       │
     │<───── DOWNLOAD_FILE ─────────────────│
     │       (triggers file download)       │
     └───────────────────────────────────────┘
```

## File Structure

```
framework/core/plugins/ai-agent/
├── index.ts                    # Plugin entry point
├── types.ts                    # TypeScript interfaces
├── constants.ts                # Default values
├── README.md                   # This file
├── services/
│   └── ai-agent-service.ts     # Panel state, postMessage
├── composables/
│   ├── index.ts
│   ├── useAiAgent.ts           # Panel control
│   └── useAiAgentContext.ts    # Data binding + preview
└── components/
    ├── index.ts
    ├── VcAiAgentPanel.vue      # Main panel
    └── _internal/
        ├── VcAiAgentHeader.vue
        └── VcAiAgentIframe.vue
```
