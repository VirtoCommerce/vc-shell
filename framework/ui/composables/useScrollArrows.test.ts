import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

// Mock @vueuse/core
vi.mock("@vueuse/core", () => ({
  useResizeObserver: vi.fn(),
}));

import { isScrolledToEnd, useScrollArrows } from "./useScrollArrows";

describe("useScrollArrows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("initializes with both arrows hidden", () => {
    const viewportRef = ref<HTMLElement | null>(null);
    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));

    expect(result.canScrollUp.value).toBe(false);
    expect(result.canScrollDown.value).toBe(false);
  });

  it("updateScrollState sets canScrollUp when scrollTop > 0", () => {
    const el = {
      scrollTop: 50,
      scrollHeight: 300,
      clientHeight: 200,
    } as HTMLElement;
    const viewportRef = ref<HTMLElement | null>(el);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));
    result.updateScrollState();

    expect(result.canScrollUp.value).toBe(true);
    expect(result.canScrollDown.value).toBe(true);
  });

  it("updateScrollState sets canScrollDown to false at bottom", () => {
    const el = {
      scrollTop: 100,
      scrollHeight: 300,
      clientHeight: 200,
    } as HTMLElement;
    const viewportRef = ref<HTMLElement | null>(el);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));
    result.updateScrollState();

    // scrollTop(100) >= scrollHeight(300) - clientHeight(200) = 100
    expect(result.canScrollDown.value).toBe(false);
  });

  // Measured in a browser at 90% and 67% zoom with the list scrolled as far as it goes: the
  // position stops a fraction short of scrollHeight - clientHeight, which are rounded.
  it.each([
    ["90% zoom", 0.9, { scrollTop: 1710, scrollHeight: 1921, clientHeight: 210 }],
    ["67% zoom", 0.67, { scrollTop: 431.34, scrollHeight: 641, clientHeight: 208 }],
  ])("updateScrollState hides the down arrow at the end under %s", (_zoom, dpr, metrics) => {
    vi.spyOn(window, "devicePixelRatio", "get").mockReturnValue(dpr);
    const viewportRef = ref<HTMLElement | null>(metrics as HTMLElement);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));
    result.updateScrollState();

    expect(result.canScrollDown.value).toBe(false);
  });

  it("updateScrollState sets both false when no element", () => {
    const viewportRef = ref<HTMLElement | null>(null);
    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));

    result.updateScrollState();

    expect(result.canScrollUp.value).toBe(false);
    expect(result.canScrollDown.value).toBe(false);
  });

  it("startScroll scrolls down by increasing scrollTop", () => {
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      if (!rafCallback) rafCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const el = {
      scrollTop: 0,
      scrollHeight: 300,
      clientHeight: 200,
    } as HTMLElement;
    const viewportRef = ref<HTMLElement | null>(el);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));
    result.startScroll("down");

    // Execute one frame
    if (rafCallback) rafCallback(0);

    expect(el.scrollTop).toBe(2); // default speed = 2
  });

  it("startScroll scrolls up by decreasing scrollTop", () => {
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      if (!rafCallback) rafCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const el = {
      scrollTop: 50,
      scrollHeight: 300,
      clientHeight: 200,
    } as HTMLElement;
    const viewportRef = ref<HTMLElement | null>(el);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));
    result.startScroll("up");

    if (rafCallback) rafCallback(0);

    expect(el.scrollTop).toBe(48); // 50 - 2
  });

  it("stopScroll cancels animation", () => {
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);

    const el = {
      scrollTop: 0,
      scrollHeight: 300,
      clientHeight: 200,
    } as HTMLElement;
    const viewportRef = ref<HTMLElement | null>(el);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));
    result.startScroll("down");
    result.stopScroll();

    expect(cancelSpy).toHaveBeenCalledWith(42);
  });

  it("respects custom speed option", () => {
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      if (!rafCallback) rafCallback = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const el = {
      scrollTop: 0,
      scrollHeight: 300,
      clientHeight: 200,
    } as HTMLElement;
    const viewportRef = ref<HTMLElement | null>(el);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef, { speed: 5 }));
    result.startScroll("down");

    if (rafCallback) rafCallback(0);

    expect(el.scrollTop).toBe(5);
  });

  it("startScroll does nothing when no element", () => {
    vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    const viewportRef = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() => useScrollArrows(viewportRef));
    result.startScroll("down");

    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });
});

describe("isScrolledToEnd", () => {
  it.each([
    [{ scrollTop: 100, scrollHeight: 300, clientHeight: 200 }, true],
    [{ scrollTop: 99.4, scrollHeight: 300, clientHeight: 200 }, true],
    [{ scrollTop: 97, scrollHeight: 300, clientHeight: 200 }, false],
    [{ scrollTop: 0, scrollHeight: 200, clientHeight: 200 }, true],
  ])("reads %o as at the end: %s", (metrics, expected) => {
    expect(isScrolledToEnd(metrics as HTMLElement)).toBe(expected);
  });
});
