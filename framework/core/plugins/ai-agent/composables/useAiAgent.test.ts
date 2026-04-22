import { computed, defineComponent, h, provide, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { AiAgentServiceKey, LanguageServiceKey, ToolbarServiceKey } from "@framework/injection-keys";
import {
  AI_AGENT_TOOLBAR_BUTTON_ICON,
  AI_AGENT_TOOLBAR_BUTTON_ID,
  AI_AGENT_TOOLBAR_BUTTON_TITLE,
} from "@core/plugins/ai-agent/constants";
import { createMockBladeReturn } from "@framework/test-mock-factories";

const mockBladeReturn = createMockBladeReturn();

const mocks = vi.hoisted(() => ({
  openBlade: vi.fn(),
  replaceCurrentBlade: vi.fn(),
  getAccessToken: vi.fn(),
  createAiAgentService: vi.fn(),
  registerToolbarItem: vi.fn(),
  currentUser: null as null | {
    id: string;
    userName: string;
    isAdministrator: boolean;
    permissions: string[];
  },
  blades: [] as Array<Record<string, unknown>>,
  activeBlade: undefined as Record<string, unknown> | undefined,
}));

vi.mock("@core/composables/useUser", () => ({
  useUser: () => ({
    user: ref(mocks.currentUser),
    getAccessToken: mocks.getAccessToken,
  }),
}));

vi.mock("@core/composables/useBlade", () => ({
  useBlade: () => ({ ...mockBladeReturn, openBlade: mocks.openBlade }),
}));

vi.mock("@core/blade-navigation", () => ({
  useBladeStack: () => ({
    blades: ref(mocks.blades),
    activeBlade: computed(() => mocks.activeBlade),
    replaceCurrentBlade: mocks.replaceCurrentBlade,
  }),
}));

vi.mock("@core/plugins/ai-agent/services/ai-agent-service", () => ({
  createAiAgentService: mocks.createAiAgentService,
}));

import { createAiAgentToolbarButton, provideAiAgentService, useAiAgent } from "./useAiAgent";

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

function mountWithProvidedService(mockService = createMockService()) {
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

  return { result: result!, mockService };
}

function mountWithAiAgentProvider(options?: {
  providerOptions?: Parameters<typeof provideAiAgentService>[0];
  withToolbar?: boolean;
  locale?: string;
}) {
  let providedService: ReturnType<typeof provideAiAgentService> | undefined;

  const ServiceConsumer = defineComponent({
    setup() {
      providedService = provideAiAgentService(options?.providerOptions);
      return () => h("div");
    },
  });

  const TestHost = defineComponent({
    setup() {
      provide(LanguageServiceKey, { currentLocale: ref(options?.locale ?? "en") } as any);
      if (options?.withToolbar !== false) {
        provide(ToolbarServiceKey, {
          registerToolbarItem: mocks.registerToolbarItem,
        } as any);
      }
      return () => h(ServiceConsumer);
    },
  });

  mount(TestHost);
  return providedService!;
}

describe("useAiAgent", () => {
  it("throws when service is not provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    try {
      expect(() => {
        mountWithSetup(() => useAiAgent());
      }).toThrow();
    } finally {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });

  it("returns full API when service is provided", () => {
    const { result } = mountWithProvidedService();

    expect(result).toHaveProperty("panelState");
    expect(result).toHaveProperty("config");
    expect(result).toHaveProperty("context");
    expect(result).toHaveProperty("isOpen");
    expect(result).toHaveProperty("isExpanded");
    expect(result).toHaveProperty("totalItemsCount");
    expect(result).toHaveProperty("openPanel");
    expect(result).toHaveProperty("closePanel");
    expect(result).toHaveProperty("togglePanel");
    expect(result).toHaveProperty("expandPanel");
    expect(result).toHaveProperty("collapsePanel");
    expect(result).toHaveProperty("setConfig");
    expect(result).toHaveProperty("sendMessage");
    expect(result).toHaveProperty("onMessage");
  });

  it("delegates method calls to the service", () => {
    const { result, mockService } = mountWithProvidedService();

    result.openPanel();
    expect(mockService.openPanel).toHaveBeenCalledOnce();

    result.closePanel();
    expect(mockService.closePanel).toHaveBeenCalledOnce();

    result.togglePanel();
    expect(mockService.togglePanel).toHaveBeenCalledOnce();

    result.setConfig({ endpoint: "/api" } as any);
    expect(mockService.setConfig).toHaveBeenCalledWith({ endpoint: "/api" });
  });

  it("exposes reactive state from service", () => {
    const { result } = mountWithProvidedService();

    expect(result.panelState.value).toBe("closed");
    expect(result.isOpen.value).toBe(false);
    expect(result.isExpanded.value).toBe(false);
    expect(result.totalItemsCount.value).toBe(0);
  });
});

