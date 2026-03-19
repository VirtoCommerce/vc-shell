import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useVirtualScroll } from "./useVirtualScroll";

function makeItems(count: number) {
  return ref(Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${i}` })));
}

function setup(itemCount = 100, itemSize = 40, containerHeight = 200) {
  const items = makeItems(itemCount);
  const containerRef = ref<HTMLElement | null>(null);

  const { result, wrapper } = mountWithSetup(() => {
    const vs = useVirtualScroll({
      items,
      itemSize,
      containerRef,
      numToleratedItems: 2,
    });
    return vs;
  });

  // Simulate container being available with a given height
  // We need to set containerHeight and scrollTop manually since jsdom
  // doesn't have real layout
  result.containerHeight.value = containerHeight;

  return { result, wrapper, items, containerRef };
}

describe("useVirtualScroll", () => {
  it("totalHeight is items.length * itemSize", () => {
    const { result } = setup(100, 40);
    expect(result.totalHeight.value).toBe(4000);
  });

  it("visibleRange starts at 0 when scrollTop is 0", () => {
    const { result } = setup(100, 40, 200);
    result.scrollTop.value = 0;
    const range = result.visibleRange.value;
    expect(range.start).toBe(0);
    // end = min(100, 0 + ceil(200/40) + 2*2) = min(100, 9) = 9
    expect(range.end).toBe(9);
  });

  it("visibleItems returns only the windowed slice", () => {
    const { result } = setup(100, 40, 200);
    result.scrollTop.value = 0;
    const visible = result.visibleItems.value;
    expect(visible.length).toBeLessThan(100);
    expect(visible[0].index).toBe(0);
  });

  it("offsetY equals start * itemSize", () => {
    const { result } = setup(100, 40, 200);
    result.scrollTop.value = 400; // scroll past 10 items
    const range = result.visibleRange.value;
    expect(result.offsetY.value).toBe(range.start * 40);
  });

  it("visibleRange adjusts when scrollTop changes", () => {
    const { result } = setup(100, 40, 200);
    result.scrollTop.value = 0;
    const rangeBefore = result.visibleRange.value;

    result.scrollTop.value = 800; // scroll to item 20
    const rangeAfter = result.visibleRange.value;
    expect(rangeAfter.start).toBeGreaterThan(rangeBefore.start);
  });

  it("returns empty range when containerHeight is 0", () => {
    const { result } = setup(100, 40, 0);
    expect(result.visibleRange.value).toEqual({ start: 0, end: 0 });
  });

  it("returns empty range when items is empty", () => {
    const items = ref<any[]>([]);
    const containerRef = ref<HTMLElement | null>(null);
    const { result } = mountWithSetup(() =>
      useVirtualScroll({ items, itemSize: 40, containerRef }),
    );
    result.containerHeight.value = 200;
    expect(result.visibleRange.value).toEqual({ start: 0, end: 0 });
  });

  it("onScroll updates scrollTop from event target", () => {
    const { result } = setup(100, 40, 200);
    const fakeEl = { scrollTop: 600, clientHeight: 200 } as HTMLElement;
    const event = { target: fakeEl } as unknown as Event;
    result.onScroll(event);
    expect(result.scrollTop.value).toBe(600);
  });

  it("isLoading starts as false", () => {
    const { result } = setup();
    expect(result.isLoading.value).toBe(false);
  });

  it("scrollToIndex calls scrollTo on container", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const items = makeItems(100);
    const { result } = mountWithSetup(() =>
      useVirtualScroll({ items, itemSize: 40, containerRef }),
    );
    const mockScrollTo = vi.fn();
    containerRef.value = { scrollTo: mockScrollTo, clientHeight: 200, scrollTop: 0 } as any;
    result.scrollToIndex(10);
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 400, behavior: "auto" });
  });

  it("scrollToTop calls scrollTo with top=0", () => {
    const containerRef = ref<HTMLElement | null>(null);
    const items = makeItems(100);
    const { result } = mountWithSetup(() =>
      useVirtualScroll({ items, itemSize: 40, containerRef }),
    );
    const mockScrollTo = vi.fn();
    containerRef.value = { scrollTo: mockScrollTo, clientHeight: 200, scrollTop: 0 } as any;
    result.scrollToTop();
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
