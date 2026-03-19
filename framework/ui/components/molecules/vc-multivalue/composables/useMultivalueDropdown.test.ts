import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

// Mock floating-ui
vi.mock("@floating-ui/vue", () => ({
  useFloating: vi.fn((_ref, _float, opts) => ({
    x: ref(0),
    y: ref(0),
    placement: opts?.placement ?? ref("bottom"),
    strategy: opts?.strategy ?? ref("absolute"),
    isPositioned: ref(false),
    update: vi.fn(),
    middlewareData: ref({ sameWidth: { width: "300px" } }),
  })),
  flip: vi.fn(() => ({ name: "flip" })),
  shift: vi.fn(() => ({ name: "shift" })),
  offset: vi.fn(() => ({ name: "offset" })),
  autoUpdate: vi.fn(),
}));

// Mock useFloatingPosition
vi.mock("@ui/composables", () => ({
  useFloatingPosition: vi.fn(() => ({
    x: ref(0),
    y: ref(0),
    placement: ref("bottom"),
    strategy: ref("absolute"),
    isPositioned: ref(false),
    update: vi.fn(),
    middlewareData: ref({ sameWidth: { width: "300px" } }),
    floatingStyle: computed(() => ({})),
    resolvedPlacement: ref("bottom"),
    resolvedStrategy: ref("absolute"),
  })),
}));

// Mock useKeyboardNavigation
vi.mock("@core/composables/useKeyboardNavigation", () => ({
  useKeyboardNavigation: vi.fn(() => ({
    initKeyboardNavigation: vi.fn(),
    cleanupKeyboardNavigation: vi.fn(),
    focusedItemIndex: ref(-1),
  })),
}));

import { useMultivalueDropdown } from "./useMultivalueDropdown";

function createOptions(overrides: Partial<Parameters<typeof useMultivalueDropdown>[0]> = {}) {
  return {
    disabled: () => false,
    onItemSelect: vi.fn(),
    emit: { close: vi.fn() },
    ...overrides,
  };
}

describe("useMultivalueDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with dropdown closed", () => {
    const { result } = mountWithSetup(() => useMultivalueDropdown(createOptions()));

    expect(result.isOpened.value).toBe(false);
    expect(result.isFocused.value).toBe(false);
  });

  it("openDropdown opens and focuses", () => {
    const { result } = mountWithSetup(() => useMultivalueDropdown(createOptions()));

    result.openDropdown();

    expect(result.isOpened.value).toBe(true);
    expect(result.isFocused.value).toBe(true);
  });

  it("openDropdown does nothing when disabled", () => {
    const { result } = mountWithSetup(() =>
      useMultivalueDropdown(createOptions({ disabled: () => true })),
    );

    result.openDropdown();
    expect(result.isOpened.value).toBe(false);
  });

  it("closeDropdown closes and emits", () => {
    const emit = { close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useMultivalueDropdown(createOptions({ emit })),
    );

    result.openDropdown();
    result.closeDropdown();

    expect(result.isOpened.value).toBe(false);
    expect(result.isFocused.value).toBe(false);
    expect(emit.close).toHaveBeenCalled();
  });

  it("toggleDropdown opens when closed", () => {
    const { result } = mountWithSetup(() => useMultivalueDropdown(createOptions()));

    result.toggleDropdown();
    expect(result.isOpened.value).toBe(true);
  });

  it("toggleDropdown closes when open", () => {
    const emit = { close: vi.fn() };
    const { result } = mountWithSetup(() =>
      useMultivalueDropdown(createOptions({ emit })),
    );

    result.toggleDropdown();
    expect(result.isOpened.value).toBe(true);

    result.toggleDropdown();
    expect(result.isOpened.value).toBe(false);
    expect(emit.close).toHaveBeenCalled();
  });

  it("returns ref objects for dropdown elements", () => {
    const { result } = mountWithSetup(() => useMultivalueDropdown(createOptions()));

    expect(result.dropdownToggleRef.value).toBeNull();
    expect(result.dropdownRef.value).toBeNull();
    expect(result.searchRef.value).toBeNull();
  });

  it("dropdownStyle computes from popper values", () => {
    const { result } = mountWithSetup(() => useMultivalueDropdown(createOptions()));

    expect(result.dropdownStyle.value).toEqual({
      top: "0px",
      left: "0px",
      width: "300px",
    });
  });
});
