import { ref, computed, defineComponent, h, provide, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { AiAgentServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { useAiAgentContext, clearPreviewState } from "./useAiAgentContext";

function createMockInternalService() {
  const previewHandlers: Array<(payload: any) => void> = [];

  return {
    panelState: ref("closed"),
    config: ref({}),
    context: computed(() => ({ items: [], contextType: "list" as const })),
    isOpen: computed(() => false),
    isExpanded: computed(() => false),
    totalItemsCount: computed(() => 0),
    openPanel: vi.fn(),
    closePanel: vi.fn(),
    togglePanel: vi.fn(),
    expandPanel: vi.fn(),
    collapsePanel: vi.fn(),
    setConfig: vi.fn(),
    sendMessage: vi.fn(),
    onMessage: vi.fn(() => vi.fn()),
    _setContextData: vi.fn(),
    _onPreviewChanges: vi.fn((handler: (payload: any) => void) => {
      previewHandlers.push(handler);
      return () => {
        const idx = previewHandlers.indexOf(handler);
        if (idx >= 0) previewHandlers.splice(idx, 1);
      };
    }),
    _simulatePreviewChanges(payload: any) {
      previewHandlers.forEach((h) => h(payload));
    },
    iframeRef: ref(null),
    _setIframeRef: vi.fn(),
    _startListening: vi.fn(),
    _stopListening: vi.fn(),
  };
}

function mountWithAiContext<T>(setupFn: () => T, service: ReturnType<typeof createMockInternalService> | null = null) {
  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      if (service) {
        provide(AiAgentServiceKey, service as any);
      }
      provide(
        BladeDescriptorKey,
        computed(() => ({ id: "test-blade-1", name: "TestBlade", visible: true })),
      );
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper, service };
}

describe("useAiAgentContext", () => {
  it("returns dummy preview state when service not provided", () => {
    const dataRef = ref({ id: "1", objectType: "Product", name: "Test" });
    const { result } = mountWithAiContext(() => useAiAgentContext({ dataRef }));

    expect(result.previewState.isActive.value).toBe(false);
    expect(result.previewState.changedFields.value).toEqual([]);
    expect(typeof result.clearPreview).toBe("function");
  });

  it("sets context data on mount via _setContextData", async () => {
    const service = createMockInternalService();
    const dataRef = ref({ id: "1", objectType: "Product", name: "Item" });
    mountWithAiContext(() => useAiAgentContext({ dataRef }), service);

    await nextTick();
    expect(service._setContextData).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "1", objectType: "Product" })]),
      "details",
      undefined,
      "test-blade-1",
    );
  });

  it("normalizes single object to array for context", async () => {
    const service = createMockInternalService();
    const dataRef = ref({ id: "x", objectType: "Offer", name: "My Offer" });
    mountWithAiContext(() => useAiAgentContext({ dataRef }), service);

    await nextTick();
    const call = service._setContextData.mock.calls[0];
    expect(Array.isArray(call[0])).toBe(true);
    expect(call[0]).toHaveLength(1);
  });

  it("detects array ref as list context type", async () => {
    const service = createMockInternalService();
    const dataRef = ref([
      { id: "1", objectType: "Product", name: "A" },
      { id: "2", objectType: "Product", name: "B" },
    ]);
    mountWithAiContext(() => useAiAgentContext({ dataRef }), service);

    await nextTick();
    const call = service._setContextData.mock.calls[0];
    expect(call[1]).toBe("list");
    // List context only sends id, objectType, name
    expect(call[0][0]).toEqual({ id: "1", objectType: "Product", name: "A" });
  });

  it("applies preview changes from service", async () => {
    const service = createMockInternalService();
    const dataRef = ref({ id: "1", objectType: "Product", name: "Old Name", price: 10 });
    const { result } = mountWithAiContext(() => useAiAgentContext({ dataRef }), service);

    service._simulatePreviewChanges({
      data: { name: "New Name" },
      changedFields: ["name"],
    });

    expect(dataRef.value.name).toBe("New Name");
    expect(dataRef.value.price).toBe(10); // unchanged
    expect(result.previewState.isActive.value).toBe(true);
    expect(result.previewState.changedFields.value).toEqual(["name"]);
  });

  it("clearPreview resets preview state", async () => {
    const service = createMockInternalService();
    const dataRef = ref({ id: "1", objectType: "Product", name: "Test" });
    const { result } = mountWithAiContext(() => useAiAgentContext({ dataRef }), service);

    service._simulatePreviewChanges({
      data: { name: "Changed" },
      changedFields: ["name"],
    });
    expect(result.previewState.isActive.value).toBe(true);

    result.clearPreview();
    expect(result.previewState.isActive.value).toBe(false);
    expect(result.previewState.changedFields.value).toEqual([]);
  });

  it("clears context on unmount", async () => {
    const service = createMockInternalService();
    const dataRef = ref({ id: "1", objectType: "Product", name: "Test" });
    const { wrapper } = mountWithAiContext(() => useAiAgentContext({ dataRef }), service);

    service._setContextData.mockClear();
    wrapper.unmount();

    expect(service._setContextData).toHaveBeenCalledWith([], "list", undefined, "test-blade-1");
  });

  it("passes suggestions to _setContextData", async () => {
    const service = createMockInternalService();
    const suggestions = [{ id: "s1", title: "Translate", prompt: "Do it" }] as any;
    const dataRef = ref({ id: "1", objectType: "Product", name: "Test" });
    mountWithAiContext(() => useAiAgentContext({ dataRef, suggestions }), service);

    await nextTick();
    expect(service._setContextData).toHaveBeenCalledWith(expect.anything(), "details", suggestions, "test-blade-1");
  });
});

describe("clearPreviewState (deprecated)", () => {
  it("logs a deprecation warning", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    clearPreviewState({ isActive: computed(() => false), changedFields: computed(() => []) });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("deprecated"));
    warnSpy.mockRestore();
  });
});
