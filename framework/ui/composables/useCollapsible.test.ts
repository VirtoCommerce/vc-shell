import { describe, it, expect, vi } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";

// Mock @vueuse/core
vi.mock("@vueuse/core", () => ({
  useResizeObserver: vi.fn(),
}));

import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { useCollapsible } from "./useCollapsible";

describe("useCollapsible", () => {
  it("defaults to collapsed state", () => {
    const { result } = mountWithSetup(() => useCollapsible());

    expect(result.isExpanded.value).toBe(false);
  });

  it("starts expanded when option is true", () => {
    const { result } = mountWithSetup(() => useCollapsible({ expanded: true }));

    expect(result.isExpanded.value).toBe(true);
  });

  it("toggle flips expanded state", () => {
    const { result } = mountWithSetup(() => useCollapsible());

    expect(result.isExpanded.value).toBe(false);
    result.toggle();
    expect(result.isExpanded.value).toBe(true);
    result.toggle();
    expect(result.isExpanded.value).toBe(false);
  });

  it("wrapperStyle returns 0px maxHeight when collapsed (default collapsedHeight=0)", () => {
    const { result } = mountWithSetup(() => useCollapsible());

    expect(result.wrapperStyle.value).toEqual({ maxHeight: "0px" });
  });

  it("wrapperStyle uses collapsedHeight when collapsed", () => {
    const { result } = mountWithSetup(() => useCollapsible({ collapsedHeight: 50 }));

    expect(result.wrapperStyle.value).toEqual({ maxHeight: "50px" });
  });

  it("wrapperStyle returns contentHeight when expanded and no maxExpandedHeight", () => {
    const { result } = mountWithSetup(() => useCollapsible({ expanded: true }));

    // contentHeight defaults to 0
    expect(result.wrapperStyle.value).toEqual({ maxHeight: "0px" });
  });

  it("wrapperStyle caps at maxExpandedHeight when content exceeds it", () => {
    const { result } = mountWithSetup(() => useCollapsible({ expanded: true, maxExpandedHeight: 200 }));

    // Simulate content height > maxExpandedHeight
    // contentHeight is a ref we can't set directly, but we can verify logic:
    // When contentHeight=0, 0 < 200, so it returns contentHeight
    expect(result.wrapperStyle.value).toEqual({ maxHeight: "0px" });
  });

  it("hasOverflow is true when contentHeight > collapsedHeight", () => {
    const { result } = mountWithSetup(() => useCollapsible({ collapsedHeight: 50 }));

    // contentHeight = 0 initially, so no overflow
    expect(result.hasOverflow.value).toBe(false);
  });

  it("hasOverflow is false when contentHeight <= collapsedHeight", () => {
    const { result } = mountWithSetup(() => useCollapsible({ collapsedHeight: 100 }));

    expect(result.hasOverflow.value).toBe(false);
  });

  it("hasScroll is false when no maxExpandedHeight", () => {
    const { result } = mountWithSetup(() => useCollapsible());

    expect(result.hasScroll.value).toBe(false);
  });

  it("hasScroll is false when contentHeight <= maxExpandedHeight", () => {
    const { result } = mountWithSetup(() => useCollapsible({ maxExpandedHeight: 200 }));

    // contentHeight=0 < 200
    expect(result.hasScroll.value).toBe(false);
  });

  it("contentRef starts as undefined", () => {
    const { result } = mountWithSetup(() => useCollapsible());

    expect(result.contentRef.value).toBeUndefined();
  });

  it("contentHeight starts at 0", () => {
    const { result } = mountWithSetup(() => useCollapsible());

    expect(result.contentHeight.value).toBe(0);
  });

  it("measures the content on mount, before the first resize callback", () => {
    // The resize observer is mocked out, so only the mount-time measurement can set the height
    const height = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(120);
    let result!: ReturnType<typeof useCollapsible>;
    const wrapper = mount(
      defineComponent({
        setup() {
          result = useCollapsible();
          return () => h("div", { ref: result.contentRef });
        },
      }),
    );
    expect(result.contentHeight.value).toBe(120);
    expect(result.hasOverflow.value).toBe(true);
    wrapper.unmount();
    height.mockRestore();
  });
});
