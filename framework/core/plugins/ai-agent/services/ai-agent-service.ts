import { computed, ref, shallowRef, watch, type ShallowRef } from "vue";
import { cloneDeep } from "lodash-es";
import { createLogger } from "@core/utilities";
import {
  IAiAgentService,
  IAiAgentConfig,
  IAiAgentContext,
  IAiAgentMessage,
  AiAgentPanelState,
  AiAgentMessageType,
  AiAgentContextType,
  IAiAgentBladeContext,
  IAiAgentUserContext,
  IInitContextPayload,
  IUpdateContextPayload,
  IChatBladeContext,
  INavigateToAppPayload,
  IApplyChangesPayload,
  IChatErrorPayload,
  IPreviewChangesPayload,
  IDownloadFilePayload,
  ISuggestion,
} from "@core/plugins/ai-agent/types";
import { DEFAULT_AI_AGENT_CONFIG } from "@core/plugins/ai-agent/constants";

const logger = createLogger("ai-agent-service");

/**
 * Options for creating the AI agent service
 */
export interface CreateAiAgentServiceOptions {
  /** Function to get current user information */
  userGetter: () => IAiAgentUserContext | undefined;
  /** Function to get current blade context */
  bladeGetter: () => IAiAgentBladeContext | null;
  /** Function to get user locale */
  localeGetter: () => string;
  /** Function to get access token (handles automatic refresh) */
  tokenGetter?: () => Promise<string | null>;
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
  /** Update context data for a blade (called by useAiAgentContext) */
  _setContextData: (
    items: Record<string, unknown>[],
    type: AiAgentContextType,
    suggestions?: ISuggestion[],
    bladeId?: string,
  ) => void;
  /** Register preview changes handler */
  _onPreviewChanges: (handler: (payload: IPreviewChangesPayload) => void) => () => void;
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
 * Download a file from base64 content
 */
function downloadFile(payload: IDownloadFilePayload): void {
  const { filename, contentType, content } = payload;

  try {
    const byteCharacters = atob(content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logger.debug(`File downloaded: ${filename}`);
  } catch (error) {
    logger.error("Failed to download file:", error);
  }
}

/**
 * Creates an AI agent service for managing the AI panel state and communication.
 */
export function createAiAgentService(options: CreateAiAgentServiceOptions): IAiAgentServiceInternal {
  const { userGetter, bladeGetter, localeGetter, tokenGetter, navigateToBlade, reloadBlade, initialConfig } = options;

  // State
  const panelState = ref<AiAgentPanelState>("closed");
  const config = ref<IAiAgentConfig>({ ...DEFAULT_AI_AGENT_CONFIG, ...initialConfig });
  const iframeRef: ShallowRef<HTMLIFrameElement | null> = shallowRef(null);
  const isInitialized = ref(false);
  const isListenerRegistered = ref(false);
  const pendingInitContext = ref(false);

  // Context data from useAiAgentContext - stored per blade
  // Key is blade id, value is context for that blade
  const bladeContexts = ref<
    Map<
      string,
      {
        items: Record<string, unknown>[];
        type: AiAgentContextType;
        suggestions?: ISuggestion[];
      }
    >
  >(new Map());

  // Get context for the active blade (last in the navigation stack)
  const getActiveBladeContext = () => {
    const activeBlade = bladeGetter();
    if (!activeBlade) return { items: [], type: "list" as AiAgentContextType, suggestions: undefined };

    const bladeContext = bladeContexts.value.get(activeBlade.id);
    return bladeContext || { items: [], type: "list" as AiAgentContextType, suggestions: undefined };
  };

  // Computed accessors for backward compatibility
  const contextItems = computed(() => getActiveBladeContext().items);
  const contextType = computed(() => getActiveBladeContext().type);
  const contextSuggestions = computed(() => getActiveBladeContext().suggestions);

  // Message handlers registry
  const messageHandlers = new Set<(event: IAiAgentMessage) => void>();
  const previewChangesHandlers = new Set<(payload: IPreviewChangesPayload) => void>();

  // Computed: is panel open
  const isOpen = computed(() => panelState.value !== "closed");

  // Computed: is panel expanded
  const isExpanded = computed(() => panelState.value === "expanded");

  // Computed: total items count
  const totalItemsCount = computed(() => contextItems.value.length);

  // Computed: current context (reactive)
  const context = computed<IAiAgentContext>(() => ({
    user: userGetter(),
    currentBlade: bladeGetter(),
    items: contextItems.value,
    timestamp: Date.now(),
  }));

  /**
   * Build INIT_CONTEXT payload for chatbot
   * Uses cloneDeep to ensure data is fully serializable (postMessage cannot clone Vue proxies)
   * Fetches fresh access token (with automatic refresh if expired)
   *
   * tenantId priority:
   * 1. config.tenantId (configured by app via VirtoShellFramework options)
   * 2. organization_id from JWT (deprecated fallback)
   */
  const buildInitContextPayload = async (): Promise<IInitContextPayload> => {
    const accessToken = tokenGetter ? ((await tokenGetter()) ?? undefined) : undefined;
    return {
      userId: userGetter()?.id || "",
      locale: localeGetter(),
      blade: toBladeContext(bladeGetter()),
      contextType: contextType.value,
      items: cloneDeep(contextItems.value),
      suggestions: contextSuggestions.value ? cloneDeep(contextSuggestions.value) : undefined,
      accessToken,
    };
  };

  /**
   * Build UPDATE_CONTEXT payload for chatbot
   * Uses cloneDeep to ensure data is fully serializable (postMessage cannot clone Vue proxies)
   * Fetches fresh access token (with automatic refresh if expired)
   *
   * tenantId priority:
   * 1. config.tenantId (configured by app via VirtoShellFramework options)
   * 2. organization_id from JWT (deprecated fallback)
   */
  const buildUpdateContextPayload = async (): Promise<IUpdateContextPayload> => {
    const accessToken = tokenGetter ? ((await tokenGetter()) ?? undefined) : undefined;
    return {
      blade: toBladeContext(bladeGetter()),
      contextType: contextType.value,
      items: cloneDeep(contextItems.value),
      suggestions: contextSuggestions.value ? cloneDeep(contextSuggestions.value) : undefined,
      locale: localeGetter(),
      accessToken,
    };
  };

  // Internal functions defined below, forward-declared here for watchers
  let sendRawMessage: (message: { type: string; payload?: unknown }) => void;
  let _handleIncomingMessage: (event: MessageEvent) => void;

  // Watch for context changes and send UPDATE_CONTEXT to chatbot
  watch(
    () => ({
      currentBlade: context.value.currentBlade,
      items: context.value.items,
    }),
    async () => {
      if (isOpen.value && isInitialized.value && iframeRef.value?.contentWindow) {
        const payload = await buildUpdateContextPayload();
        sendRawMessage({ type: "UPDATE_CONTEXT", payload });
      }
    },
    { deep: true },
  );

  // Watch for iframe ref changes - send pending INIT_CONTEXT when iframe becomes available
  watch(iframeRef, async (iframe) => {
    if (iframe?.contentWindow && pendingInitContext.value) {
      logger.debug("Iframe became available, sending pending INIT_CONTEXT");
      pendingInitContext.value = false;
      isInitialized.value = true;
      const payload = await buildInitContextPayload();
      sendRawMessage({ type: "INIT_CONTEXT", payload });
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
    // Reset initialized state since iframe will be destroyed (v-if in panel component)
    // Next time panel opens, iframe will send CHAT_READY and we'll send INIT_CONTEXT again
    isInitialized.value = false;
    pendingInitContext.value = false;
    logger.debug("Panel closed, reset initialized state");
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
   * Payload data should already be unwrapped from Vue proxies via toRaw() in build*Payload functions
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

    // Immediately check for pending context (in case watch doesn't fire)
    if (iframe?.contentWindow && pendingInitContext.value) {
      logger.debug("Iframe ref set with pending context - sending INIT_CONTEXT immediately");
      pendingInitContext.value = false;
      isInitialized.value = true;
      buildInitContextPayload().then((payload) => {
        sendRawMessage({ type: "INIT_CONTEXT", payload });
      });
    }
  };

  /**
   * Set context data for a specific blade (called by useAiAgentContext)
   * If bladeId is not provided, uses the current active blade
   */
  const _setContextData = (
    items: Record<string, unknown>[],
    type: AiAgentContextType,
    suggestions?: ISuggestion[],
    bladeId?: string,
  ): void => {
    const targetBladeId = bladeId || bladeGetter()?.id;
    if (!targetBladeId) {
      logger.warn("Cannot set context data: no blade id available");
      return;
    }

    if (items.length === 0 && !suggestions) {
      // Remove context for this blade when cleared
      bladeContexts.value.delete(targetBladeId);
      logger.debug(`Context cleared for blade: ${targetBladeId}`);
    } else {
      // Set context for this blade
      bladeContexts.value.set(targetBladeId, { items, type, suggestions });
      logger.debug(`Context set for blade: ${targetBladeId}, items: ${items.length}, type: ${type}`);
    }
  };

  /**
   * Register preview changes handler
   */
  const _onPreviewChanges = (handler: (payload: IPreviewChangesPayload) => void): (() => void) => {
    previewChangesHandlers.add(handler);
    return () => {
      previewChangesHandlers.delete(handler);
    };
  };

  /**
   * Handle incoming postMessage events (called by component)
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

    // Validate message structure
    const message = event.data;
    if (!message?.type || typeof message.type !== "string") {
      return;
    }

    logger.debug(`Message received: ${message.type}`, message.payload);

    // Handle chatbot protocol messages
    switch (message.type) {
      case "CHAT_READY":
        if (iframeRef.value?.contentWindow) {
          isInitialized.value = true;
          buildInitContextPayload().then((payload) => {
            sendRawMessage({ type: "INIT_CONTEXT", payload });
            logger.info("Chatbot ready, sent INIT_CONTEXT");
          });
        } else {
          pendingInitContext.value = true;
          logger.info("Chatbot ready, but iframe ref not available yet - pending INIT_CONTEXT");

          // Fallback: retry after short delay in case iframeRef was set but watch didn't fire
          setTimeout(() => {
            if (pendingInitContext.value && iframeRef.value?.contentWindow) {
              logger.debug("Fallback: sending pending INIT_CONTEXT after timeout");
              pendingInitContext.value = false;
              isInitialized.value = true;
              buildInitContextPayload().then((payload) => {
                sendRawMessage({ type: "INIT_CONTEXT", payload });
              });
            }
          }, 100);
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

      case "PREVIEW_CHANGES": {
        const previewPayload = message.payload as IPreviewChangesPayload;
        console.log("[AI-AGENT-SERVICE] PREVIEW_CHANGES received", {
          handlersCount: previewChangesHandlers.size,
          payloadDataKeys: previewPayload?.data ? Object.keys(previewPayload.data) : [],
          changedFields: previewPayload?.changedFields,
          payloadPreview: JSON.stringify(previewPayload).substring(0, 500),
        });
        if (previewChangesHandlers.size === 0) {
          console.warn("[AI-AGENT-SERVICE] No preview changes handlers registered!");
        }
        previewChangesHandlers.forEach((handler) => {
          try {
            console.log("[AI-AGENT-SERVICE] Calling preview changes handler");
            handler(previewPayload);
          } catch (error) {
            console.error("[AI-AGENT-SERVICE] Error in preview changes handler:", error);
          }
        });
        break;
      }

      case "DOWNLOAD_FILE": {
        const downloadPayload = message.payload as IDownloadFilePayload;
        if (downloadPayload) {
          downloadFile(downloadPayload);
        }
        break;
      }

      case "APPLY_CHANGES": {
        const changesPayload = message.payload as IApplyChangesPayload;
        logger.debug("Apply changes requested:", changesPayload?.changes);
        break;
      }

      case "CHAT_ERROR": {
        const errorPayload = message.payload as IChatErrorPayload;
        logger.error(`Chatbot error [${errorPayload?.code}]: ${errorPayload?.message}`);
        break;
      }

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
  _startListening();
  logger.debug("AI Agent Service initialized, listener auto-registered");

  return {
    // State
    panelState,
    config,
    context,
    isOpen,
    isExpanded,
    totalItemsCount,

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
    _setContextData,
    _onPreviewChanges,
  };
}
