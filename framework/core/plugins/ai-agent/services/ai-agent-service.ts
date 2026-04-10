import { ref, computed, watch, toValue, type MaybeRefOrGetter, type ShallowRef } from "vue";
import { createLogger } from "@core/utilities";
import type {
  IAiAgentService,
  IAiAgentConfig,
  IAiAgentContext,
  AiAgentMessageType,
  IAiAgentMessage,
  IPreviewChangesPayload,
  ISuggestion,
  AiAgentContextType,
  IAiAgentBladeContext,
  IAiAgentUserContext,
} from "@core/plugins/ai-agent/types";
import { DEFAULT_AI_AGENT_CONFIG } from "@core/plugins/ai-agent/constants";
import { createPanelController } from "./panel-controller";
import { createContextManager } from "./context-manager";
import { createMessageTransport } from "./message-transport";

const logger = createLogger("ai-agent-service");

/**
 * Options for creating the AI agent service
 */
export interface CreateAiAgentServiceOptions {
  /** Current user information (ref, getter, or plain value) */
  user: MaybeRefOrGetter<IAiAgentUserContext | undefined>;
  /** Current blade context (ref, getter, or plain value) */
  blade: MaybeRefOrGetter<IAiAgentBladeContext | null>;
  /** User locale (ref, getter, or plain value) */
  locale: MaybeRefOrGetter<string>;
  /** Function to get access token (handles automatic refresh) */
  tokenGetter?: () => Promise<string | null>;
  /** Function to navigate to blade */
  navigateToBlade?: (bladeName: string, param?: string, options?: Record<string, unknown>) => void;
  /** Function to reload current blade */
  reloadBlade?: () => void;
  /** Initial configuration */
  initialConfig?: Partial<IAiAgentConfig>;
  /** Whether the app is running in embedded mode (inside OneShell iframe) */
  isEmbedded?: boolean;
}

/**
 * Extended AI Agent Service with internal methods for component use
 */
