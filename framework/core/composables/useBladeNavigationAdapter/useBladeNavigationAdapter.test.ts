import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { computed, type Component } from "vue";

// ── Hoist mock objects so they can be used in vi.mock factory ─────────────────
// vi.hoisted() creates values before hoisting, making them available in vi.mock.

const {
  mockStackBlades,
  mockStackActiveBlade,
  mockStackWorkspace,
  mockOpenBlade,
  mockGetBladeComponent,
  mockOpenWorkspace,
  mockCoverCurrentBlade,
  mockReplaceCurrentBlade,
  mockCloseBlade,
  mockRegisterBeforeClose,
  mockSetBladeError,
  mockClearBladeError,
  mockCallParent,
  mockGetRoutes,
  mockGetTenantPrefix,
  mockHistoryReplace,
  mockCurrentRoute,
  mockSyncUrlPush,
  mockSyncUrlReplace,
} = vi.hoisted(() => {
  const mockStackBlades = { value: [] as any[] };
  const mockStackActiveBlade = { value: undefined as any };
  const mockStackWorkspace = { value: undefined as any };
  const mockOpenBlade = vi.fn().mockResolvedValue(undefined);
  const mockGetBladeComponent = vi.fn().mockReturnValue(undefined);
  const mockOpenWorkspace = vi.fn().mockResolvedValue(undefined);
  const mockCoverCurrentBlade = vi.fn().mockResolvedValue(undefined);
  const mockReplaceCurrentBlade = vi.fn().mockResolvedValue(undefined);
  const mockCloseBlade = vi.fn().mockResolvedValue(false);
  const mockRegisterBeforeClose = vi.fn();
  const mockSetBladeError = vi.fn();
  const mockClearBladeError = vi.fn();
  const mockCallParent = vi.fn().mockResolvedValue(undefined);
  const mockGetRoutes = vi.fn().mockReturnValue([] as any[]);
  const mockGetTenantPrefix = vi.fn().mockReturnValue("");
  const mockHistoryReplace = vi.fn();
  const mockCurrentRoute = { value: { path: "/", params: {} as Record<string, unknown>, query: {} } };
  const mockSyncUrlPush = vi.fn();
  const mockSyncUrlReplace = vi.fn();
  return {
    mockStackBlades,
    mockStackActiveBlade,
    mockStackWorkspace,
    mockOpenBlade,
    mockGetBladeComponent,
    mockOpenWorkspace,
    mockCoverCurrentBlade,
    mockReplaceCurrentBlade,
    mockCloseBlade,
    mockRegisterBeforeClose,
    mockSetBladeError,
    mockClearBladeError,
    mockCallParent,
    mockGetRoutes,
    mockGetTenantPrefix,
    mockHistoryReplace,
    mockCurrentRoute,
    mockSyncUrlPush,
    mockSyncUrlReplace,
  };
});

// ── Mock the module-level singletons from plugin-v2 ───────────────────────────
// useBladeNavigation reads bladeStackInstance, bladeMessagingInstance, etc.
// directly from plugin-v2 (NOT via inject()). We must mock the module.

