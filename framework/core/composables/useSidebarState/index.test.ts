import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";

// Mock useMenuExpanded before importing the composable
vi.mock("@shared/composables/useMenuExpanded", () => ({
  useMenuExpanded: () => ({
    isExpanded: ref(false),
    isHoverExpanded: ref(false),
    toggleExpanded: vi.fn(),
    toggleHoverExpanded: vi.fn(),
  }),
}));

import { provideSidebarState, useSidebarState } from "./index";

describe("provideSidebarState", () => {
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
    const { result } = mountWithSetup(() => provideSidebarState());
    // Both false by default from mock
    expect(result.isExpanded.value).toBe(false);

    // When isPinned is set to true
    result.isPinned.value = true;
    expect(result.isExpanded.value).toBe(true);
  });
});

describe("useSidebarState", () => {
  it("throws when used without provider", () => {
    expect(() => {
      mountWithSetup(() => useSidebarState());
    }).toThrow("useSidebarState() requires provideSidebarState() in a parent component");
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
});
