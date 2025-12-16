# Virto OZ Chatbot Implementation

## Overview
A React-based AI chatbot application designed to be embedded as an iframe in vc-shell applications. Communicates with the parent application via PostMessage protocol for context sharing and action execution.

## Tech Stack
- **Framework**: React 19.2 with TypeScript 5.9
- **Build**: Vite 7.2
- **Styling**: Tailwind CSS 4.1
- **Validation**: Zod 4.1
- **Streaming**: Streamdown 1.6 (markdown streaming)
- **Virtual List**: @tanstack/react-virtual 3.13

## File Structure
```
chatbot/src/
├── App.tsx                    # Main app component, orchestrator usage
├── main.tsx                   # Entry point
├── index.ts                   # Package exports
├── chat/
│   ├── api/
│   │   ├── ChatApi.ts         # Real API client (placeholder)
│   │   ├── MockChatApi.ts     # Mock API for development
│   │   ├── websocket.ts       # WebSocket client (placeholder)
│   │   └── errorHandler.ts    # Error handling utilities
│   ├── model/
│   │   ├── usePostMessage.ts  # PostMessage communication with shell
│   │   ├── useChatContext.ts  # Context state management
│   │   ├── useChatOrchestrator.ts  # Main orchestrator hook
│   │   ├── useChat.ts         # Chat API logic
│   │   ├── useChatMessages.ts # Message state management
│   │   ├── useRateLimiter.ts  # Rate limiting logic
│   │   ├── useHistory.ts      # Chat history management
│   │   └── useSessionPersistence.ts  # Session storage
│   ├── types/
│   │   ├── index.ts           # Type re-exports
│   │   ├── context.ts         # Context types (ChatContext, BladeContext)
│   │   ├── messages.ts        # Message types (ChatMessage, SearchResult)
│   │   ├── actions.ts         # PostMessage action types
│   │   ├── api.ts             # API types
│   │   ├── history.ts         # History types
│   │   └── schemas.ts         # Zod schemas for validation
│   └── ui/
│       ├── ChatContainer.tsx  # Main container with ref handle
│       ├── ChatHeader.tsx     # Header with sessions/history
│       ├── ChatInput.tsx      # Input field with context tags
│       ├── ChatMessages.tsx   # Virtualized message list
│       ├── ChatMessage.tsx    # Single message component
│       ├── ChatWelcome.tsx    # Welcome screen with suggestions
│       ├── ChatSuggestionCard.tsx  # Suggestion card component
│       ├── MarkdownRenderer.tsx    # Streaming markdown
│       └── ...
└── shared/
    ├── constants/
    │   ├── security.ts        # Origin validation
    │   ├── suggestions.ts     # Default suggestions
    │   └── ui.ts              # UI constants
    ├── utils/
    │   └── markdown.ts        # Markdown utilities
    └── components/
        ├── ErrorBoundary.tsx  # Error boundary
        ├── ErrorToast.tsx     # Error toast
        └── RateLimitBanner.tsx # Rate limit banner
```

## Architecture

### Core Hooks

#### useChatOrchestrator
The main orchestration hook that combines all chat logic:
```typescript
export function useChatOrchestrator(config: ChatOrchestratorConfig): ChatOrchestratorReturn {
  const chatContext = useChatContext();  // Context state
  const rateLimiter = useRateLimiter();  // Rate limiting
  const postMessage = usePostMessage();   // PostMessage communication
  const { sendMessage, ... } = useChat({ ... });  // API communication
  
  // Setup PostMessage handlers
  useEffect(() => {
    postMessage.onInit((payload) => chatContext.initContext(payload));
    postMessage.onUpdate((payload) => chatContext.updateContext(payload));
  }, []);
  
  return {
    isStreaming, isRateLimited, error,
    items, itemsCount, contextType, isDetailsContext, suggestions,
    sendMessage, retryMessage, abort,
    handleActionClick, // navigate, expand, show-more
    initContext, updateContext,
    containerRef, // Ref for ChatContainer imperative methods
  };
}
```

