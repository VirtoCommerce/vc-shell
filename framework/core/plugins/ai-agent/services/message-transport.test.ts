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
