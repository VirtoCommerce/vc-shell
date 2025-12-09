import { computed, ref, shallowRef, watch, type Ref, type ShallowRef } from "vue";
import { createLogger } from "../utilities";
import {
  IAiAgentService,
  IAiAgentConfig,
  IAiAgentContext,
  IAiAgentMessage,
  AiAgentPanelState,
  AiAgentMessageType,
  IBladeSelectionService,
  IAiAgentBladeContext,
  IAiAgentUserContext,
  IInitContextPayload,
  IUpdateContextPayload,
  IChatSelectedItem,
  IChatBladeContext,
  ISelectedItem,
  INavigateToAppPayload,
  IApplyChangesPayload,
  IChatErrorPayload,
} from "../types/ai-agent";

const logger = createLogger("ai-agent-service");

/** Default configuration for AI agent panel */
const DEFAULT_CONFIG: IAiAgentConfig = {
  url: "",
  title: "Virto OZ",
  width: 350,
  expandedWidth: 500,
  allowedOrigins: ["*"],
};

/**
 * Options for creating the AI agent service
 */
export interface CreateAiAgentServiceOptions {
  /** Blade selection service for getting selected items */
  selectionService: IBladeSelectionService;
  /** Function to get current user information */
  userGetter: () => IAiAgentUserContext | undefined;
  /** Function to get current blade context */
  bladeGetter: () => IAiAgentBladeContext | null;
  /** Function to get auth token */
  authTokenGetter: () => string;
  /** Function to get user locale */
  localeGetter: () => string;
  /** Function to navigate to blade */
  navigateToBlade?: (bladeName: string, param?: string, options?: Record<string, unknown>) => void;
  /** Function to reload current blade */
  reloadBlade?: () => void;
  /** Initial configuration */
  initialConfig?: Partial<IAiAgentConfig>;
}

/**
 * Extended AI Agent Service with internal methods for component use
 */
export interface IAiAgentServiceInternal extends IAiAgentService {
  /** Reference to the iframe element (set by component) */
  iframeRef: ShallowRef<HTMLIFrameElement | null>;
  /** Set the iframe reference (called by component) */
  _setIframeRef: (iframe: HTMLIFrameElement | null) => void;
  /** Handle incoming postMessage events (called by component) */
  _handleIncomingMessage: (event: MessageEvent) => void;
  /** Start listening for postMessage events */
  _startListening: () => void;
  /** Stop listening for postMessage events */
  _stopListening: () => void;
}

/**
 * Convert internal selection items to chatbot format
 */
function toSelectedItems(items: ISelectedItem[]): IChatSelectedItem[] {
  return items.map((item) => ({
    id: item.id,
    type: item.type,
    name: (item.data?.name as string) || (item.data?.title as string) || item.id,
    module: item.bladeId,
  }));
}

/**
 * Convert internal blade context to chatbot format
 */
function toBladeContext(blade: IAiAgentBladeContext | null): IChatBladeContext {
  if (!blade) {
    return { id: "unknown", name: "unknown", title: "Unknown" };
  }
  return {
    id: blade.id,
    name: blade.name,
    title: blade.title || blade.name,
    param: blade.param,
  };
}

/**
 * Creates an AI agent service for managing the AI panel state and communication.
 */
