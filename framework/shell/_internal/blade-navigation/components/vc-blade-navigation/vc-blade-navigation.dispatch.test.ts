import { describe, it, expect, vi, afterEach } from "vitest";
import { computed } from "vue";
import { createShortcutDispatcher } from "./shortcut-dispatch";
import { createBladeStack } from "@core/blade-navigation/useBladeStack";
import { buildUrlFromStack } from "@core/blade-navigation/utils/urlSync";
import type { IBladeStack } from "@core/blade-navigation/types";
import type { IBladeRegistry } from "@core/composables/useBladeRegistry";

function ev(init: Partial<KeyboardEvent> & { code?: string; key?: string }): KeyboardEvent {
  return {
    code: "",
    key: "",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    repeat: false,
    defaultPrevented: false,
    isComposing: false,
    preventDefault: vi.fn(),
    ...init,
  } as unknown as KeyboardEvent;
}

afterEach(() => (document.body.innerHTML = ""));

describe("createShortcutDispatcher", () => {
  const baseDeps = () => ({
    isMac: false,
    getActiveBlade: () => ({ id: "b1", parentId: "root" }) as any,
    getToolbarItems: (_id: string) => [] as any[],
    isMobile: () => false,
    isEnabled: (_item: any) => true,
    closeBlade: vi.fn(),
    toggleMaximized: vi.fn(),
    isModalOpen: () => false,
  });

  it("fires a toolbar shortcut and preventDefaults", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    const e = ev({ code: "KeyS", ctrlKey: true });
    await dispatch(e);
    expect(clickHandler).toHaveBeenCalledOnce();
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("ignores repeat events", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "KeyS", ctrlKey: true, repeat: true }));
    expect(clickHandler).not.toHaveBeenCalled();
  });

  it("skips when defaultPrevented", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "KeyS", ctrlKey: true, defaultPrevented: true }));
    expect(clickHandler).not.toHaveBeenCalled();
  });

  it("does not fire disabled toolbar items", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.isEnabled = () => false;
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "KeyS", ctrlKey: true }));
    expect(clickHandler).not.toHaveBeenCalled();
  });

  it("Esc closes a closable active blade", async () => {
    const deps = baseDeps();
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ key: "Escape" }));
    expect(deps.closeBlade).toHaveBeenCalledWith("b1");
  });

  it("Esc does nothing for a non-closable (workspace) blade", async () => {
    const deps = baseDeps();
    deps.getActiveBlade = () => ({ id: "b1", parentId: undefined }) as any;
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ key: "Escape" }));
    expect(deps.closeBlade).not.toHaveBeenCalled();
  });

  it("mod+backslash toggles maximize when desktop + closable", async () => {
    const deps = baseDeps();
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "Backslash", ctrlKey: true }));
    expect(deps.toggleMaximized).toHaveBeenCalledWith("b1");
  });

  it("mod+backslash does nothing on mobile", async () => {
    const deps = baseDeps();
    deps.isMobile = () => true;
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "Backslash", ctrlKey: true }));
    expect(deps.toggleMaximized).not.toHaveBeenCalled();
  });

  it("explicit toolbar shortcut wins over built-in Esc", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.getToolbarItems = () => [{ id: "cancel", shortcut: { key: "escape" }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ key: "Escape" }));
    expect(clickHandler).toHaveBeenCalledOnce();
    expect(deps.closeBlade).not.toHaveBeenCalled();
  });

  it("bare key suppressed while a text input is focused", async () => {
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.getToolbarItems = () => [{ id: "edit", shortcut: { key: "e" }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "KeyE" }));
    expect(clickHandler).not.toHaveBeenCalled();
  });

  it("does not fire a toolbar shortcut when a modal is open", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.isModalOpen = () => true;
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    const e = ev({ code: "KeyS", ctrlKey: true });
    await dispatch(e);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(e.preventDefault).not.toHaveBeenCalled();
  });

  it("does not fire built-in Esc when a modal is open", async () => {
    const deps = baseDeps();
    deps.isModalOpen = () => true;
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ key: "Escape" }));
    expect(deps.closeBlade).not.toHaveBeenCalled();
  });

  it("still fires a toolbar shortcut when no modal is open", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.isModalOpen = () => false;
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "KeyS", ctrlKey: true }));
    expect(clickHandler).toHaveBeenCalledOnce();
  });

  it("consumes the combo for a matched but disabled toolbar item (no browser default)", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.isEnabled = () => false;
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    const e = ev({ code: "KeyS", ctrlKey: true });
    await dispatch(e);
    expect(clickHandler).not.toHaveBeenCalled();
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("ignores shortcuts while an IME composition is in progress", async () => {
    const clickHandler = vi.fn();
    const deps = baseDeps();
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    await dispatch(ev({ code: "KeyS", ctrlKey: true, isComposing: true } as any));
    expect(clickHandler).not.toHaveBeenCalled();
  });

  it("does not reject when a matched handler throws, but still consumes the combo", async () => {
    const clickHandler = vi.fn(() => {
      throw new Error("boom");
    });
    const deps = baseDeps();
    deps.getToolbarItems = () => [{ id: "save", shortcut: { key: "s", mod: true }, clickHandler }];
    const dispatch = createShortcutDispatcher(deps);
    const e = ev({ code: "KeyS", ctrlKey: true });
    await expect(dispatch(e)).resolves.toBeUndefined();
    expect(e.preventDefault).toHaveBeenCalled();
  });
});

