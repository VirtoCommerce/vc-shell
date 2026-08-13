import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createMessageTransport } from "./message-transport";
import type { IAiAgentConfig } from "@core/plugins/ai-agent/types";

function makeTransport(config: Partial<IAiAgentConfig>) {
  const fullConfig: IAiAgentConfig = { url: "https://chat.example.com", ...config };
  return createMessageTransport({
    getConfig: () => fullConfig,
    isEmbedded: false,
  });
}

describe("message-transport — incoming origin validation", () => {
  let transport: ReturnType<typeof createMessageTransport>;

  afterEach(() => {
    transport?.stopListening();
  });

  function dispatchChatReady(origin: string) {
    window.dispatchEvent(new MessageEvent("message", { data: { type: "CHAT_READY" }, origin }));
  }

  it("rejects incoming messages when allowedOrigins is empty", () => {
    transport = makeTransport({ allowedOrigins: [] });
    const onReady = vi.fn();
    transport.onChatReady(onReady);
    transport.startListening();

    dispatchChatReady("https://evil.example.com");
    expect(onReady).not.toHaveBeenCalled();
  });

  it("rejects incoming messages when allowedOrigins contains a wildcard", () => {
    transport = makeTransport({ allowedOrigins: ["*"] });
    const onReady = vi.fn();
    transport.onChatReady(onReady);
    transport.startListening();

    dispatchChatReady("https://chat.example.com");
    expect(onReady).not.toHaveBeenCalled();
  });

  it("rejects incoming messages from a non-listed origin", () => {
    transport = makeTransport({ allowedOrigins: ["https://chat.example.com"] });
    const onReady = vi.fn();
    transport.onChatReady(onReady);
    transport.startListening();

    dispatchChatReady("https://evil.example.com");
    expect(onReady).not.toHaveBeenCalled();
  });

  it("accepts incoming messages from an explicitly allowed origin", () => {
    transport = makeTransport({ allowedOrigins: ["https://chat.example.com"] });
    const onReady = vi.fn();
    transport.onChatReady(onReady);
    transport.startListening();

    dispatchChatReady("https://chat.example.com");
    expect(onReady).toHaveBeenCalledOnce();
  });
});

// The panel's Escape handler listens on the host document, which never sees a keystroke
// delivered to a cross-origin iframe. Once the chatbot takes focus, relaying it as a message
// is the only way to close the panel from the keyboard (VCST-5673).
describe("message-transport — CLOSE_PANEL", () => {
  let transport: ReturnType<typeof createMessageTransport>;
  let closePanel: ReturnType<typeof vi.fn>;

  function makeWithClose(allowedOrigins: string[]) {
    closePanel = vi.fn();
    return createMessageTransport({
      getConfig: () => ({ url: "https://chat.example.com", allowedOrigins }) as IAiAgentConfig,
      isEmbedded: false,
      closePanel,
    });
  }

  function dispatchClosePanel(origin: string) {
    window.dispatchEvent(new MessageEvent("message", { data: { type: "CLOSE_PANEL" }, origin }));
  }

  afterEach(() => {
    transport?.stopListening();
  });

  it("closes the panel when an allowed origin asks it to", () => {
    transport = makeWithClose(["https://chat.example.com"]);
    transport.startListening();

    dispatchClosePanel("https://chat.example.com");
    expect(closePanel).toHaveBeenCalledOnce();
  });

  it("ignores the request from an origin that is not allowed", () => {
    transport = makeWithClose(["https://chat.example.com"]);
    transport.startListening();

    dispatchClosePanel("https://evil.example.com");
    expect(closePanel).not.toHaveBeenCalled();
  });

  it("still notifies generic message handlers so a host can react to it", () => {
    transport = makeWithClose(["https://chat.example.com"]);
    const onMessage = vi.fn();
    transport.onMessage(onMessage);
    transport.startListening();

    dispatchClosePanel("https://chat.example.com");
    expect(onMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "CLOSE_PANEL" }));
  });
});

describe("message-transport — outbound sendToParent origin", () => {
  const realParent = window.parent;
  let parentPostMessage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    parentPostMessage = vi.fn();
    Object.defineProperty(window, "parent", {
      value: { postMessage: parentPostMessage },
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "parent", { value: realParent, configurable: true, writable: true });
  });

  it("drops outbound message when parentOrigin is missing", () => {
    const transport = makeTransport({});
    transport.sendToParent({ type: "AI_CONTEXT_UPDATE", payload: { accessToken: "secret" } });
    expect(parentPostMessage).not.toHaveBeenCalled();
  });

  it('drops outbound message when parentOrigin is "*"', () => {
    const transport = makeTransport({ parentOrigin: "*" });
    transport.sendToParent({ type: "AI_CONTEXT_UPDATE", payload: { accessToken: "secret" } });
    expect(parentPostMessage).not.toHaveBeenCalled();
  });

  it("posts to the exact parentOrigin when set", () => {
    const transport = makeTransport({ parentOrigin: "https://host.example.com" });
    const message = { type: "AI_CONTEXT_UPDATE", payload: { accessToken: "secret" } };
    transport.sendToParent(message);
    expect(parentPostMessage).toHaveBeenCalledWith(message, "https://host.example.com");
  });
});

describe("message-transport — outbound sendToIframe origin", () => {
  let iframePostMessage: ReturnType<typeof vi.fn>;

  function attachIframe(transport: ReturnType<typeof createMessageTransport>) {
    iframePostMessage = vi.fn();
    transport.setIframeRef({ contentWindow: { postMessage: iframePostMessage } } as unknown as HTMLIFrameElement);
  }

  it("drops outbound message when allowedOrigins is empty", () => {
    const transport = makeTransport({ allowedOrigins: [] });
    attachIframe(transport);
    transport.sendToIframe({ type: "INIT_CONTEXT", payload: { accessToken: "secret" } });
    expect(iframePostMessage).not.toHaveBeenCalled();
  });

  it('drops outbound message when the first allowedOrigin is "*"', () => {
    const transport = makeTransport({ allowedOrigins: ["*"] });
    attachIframe(transport);
    transport.sendToIframe({ type: "INIT_CONTEXT", payload: { accessToken: "secret" } });
    expect(iframePostMessage).not.toHaveBeenCalled();
  });

  it("posts to the first explicit allowedOrigin", () => {
    const transport = makeTransport({ allowedOrigins: ["https://chat.example.com"] });
    attachIframe(transport);
    const message = { type: "INIT_CONTEXT", payload: { accessToken: "secret" } };
    transport.sendToIframe(message);
    expect(iframePostMessage).toHaveBeenCalledWith(message, "https://chat.example.com");
  });

  it("does nothing when the iframe is not available", () => {
    const transport = makeTransport({ allowedOrigins: ["https://chat.example.com"] });
    iframePostMessage = vi.fn();
    // no setIframeRef → contentWindow absent
    expect(() => transport.sendToIframe({ type: "INIT_CONTEXT" })).not.toThrow();
    expect(iframePostMessage).not.toHaveBeenCalled();
  });
});
