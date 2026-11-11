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
});