#### usePostMessage
Handles bidirectional PostMessage communication:
```typescript
export function usePostMessage() {
  // Outgoing messages
  const sendToParent = (message: ChatToParentMessage) => {
    window.parent.postMessage(message, targetOrigin);
  };
  
  // Specific message helpers
  const navigateToApp = (bladeName, param?, options?) => { ... };
  const expandInChat = (itemId, itemType) => { ... };
  const reloadBlade = () => { ... };
  const previewChanges = (data, changedFields?) => { ... };
  const applyChanges = (changes) => { ... };
  const showMore = (category) => { ... };
  const notifyError = (code, message) => { ... };
  
  // Incoming message callbacks
  const onInit = (callback) => { ... };  // INIT_CONTEXT handler
  const onUpdate = (callback) => { ... }; // UPDATE_CONTEXT handler
  
  // On mount: send CHAT_READY and setup listener
  useEffect(() => {
    window.parent.postMessage({ type: "CHAT_READY" }, "*");
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  
  return { sendToParent, navigateToApp, expandInChat, ... };
}
```

#### useChatContext
Manages context state from shell:
```typescript
export function useChatContext() {
  const authTokenRef = useRef("");  // Secure storage (not in DevTools)
  const [userId, setUserId] = useState("");
  const [locale, setLocale] = useState("en");
  const [blade, setBlade] = useState<BladeContext | null>(null);
  const [contextType, setContextType] = useState<ContextType>("list");
  const [items, setItems] = useState<ContextItem[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionFromShell[]>();
  
  const initContext = (payload) => { /* set all fields */ };
  const updateContext = (payload) => { /* partial update */ };
  
  return {
    userId, locale, blade, contextType, items, suggestions,
    isInitialized, hasItems, itemsCount,
    isDetailsContext, isListContext,
    getAuthToken,  // Secure getter
    initContext, updateContext, resetContext,
  };
}
```

### PostMessage Protocol

#### Shell → Chat (Incoming)
| Type | Payload | Description |
|------|---------|-------------|
| `INIT_CONTEXT` | `{userId, locale, blade, contextType, items?, suggestions?}` | Initialize chat context |
| `UPDATE_CONTEXT` | Partial of above | Update context (e.g., selection change) |

#### Chat → Shell (Outgoing)
| Type | Payload | Description |
|------|---------|-------------|
| `CHAT_READY` | - | Chatbot is ready to receive context |
| `NAVIGATE_TO_APP` | `{bladeName, param?, options?}` | Navigate to blade |
| `EXPAND_IN_CHAT` | `{itemId, itemType}` | Expand item details in chat |
| `RELOAD_BLADE` | - | Reload current blade |
| `PREVIEW_CHANGES` | `{data, changedFields?}` | Preview form changes |
| `APPLY_CHANGES` | `{changes: [{entityId, entityType, field, oldValue, newValue}]}` | Apply changes |
| `SHOW_MORE` | `{category}` | Request more results |
| `CHAT_ERROR` | `{code, message}` | Report error to shell |

### Context Types

#### ContextType
Determines UI behavior:
- `"list"` - Multiple selected items from list blade (shows "X items selected" badge)
- `"details"` - Single item in details blade (shows suggestions UI with Apply changes flow)

#### ChatContext
```typescript
interface ChatContext {
  authToken?: string;       // Optional - vc-shell uses cookie-based auth
  userId: string;
  locale: string;
  blade: BladeContext;
  contextType: ContextType;
  items?: ContextItem[];    // Array of any objects (offers, products, etc.)
  suggestions?: SuggestionFromShell[];
}

interface BladeContext {
  id: string;    // Unique blade identifier
  name: string;  // Blade component name
  title: string; // Blade title
  param?: string; // Entity ID
}
```

### Message Types

```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;  // Markdown
  timestamp: Date;
  status: "pending" | "streaming" | "complete" | "error" | "aborted";
  error?: string;
  canRetry?: boolean;
  retryCount?: number;
  originalUserMessage?: string;
}

interface SuggestionCard {
  id: string;
  title: string;
  icon: string;
  iconColor?: string;
  prompt: string;  // Text to send on click
}
```

### Zod Validation
All incoming PostMessages are validated with Zod schemas:
```typescript
const InitContextPayloadSchema = z.object({
  authToken: z.string().optional(),
  userId: z.string().min(1),
  locale: z.string().min(2),
  blade: BladeSchema,
  contextType: ContextTypeSchema.optional().default("list"),
  items: z.array(ContextItemSchema).optional(),
  suggestions: z.array(SuggestionSchema).optional(),
});

// Usage
const parseResult = parseParentMessage(event.data);
if (!parseResult.success) {
  logSecurityEvent("message_validation_failed", { error: parseResult.error });
  return;
}
```