vi.mock("@core/blade-navigation/singletons", () => ({
  bladeStackInstance: {
    blades: mockStackBlades,
    workspace: mockStackWorkspace,
    activeBlade: mockStackActiveBlade,
    openBlade: mockOpenBlade,
    openWorkspace: mockOpenWorkspace,
    closeBlade: mockCloseBlade,
    replaceCurrentBlade: mockReplaceCurrentBlade,
    coverCurrentBlade: mockCoverCurrentBlade,
    registerBeforeClose: mockRegisterBeforeClose,
    setBladeError: mockSetBladeError,
    clearBladeError: mockClearBladeError,
  },
  bladeMessagingInstance: {
    callParent: mockCallParent,
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
      currentRoute: mockCurrentRoute,
      getRoutes: mockGetRoutes,
      options: { history: { replace: mockHistoryReplace } },
      push: vi.fn().mockResolvedValue(undefined),
      replace: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

// Mock urlSync to avoid real router interaction
vi.mock("@core/blade-navigation/utils/urlSync", () => ({
  buildUrlFromStack: vi.fn().mockReturnValue("/"),
  createUrlSync: vi.fn().mockReturnValue({
    syncUrlPush: mockSyncUrlPush,
    syncUrlReplace: mockSyncUrlReplace,
  }),
  getTenantPrefix: mockGetTenantPrefix,
}));

// Import after mocks are registered
import { useBladeNavigation, _resetAdapterState } from "@core/composables/useBladeNavigationAdapter";

afterEach(() => {
  // Clear cached computeds and deprecation warned set between tests
  _resetAdapterState();
  vi.restoreAllMocks();
});

beforeEach(() => {
  // Reset stack refs to empty state
  mockStackBlades.value = [];
  mockStackWorkspace.value = undefined;
  mockStackActiveBlade.value = undefined;
  mockCurrentRoute.value = { path: "/", params: {}, query: {} };

  vi.clearAllMocks();

  // clearAllMocks wipes call history but not implementations (nor does
  // restoreAllMocks, for plain vi.fn()s), and several tests below override
  // them — re-arm so test order cannot matter. createUrlSync needs no re-arm:
  // nothing overrides it.
  mockOpenBlade.mockResolvedValue(undefined);
  mockOpenWorkspace.mockResolvedValue(undefined);
  mockCoverCurrentBlade.mockResolvedValue(undefined);
  mockReplaceCurrentBlade.mockResolvedValue(undefined);
  mockCloseBlade.mockResolvedValue(false);
  mockCallParent.mockResolvedValue(undefined);
  mockGetBladeComponent.mockReturnValue(undefined);
  mockGetRoutes.mockReturnValue([]);
  mockGetTenantPrefix.mockReturnValue("");
  window.location.hash = "";

  // The adapter warns on every deprecated call and logs on invalid indexes.
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
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

    expect(mockOpenBlade).toHaveBeenCalledWith(expect.objectContaining({ name: "TargetBlade", param: "p1" }));
  });

  it("resolveBladeByName delegates to bladeRegistry.getBladeComponent", () => {
    const nav = useBladeNavigation();
    nav.resolveBladeByName("SomeBlade");
    expect(mockGetBladeComponent).toHaveBeenCalledWith("SomeBlade");
  });
});

// ── onBeforeClose: the legacy ↔ new guard boolean inversion ───────────────────

describe("onBeforeClose() — guard boolean inversion (index.ts:309-316)", () => {
  // Legacy onBeforeClose : return `false` PREVENTS the close, anything else allows.
  // New registerBeforeClose: return `true`  PREVENTS the close.
  // The adapter bridges the two with `return result === false`.
  const cases: { name: string; legacy: () => Promise<boolean | undefined>; prevents: boolean }[] = [
    { name: "legacy false → registered guard resolves true (PREVENT)", legacy: async () => false, prevents: true },
    { name: "legacy true → registered guard resolves false (allow)", legacy: async () => true, prevents: false },
    {
      name: "legacy undefined → registered guard resolves false (allow)",
      legacy: async () => undefined,
      prevents: false,
    },
    {
      name: "async legacy false → registered guard resolves true (PREVENT)",
      legacy: () => Promise.resolve<boolean | undefined>(false),
      prevents: true,
    },
  ];

  it.each(cases)("$name", async ({ legacy, prevents }) => {
    mockStackActiveBlade.value = { id: "blade-1" };

    const nav = useBladeNavigation();
    nav.onBeforeClose(legacy);

    expect(mockRegisterBeforeClose).toHaveBeenCalledTimes(1);
    const [bladeId, registered] = mockRegisterBeforeClose.mock.calls[0] as [string, () => Promise<boolean>];
    expect(bladeId).toBe("blade-1");
    await expect(registered()).resolves.toBe(prevents);
  });

  it("a second onBeforeClose replaces the first on the same blade", async () => {
    // The stack keys guards by blade id in a Map, so re-registering overwrites.
    mockStackActiveBlade.value = { id: "blade-9" };
    const first = vi.fn().mockResolvedValue(false);
    const second = vi.fn().mockResolvedValue(undefined);

    const nav = useBladeNavigation();
    nav.onBeforeClose(first);
    nav.onBeforeClose(second);

    expect(mockRegisterBeforeClose).toHaveBeenCalledTimes(2);
    expect(mockRegisterBeforeClose.mock.calls.every(([id]) => id === "blade-9")).toBe(true);

    const [, latest] = mockRegisterBeforeClose.mock.calls[1] as [string, () => Promise<boolean>];
    await expect(latest()).resolves.toBe(false);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("propagates a throwing legacy guard out of the registered guard", async () => {
    // `await cb()` is unguarded (index.ts:314), so a rejecting legacy callback
    // rejects the stack's guard instead of resolving to allow/prevent.
    mockStackActiveBlade.value = { id: "blade-1" };

    const nav = useBladeNavigation();
    nav.onBeforeClose(async () => {
      throw new Error("guard exploded");
    });

    const [, registered] = mockRegisterBeforeClose.mock.calls[0] as [string, () => Promise<boolean>];
    await expect(registered()).rejects.toThrow("guard exploded");
  });

  it("registers nothing when no current blade can be determined", () => {
    mockStackActiveBlade.value = undefined;

    const nav = useBladeNavigation();
    nav.onBeforeClose(async () => false);

    expect(mockRegisterBeforeClose).not.toHaveBeenCalled();
  });
});

// ── openBlade: which stack verb the legacy flags select ───────────────────────

describe("openBlade() — legacy flags → stack verbs", () => {
  it("replaceCurrentBlade:true maps to stack.coverCurrentBlade, NOT stack.replaceCurrentBlade", async () => {
    // Intentional divergence, kept until the adapter is dropped:
    // useBlade().replaceWith maps the same word to stack.replaceCurrentBlade
    // (useBlade/index.ts:223). Do not "align" the adapter with it.
    const nav = useBladeNavigation();
    await nav.openBlade({ blade: { name: "Target" }, replaceCurrentBlade: true });

    expect(mockCoverCurrentBlade).toHaveBeenCalledWith(expect.objectContaining({ name: "Target" }));
    expect(mockReplaceCurrentBlade).not.toHaveBeenCalled();
    expect(mockOpenBlade).not.toHaveBeenCalled();
  });

  it("without the flag maps to stack.openBlade with the active blade as parent", async () => {
    mockStackActiveBlade.value = { id: "parent-1" };

    const nav = useBladeNavigation();
    await nav.openBlade({ blade: { name: "Target" } });

    expect(mockOpenBlade).toHaveBeenCalledWith(expect.objectContaining({ name: "Target", parentId: "parent-1" }));
    expect(mockCoverCurrentBlade).not.toHaveBeenCalled();
  });

  it("isWorkspace takes precedence over replaceCurrentBlade", async () => {
    const nav = useBladeNavigation();
    await nav.openBlade({ blade: { name: "Target" }, replaceCurrentBlade: true }, true);

    expect(mockOpenWorkspace).toHaveBeenCalledTimes(1);
    expect(mockCoverCurrentBlade).not.toHaveBeenCalled();
    expect(mockOpenBlade).not.toHaveBeenCalled();
  });

  it("extracts the blade name from a component constructor", async () => {
    const nav = useBladeNavigation();
    await nav.openBlade({ blade: { __name: "InferredBlade" } as unknown as Component });

    expect(mockOpenBlade).toHaveBeenCalledWith(expect.objectContaining({ name: "InferredBlade" }));
  });
});

// ── index → blade id translation ──────────────────────────────────────────────

describe("index → blade id translation (getBladeIdByIndex, index.ts:186)", () => {
  beforeEach(() => {
    mockStackBlades.value = [{ id: "b0" }, { id: "b1" }, { id: "b2" }];
  });

  it("closeBlade(index) closes the descriptor sitting at that index", async () => {
    const nav = useBladeNavigation();
    await nav.closeBlade(2);

    expect(mockCloseBlade).toHaveBeenCalledWith("b2");
  });

  it.each([-1, 3, 99])("closeBlade(%i) is an out-of-range no-op returning false", async (index) => {
    const nav = useBladeNavigation();
    await expect(nav.closeBlade(index)).resolves.toBe(false);

    // The adapter logs here, but vitest-mocks.setup.ts stubs @core/utilities'
    // createLogger globally, so there is no console call to assert on.
    expect(mockCloseBlade).not.toHaveBeenCalled();
    expect(mockSyncUrlReplace).not.toHaveBeenCalled();
  });

  it("setBladeError / clearBladeError address the descriptor at the index", () => {
    const error = new Error("boom");

    const nav = useBladeNavigation();
    nav.setBladeError(1, error);
    nav.clearBladeError(1);

    expect(mockSetBladeError).toHaveBeenCalledWith("b1", error);
    expect(mockClearBladeError).toHaveBeenCalledWith("b1");
  });

  it.each([-1, 5])("setBladeError / clearBladeError at out-of-range %i are silent no-ops", (index) => {
    const nav = useBladeNavigation();

    expect(() => nav.setBladeError(index, new Error("boom"))).not.toThrow();
    expect(() => nav.clearBladeError(index)).not.toThrow();
    expect(mockSetBladeError).not.toHaveBeenCalled();
    expect(mockClearBladeError).not.toHaveBeenCalled();
  });

  it("onParentCall(args, index) routes the call from the descriptor at that index", async () => {
    mockCallParent.mockResolvedValue("result");
    const callback = vi.fn();

    const nav = useBladeNavigation();
    await nav.onParentCall({ method: "refresh", args: { a: 1 }, callback }, 1);

    expect(mockCallParent).toHaveBeenCalledWith("b1", "refresh", { a: 1 });
    expect(callback).toHaveBeenCalledWith("result");
  });

  it("onParentCall without an index falls back to the active blade", async () => {
    mockStackActiveBlade.value = { id: "b2" };

    const nav = useBladeNavigation();
    await nav.onParentCall({ method: "refresh" });

    expect(mockCallParent).toHaveBeenCalledWith("b2", "refresh", undefined);
  });

  it("onParentCall with an out-of-range index does NOT fall back to the active blade", async () => {
    // `currentBladeIndex !== undefined` short-circuits the fallback
    // (index.ts:277-281), so an invalid index aborts the call instead of
    // routing it to the active blade. Pinning current behaviour.
    mockStackActiveBlade.value = { id: "b2" };

    const nav = useBladeNavigation();
    await nav.onParentCall({ method: "refresh" }, 42);

    expect(mockCallParent).not.toHaveBeenCalled();
  });

  it("onParentCall swallows a rejecting parent method and skips the callback", async () => {
    mockCallParent.mockRejectedValue(new Error("nope"));
    const callback = vi.fn();

    const nav = useBladeNavigation();
    await expect(nav.onParentCall({ method: "refresh", callback }, 1)).resolves.toBeUndefined();

    expect(callback).not.toHaveBeenCalled();
  });
});

// ── Navigation query round-trip ───────────────────────────────────────────────

describe("setNavigationQuery / getNavigationQuery (index.ts:334-372)", () => {
  beforeEach(() => {
    mockStackWorkspace.value = { id: "ws", name: "Offers" };
    window.location.hash = "#/offers";
  });

  it("namespaces every key with the lowercased workspace name", () => {
    const nav = useBladeNavigation();
    nav.setNavigationQuery({ page: 2, keyword: "abc" });

    expect(mockHistoryReplace).toHaveBeenCalledWith("/offers?offers_page=2&offers_keyword=abc");
  });

  it.each([
    ["abc", { page: 2, keyword: "abc" }],
    // Suspected bug (index.ts:346-350): decodeURIComponent is applied to the
    // whole query string, undoing the escaping URLSearchParams just did. The
    // "&" written as %26 comes back as a separator, so the value is truncated
    // at it and the remainder becomes a stray param of another namespace.
    ["a&b", { page: 2, keyword: "a" }],
    // Survives only because URLSearchParams splits on the FIRST "=".
    ["x=1", { page: 2, keyword: "x=1" }],
  ])('round-trips the keyword "%s" through the hash', (keyword, expected) => {
    const nav = useBladeNavigation();
    nav.setNavigationQuery({ page: 2, keyword });

    const written = mockHistoryReplace.mock.calls[0][0] as string;
    window.location.hash = `#${written}`;

    expect(nav.getNavigationQuery()).toEqual(expected);
  });

  it("reads only keys belonging to the current workspace namespace", () => {
    window.location.hash = "#/offers?offers_page=3&orders_page=9&loose=1";

    const nav = useBladeNavigation();
    expect(nav.getNavigationQuery()).toEqual({ page: 3 });
  });

  it("returns undefined when the hash holds nothing for this workspace", () => {
    window.location.hash = "#/offers?orders_page=9";

    const nav = useBladeNavigation();
    expect(nav.getNavigationQuery()).toBeUndefined();
  });

  it("is inert without a workspace", () => {
    mockStackWorkspace.value = undefined;

    const nav = useBladeNavigation();
    expect(nav.getNavigationQuery()).toBeUndefined();
    nav.setNavigationQuery({ page: 1 });
    expect(mockHistoryReplace).not.toHaveBeenCalled();
  });

  it("drops null and undefined values when writing", () => {
    const nav = useBladeNavigation();
    nav.setNavigationQuery({ page: 1, keyword: undefined, sort: null } as unknown as Record<string, string>);

    expect(mockHistoryReplace).toHaveBeenCalledWith("/offers?offers_page=1");
  });

  it("overwrites the whole query string, dropping foreign params already in the hash", () => {
    // Suspected bug: getNavigationQuery filters by `${prefix}_`, so foreign
    // namespaces are expected in the hash — but setNavigationQuery replaces the
    // entire query string and destroys them. Two workspaces cannot hold URL
    // state at the same time. Pinned as current behaviour.
    window.location.hash = "#/offers?orders_page=9";

    const nav = useBladeNavigation();
    nav.setNavigationQuery({ page: 1 });

    expect(mockHistoryReplace).toHaveBeenCalledWith("/offers?offers_page=1");
  });

  it.each([
    ["", 0],
    ["007", 7],
    ["1e3", 1000],
  ])('coerces the numeric-looking value "%s" on read', (raw, expected) => {
    // Suspected bug (index.ts:366-367): every value that Number() accepts is
    // returned as a number, so an empty string becomes 0, a zero-padded id
    // loses its padding and exponent notation is expanded. Pinned as current
    // behaviour, not fixed here.
    window.location.hash = `#/offers?offers_keyword=${raw}`;

    const nav = useBladeNavigation();
    expect(nav.getNavigationQuery()).toEqual({ keyword: expected });
  });
});

// ── goToRoot route resolution ─────────────────────────────────────────────────

describe("goToRoot() route resolution (index.ts:254-267)", () => {
  it("prefers the alias of the meta.root route and keeps the current params", () => {
    mockGetRoutes.mockReturnValue([
      { name: "Root", path: "/", meta: { root: true }, aliasOf: undefined },
      { name: "RootAlias", path: "/:sellerId", meta: {}, aliasOf: { path: "/" } },
    ]);
    mockCurrentRoute.value = { path: "/acme/offers", params: { sellerId: "acme" }, query: {} };

    const nav = useBladeNavigation();
    expect(nav.goToRoot()).toEqual({ name: "RootAlias", params: { sellerId: "acme" } });
  });

  it("falls back to the meta.root route itself when it has no alias", () => {
    mockGetRoutes.mockReturnValue([
      { name: "Login", path: "/login", meta: {}, aliasOf: { path: "/elsewhere" } },
      { name: "Root", path: "/", meta: { root: true }, aliasOf: undefined },
    ]);

    const nav = useBladeNavigation();
    expect(nav.goToRoot()).toEqual({ name: "Root", params: {} });
  });

  it("falls back to the tenant path when the router exposes no routes", () => {
    mockGetRoutes.mockReturnValue([]);

    const nav = useBladeNavigation();
    expect(nav.goToRoot()).toEqual({ path: "/" });
  });

  it("keeps the tenant prefix in the fallback path", () => {
    mockGetRoutes.mockReturnValue([]);
    mockGetTenantPrefix.mockReturnValue("acme");

    const nav = useBladeNavigation();
    expect(nav.goToRoot()).toEqual({ path: "/acme" });
  });

  it("resolves to the first alias-less route when NO route declares meta.root", () => {
    // Suspected bug (index.ts:256): with no meta.root route, `mainRoute` is
    // undefined, so the predicate degenerates to `r.aliasOf?.path === undefined`
    // — satisfied by every alias-less route. `find` therefore returns routes[0]
    // instead of leaving mainRouteAlias undefined and falling through to the
    // tenant-prefix path. Pinned as current behaviour, not fixed here.
    mockGetRoutes.mockReturnValue([
      { name: "Login", path: "/login", meta: {}, aliasOf: undefined },
      { name: "Offers", path: "/offers", meta: {}, aliasOf: undefined },
    ]);

    const nav = useBladeNavigation();
    expect(nav.goToRoot()).toEqual({ name: "Login", params: {} });
  });
});