export interface IAiAgentServiceInternal extends IAiAgentService {
  /** Reference to the iframe element (set by component) */
  iframeRef: ShallowRef<HTMLIFrameElement | null>;
  /** Set the iframe reference (called by component) */
  _setIframeRef: (iframe: HTMLIFrameElement | null) => void;
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
 * Creates an AI agent service by composing panel-controller, context-manager, and message-transport.
 */
export function createAiAgentService(options: CreateAiAgentServiceOptions): IAiAgentServiceInternal {
  const { user, blade, locale, tokenGetter, navigateToBlade, reloadBlade, initialConfig, isEmbedded = false } = options;

  const config = ref<IAiAgentConfig>({ ...DEFAULT_AI_AGENT_CONFIG, ...initialConfig });

  // Compose sub-modules
  const panel = createPanelController();

  const contextManager = createContextManager({
    user,
    blade,
    locale,
    tokenGetter,
  });

  const transport = createMessageTransport({
    getConfig: () => config.value,
    isEmbedded,
    navigateToBlade,
    reloadBlade,
  });

  // Context computed (no timestamp — clean dependency tracking)
  const context = computed<IAiAgentContext>(() => ({
    user: toValue(user),
    currentBlade: toValue(blade),
    items: contextManager.contextItems.value,
  }));

  // --- Wiring: connect modules together ---

  // Shared helper: flush pending INIT_CONTEXT when iframe becomes available
  const flushPendingInit = async () => {
    if (transport.pendingInitContext.value && transport.iframeRef.value?.contentWindow) {
      transport.pendingInitContext.value = false;
      panel.isInitialized.value = true;
      const payload = await contextManager.buildInitPayload();
      transport.sendToIframe({ type: "INIT_CONTEXT", payload });
      logger.debug("Flushed pending INIT_CONTEXT");
    }
  };

  // CHAT_READY → send INIT_CONTEXT (or mark pending if iframe ref not yet available)
  transport.onChatReady(() => {
    if (transport.iframeRef.value?.contentWindow) {
      panel.isInitialized.value = true;
      contextManager.buildInitPayload().then((payload) => {
        transport.sendToIframe({ type: "INIT_CONTEXT", payload });
        logger.info("Chatbot ready, sent INIT_CONTEXT");
      });
    } else {
      transport.pendingInitContext.value = true;
      logger.info("Chatbot ready, iframe ref not available yet — pending INIT_CONTEXT");
    }
  });

  // Watch iframe ref — flush pending INIT_CONTEXT when iframe becomes available
  watch(transport.iframeRef, () => flushPendingInit());

  // Watch context changes → UPDATE_CONTEXT (normal) or AI_CONTEXT_UPDATE (embedded)
  watch(
    context,
    async (newContext, oldContext) => {
      if (isEmbedded) {
        const payload = await contextManager.buildInitPayload();
        transport.sendToParent({ type: "AI_CONTEXT_UPDATE", payload });
        return;
      }
      if (!panel.isInitialized.value || !transport.iframeRef.value?.contentWindow) {
        return;
      }

      if (newContext.user?.id !== oldContext?.user?.id) {
        const payload = await contextManager.buildInitPayload();
        transport.sendToIframe({ type: "INIT_CONTEXT", payload });
      } else if (panel.isOpen.value) {
        const payload = await contextManager.buildUpdatePayload();
        transport.sendToIframe({ type: "UPDATE_CONTEXT", payload });
      }
    },
    { deep: true },
  );

  // Panel control — delegate to parent in embedded mode
  const openPanel = () => (isEmbedded ? transport.sendToParent({ type: "AI_TOGGLE_PANEL" }) : panel.open());
  const closePanel = () => (isEmbedded ? transport.sendToParent({ type: "AI_TOGGLE_PANEL" }) : panel.close());
  const togglePanel = () => (isEmbedded ? transport.sendToParent({ type: "AI_TOGGLE_PANEL" }) : panel.toggle());

  // _setIframeRef with pending context check
  const _setIframeRef = (iframe: HTMLIFrameElement | null) => {
    transport.setIframeRef(iframe);
    flushPendingInit();
  };

  // _setContextData with embedded clear notification
  const _setContextData = (
    items: Record<string, unknown>[],
    type: AiAgentContextType,
    suggestions?: ISuggestion[],
    bladeId?: string,
  ) => {
    const { cleared } = contextManager.setContextData(items, type, suggestions, bladeId);
    if (isEmbedded && cleared) {
      transport.sendToParent({ type: "AI_CONTEXT_CLEAR" });
    }
  };

  // Auto-start listener
  transport.startListening();

  // Embedded: notify parent
  if (isEmbedded) {
    transport.sendToParent({
      type: "EMBEDDED_APP_READY",
      payload: { supportedFeatures: ["ai-agent"] },
    });
    logger.info("Embedded mode: sent EMBEDDED_APP_READY to parent");
  }

  return {
    // State
    panelState: panel.panelState,
    config,
    context,
    isOpen: computed(() => !isEmbedded && panel.isOpen.value),
    isExpanded: panel.isExpanded,
    totalItemsCount: contextManager.totalItemsCount,

    // Panel control
    openPanel,
    closePanel,
    togglePanel,
    expandPanel: () => panel.expand(),
    collapsePanel: () => panel.collapse(),

    // Configuration
    setConfig: (newConfig: Partial<IAiAgentConfig>) => {
      config.value = { ...config.value, ...newConfig };
    },

    // Communication
    sendMessage: (type: AiAgentMessageType, payload: unknown) => {
      transport.sendToIframe({ type, payload });
    },
    onMessage: transport.onMessage,

    // Internal API
    iframeRef: transport.iframeRef,
    _setIframeRef,
    _startListening: transport.startListening,
    _stopListening: transport.stopListening,
    _setContextData,
    _onPreviewChanges: transport.onPreviewChanges,
  };
}
