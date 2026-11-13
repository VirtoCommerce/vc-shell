import { describe, it, expect, vi, afterEach } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { modeForWidth, useBarMode } from "./useBarMode";

describe("modeForWidth", () => {
  it("modeForWidth: 719 medium, 720 wide, 479 narrow", () => {
    expect(modeForWidth(719)).toBe("medium");
    expect(modeForWidth(720)).toBe("wide");
    expect(modeForWidth(480)).toBe("medium");
    expect(modeForWidth(479)).toBe("narrow");
  });
});

describe("useBarMode", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("is wide before the first measurement, then follows the observed width", async () => {
    let report: ResizeObserverCallback | undefined;
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          report = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    const el = ref<HTMLElement>();
    const scope = effectScope();
    const { mode, width } = scope.run(() => useBarMode(el))!;
    expect(mode.value).toBe("wide");

    el.value = document.createElement("div");
    await nextTick();
    report!([{ contentRect: { width: 500 } } as ResizeObserverEntry], {} as ResizeObserver);
    expect(width.value).toBe(500);
    expect(mode.value).toBe("medium");
    scope.stop();
  });

  it("a border-box bar reads its border box: 720px with 16px padding is wide", async () => {
    let report: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(cb: ResizeObserverCallback) {
          report = cb;
        }
        observe = observe;
        disconnect() {}
      },
    );
    const el = ref<HTMLElement>(document.createElement("div"));
    const scope = effectScope();
    const { mode, width } = scope.run(() => useBarMode(el, "border-box"))!;
    expect(observe).toHaveBeenCalledWith(el.value, { box: "border-box" });
    report!(
      [{ contentRect: { width: 688 }, borderBoxSize: [{ inlineSize: 720 }] } as unknown as ResizeObserverEntry],
      {} as ResizeObserver,
    );
    expect(width.value).toBe(720);
    expect(mode.value).toBe("wide");
    scope.stop();
  });
});