### Security

#### Origin Validation
```typescript
// security.ts
export function isAllowedOrigin(origin: string): boolean {
  // Allow same origin (standalone mode)
  if (origin === window.location.origin) return true;
  
  // Allow localhost in dev
  if (import.meta.env.DEV && isLocalhostOrigin(origin)) return true;
  
  // Check production whitelist (VITE_ALLOWED_ORIGINS env var)
  if (PRODUCTION_ORIGINS.includes(origin)) return true;
  
  return false;
}

// Target origin for sending
export function getTargetOrigin(parentOrigin: string | null): string {
  return parentOrigin || window.location.origin;  // Never use "*" (except CHAT_READY)
}
```

#### Auth Token Security
- Stored in `useRef` (not React state) - not visible in React DevTools
- Accessed via `getAuthToken()` secure getter
- Cookie-based auth is primary - token is optional

### UI Components

#### ChatContainer
Main container with imperative handle:
```typescript
interface ChatContainerHandle {
  addAssistantMessage: (content, status?) => string;
  updateMessage: (id, updates) => void;
  startStreaming: () => string;
  appendToStream: (id, content) => void;
  completeStream: (id) => void;
  setError: (id, error, canRetry?, retryCount?) => void;
  setAborted: (id) => void;
  messages: ChatMessage[];
}
```

#### ChatInput
Input field with context-aware features:
- Shows items count tag for "list" context
- Gradient border animation when empty
- Stop button during streaming

#### ChatWelcome
Welcome screen with:
- "X items selected" badge (list context)
- Suggestion cards from shell or defaults
- Icon support

### API Integration (Placeholder)

```typescript
interface ChatApiInterface {
  sendMessage(message: string, context: ChatContext, authToken: string): Promise<ReadableStream<string>>;
  abort(): void;
  isStreaming(): boolean;
}

// Current implementation uses MockChatApi in dev
const chatApi = createChatApi(undefined, useMockApi);
```

### Environment Variables
```env
VITE_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com  # Production origins whitelist
```

### Development Mode
- Mock context auto-initialized when running standalone (not in iframe)
- MockChatApi returns simulated responses
- Console logging for PostMessage events

### Communication Flow
```
1. Shell loads chatbot in iframe
2. Chatbot sends CHAT_READY (with "*" origin - safe, no data)
3. Shell captures origin, sends INIT_CONTEXT
4. Chatbot validates origin, parses with Zod, initializes context
5. User interacts with chatbot
6. Chatbot sends actions (NAVIGATE_TO_APP, PREVIEW_CHANGES, etc.)
7. Shell handles actions, may send UPDATE_CONTEXT
```

### Key Implementation Details

#### Mock Context in Dev
```typescript
// useChatOrchestrator
useEffect(() => {
  const isStandalone = window.parent === window;
  if (isStandalone && import.meta.env.DEV) {
    chatContext.initContext({
      authToken: "mock-token",
      userId: "mock-user",
      locale: "en",
      blade: { id: "mock-blade", name: "MockBlade", title: "Mock Blade" },
      contextType: "details",
      items: [{ id: "mock-item-1", name: "Mock Item 1" }],
      suggestions: [/* mock suggestions */],
    });
  }
}, []);
```

#### Action Link Format
```typescript
// Markdown link format for actions
// [Link Text](action:navigate:BladeName:param)
// [Link Text](action:expand:itemType:itemId)
// [Link Text](action:show-more:category)

interface ParsedActionLink {
  text: string;
  actionType: "navigate" | "expand" | "show-more";
  target: string;  // bladeName or itemType or category
  param?: string;
}
```

#### Rate Limiting
```typescript
const rateLimiter = useRateLimiter();
// rateLimiter.canMakeRequest()
// rateLimiter.recordRequest()
// rateLimiter.recordError()
// rateLimiter.isRateLimited
// rateLimiter.retryAfterMs
```

### Package Configuration
```json
{
  "name": "@vc-shell/chatbot",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/chatbot.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build"
  }
}
```
