---
title: AI Agent
category: plugins
group: root
slug: ai-agent
---

# AI Agent Plugin

Integrates an AI assistant panel (chatbot iframe) into the vc-shell application. Provides blade-aware context passing and bidirectional postMessage communication.

## Overview

The AI agent plugin embeds an external chatbot via an iframe panel that slides in from the right side of the application. It automatically sends the current blade context (user, active blade, selected items) to the chatbot and handles incoming commands (navigate, download files). The plugin is optional -- if no `APP_AI_AGENT_URL` environment variable or `config.url` is provided, it silently skips installation.

## When to Use

- Embed an AI assistant chatbot panel into your vc-shell application with automatic blade context passing
- When NOT to use: if you don't have an AI agent backend -- the plugin silently skips when no `APP_AI_AGENT_URL` is set

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

| Option                   | Type                      | Default | Description                                |
| ------------------------ | ------------------------- | ------- | ------------------------------------------ |
| `config`                 | `Partial<IAiAgentConfig>` | `{}`    | Panel configuration (see below)            |
| `addGlobalToolbarButton` | `boolean`                 | `true`  | Adds an AI button to every blade's toolbar |

### `IAiAgentConfig`

| Field            | Type       | Default      | Description                                                                                                                                               |
| ---------------- | ---------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`            | `string`   | `""`         | Chatbot iframe URL (required)                                                                                                                             |
| `title`          | `string`   | `"Virto OZ"` | Panel header title                                                                                                                                        |
| `width`          | `number`   | `362`        | Panel width in pixels                                                                                                                                     |
| `expandedWidth`  | `number`   | `500`        | Panel width when expanded                                                                                                                                 |
| `allowedOrigins` | `string[]` | `[]`         | Origins accepted for **incoming** postMessage; the first entry is the target origin for **outbound** messages to the chatbot iframe. Required — see below |
| `parentOrigin`   | `string`   | --           | Explicit parent origin for **outbound** embedded postMessage. Required in embedded mode — see below                                                       |

!!! danger "Origins must be configured — secure by default"
The bridge is locked down by default. Set both fields to explicit origins; a wildcard `"*"` or empty value is refused (the message is dropped and logged), never trusted.

- **`allowedOrigins`** governs messages the shell **accepts**, and its first entry is the target origin the shell uses to **send** `INIT_CONTEXT`/`UPDATE_CONTEXT` to the chatbot iframe. With the default `[]`, all incoming postMessages are ignored and outbound iframe messages are dropped (these carry the access token, so they are never sent to `"*"`). Set it to the chatbot's origin(s), e.g. `["https://chat.example.com"]`. A `"*"` entry is rejected outright — replace it with explicit origins.
- **`parentOrigin`** governs messages the shell **sends to the parent frame** in embedded mode (`AI_CONTEXT_UPDATE`, `AI_TOGGLE_PANEL`, etc.). These payloads can carry the access token, so with no explicit `parentOrigin` (or `"*"`) the outbound message is dropped. Set it to the exact host origin, e.g. `"https://host.example.com"`.

```ts
app.use(AiAgentPlugin, {
  config: {
    url: "https://chat.example.com",
    allowedOrigins: ["https://chat.example.com"], // incoming
    parentOrigin: "https://host.example.com", // outbound (embedded mode)
  },
});
```

### Composable: `useAiAgent()`

Access the AI agent service from any component within the app.

Returns `UseAiAgentReturn | undefined`. When `provideAiAgentService()` has not run, `useAiAgent()` logs an error and returns `undefined`, so guard the result before destructuring (e.g. `const ai = useAiAgent(); ai?.togglePanel()`).

| Return            | Type                                        | Description                                    |
| ----------------- | ------------------------------------------- | ---------------------------------------------- |
| `panelState`      | `Ref<"closed" \| "open" \| "expanded">`     | Current panel state                            |
| `isOpen`          | `ComputedRef<boolean>`                      | Whether the panel is visible                   |
| `isExpanded`      | `ComputedRef<boolean>`                      | Whether the panel is in expanded mode          |
| `totalItemsCount` | `ComputedRef<number>`                       | Number of context items                        |
| `config`          | `Ref<IAiAgentConfig>`                       | Current configuration                          |
| `context`         | `ComputedRef<IAiAgentContext>`              | Full reactive context                          |
| `openPanel()`     | `() => void`                                | Open the AI panel                              |
| `closePanel()`    | `() => void`                                | Close the AI panel                             |
| `togglePanel()`   | `() => void`                                | Toggle open/close                              |
| `expandPanel()`   | `() => void`                                | Expand to larger width                         |
| `collapsePanel()` | `() => void`                                | Collapse to normal width                       |
| `setConfig()`     | `(config: Partial<IAiAgentConfig>) => void` | Update configuration                           |
| `sendMessage()`   | `(type, payload) => void`                   | Send message to chatbot iframe                 |
| `onMessage()`     | `(handler) => () => void`                   | Register message handler (returns unsubscribe) |

### Composable: `useAiAgentContext(options)`

Binds blade data to the AI agent context. Call this in each blade that should participate in AI interactions.

| Option        | Type                 | Description                                              |
| ------------- | -------------------- | -------------------------------------------------------- |
| `dataRef`     | `Ref<T> \| Ref<T[]>` | Data to send (single object for details, array for list) |
| `suggestions` | `ISuggestion[]`      | Custom suggestion cards for the chatbot UI               |

The composable returns `void`. It wires the watcher and the unmount cleanup; nothing is exposed to the caller.

### PostMessage Protocol

**Shell to Chatbot:**

- `INIT_CONTEXT` -- Initial context when chatbot loads (user, blade, items, suggestions, token)
- `UPDATE_CONTEXT` -- Context updates when blade/items change

**Chatbot to Shell:**

- `CHAT_READY` -- Chatbot finished loading
- `NAVIGATE_TO_APP` -- Open a specific blade (driven by markdown action links in assistant messages)
- `EXPAND_IN_CHAT` -- Expand an item inline in the chat (markdown action link)
- `SHOW_MORE` -- Request the next page of a result category (markdown action link)
- `CLOSE_PANEL` -- Close the panel. No payload.

### Closing the panel from the keyboard -- the chatbot has to help

The panel closes on `Escape` and toggles on `Ctrl/Cmd+I`, but those handlers listen on the **host** document. A keystroke is delivered to the document that owns the focused element, so once the chatbot takes focus -- most chat UIs autofocus their input on load -- the host never sees it. Nothing the shell can do changes that: the panel is a cross-origin iframe, so its key events are not observable from here.

**An embedded chatbot must therefore relay its own dismiss keys:**

```js
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "i")) {
    event.preventDefault();
    window.parent.postMessage({ type: "CLOSE_PANEL" }, "https://your-shell-origin.example.com");
  }
});
```

Without that relay the only keyboard route out is `Shift+Tab` from the first focusable element in the chat, which lands on the panel header's Close button. That is a route, not a usable one -- relay the keys.

Closing a panel exposes nothing, and the sender's origin is validated against `allowedOrigins` before the message is acted on, so this carries no additional risk beyond the messages already accepted.

## Usage

### Binding Blade Data to AI Context

```typescript
// In a details blade
const product = ref<Product>({});
useAiAgentContext({
  dataRef: product,
  suggestions: [{ id: "translate", title: "Translate", icon: "translation", prompt: "Translate to English" }],
});

// In a list blade
const { selectedItems } = useTableSelection<Order>();
useAiAgentContext({ dataRef: selectedItems });
```

### Toggling the Panel Programmatically

```typescript
const ai = useAiAgent();

function onAiButtonClick() {
  ai?.togglePanel();
}
```

### Listening for Chatbot Messages

```typescript
const ai = useAiAgent();

ai?.onMessage((message) => {
  if (message.type === "NAVIGATE_TO_APP") {
    console.log("Chatbot wants to navigate to:", message.payload);
  }
});
```

## Related

- `framework/core/plugins/ai-agent/services/ai-agent-service.ts` -- core service factory (`createAiAgentService`)
- `framework/core/plugins/ai-agent/composables/useAiAgentContext.ts` -- blade context binding
- `framework/core/plugins/ai-agent/components/VcAiAgentPanel.vue` -- the panel UI component
- `framework/core/plugins/ai-agent/types.ts` -- all TypeScript interfaces
- `framework/core/plugins/ai-agent/constants.ts` -- default config, message type constants