// Esc used to close the blade without syncing the URL: it was the only close
// path in vc-blade-navigation-new.vue that did not call syncUrlReplace, so the
// address bar stayed on the closed blade. The stack owns the sync now, so any
// dispatcher wired straight to closeBlade gets it. The wiring below mirrors the
// component's; it does not mount it, so it pins the dispatcher/stack pair only.
describe("Esc against the real blade stack", () => {
  function registry(): IBladeRegistry {
    const map = new Map<string, any>([
      ["Orders", { component: {}, route: "/orders", isWorkspace: true }],
      ["OrderDetails", { component: {}, route: "/order", isWorkspace: false }],
    ]);
    return {
      registeredBladesMap: computed(() => map),
      getBlade: (name: string) => map.get(name),
      getBladeComponent: (name: string) => map.get(name)?.component,
      getBladeByRoute: (route: string) => {
        const normalized = route.replace(/^\/+/, "");
        for (const [name, data] of map.entries()) {
          if (data.route?.replace(/^\/+/, "") === normalized) return { name, data };
        }
        return undefined;
      },
    } as IBladeRegistry;
  }

  function makeRecorder() {
    const calls: string[] = [];
    let bound: IBladeStack | undefined;
    const record = (verb: string) => () => calls.push(`${verb} ${buildUrlFromStack("", bound!.blades.value).path}`);
    return {
      calls,
      bind: (s: IBladeStack) => (bound = s),
      sink: { push: record("push"), replace: record("replace") },
    };
  }

  it("closes the blade AND replaces the URL", async () => {
    const { calls, bind, sink } = makeRecorder();
    const stack = createBladeStack(registry(), undefined, sink);
    bind(stack);

    await stack.openWorkspace({ name: "Orders" });
    await stack.openBlade({ name: "OrderDetails", param: "1" });
    calls.length = 0;

    const active = stack.activeBlade.value!;
    const dispatch = createShortcutDispatcher({
      isMac: false,
      getActiveBlade: () => stack.activeBlade.value,
      getToolbarItems: () => [],
      isMobile: () => false,
      isEnabled: () => true,
      closeBlade: (id) => stack.closeBlade(id),
      toggleMaximized: () => {},
      isModalOpen: () => false,
    });

    await dispatch(ev({ key: "Escape" }));

    expect(stack.blades.value.map((b) => b.name)).toEqual(["Orders"]);
    expect(stack.activeBlade.value?.id).not.toBe(active.id);
    expect(calls).toEqual(["replace /orders"]);
  });

  it("leaves the URL alone when a guard prevents the Esc close", async () => {
    const { calls, bind, sink } = makeRecorder();
    const stack = createBladeStack(registry(), undefined, sink);
    bind(stack);

    await stack.openWorkspace({ name: "Orders" });
    await stack.openBlade({ name: "OrderDetails", param: "1" });
    stack.registerBeforeClose(stack.activeBlade.value!.id, async () => true);
    calls.length = 0;

    const dispatch = createShortcutDispatcher({
      isMac: false,
      getActiveBlade: () => stack.activeBlade.value,
      getToolbarItems: () => [],
      isMobile: () => false,
      isEnabled: () => true,
      closeBlade: (id) => stack.closeBlade(id),
      toggleMaximized: () => {},
      isModalOpen: () => false,
    });

    await dispatch(ev({ key: "Escape" }));

    expect(stack.blades.value).toHaveLength(2);
    expect(calls).toEqual([]);
  });
});
