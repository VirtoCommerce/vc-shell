import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

// Mock floating-ui
vi.mock("@floating-ui/vue", () => ({
  useFloating: vi.fn((_ref, _float, opts) => ({
    x: ref(5),
    y: ref(10),
    placement: opts.placement,
    strategy: opts.strategy,
    isPositioned: ref(false),
    update: vi.fn(),
    middlewareData: ref({ sameWidth: { width: "200px" } }),
  })),
  flip: vi.fn(() => ({ name: "flip" })),
  shift: vi.fn(() => ({ name: "shift" })),
  offset: vi.fn(() => ({ name: "offset" })),
  autoUpdate: vi.fn(),
}));

// Mock useFloatingPosition
vi.mock("@ui/composables", () => ({
  useFloatingPosition: vi.fn(() => ({
    x: ref(5),
    y: ref(10),
    placement: ref("bottom"),
    strategy: ref("absolute"),
    isPositioned: ref(false),
    update: vi.fn(),
    middlewareData: ref({ sameWidth: { width: "200px" } }),
    floatingStyle: computed(() => ({})),
    resolvedPlacement: ref("bottom"),
    resolvedStrategy: ref("absolute"),
  })),
}));

import { useSelectDropdown } from "./useSelectDropdown";

function createOptions(overrides: Partial<Parameters<typeof useSelectDropdown>[0]> = {}) {
  return {
    placement: "bottom",
    outline: () => true,
    isSelectVisible: ref(true),
    selectRootRef: ref<HTMLElement | null>(null),
    disabled: () => false,
    ensureVisibility: vi.fn(),
    ...overrides,
  };
}

describe("useSelectDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with dropdown closed", () => {
    const { result } = mountWithSetup(() => useSelectDropdown(createOptions()));

    expect(result.isOpened.value).toBe(false);
    expect(result.isFocused.value).toBe(false);
  });

  it("toggleDropdown opens the dropdown", () => {
    const { result } = mountWithSetup(() => useSelectDropdown(createOptions()));

    result.toggleDropdown();
    expect(result.isOpened.value).toBe(true);
  });

  it("toggleDropdown closes when already open", () => {
    const { result } = mountWithSetup(() => useSelectDropdown(createOptions()));

    result.toggleDropdown();
    expect(result.isOpened.value).toBe(true);

    result.toggleDropdown();
    expect(result.isOpened.value).toBe(false);
  });

  it("toggleDropdown does nothing when disabled", () => {
    const { result } = mountWithSetup(() => useSelectDropdown(createOptions({ disabled: () => true })));

    result.toggleDropdown();
    expect(result.isOpened.value).toBe(false);
  });

  it("toggleDropdown calls ensureVisibility when not visible and opening", () => {
    const ensureVisibility = vi.fn();
    const { result } = mountWithSetup(() =>
      useSelectDropdown(
        createOptions({
          isSelectVisible: ref(false),
          ensureVisibility,
        }),
      ),
    );

    result.toggleDropdown();
    expect(ensureVisibility).toHaveBeenCalled();
  });

  it("toggleDropdown does not call ensureVisibility when already visible", () => {
    const ensureVisibility = vi.fn();
    const { result } = mountWithSetup(() =>
      useSelectDropdown(
        createOptions({
          isSelectVisible: ref(true),
          ensureVisibility,
        }),
      ),
    );

    result.toggleDropdown();
    expect(ensureVisibility).not.toHaveBeenCalled();
  });

  it("returns ref objects for dropdownToggleRef and dropdownRef", () => {
    const { result } = mountWithSetup(() => useSelectDropdown(createOptions()));

    expect(result.dropdownToggleRef.value).toBeNull();
    expect(result.dropdownRef.value).toBeNull();
  });

  it("dropdownStyle computes from popper values", () => {
    const { result } = mountWithSetup(() => useSelectDropdown(createOptions()));

    expect(result.dropdownStyle.value).toEqual({
      top: "10px",
      left: "5px",
      width: "200px",
    });
  });
});
