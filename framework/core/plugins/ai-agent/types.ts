import { ComputedRef, Ref } from "vue";

// ============================================
// Core Types
// ============================================

/**
 * Context type for AI agent - determines UI behavior in chatbot
 * - 'list': Multiple selected items from a list blade (shows "X items selected" badge)
 * - 'details': Single item being edited in details blade (shows suggestions UI)
 */
export type AiAgentContextType = "list" | "details";

/**
 * Suggestion card for AI agent
 */
export interface ISuggestion {
  /** Unique identifier */
  id: string;
  /** Display title */
  title: string;
  /** Icon name */
  icon: string;
  /** Icon color (optional) */
  iconColor?: string;
  /** Prompt text to send when clicked */
  prompt: string;
}

/**
 * Options for useAiAgentContext composable
 */
export interface UseAiAgentContextOptions<T = Record<string, unknown>> {
  /**
   * Ref with data - accepts both formats:
   * - Ref<T> for DETAILS blade (single object, will be wrapped in array internally)
   * - Ref<T[]> for LIST blade (array of selected objects)
   *
   * When AI agent sends changes back, they will be applied to:
   * - The object directly (for single-object refs)
   * - The first item in array (for array refs)
   */
  dataRef: Ref<T> | Ref<T[]>;

  /** Custom suggestions for this blade */
  suggestions?: ISuggestion[];
}

/**
 * Return type for useAiAgentContext composable
 */
export interface UseAiAgentContextReturn {
  /** Preview state (for details blades) */
  previewState: {
    isActive: ComputedRef<boolean>;
    changedFields: ComputedRef<string[]>;
  };
}

// ============================================
// AI Agent Panel Types
// ============================================

/**
 * State of the AI agent panel
 */
export type AiAgentPanelState = "closed" | "open" | "expanded";

/**
 * Configuration for the AI agent panel
 */
export interface IAiAgentConfig {
  /** URL of the AI agent iframe */
  url: string;
  /** Panel title (default: "Virto OZ") */
  title?: string;
  /** Panel width in pixels when open (default: 362) */
  width?: number;
  /** Panel width in pixels when expanded (default: 500) */
  expandedWidth?: number;
  /** Allowed origins for postMessage (default: ["*"]) */
  allowedOrigins?: string[];
  /**
   * Tenant identifier for the platform instance.
   * This should be a static value identifying the platform installation (e.g., "virto", "acme-corp").
   * Configured by the host application via VirtoShellFramework options.
   *
   */
  tenantId?: string;
}

/**
 * Current blade information for AI context
 */
export interface IAiAgentBladeContext {
  /** Blade identifier */
  id: string;
  /** Blade component name */
  name: string;
  /** Blade display title */
  title?: string;
  /** Route parameter (e.g., item ID being edited) */
  param?: string;
  /** Additional blade options */
  options?: Record<string, unknown>;
}

/**
 * User information for AI context
 */
export interface IAiAgentUserContext {
  id?: string;
  userName?: string;
  isAdministrator?: boolean;
  permissions?: string[];
}

/**
 * Full context passed to the AI agent
 */
export interface IAiAgentContext {
  /** Current user information */
  user: IAiAgentUserContext | undefined;
  /** Current active blade information */
  currentBlade: IAiAgentBladeContext | null;
  /** Data items (from useAiAgentContext) */
  items: Record<string, unknown>[];
  /** Timestamp of context generation */
  timestamp: number;
}

/**
 * Service for managing AI agent state and communication
 */
export interface IAiAgentService {
  /** Current panel state */
  panelState: Ref<AiAgentPanelState>;
  /** Panel configuration */
  config: Ref<IAiAgentConfig>;
  /** Current context (reactive) */
  context: ComputedRef<IAiAgentContext>;
  /** Whether panel is open (not closed) */
  isOpen: ComputedRef<boolean>;
  /** Whether panel is in expanded state */
  isExpanded: ComputedRef<boolean>;
  /** Total count of items in current context */
  totalItemsCount: ComputedRef<number>;

  /** Open the AI panel */
  openPanel: () => void;
  /** Close the AI panel */
  closePanel: () => void;
  /** Toggle panel open/close */
  togglePanel: () => void;
  /** Expand the panel to larger width */
  expandPanel: () => void;
  /** Collapse panel to normal width */
  collapsePanel: () => void;

  /** Update configuration */
  setConfig: (config: Partial<IAiAgentConfig>) => void;