export function createAiAgentService(options: CreateAiAgentServiceOptions): IAiAgentServiceInternal {
  const {
    selectionService,
    userGetter,
    bladeGetter,
    authTokenGetter,
    localeGetter,
    navigateToBlade,
    reloadBlade,
    initialConfig,
  } = options;

  // State
  const panelState = ref<AiAgentPanelState>("closed");
  const config = ref<IAiAgentConfig>({ ...DEFAULT_CONFIG, ...initialConfig });
  const iframeRef: ShallowRef<HTMLIFrameElement | null> = shallowRef(null);
  const isInitialized = ref(false);
  const isListenerRegistered = ref(false);
  const pendingInitContext = ref(false); // Flag to send INIT_CONTEXT when iframe becomes available

  // Message handlers registry
  const messageHandlers = new Set<(event: IAiAgentMessage) => void>();

  // Computed: is panel open
  const isOpen = computed(() => panelState.value !== "closed");

  // Computed: is panel expanded
  const isExpanded = computed(() => panelState.value === "expanded");

  // Computed: current context (reactive)
  const context = computed<IAiAgentContext>(() => ({
    user: userGetter(),
    currentBlade: bladeGetter(),
    selections: selectionService.allSelectedItems.value,
    timestamp: Date.now(),
  }));

  /**
   * Build INIT_CONTEXT payload for chatbot
   */
  const buildInitContextPayload = (): IInitContextPayload => ({
    authToken: authTokenGetter(),
    userId: userGetter()?.id || "",
    locale: localeGetter(),
    blade: toBladeContext(bladeGetter()),
    selectedItems: toSelectedItems(selectionService.allSelectedItems.value),
  });

  /**
   * Build UPDATE_CONTEXT payload for chatbot
   */
  const buildUpdateContextPayload = (): IUpdateContextPayload => ({
    blade: toBladeContext(bladeGetter()),
    selectedItems: toSelectedItems(selectionService.allSelectedItems.value),
    locale: localeGetter(),
  });

  // Watch for context changes and send UPDATE_CONTEXT to chatbot
  watch(
    () => ({
      currentBlade: context.value.currentBlade,
      selections: context.value.selections,
    }),
    () => {
      if (isOpen.value && isInitialized.value && iframeRef.value?.contentWindow) {
        sendRawMessage({ type: "UPDATE_CONTEXT", payload: buildUpdateContextPayload() });
      }
    },
    { deep: true },
  );

  // Internal functions defined below, forward-declared here for watchers and _startListening
  let sendRawMessage: (message: { type: string; payload?: unknown }) => void;
  let _handleIncomingMessage: (event: MessageEvent) => void;

  // Watch for iframe ref changes - send pending INIT_CONTEXT when iframe becomes available
  // This handles the race condition where CHAT_READY arrives before iframe ref is set
  watch(iframeRef, (iframe) => {
    if (iframe?.contentWindow && pendingInitContext.value) {
      logger.debug("Iframe became available, sending pending INIT_CONTEXT");
      pendingInitContext.value = false;
      isInitialized.value = true;
      sendRawMessage({ type: "INIT_CONTEXT", payload: buildInitContextPayload() });
    }
  });

  /**
   * Start listening for messages (called by component on mount)
   */
  const _startListening = (): void => {
    if (!isListenerRegistered.value) {
      window.addEventListener("message", _handleIncomingMessage);
      isListenerRegistered.value = true;
      logger.debug("Message listener registered");
    }
  };

  /**
   * Stop listening for messages (called by component on unmount)
   */
  const _stopListening = (): void => {
    if (isListenerRegistered.value) {
      window.removeEventListener("message", _handleIncomingMessage);
      isListenerRegistered.value = false;
      logger.debug("Message listener unregistered");
    }
  };

  /**
   * Open the AI panel
   */
  const openPanel = (): void => {
    if (panelState.value === "closed") {
      panelState.value = "open";
      logger.debug("Panel opened");
    }
  };

  /**
   * Close the AI panel
   */
  const closePanel = (): void => {
    panelState.value = "closed";
    logger.debug("Panel closed");
  };

  /**
   * Toggle panel open/close
   */
  const togglePanel = (): void => {
    if (panelState.value === "closed") {
      openPanel();
    } else {
      closePanel();
    }
  };

  /**
   * Expand the panel to larger width
   */
  const expandPanel = (): void => {
    if (panelState.value === "open") {
      panelState.value = "expanded";
      logger.debug("Panel expanded");
    }
  };

  /**
   * Collapse panel to normal width
   */
  const collapsePanel = (): void => {
    if (panelState.value === "expanded") {
      panelState.value = "open";
      logger.debug("Panel collapsed");
    }
  };

  /**
   * Update configuration
   */
  const setConfig = (newConfig: Partial<IAiAgentConfig>): void => {
    config.value = { ...config.value, ...newConfig };
    logger.debug("Config updated", newConfig);
  };

  /**
   * Send raw message to iframe (chatbot protocol format)
   */
  sendRawMessage = (message: { type: string; payload?: unknown }): void => {
    if (!iframeRef.value?.contentWindow) {
      logger.warn("Cannot send message: iframe not available");
      return;
    }

    const targetOrigin = config.value.allowedOrigins?.[0] || "*";
    iframeRef.value.contentWindow.postMessage(message, targetOrigin);
    logger.debug(`Message sent: ${message.type}`, message.payload);
  };

  /**
   * Send message to AI agent iframe (public API)
   */
  const sendMessage = (type: AiAgentMessageType, payload: unknown): void => {
    sendRawMessage({ type, payload });
  };

  /**
   * Register message handler, returns unsubscribe function
   */
  const onMessage = (handler: (event: IAiAgentMessage) => void): (() => void) => {
    messageHandlers.add(handler);
    return () => {
      messageHandlers.delete(handler);
    };
  };

  /**
   * Set the iframe reference (called by component)
   */
  const _setIframeRef = (iframe: HTMLIFrameElement | null): void => {
    iframeRef.value = iframe;
    logger.debug("Iframe ref set:", iframe ? "available" : "null");
  };

  /**
   * Handle incoming postMessage events (called by component)
   * Supports chatbot protocol messages
   */
  _handleIncomingMessage = (event: MessageEvent): void => {
    // Log all incoming messages for debugging
    if (event.data?.type) {
      logger.debug("Raw message event received:", {
        origin: event.origin,
        type: event.data.type,
        hasIframe: !!iframeRef.value,
      });
    }

    // Validate origin if configured
    const allowedOrigins = config.value.allowedOrigins || ["*"];
    if (!allowedOrigins.includes("*") && !allowedOrigins.includes(event.origin)) {
      logger.warn(`Message from unauthorized origin: ${event.origin}`);
      return;
    }

    // Validate message structure - chatbot sends { type, payload? }
    const message = event.data;
    if (!message?.type || typeof message.type !== "string") {
      // Not our message, ignore
      return;
    }

    logger.debug(`Message received: ${message.type}`, message.payload);

    // Handle chatbot protocol messages
    switch (message.type) {
      case "CHAT_READY":
        // Chatbot is ready - send INIT_CONTEXT
        // Handle race condition: if iframe ref is not yet available, set pending flag
        if (iframeRef.value?.contentWindow) {
          isInitialized.value = true;
          sendRawMessage({ type: "INIT_CONTEXT", payload: buildInitContextPayload() });
          logger.info("Chatbot ready, sent INIT_CONTEXT");
        } else {
          // Iframe ref not yet available (race condition)
          // Set pending flag - INIT_CONTEXT will be sent when iframe ref is set
          pendingInitContext.value = true;
          logger.info("Chatbot ready, but iframe ref not available yet - pending INIT_CONTEXT");
        }
        break;

      case "NAVIGATE_TO_APP": {
        const navPayload = message.payload as INavigateToAppPayload;
        if (navigateToBlade && navPayload?.bladeName) {
          navigateToBlade(navPayload.bladeName, navPayload.param, navPayload.options);
          logger.debug(`Navigation requested to: ${navPayload.bladeName}`);
        }
        break;
      }

      case "RELOAD_BLADE":
        if (reloadBlade) {
          reloadBlade();
          logger.debug("Blade reload requested");
        }
        break;

      case "APPLY_CHANGES": {
        const changesPayload = message.payload as IApplyChangesPayload;
        logger.debug("Apply changes requested:", changesPayload?.changes);
        // Pass to handlers - application can implement this
        break;
      }

      case "CHAT_ERROR": {
        const errorPayload = message.payload as IChatErrorPayload;
        logger.error(`Chatbot error [${errorPayload?.code}]: ${errorPayload?.message}`);
        break;
      }

      // Ignore other messages (like SHOW_MORE, EXPAND_IN_CHAT)
      default:
        break;
    }

    // Notify all registered handlers
    const normalizedMessage: IAiAgentMessage = {
      type: message.type,
      payload: message.payload,
      timestamp: Date.now(),
    };

    messageHandlers.forEach((handler) => {
      try {
        handler(normalizedMessage);
      } catch (error) {
        logger.error("Error in message handler:", error);
      }
    });
  };

  // Auto-register listener when service is created
  // This ensures we receive CHAT_READY even before the panel component mounts
  _startListening();
  logger.debug("AI Agent Service initialized, listener auto-registered");

  return {
    // State
    panelState,
    config,
    context,
    isOpen,
    isExpanded,

    // Panel control
    openPanel,
    closePanel,
    togglePanel,
    expandPanel,
    collapsePanel,

    // Configuration
    setConfig,

    // Communication
    sendMessage,
    onMessage,

    // Internal (for component use)
    iframeRef,
    _setIframeRef,
    _handleIncomingMessage,
    _startListening,
    _stopListening,
  };
}
