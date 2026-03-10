import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ref, computed } from "vue";

// ── Hoist mock objects so they can be used in vi.mock factory ─────────────────
// vi.hoisted() creates values before hoisting, making them available in vi.mock.

const { mockStackBlades, mockStackActiveBlade, mockStackWorkspace, mockOpenBlade, mockGetBladeComponent } =
  vi.hoisted(() => {
    const mockStackBlades = { value: [] as any[] };
    const mockStackActiveBlade = { value: undefined as any };
    const mockStackWorkspace = { value: undefined as any };
    const mockOpenBlade = vi.fn().mockResolvedValue(undefined);
    const mockGetBladeComponent = vi.fn().mockReturnValue(undefined);
    return { mockStackBlades, mockStackActiveBlade, mockStackWorkspace, mockOpenBlade, mockGetBladeComponent };
  });

// ── Mock the module-level singletons from plugin-v2 ───────────────────────────
// useBladeNavigation reads bladeStackInstance, bladeMessagingInstance, etc.
// directly from plugin-v2 (NOT via inject()). We must mock the module.

vi.mock("@shared/components/blade-navigation/plugin-v2", () => ({
  bladeStackInstance: {
    blades: mockStackBlades,
    workspace: mockStackWorkspace,
    activeBlade: mockStackActiveBlade,
    openBlade: mockOpenBlade,
    openWorkspace: vi.fn().mockResolvedValue(undefined),
    closeBlade: vi.fn().mockResolvedValue(false),
    replaceCurrentBlade: vi.fn().mockResolvedValue(undefined),
    registerBeforeClose: vi.fn(),
    setBladeError: vi.fn(),
    clearBladeError: vi.fn(),
  },
  bladeMessagingInstance: {
    callParent: vi.fn().mockResolvedValue(undefined),
    exposeToChildren: vi.fn(),
  },
  bladeRegistryInstance: {
    registeredBladesMap: computed(() => new Map()),
    getBlade: vi.fn(),
    getBladeComponent: mockGetBladeComponent,
    getBladeByRoute: vi.fn(),
  },
  bladeNavigationInstance: {
    router: {
      currentRoute: ref({ path: "/", params: {}, query: {} }),
      getRoutes: vi.fn().mockReturnValue([]),
      options: { history: { replace: vi.fn() } },
      push: vi.fn().mockResolvedValue(undefined),
      replace: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

// Mock urlSync to avoid real router interaction
vi.mock("@shared/components/blade-navigation/utils/urlSync", () => ({
  buildUrlFromStack: vi.fn().mockReturnValue("/"),
  createUrlSync: vi.fn().mockReturnValue({
    syncUrlPush: vi.fn(),
    syncUrlReplace: vi.fn(),
  }),
  getTenantPrefix: vi.fn().mockReturnValue(""),
}));

// Import after mocks are registered
import {
  useBladeNavigation,
  _resetAdapterState,
} from "@shared/components/blade-navigation/composables/useBladeNavigationAdapter";

afterEach(() => {
  // Clear cached computeds and deprecation warned set between tests
  _resetAdapterState();
});

beforeEach(() => {
  // Reset stack refs to empty state
  mockStackBlades.value = [];
  mockStackWorkspace.value = undefined;
  mockStackActiveBlade.value = undefined;
  // Reset mock call counts
  mockOpenBlade.mockClear();
  mockGetBladeComponent.mockClear();
});

// ── useBladeNavigation() ──────────────────────────────────────────────────────

describe("useBladeNavigation()", () => {
  it("returns expected interface shape", () => {
    const nav = useBladeNavigation();
    expect(nav.blades).toBeDefined();
    expect(nav.activeWorkspace).toBeDefined();
    expect(typeof nav.openBlade).toBe("function");
    expect(typeof nav.closeBlade).toBe("function");
    expect(typeof nav.goToRoot).toBe("function");
    expect(typeof nav.onParentCall).toBe("function");
    expect(typeof nav.onBeforeClose).toBe("function");
    expect(typeof nav.resolveBladeByName).toBe("function");
    expect(typeof nav.routeResolver).toBe("function");
    expect(typeof nav.setBladeError).toBe("function");
    expect(typeof nav.clearBladeError).toBe("function");
  });

  it("blades computed reflects empty stack initially", () => {
    const nav = useBladeNavigation();
    expect(nav.blades.value).toHaveLength(0);
  });

  it("blades computed maps descriptors from bladeStack.blades", () => {
    // Set up bladeStack with one blade descriptor
    mockStackBlades.value = [
      {
        id: "blade-1",
        name: "TestBlade",
        param: "abc",
        options: undefined,
        visible: true,
        error: undefined,
        title: "Test Title",
        url: undefined,
        parentId: undefined,
        query: undefined,
      },
    ];

    const nav = useBladeNavigation();
    expect(nav.blades.value).toHaveLength(1);
    // BladeVNode shim maps descriptor.param to props.param
    expect(nav.blades.value[0].props.param).toBe("abc");
  });

  it("openBlade() delegates to bladeStack.openBlade", async () => {
    const nav = useBladeNavigation();
    await nav.openBlade({ blade: { name: "TargetBlade" }, param: "p1" });

    expect(mockOpenBlade).toHaveBeenCalledWith(
      expect.objectContaining({ name: "TargetBlade", param: "p1" }),
    );
  });

  it("resolveBladeByName delegates to bladeRegistry.getBladeComponent", () => {
    const nav = useBladeNavigation();
    nav.resolveBladeByName("SomeBlade");
    expect(mockGetBladeComponent).toHaveBeenCalledWith("SomeBlade");
  });
});
