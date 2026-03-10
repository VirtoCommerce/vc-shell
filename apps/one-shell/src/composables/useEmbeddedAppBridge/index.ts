import { ref, onUnmounted, type ShallowRef } from "vue";
import { useAiAgent } from "@vc-shell/framework";
import type {
  IAiContextUpdatePayload,
  IAiChatMessagePayload,
  IAiAgentMessage,
} from "@vc-shell/framework";
import {
  EMBEDDED_TO_HOST_MESSAGE_TYPES,
  HOST_TO_EMBEDDED_MESSAGE_TYPES,
} from "@vc-shell/framework";

export function useEmbeddedAppBridge(iframeRef: Readonly<ShallowRef<HTMLIFrameElement | null>>) {
  const isAppReady = ref(false);
  const isContextInitialized = ref(false);
  const pendingContext = ref<IAiContextUpdatePayload | null>(null);
  const { togglePanel, sendMessage, onMessage } = useAiAgent();

  /**
   * Send message to embedded app iframe
   */
  function sendToEmbeddedApp(message: { type: string; payload?: unknown }) {
    const iframe = iframeRef.value;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(message, "*");
  }

  /**
   * Handle messages from embedded app
   */
  function handleMessage(event: MessageEvent) {
    const message = event.data;
    if (!message?.type || typeof message.type !== "string") return;

    // Verify message comes from our iframe
    const iframe = iframeRef.value;
    if (!iframe?.contentWindow) return;
    if (event.source !== iframe.contentWindow) return;

    switch (message.type) {
      case EMBEDDED_TO_HOST_MESSAGE_TYPES.EMBEDDED_APP_READY: {
        isAppReady.value = true;
        sendToEmbeddedApp({ type: HOST_TO_EMBEDDED_MESSAGE_TYPES.EMBEDDED_HOST_READY });
        break;
      }

      case EMBEDDED_TO_HOST_MESSAGE_TYPES.AI_TOGGLE_PANEL: {
        togglePanel();
        break;
      }

      case EMBEDDED_TO_HOST_MESSAGE_TYPES.AI_CONTEXT_UPDATE: {
        const payload = message.payload as IAiContextUpdatePayload;
        if (payload) {
          pendingContext.value = payload;
          const messageType = isContextInitialized.value ? "UPDATE_CONTEXT" : "INIT_CONTEXT";
          sendMessage(messageType, payload);
          isContextInitialized.value = true;
        }
        break;
      }

      case EMBEDDED_TO_HOST_MESSAGE_TYPES.AI_CONTEXT_CLEAR: {
        sendMessage("UPDATE_CONTEXT", {
          blade: { id: "unknown", name: "unknown", title: "Unknown" },
          contextType: "list",
          items: [],
        });
        isContextInitialized.value = false;
        break;
      }

      default:
        break;
    }
  }

  // Listen for messages from embedded app
  window.addEventListener("message", handleMessage);

  // Forward chatbot messages to embedded app
  const chatToShellTypes = [
    "NAVIGATE_TO_APP", "EXPAND_IN_CHAT", "RELOAD_BLADE",
    "PREVIEW_CHANGES", "APPLY_CHANGES", "DOWNLOAD_FILE", "SHOW_MORE", "CHAT_ERROR",
  ];

  const unsubscribe = onMessage((message: IAiAgentMessage) => {
    // When chatbot iframe becomes ready, re-send stored context from embedded app
    if (message.type === "CHAT_READY" && pendingContext.value) {
      sendMessage("INIT_CONTEXT", pendingContext.value);
      isContextInitialized.value = true;
    }

    if (chatToShellTypes.includes(message.type)) {
      const chatMessage: IAiChatMessagePayload = {
        type: message.type as IAiChatMessagePayload["type"],
        payload: message.payload,
      };
      sendToEmbeddedApp({
        type: HOST_TO_EMBEDDED_MESSAGE_TYPES.AI_CHAT_MESSAGE,
        payload: chatMessage,
      });
    }
  });

  /**
   * Reset bridge state (call when iframe URL changes)
   */
  function reset() {
    isAppReady.value = false;
    isContextInitialized.value = false;
    pendingContext.value = null;
  }

  onUnmounted(() => {
    window.removeEventListener("message", handleMessage);
    unsubscribe();
  });

  return {
    isAppReady,
    reset,
  };
}
