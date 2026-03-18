import { ref, shallowRef, type ShallowRef } from "vue";
import { createLogger } from "@core/utilities";
import type {
  IAiAgentConfig,
  IAiAgentMessage,
  AiAgentMessageType,
  IPreviewChangesPayload,
  INavigateToAppPayload,
  IApplyChangesPayload,
  IDownloadFilePayload,
  IChatErrorPayload,
  IAiChatMessagePayload,
} from "@core/plugins/ai-agent/types";

const logger = createLogger("ai-agent-transport");

export interface MessageTransportOptions {
  getConfig: () => IAiAgentConfig;
  isEmbedded: boolean;
  navigateToBlade?: (bladeName: string, param?: string, options?: Record<string, unknown>) => void;
  reloadBlade?: () => void;
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
  onPreviewChanges: (handler: (payload: IPreviewChangesPayload) => void) => () => void;
  onMessage: (handler: (event: IAiAgentMessage) => void) => () => void;
}

function downloadFile(payload: IDownloadFilePayload): void {
  try {
    const byteCharacters = atob(payload.content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: payload.contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = payload.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logger.debug(`File downloaded: ${payload.filename}`);
  } catch (error) {
    logger.error("Failed to download file:", error);
  }
}

export function createMessageTransport(options: MessageTransportOptions): MessageTransport {
  const { getConfig, isEmbedded, navigateToBlade, reloadBlade } = options;

  const iframeRef: ShallowRef<HTMLIFrameElement | null> = shallowRef(null);
  const pendingInitContext = ref(false);
  const isListenerRegistered = ref(false);

  const messageHandlers = new Set<(event: IAiAgentMessage) => void>();
  const previewChangesHandlers = new Set<(payload: IPreviewChangesPayload) => void>();
  const chatReadyHandlers = new Set<() => void>();

  /** Shared handler for all chat protocol messages (used by both normal and embedded) */
  function handleChatMessage(type: string, payload: unknown): void {
    switch (type) {
      case "PREVIEW_CHANGES": {
        const previewPayload = payload as IPreviewChangesPayload;
        if (previewChangesHandlers.size === 0) {
          logger.warn("No preview changes handlers registered!");
        }
        previewChangesHandlers.forEach((handler) => {
          try {
            handler(previewPayload);
          } catch (e) {
            logger.error("Error in preview handler:", e);
          }
        });
        break;
      }
      case "NAVIGATE_TO_APP": {
        const navPayload = payload as INavigateToAppPayload;
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
      case "DOWNLOAD_FILE": {
        const dlPayload = payload as IDownloadFilePayload;
        if (dlPayload) downloadFile(dlPayload);
        break;
      }
      case "APPLY_CHANGES": {
        const changesPayload = payload as IApplyChangesPayload;
        logger.warn("APPLY_CHANGES received but not implemented:", changesPayload?.changes);
        break;
      }
      case "CHAT_ERROR": {
        const errPayload = payload as IChatErrorPayload;
        logger.error(`Chatbot error [${errPayload?.code}]: ${errPayload?.message}`);
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
    const allowedOrigins = config.allowedOrigins || ["*"];
    if (!allowedOrigins.includes("*") && !allowedOrigins.includes(event.origin)) {
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
      const config = getConfig();
      const targetOrigin = config.allowedOrigins?.[0] || "*";
      iframeRef.value.contentWindow.postMessage(message, targetOrigin);
      logger.debug(`Sent to iframe: ${message.type}`);
    },

    sendToParent(message: { type: string; payload?: unknown }) {
      if (!window.parent || window.parent === window) {
        logger.warn("Cannot send to parent: not in iframe");
        return;
      }
      window.parent.postMessage(message, "*");
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

    onPreviewChanges(handler: (payload: IPreviewChangesPayload) => void) {
      previewChangesHandlers.add(handler);
      return () => {
        previewChangesHandlers.delete(handler);
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