  /** Send message to AI agent iframe */
  sendMessage: (type: AiAgentMessageType, payload: unknown) => void;
  /** Register message handler, returns unsubscribe function */
  onMessage: (handler: (event: IAiAgentMessage) => void) => () => void;
}

// ============================================
// PostMessage Protocol Types
// ============================================

/**
 * Message types sent from Shell to Chatbot
 */
export type ShellToChatMessageType =
  | "INIT_CONTEXT" // Initial context when chatbot loads
  | "UPDATE_CONTEXT"; // Context updates (items, blade changes)

/**
 * Message types sent from Chatbot to Shell
 */
export type ChatToShellMessageType =
  | "CHAT_READY" // Chatbot is loaded and ready
  | "NAVIGATE_TO_APP" // Request to navigate to a blade
  | "EXPAND_IN_CHAT" // Request to expand item in chat
  | "RELOAD_BLADE" // Request to reload current blade
  | "PREVIEW_CHANGES" // Request to preview changes in form
  | "APPLY_CHANGES" // Request to apply data changes
  | "DOWNLOAD_FILE" // Request to download file
  | "SHOW_MORE" // Request for more results
  | "CHAT_ERROR"; // Error notification

/**
 * Combined message types
 */
export type AiAgentMessageType = ShellToChatMessageType | ChatToShellMessageType;

/**
 * Generic message type (for handlers)
 */
export interface IAiAgentMessage<T = unknown> {
  /** Message type identifier */
  type: AiAgentMessageType;
  /** Message payload */
  payload?: T;
  /** Message timestamp (optional) */
  timestamp?: number;
}

// ============================================
// Specific Message Payloads
// ============================================

/**
 * Blade context for chatbot (simplified for chat use)
 */
export interface IChatBladeContext {
  /** Blade identifier */
  id: string;
  /** Blade component name */
  name: string;
  /** Blade display title */
  title: string;
  /** Route parameter (e.g., item ID being edited) */
  param?: string;
}

/** Payload for INIT_CONTEXT message (Shell -> Chat) */
export interface IInitContextPayload {
  /** Current user ID */
  userId: string;
  /** User locale */
  locale: string;
  /** Tenant identifier (from JWT or host app) */
  tenantId?: string;
  /** Current blade context */
  blade: IChatBladeContext;
  /** Context type - determines chatbot UI behavior */
  contextType: AiAgentContextType;
  /** Data items - always array (1 for details, N for list) */
  items: Record<string, unknown>[];
  /** Custom suggestions (if any) */
  suggestions?: ISuggestion[];
  /** Access token for API calls (automatically refreshed) */
  accessToken?: string;
}

/** Payload for UPDATE_CONTEXT message (Shell -> Chat) */
export interface IUpdateContextPayload {
  /** Updated blade context (if changed) */
  blade?: IChatBladeContext;
  /** Tenant identifier (from JWT or host app) */
  tenantId?: string;
  /** Context type - determines chatbot UI behavior */
  contextType: AiAgentContextType;
  /** Data items - always array of full objects */
  items: Record<string, unknown>[];
  /** Custom suggestions (if changed) */
  suggestions?: ISuggestion[];
  /** Updated user locale (if changed) */
  locale?: string;
  /** Access token for API calls (automatically refreshed) */
  accessToken?: string;
}

/** Payload for NAVIGATE_TO_APP message (Chat -> Shell) */
export interface INavigateToAppPayload {
  /** Blade name to open */
  bladeName: string;
  /** Entity ID */
  param?: string;
  /** Additional options */
  options?: Record<string, unknown>;
}

/** Payload for PREVIEW_CHANGES message (Chat -> Shell) */
export interface IPreviewChangesPayload {
  /** Updated data to preview */
  data: Record<string, unknown>;
  /** List of changed field names */
  changedFields?: string[];
}

/** Payload for APPLY_CHANGES message (Chat -> Shell) */
export interface IApplyChangesPayload {
  changes: Array<{
    entityId: string;
    entityType: string;
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}

/** Payload for DOWNLOAD_FILE message (Chat -> Shell) */
export interface IDownloadFilePayload {
  /** Filename for download */
  filename: string;
  /** MIME type */
  contentType: string;
  /** Base64 encoded content */
  content: string;
}

/** Payload for CHAT_ERROR message (Chat -> Shell) */
export interface IChatErrorPayload {
  code: string;
  message: string;
}
