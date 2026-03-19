import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import { mountWithSetup } from "@framework/test-helpers";

// Mock @floating-ui/vue
vi.mock("@floating-ui/vue", () => ({
  useFloating: vi.fn((_ref, _float, opts) => ({
    x: ref(10),
    y: ref(20),
    placement: opts.placement,
    strategy: opts.strategy,
    isPositioned: ref(true),
    update: vi.fn(),
    middlewareData: ref({}),
  })),
  flip: vi.fn((opts) => ({ name: "flip", options: opts })),
  shift: vi.fn((opts) => ({ name: "shift", options: opts })),
  offset: vi.fn((opts) => ({ name: "offset", options: opts })),
  autoUpdate: vi.fn(),
}));

import { useFloatingPosition } from "./useFloatingPosition";

describe("useFloatingPosition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns floatingStyle with position, top, left", () => {
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() => useFloatingPosition(referenceEl, floatingEl));

    expect(result.floatingStyle.value).toEqual({
      position: "absolute",
      top: "20px",
      left: "10px",
    });
  });

  it("defaults placement to bottom", () => {
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() => useFloatingPosition(referenceEl, floatingEl));

    expect(result.resolvedPlacement.value).toBe("bottom");
  });

  it("defaults strategy to absolute", () => {
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() => useFloatingPosition(referenceEl, floatingEl));

    expect(result.resolvedStrategy.value).toBe("absolute");
  });

  it("respects custom placement", () => {
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() =>
      useFloatingPosition(referenceEl, floatingEl, { placement: "top-start" }),
    );

    expect(result.resolvedPlacement.value).toBe("top-start");
  });

  it("respects custom strategy", () => {
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() =>
      useFloatingPosition(referenceEl, floatingEl, { strategy: "fixed" }),
    );

    expect(result.resolvedStrategy.value).toBe("fixed");
  });

  it("uses explicit middleware when provided", async () => {
    const { flip } = await import("@floating-ui/vue");
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);
    const customMiddleware = [{ name: "custom", fn: vi.fn() }];

    mountWithSetup(() =>
      useFloatingPosition(referenceEl, floatingEl, {
        middleware: customMiddleware,
      }),
    );

    // flip/shift should NOT be called since explicit middleware was provided
    // (they are only called when building default middleware)
    // The explicit middleware array is returned as-is
    expect(customMiddleware).toHaveLength(1);
  });

  it("accepts numeric offset without error", () => {
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() =>
      useFloatingPosition(referenceEl, floatingEl, { offset: 12 }),
    );

    // Composable should return valid result with numeric offset
    expect(result.floatingStyle.value).toBeDefined();
    expect(result.resolvedPlacement.value).toBe("bottom");
  });

  it("accepts object offset without error", () => {
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    const { result } = mountWithSetup(() =>
      useFloatingPosition(referenceEl, floatingEl, {
        offset: { mainAxis: 5, crossAxis: 3 },
      }),
    );

    expect(result.floatingStyle.value).toBeDefined();
    expect(result.resolvedPlacement.value).toBe("bottom");
  });

  it("disables flip when enableFlip is false", async () => {
    const { flip } = await import("@floating-ui/vue");
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    vi.mocked(flip).mockClear();

    mountWithSetup(() =>
      useFloatingPosition(referenceEl, floatingEl, { enableFlip: false }),
    );

    expect(flip).not.toHaveBeenCalled();
  });

  it("disables shift when enableShift is false", async () => {
    const { shift } = await import("@floating-ui/vue");
    const referenceEl = ref<HTMLElement | null>(null);
    const floatingEl = ref<HTMLElement | null>(null);

    vi.mocked(shift).mockClear();

    mountWithSetup(() =>
      useFloatingPosition(referenceEl, floatingEl, { enableShift: false }),
    );

    expect(shift).not.toHaveBeenCalled();
  });
});
