import { ref, shallowRef, type ShallowRef } from "vue";
import { createLogger } from "@core/utilities";
import type {
  IAiAgentConfig,
  IAiAgentMessage,
  AiAgentMessageType,
  INavigateToAppPayload,
  IAiChatMessagePayload,
} from "@core/plugins/ai-agent/types";

const logger = createLogger("ai-agent-transport");

export interface MessageTransportOptions {
  getConfig: () => IAiAgentConfig;
  isEmbedded: boolean;
  navigateToBlade?: (bladeName: string, param?: string, options?: Record<string, unknown>) => void;
  /** Invoked on a CLOSE_PANEL message — the chatbot's only way to close the panel it has focus in. */
  closePanel?: () => void;
}

export interface MessageTransport {
  iframeRef: ShallowRef<HTMLIFrameElement | null>;
  pendingInitContext: ReturnType<typeof ref<boolean>>;
  isListenerRegistered: ReturnType<typeof ref<boolean>>;
  setIframeRef: (iframe: HTMLIFrameElement | null) => void;
  sendToIframe: (message: { type: string; payload?: unknown }) => void;
  sendToParent: (message: { type: string; payload?: unknown }) => void;
  startListening: () => void;
  stopListening: () => void;
  onChatReady: (handler: () => void) => () => void;
  onMessage: (handler: (event: IAiAgentMessage) => void) => () => void;
}

export function createMessageTransport(options: MessageTransportOptions): MessageTransport {
  const { getConfig, isEmbedded, navigateToBlade, closePanel } = options;

  const iframeRef: ShallowRef<HTMLIFrameElement | null> = shallowRef(null);
  const pendingInitContext = ref(false);
  const isListenerRegistered = ref(false);

  const messageHandlers = new Set<(event: IAiAgentMessage) => void>();
  const chatReadyHandlers = new Set<() => void>();

  /** Shared handler for all chat protocol messages (used by both normal and embedded) */
  function handleChatMessage(type: string, payload: unknown): void {
    switch (type) {
      case "NAVIGATE_TO_APP": {
        const navPayload = payload as INavigateToAppPayload;
        if (navigateToBlade && navPayload?.bladeName) {
          navigateToBlade(navPayload.bladeName, navPayload.param, navPayload.options);
          logger.debug(`Navigation requested to: ${navPayload.bladeName}`);
        }
        break;
      }
      // The panel's own Escape handler listens on the host document, which never sees a
      // keystroke delivered to a cross-origin iframe. So while the chatbot holds focus the
      // only route back is the chatbot relaying it here (VCST-5673). Closing a panel exposes
      // nothing, and the sender's origin and window are checked before this runs.
      case "CLOSE_PANEL": {
        if (closePanel) {
          closePanel();
          logger.debug("Panel close requested by the chatbot");
        }
        break;
      }
      default:
        break;
    }

    // Notify general message handlers
    const normalized: IAiAgentMessage = {
      type: type as AiAgentMessageType,
      payload,
      timestamp: Date.now(),
    };
    messageHandlers.forEach((handler) => {
      try {
        handler(normalized);
      } catch (e) {
        logger.error("Handler error:", e);
      }
    });
  }

  function handleIncomingMessage(event: MessageEvent): void {
    const config = getConfig();
    const allowedOrigins = config.allowedOrigins ?? [];
    if (allowedOrigins.length === 0) {
      logger.warn(
        "Ignoring postMessage: aiAgentConfig.allowedOrigins is empty. " +
          "Configure explicit origins to enable the AI agent bridge.",
        { origin: event.origin, type: event.data?.type },
      );
      return;
    }
    if (allowedOrigins.includes("*")) {
      logger.error(
        "Refusing postMessage with wildcard allowedOrigins. " +
          'Replace "*" with explicit origins (e.g. ["https://chat.example.com"]).',
      );
      return;
    }
    if (!allowedOrigins.includes(event.origin)) {
      return;
    }

    const expectedSource = isEmbedded ? window.parent : iframeRef.value?.contentWindow;
    if (!expectedSource || event.source !== expectedSource) {
      return;
    }

    const message = event.data;
    if (!message?.type || typeof message.type !== "string") return;

    logger.debug(`Message received: ${message.type}`);

    switch (message.type) {
      // Embedded: parent forwards chat messages wrapped in AI_CHAT_MESSAGE
      case "AI_CHAT_MESSAGE": {
        if (isEmbedded) {
          const chatMessage = message.payload as IAiChatMessagePayload;
          if (chatMessage?.type) {
            handleChatMessage(chatMessage.type, chatMessage.payload);
          }
        }
        return;
      }
      // Normal: chatbot signals it's ready
      case "CHAT_READY":
        chatReadyHandlers.forEach((h) => {
          try {
            h();
          } catch (e) {
            logger.error("ChatReady handler error:", e);
          }
        });
        break;
      // Normal: direct chat protocol messages
      default:
        handleChatMessage(message.type, message.payload);
        break;
    }
  }

  return {
    iframeRef,
    pendingInitContext,
    isListenerRegistered,

    setIframeRef(iframe: HTMLIFrameElement | null) {
      iframeRef.value = iframe;
      logger.debug("Iframe ref set:", iframe ? "available" : "null");
    },

    sendToIframe(message: { type: string; payload?: unknown }) {
      if (!iframeRef.value?.contentWindow) {
        logger.warn("Cannot send message: iframe not available");
        return;
      }
      const targetOrigin = getConfig().allowedOrigins?.[0];
      if (!targetOrigin || targetOrigin === "*") {
        logger.error(
          "Refusing to send to iframe: aiAgentConfig.allowedOrigins must contain an explicit origin. " +
            "Message dropped to avoid leaking data (including access tokens) to arbitrary origins.",
          { type: message.type },
        );
        return;
      }
      iframeRef.value.contentWindow.postMessage(message, targetOrigin);
      logger.debug(`Sent to iframe: ${message.type}`);
    },

    sendToParent(message: { type: string; payload?: unknown }) {
      if (!window.parent || window.parent === window) {
        logger.warn("Cannot send to parent: not in iframe");
        return;
      }
      const parentOrigin = getConfig().parentOrigin;
      if (!parentOrigin || parentOrigin === "*") {
        logger.error(
          "Refusing to send to parent: aiAgentConfig.parentOrigin must be an explicit origin. " +
            "Message dropped to avoid leaking data (including access tokens) to arbitrary origins.",
          { type: message.type },
        );
        return;
      }
      window.parent.postMessage(message, parentOrigin);
      logger.debug(`Sent to parent: ${message.type}`);
    },

    startListening() {
      if (!isListenerRegistered.value) {
        window.addEventListener("message", handleIncomingMessage);
        isListenerRegistered.value = true;
      }
    },

    stopListening() {
      if (isListenerRegistered.value) {
        window.removeEventListener("message", handleIncomingMessage);
        isListenerRegistered.value = false;
      }
    },

    onChatReady(handler: () => void) {
      chatReadyHandlers.add(handler);
      return () => {
        chatReadyHandlers.delete(handler);
      };
    },

    onMessage(handler: (event: IAiAgentMessage) => void) {
      messageHandlers.add(handler);
      return () => {
        messageHandlers.delete(handler);
      };
    },
  };
}
