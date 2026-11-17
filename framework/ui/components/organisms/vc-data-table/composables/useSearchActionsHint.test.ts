import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { useSearchActionsHint } from "./useSearchActionsHint";

let report: (() => void) | undefined;
class RO {
  constructor(cb: ResizeObserverCallback) {
    report = () => cb([], this as unknown as ResizeObserver);
  }
  observe() {}
  disconnect() {}
}

const box = (width: number) => {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({ width }) as DOMRect;
  return el;
};

describe("useSearchActionsHint", () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    report = undefined;
    vi.stubGlobal("ResizeObserver", RO);
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    warn.mockRestore();
  });

  const run = async (rowWidth: number, actionsWidth: number) => {
    const row = ref<HTMLElement>(box(rowWidth));
    const actions = ref<HTMLElement>(box(actionsWidth));
    const scope = effectScope();
    scope.run(() => useSearchActionsHint(row, actions));
    await nextTick();
    return { scope, actions };
  };

  it("warns once when the slot takes more than 40% of the row", async () => {
    const { scope } = await run(1000, 500);
    report?.();
    report?.();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("#header");
    scope.stop();
  });

  it("stays quiet for narrow slot content", async () => {
    const { scope } = await run(1000, 400);
    report?.();
    expect(warn).not.toHaveBeenCalled();
    scope.stop();
  });

  it("never warns in production", async () => {
    vi.stubEnv("DEV", false);
    const { scope } = await run(1000, 900);
    report?.();
    expect(report).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
    scope.stop();
  });
});
