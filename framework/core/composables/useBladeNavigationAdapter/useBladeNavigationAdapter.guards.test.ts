/**
 * End-to-end counterpart to the guard-inversion truth table in
 * useBladeNavigationAdapter.test.ts.
 *
 * That file asserts what the adapter hands to `registerBeforeClose`; this one
 * runs the legacy API against a REAL BladeStack so the observable effect of the
 * inversion is pinned too: a legacy guard returning `false` must leave the blade
 * on the stack.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref } from "vue";
import { createBladeStack } from "@core/blade-navigation/useBladeStack";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";

// A mutable holder lets each test run against a freshly created stack while the
// adapter keeps reading the (mocked) module-level singletons.
const holder = vi.hoisted(() => ({
  stack: undefined as unknown,
  router: undefined as unknown,
  messaging: { callParent: vi.fn(), exposeToChildren: vi.fn() },
  registry: { getBlade: vi.fn(), getBladeComponent: vi.fn(), getBladeByRoute: vi.fn() },
  syncUrlPush: vi.fn(),
  syncUrlReplace: vi.fn(),
}));

vi.mock("@core/blade-navigation/singletons", () => ({
  get bladeStackInstance() {
    return holder.stack;
  },
  get bladeMessagingInstance() {
    return holder.messaging;
  },
  get bladeRegistryInstance() {
    return holder.registry;
  },
  get bladeNavigationInstance() {
    return { router: holder.router };
  },
}));

// Record the sync calls instead of hitting a router: with the real stack behind
// the adapter, this is the only place a URL write can be tied to a close that
// the stack actually performed.
vi.mock("@core/blade-navigation/utils/urlSync", () => ({
  buildUrlFromStack: vi.fn().mockReturnValue({ path: "/", query: {} }),
  createUrlSync: vi.fn(() => ({ syncUrlPush: holder.syncUrlPush, syncUrlReplace: holder.syncUrlReplace })),
  getTenantPrefix: vi.fn().mockReturnValue(""),
}));

import { useBladeNavigation, _resetAdapterState } from "@core/composables/useBladeNavigationAdapter";

const REGISTERED_BLADES: Record<string, { route: string }> = {
  Workspace: { route: "/ws" },
  Child: { route: "/child" },
};

function makeRegistry(): IBladeRegistry {
  return {
    getBlade: (name: string) => REGISTERED_BLADES[name],
    getBladeComponent: () => undefined,
    getBladeByRoute: () => undefined,
  } as unknown as IBladeRegistry;
}

function stack() {
  return holder.stack as ReturnType<typeof createBladeStack>;
}

beforeEach(async () => {
  holder.stack = createBladeStack(makeRegistry());
  holder.router = {
    currentRoute: ref({ path: "/", params: {}, query: {} }),
    getRoutes: () => [],
    options: { history: { replace: vi.fn() } },
    push: vi.fn().mockResolvedValue(undefined),
    replace: vi.fn().mockResolvedValue(undefined),
  };

  holder.messaging.callParent.mockReset();
  holder.messaging.exposeToChildren.mockReset();
  holder.syncUrlPush.mockClear();
  holder.syncUrlReplace.mockClear();
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});

  // Workspace at index 0, one child at index 1 — the child is the active blade,
  // so the adapter's onBeforeClose (no component context) registers against it.
  await stack().openWorkspace({ name: "Workspace" });
  await stack().openBlade({ name: "Child" });
});

afterEach(() => {
  _resetAdapterState();
  vi.restoreAllMocks();
});

describe("legacy onBeforeClose against a real BladeStack", () => {
  it("registers the guard on the active (child) blade, not on the workspace", async () => {
    const guard = vi.fn().mockResolvedValue(false);

    const nav = useBladeNavigation();
    nav.onBeforeClose(guard);

    // Divergence from the legacy implementation: called outside a blade, the old
    // singleton registered the callback on the active WORKSPACE, while the
    // adapter falls back to the active blade. Called from inside a blade (the
    // production path) both target the caller's own blade.
    // Closing the child by id must hit the guard. Had it landed on the
    // workspace id, the child would close unguarded.
    await stack().closeBlade(stack().blades.value[1].id);

    expect(guard).toHaveBeenCalledTimes(1);
    expect(stack().blades.value).toHaveLength(2);
  });

  it("a legacy guard returning false prevents closeBlade(index)", async () => {
    const guard = vi.fn().mockResolvedValue(false);

    const nav = useBladeNavigation();
    nav.onBeforeClose(guard);

    const prevented = await nav.closeBlade(1);

    // The adapter returns the stack's `prevented` flag verbatim, so `true` here
    // means the close was BLOCKED — the opposite of what the legacy method name
    // suggests. Pinned as current behaviour.
    expect(prevented).toBe(true);
    expect(guard).toHaveBeenCalledTimes(1);
    expect(stack().blades.value).toHaveLength(2);
  });

  it.each([
    ["true", true],
    ["undefined", undefined],
  ])("a legacy guard returning %s allows closeBlade(index)", async (_label, value) => {
    const guard = vi.fn().mockResolvedValue(value);

    const nav = useBladeNavigation();
    nav.onBeforeClose(guard);

    const prevented = await nav.closeBlade(1);

    expect(prevented).toBe(false);
    expect(guard).toHaveBeenCalledTimes(1);
    expect(stack().blades.value).toHaveLength(1);
  });

  it("closes without any registered guard", async () => {
    const nav = useBladeNavigation();

    await expect(nav.closeBlade(1)).resolves.toBe(false);
    expect(stack().blades.value).toHaveLength(1);
  });

  it("a preventing guard also blocks the implicit close when a sibling blade opens", async () => {
    const nav = useBladeNavigation();
    nav.onBeforeClose(async () => false);

    // Opening from the workspace would close the child; the guard vetoes it.
    await stack().openBlade({ name: "Child", parentId: stack().workspace.value!.id });

    expect(stack().blades.value).toHaveLength(2);
    expect(nav.blades.value).toHaveLength(2);
  });

  it("a guard does not carry over to a freshly opened blade of the same name", async () => {
    const guard = vi.fn().mockResolvedValue(false);

    const nav = useBladeNavigation();
    nav.onBeforeClose(guard);

    await expect(nav.closeBlade(1)).resolves.toBe(true);
    guard.mockResolvedValue(undefined);
    await expect(nav.closeBlade(1)).resolves.toBe(false);
    expect(guard).toHaveBeenCalledTimes(2);

    // Closing a blade runs _cleanupBlade (useBladeStack.ts:60-65), which drops
    // its guard, so the replacement Child opens unguarded.
    await stack().openBlade({ name: "Child" });
    await expect(nav.closeBlade(1)).resolves.toBe(false);

    expect(guard).toHaveBeenCalledTimes(2);
    expect(stack().blades.value).toHaveLength(1);
  });
});
