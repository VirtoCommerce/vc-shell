import { ref, computed, defineComponent, h, provide } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { AiAgentServiceKey } from "@framework/injection-keys";

// Mock modules that provideAiAgentService depends on
vi.mock("@core/composables/useUser", () => ({
  useUser: () => ({
    user: ref(null),
    getAccessToken: vi.fn().mockResolvedValue("token"),
  }),
}));

vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({
    openBlade: vi.fn(),
  }),
}));

vi.mock("@core/blade-navigation", () => ({
  useBladeStack: () => ({
    blades: ref([]),
    activeBlade: computed(() => undefined),
    replaceCurrentBlade: vi.fn(),
  }),
}));

import { useAiAgent, createAiAgentToolbarButton } from "./useAiAgent";

function createMockService() {
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
  };
}

describe("useAiAgent", () => {
  it("throws when service is not provided", () => {
    expect(() => {
      mountWithSetup(() => useAiAgent());
    }).toThrow();
  });

  it("returns full API when service is provided", () => {
    const mockService = createMockService();
    let result: ReturnType<typeof useAiAgent>;

    const Inner = defineComponent({
      setup() {
        result = useAiAgent();
        return () => h("div");
      },
    });
    const Outer = defineComponent({
      setup() {
        provide(AiAgentServiceKey, mockService as any);
        return () => h(Inner);
      },
    });
    mount(Outer);

    expect(result!).toHaveProperty("panelState");
    expect(result!).toHaveProperty("config");
    expect(result!).toHaveProperty("context");
    expect(result!).toHaveProperty("isOpen");
    expect(result!).toHaveProperty("isExpanded");
    expect(result!).toHaveProperty("totalItemsCount");
    expect(result!).toHaveProperty("openPanel");
    expect(result!).toHaveProperty("closePanel");
    expect(result!).toHaveProperty("togglePanel");
    expect(result!).toHaveProperty("expandPanel");
    expect(result!).toHaveProperty("collapsePanel");
    expect(result!).toHaveProperty("setConfig");
    expect(result!).toHaveProperty("sendMessage");
    expect(result!).toHaveProperty("onMessage");
  });

  it("delegates method calls to the service", () => {
    const mockService = createMockService();
    let result: ReturnType<typeof useAiAgent>;

    const Inner = defineComponent({
      setup() {
        result = useAiAgent();
        return () => h("div");
      },
    });
    const Outer = defineComponent({
      setup() {
        provide(AiAgentServiceKey, mockService as any);
        return () => h(Inner);
      },
    });
    mount(Outer);

    result!.openPanel();
    expect(mockService.openPanel).toHaveBeenCalledOnce();

    result!.closePanel();
    expect(mockService.closePanel).toHaveBeenCalledOnce();

    result!.togglePanel();
    expect(mockService.togglePanel).toHaveBeenCalledOnce();

    result!.setConfig({ endpoint: "/api" } as any);
    expect(mockService.setConfig).toHaveBeenCalledWith({ endpoint: "/api" });
  });

  it("exposes reactive state from service", () => {
    const mockService = createMockService();
    let result: ReturnType<typeof useAiAgent>;

    const Inner = defineComponent({
      setup() {
        result = useAiAgent();
        return () => h("div");
      },
    });
    const Outer = defineComponent({
      setup() {
        provide(AiAgentServiceKey, mockService as any);
        return () => h(Inner);
      },
    });
    mount(Outer);

    expect(result!.panelState.value).toBe("closed");
    expect(result!.isOpen.value).toBe(false);
    expect(result!.isExpanded.value).toBe(false);
    expect(result!.totalItemsCount.value).toBe(0);
  });
});

describe("createAiAgentToolbarButton (deprecated)", () => {
  it("returns a toolbar button descriptor", () => {
    const btn = createAiAgentToolbarButton();

    expect(btn.id).toBe("ai-agent-toggle");
    expect(btn.icon).toBe("lucide-sparkles");
    expect(btn.title).toBe("AI Assistant");
    expect(typeof btn.clickHandler).toBe("function");
  });

  it("accepts custom icon and title", () => {
    const btn = createAiAgentToolbarButton({ icon: "custom-icon", title: "Custom" });

    expect(btn.icon).toBe("custom-icon");
    expect(btn.title).toBe("Custom");
  });
});
