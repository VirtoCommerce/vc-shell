import { ref, computed, defineComponent, h, provide, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { AiAgentServiceKey } from "@framework/injection-keys";
import { BladeDescriptorKey } from "@core/blade-navigation/types";
import { useAiAgentContext } from "./useAiAgentContext";

function createMockInternalService() {
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
  it("is a no-op when service is not provided", () => {
    const dataRef = ref({ id: "1", objectType: "Product", name: "Test" });
    expect(() => mountWithAiContext(() => useAiAgentContext({ dataRef }))).not.toThrow();
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