describe("provideAiAgentService", () => {
  beforeEach(() => {
    mocks.openBlade.mockReset().mockResolvedValue(undefined);
    mocks.replaceCurrentBlade.mockReset().mockResolvedValue(undefined);
    mocks.getAccessToken.mockReset().mockResolvedValue("token");
    mocks.registerToolbarItem.mockReset();
    mocks.createAiAgentService.mockReset().mockImplementation(() => createMockService());
    mocks.currentUser = null;
    mocks.blades = [];
    mocks.activeBlade = undefined;
  });

  it("registers global toolbar button by default and wires click handler", () => {
    const service = mountWithAiAgentProvider();

    expect(mocks.createAiAgentService).toHaveBeenCalledTimes(1);
    expect(mocks.registerToolbarItem).toHaveBeenCalledTimes(1);

    const [toolbarItem, bladeScope] = mocks.registerToolbarItem.mock.calls[0];
    expect(bladeScope).toBe("*");
    expect(toolbarItem).toEqual(
      expect.objectContaining({
        id: AI_AGENT_TOOLBAR_BUTTON_ID,
        icon: AI_AGENT_TOOLBAR_BUTTON_ICON,
        title: AI_AGENT_TOOLBAR_BUTTON_TITLE,
      }),
    );

    toolbarItem.clickHandler();
    expect(service.togglePanel).toHaveBeenCalledTimes(1);
  });

  it("skips toolbar registration when addGlobalToolbarButton is false", () => {
    mountWithAiAgentProvider({ providerOptions: { addGlobalToolbarButton: false } });

    expect(mocks.registerToolbarItem).not.toHaveBeenCalled();
  });

  it("passes mapped user and locale getters to the service factory", () => {
    mocks.currentUser = {
      id: "u-1",
      userName: "tester",
      isAdministrator: true,
      permissions: ["read", "write"],
    };

    mountWithAiAgentProvider({ locale: "ru-RU" });
    const [options] = mocks.createAiAgentService.mock.calls[0];

    expect(options.userGetter()).toEqual({
      id: "u-1",
      userName: "tester",
      isAdministrator: true,
      permissions: ["read", "write"],
    });
    expect(options.localeGetter()).toBe("ru-RU");
    expect(options.tokenGetter).toBe(mocks.getAccessToken);
  });

  it("provides navigate and reload callbacks that use blade APIs", async () => {
    mocks.activeBlade = {
      name: "products-list",
      param: "p1",
      query: { q: "text" },
      options: { icon: "cube" },
    };

    mountWithAiAgentProvider();
    const [options] = mocks.createAiAgentService.mock.calls[0];

    options.navigateToBlade("orders-details", "42", { modal: true });
    await flushPromises();
    expect(mocks.openBlade).toHaveBeenCalledWith({
      name: "orders-details",
      param: "42",
      options: { modal: true },
    });

    options.reloadBlade();
    await flushPromises();
    expect(mocks.replaceCurrentBlade).toHaveBeenCalledWith({
      name: "products-list",
      param: "p1",
      query: { q: "text" },
      options: { icon: "cube" },
    });
  });

  it("does not reload blade when there is no active blade", () => {
    mountWithAiAgentProvider();
    const [options] = mocks.createAiAgentService.mock.calls[0];

    options.reloadBlade();
    expect(mocks.replaceCurrentBlade).not.toHaveBeenCalled();
  });

  it("handles openBlade rejection in navigate callback without throwing", async () => {
    mocks.openBlade.mockRejectedValueOnce(new Error("not found"));
    mountWithAiAgentProvider();
    const [options] = mocks.createAiAgentService.mock.calls[0];
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      expect(() => options.navigateToBlade("missing-blade")).not.toThrow();
      await flushPromises();
    } finally {
      warnSpy.mockRestore();
      errorSpy.mockRestore();
    }

    expect(mocks.openBlade).toHaveBeenCalledWith({
      name: "missing-blade",
      param: undefined,
      options: undefined,
    });
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
