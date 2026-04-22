import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick } from "vue";
import { flushPromises } from "@vue/test-utils";
import { createAiAgentService } from "./ai-agent-service";

describe("createAiAgentService", () => {
  const userGetter = () => ({ id: "user-1", userName: "admin" });
  const bladeGetter = () => ({ id: "offers", name: "OfferDetails", title: "Offer #1" });
  const localeGetter = () => "en";
  const tokenGetter = async () => "token-123";

  let service: ReturnType<typeof createAiAgentService>;
  let postMessageSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    service = createAiAgentService({
      userGetter,
      bladeGetter,
      localeGetter,
      tokenGetter,
      initialConfig: { url: "https://chat.example.com" },
    });

    // Mock iframe contentWindow
    postMessageSpy = vi.fn();
    const mockIframe = {
      contentWindow: { postMessage: postMessageSpy },
    } as unknown as HTMLIFrameElement;
    service._setIframeRef(mockIframe);
  });

  afterEach(() => {
    service._stopListening();
    vi.useRealTimers();
  });

  it("sends INIT_CONTEXT on CHAT_READY", async () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "CHAT_READY" },
      }),
    );

    // buildInitPayload is async — flush the promise
    await flushPromises();

    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "INIT_CONTEXT",
        payload: expect.objectContaining({
          userId: "user-1",
          locale: "en",
          blade: expect.objectContaining({ id: "offers" }),
          accessToken: "token-123",
        }),
      }),
      "*",
    );
  });

  it("sends UPDATE_CONTEXT when context data changes while panel is open", async () => {
    // Initialize: trigger CHAT_READY to set isInitialized
    window.dispatchEvent(new MessageEvent("message", { data: { type: "CHAT_READY" } }));
    await flushPromises();

    // Open the panel
    service.openPanel();
    await nextTick();

    postMessageSpy.mockClear();

    // Update context data — this mutates contextItems which the deep watcher observes
    service._setContextData([{ id: "1", price: 99 }], "details", undefined, "offers");
    await nextTick();
    await flushPromises();

    const updateCall = postMessageSpy.mock.calls.find((call) => call[0]?.type === "UPDATE_CONTEXT");
    expect(updateCall).toBeDefined();
    expect(updateCall![0].payload.items).toEqual([{ id: "1", price: 99 }]);
  });

  it("dispatches PREVIEW_CHANGES to registered handlers", () => {
    const handler = vi.fn();
    service._onPreviewChanges(handler);

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "PREVIEW_CHANGES",
          payload: { data: { name: "New Name" }, changedFields: ["name"] },
        },
      }),
    );

    expect(handler).toHaveBeenCalledWith({
      data: { name: "New Name" },
      changedFields: ["name"],
    });
  });

  it("does not send UPDATE_CONTEXT when panel is closed", async () => {
    // Initialize: trigger CHAT_READY
    window.dispatchEvent(new MessageEvent("message", { data: { type: "CHAT_READY" } }));
    await flushPromises();
    // Panel stays closed (don't call openPanel)

    postMessageSpy.mockClear();

    service._setContextData([{ id: "1" }], "details", undefined, "offers");
    await nextTick();
    await flushPromises();

    const updateCall = postMessageSpy.mock.calls.find((call) => call[0]?.type === "UPDATE_CONTEXT");
    expect(updateCall).toBeUndefined();
  });
});
