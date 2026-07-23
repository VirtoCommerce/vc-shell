import { describe, it, expect, vi, afterEach } from "vitest";
import { createShortcutDispatcher } from "./shortcut-dispatch";

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
});
