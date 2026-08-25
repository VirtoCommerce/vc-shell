import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";

import { provideSidebarState, useSidebarState, sidebarStorageKey } from "./index";

describe("sidebarStorageKey", () => {
  it("uses the explicit app name when given", () => {
    expect(sidebarStorageKey("operations")).toBe("VC_APP_MENU_EXPANDED_operations");
  });

  it("derives the app name from the first path segment", () => {
    const segment = window.location.pathname.split("/").filter(Boolean)[0] ?? "default";
    expect(sidebarStorageKey()).toBe(`VC_APP_MENU_EXPANDED_${segment}`);
  });

  it("falls back to 'default' for an empty app name", () => {
    expect(sidebarStorageKey("")).toBe("VC_APP_MENU_EXPANDED_default");
  });
});

describe("provideSidebarState", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("returns sidebar state with expected shape", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    expect(result).toHaveProperty("isPinned");
    expect(result).toHaveProperty("isHoverExpanded");
    expect(result).toHaveProperty("isMenuOpen");
    expect(result).toHaveProperty("isExpanded");
    expect(result).toHaveProperty("togglePin");
    expect(result).toHaveProperty("setHoverExpanded");
    expect(result).toHaveProperty("openMenu");
    expect(result).toHaveProperty("closeMenu");
  });

  it("isPinned defaults to true and persists under the app-scoped key", async () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    expect(result.isPinned.value).toBe(true);

    result.togglePin();
    expect(result.isPinned.value).toBe(false);

    // useLocalStorage flushes on "pre", so the write lands after the tick
    await nextTick();
    expect(localStorage.getItem(sidebarStorageKey())).toBe("false");
  });

  it("reads the pinned state back from localStorage", () => {
    localStorage.setItem(sidebarStorageKey(), "false");
    const { result } = mountWithSetup(() => provideSidebarState());
    expect(result.isPinned.value).toBe(false);
  });

  it("isMenuOpen starts as false", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    expect(result.isMenuOpen.value).toBe(false);
  });

  it("openMenu sets isMenuOpen to true", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    result.openMenu();
    expect(result.isMenuOpen.value).toBe(true);
  });

  it("closeMenu sets isMenuOpen to false", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    result.openMenu();
    result.closeMenu();
    expect(result.isMenuOpen.value).toBe(false);
  });

  it("isExpanded is computed from isPinned and isHoverExpanded", () => {
    localStorage.setItem(sidebarStorageKey(), "false");
    const { result } = mountWithSetup(() => provideSidebarState());
    expect(result.isExpanded.value).toBe(false);

    result.isPinned.value = true;
    expect(result.isExpanded.value).toBe(true);
  });

  it("isExpanded is true while hover-expanded even when unpinned", () => {
    localStorage.setItem(sidebarStorageKey(), "false");
    const { result } = mountWithSetup(() => provideSidebarState());

    result.setHoverExpanded(true);
    vi.advanceTimersByTime(200);
    expect(result.isExpanded.value).toBe(true);

    result.setHoverExpanded(false);
    expect(result.isExpanded.value).toBe(false);
  });
});

describe("provideSidebarState hover debounce", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it("expands after a 200ms delay", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    result.setHoverExpanded(true);
    expect(result.isHoverExpanded.value).toBe(false);
    vi.advanceTimersByTime(199);
    expect(result.isHoverExpanded.value).toBe(false);
    vi.advanceTimersByTime(1);
    expect(result.isHoverExpanded.value).toBe(true);
  });

  it("collapses immediately", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    result.setHoverExpanded(true);
    vi.advanceTimersByTime(200);
    expect(result.isHoverExpanded.value).toBe(true);

    result.setHoverExpanded(false);
    expect(result.isHoverExpanded.value).toBe(false);
  });

  it("cancels a pending expand when collapsed within the delay", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    result.setHoverExpanded(true);
    vi.advanceTimersByTime(100);
    result.setHoverExpanded(false);
    vi.advanceTimersByTime(200);
    expect(result.isHoverExpanded.value).toBe(false);
  });

  it("restarts the delay when called repeatedly with true", () => {
    const { result } = mountWithSetup(() => provideSidebarState());
    result.setHoverExpanded(true);
    vi.advanceTimersByTime(100);
    result.setHoverExpanded(true);
    vi.advanceTimersByTime(100);
    expect(result.isHoverExpanded.value).toBe(false);
    vi.advanceTimersByTime(100);
    expect(result.isHoverExpanded.value).toBe(true);
  });

  it("clears the pending timeout when the scope is disposed", () => {
    const { result, wrapper } = mountWithSetup(() => provideSidebarState());
    result.setHoverExpanded(true);
    wrapper.unmount();
    vi.advanceTimersByTime(300);
    expect(result.isHoverExpanded.value).toBe(false);
  });
});

describe("useSidebarState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    // Restore real timers unconditionally: the hover case below mocks them, and a
    // failing assertion would otherwise leave every later test on fake timers.
    vi.useRealTimers();
    localStorage.clear();
  });

  it("throws when used without provider", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      mountWithSetup(() => useSidebarState());
    }).toThrow("useSidebarState() requires provideSidebarState() in a parent component");
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("returns provided state from parent", () => {
    let innerResult: ReturnType<typeof useSidebarState>;

    const Inner = defineComponent({
      setup() {
        innerResult = useSidebarState();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provideSidebarState();
        return () => h(Inner);
      },
    });

    mount(Outer);
    expect(innerResult!).toHaveProperty("isPinned");
    expect(innerResult!).toHaveProperty("openMenu");
  });

  it("two consumers share the same hover state", () => {
    vi.useFakeTimers();
    let a: ReturnType<typeof useSidebarState>;
    let b: ReturnType<typeof useSidebarState>;

    const ChildA = defineComponent({
      setup() {
        a = useSidebarState();
        return () => h("div");
      },
    });

    const ChildB = defineComponent({
      setup() {
        b = useSidebarState();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        provideSidebarState();
        return () => [h(ChildA), h(ChildB)];
      },
    });

    mount(Outer);
    expect(a!.isHoverExpanded).toBe(b!.isHoverExpanded);

    a!.setHoverExpanded(true);
    vi.advanceTimersByTime(200);
    expect(b!.isHoverExpanded.value).toBe(true);
  });

  it("provideSidebarState is idempotent inside one tree", () => {
    let inner: ReturnType<typeof useSidebarState>;
    let outer: ReturnType<typeof useSidebarState>;

    const Inner = defineComponent({
      setup() {
        inner = provideSidebarState();
        return () => h("div");
      },
    });

    const Outer = defineComponent({
      setup() {
        outer = provideSidebarState();
        return () => h(Inner);
      },
    });

    mount(Outer);
    expect(inner!).toBe(outer!);
  });
});
