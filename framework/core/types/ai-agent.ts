import { ComputedRef, Ref } from "vue";

// ============================================
// Selection Types
// ============================================

/**
 * Represents a single selected item from any blade
 */
export interface ISelectedItem {
  /** Unique identifier of the item */
  id: string;
  /** Type of the item (e.g., "IOffer", "IProduct", "IOrder") */
  type: string;
  /** Full item data */
  data: Record<string, unknown>;
  /** ID of the blade where item was selected */
  bladeId: string;
  /** Timestamp when item was selected */
  selectedAt: number;
}

/**
 * Selection state for a single blade
 */
export interface IBladeSelectionState {
  /** Blade identifier */
  bladeId: string;
  /** Human-readable blade name/title */
  bladeName: string;
  /** Selected items in this blade */
  items: ISelectedItem[];
}

/**
 * Service for managing selection state across all blades
 */
export interface IBladeSelectionService {
  /** All selections grouped by blade ID */
  selections: ComputedRef<Map<string, IBladeSelectionState>>;
  /** Flattened array of all selected items from all blades */
  allSelectedItems: ComputedRef<ISelectedItem[]>;
  /** Total count of selected items across all blades */
  totalSelectedCount: ComputedRef<number>;

  /** Set selection for a specific blade (replaces existing) */
  setSelection: (bladeId: string, bladeName: string, items: ISelectedItem[]) => void;
  /** Add single item to blade's selection */
  addToSelection: (bladeId: string, bladeName: string, item: ISelectedItem) => void;
  /** Remove single item from blade's selection */
  removeFromSelection: (bladeId: string, itemId: string) => void;
  /** Clear all selections for a specific blade */
  clearBladeSelection: (bladeId: string) => void;
  /** Clear all selections from all blades */
  clearAllSelections: () => void;
  /** Get selection state for a specific blade */
  getBladeSelection: (bladeId: string) => IBladeSelectionState | undefined;
}

// ============================================
// AI Agent Types
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
  /** Panel width in pixels when open (default: 350) */
  width?: number;
  /** Panel width in pixels when expanded (default: 500) */
  expandedWidth?: number;
  /** Allowed origins for postMessage (default: ["*"]) */
  allowedOrigins?: string[];
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
  /** All selected items across blades */
  selections: ISelectedItem[];
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
// Compatible with @vc-shell/chatbot protocol
// ============================================

/**
 * Message types sent from Shell to Chatbot
 */
export type ShellToChatMessageType =
  | "INIT_CONTEXT" // Initial context when chatbot loads
  | "UPDATE_CONTEXT"; // Context updates (selection, blade changes)

/**
 * Message types sent from Chatbot to Shell
 */
export type ChatToShellMessageType =
  | "CHAT_READY" // Chatbot is loaded and ready
  | "NAVIGATE_TO_APP" // Request to navigate to a blade
  | "EXPAND_IN_CHAT" // Request to expand item in chat
  | "RELOAD_BLADE" // Request to reload current blade
  | "APPLY_CHANGES" // Request to apply data changes
  | "SHOW_MORE" // Request for more results
  | "CHAT_ERROR"; // Error notification

/**
 * Combined message types (legacy naming for compatibility)
 */
export type AiAgentMessageType = ShellToChatMessageType | ChatToShellMessageType;

/**
 * Base message format for postMessage communication (Shell -> Chat)
 */
export interface IShellToChatMessage<T = unknown> {
  /** Message type identifier */
  type: ShellToChatMessageType;
  /** Message payload */
  payload: T;
}

/**
 * Base message format for postMessage communication (Chat -> Shell)
 */
export interface IChatToShellMessage<T = unknown> {
  /** Message type identifier */
  type: ChatToShellMessageType;
  /** Message payload (optional for some message types) */
  payload?: T;
}

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
  /** Message source identifier (optional, legacy) */
  source?: "vc-shell" | "ai-agent";
}

// ============================================
// Specific Message Payloads
// Compatible with @vc-shell/chatbot protocol
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

/**
 * Selected item for chatbot (simplified format)
 */
export interface IChatSelectedItem {
  /** Item ID */
  id: string;
  /** Item type: product, order, customer, etc. */
  type: string;
  /** Display name */
  name: string;
  /** Module the item belongs to */
  module?: string;
}

/** Payload for INIT_CONTEXT message (Shell -> Chat) */
export interface IInitContextPayload {
  /** Authentication token */
  authToken: string;
  /** Current user ID */
  userId: string;
  /** User locale */
  locale: string;
  /** Current blade context */
  blade: IChatBladeContext;
  /** Selected items (if any) */
  selectedItems?: IChatSelectedItem[];
}

/** Payload for UPDATE_CONTEXT message (Shell -> Chat) */
export interface IUpdateContextPayload {
  /** Updated blade context (if changed) */
  blade?: IChatBladeContext;
  /** Updated selected items (if changed) */
  selectedItems?: IChatSelectedItem[];
  /** Updated user locale (if changed) */
  locale?: string;
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

/** Payload for EXPAND_IN_CHAT message (Chat -> Shell) */
export interface IExpandInChatPayload {
  itemId: string;
  itemType: string;
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

/** Payload for SHOW_MORE message (Chat -> Shell) */
export interface IShowMorePayload {
  /** Category to load (e.g., "applications", "products") */
  category: string;
}

/** Payload for CHAT_ERROR message (Chat -> Shell) */
export interface IChatErrorPayload {
  code: string;
  message: string;
}
