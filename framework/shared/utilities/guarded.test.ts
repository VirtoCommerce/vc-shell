import { describe, it, expect, vi } from "vitest";
import { guarded } from "./guarded";

describe("guarded", () => {
  it("calls the handler on first invocation", () => {
    const handler = vi.fn();
    const guardedFn = guarded(handler);

    guardedFn();

    expect(handler).toHaveBeenCalledOnce();
  });

  it("passes a release function to the handler", () => {
    let capturedRelease: (() => void) | undefined;
    const handler = vi.fn((release: () => void) => {
      capturedRelease = release;
    });
    const guardedFn = guarded(handler);

    guardedFn();

    expect(capturedRelease).toBeTypeOf("function");
  });

  it("blocks second call while locked", () => {
    const handler = vi.fn();
    const guardedFn = guarded(handler);

    guardedFn();
    guardedFn();

    expect(handler).toHaveBeenCalledOnce();
  });

  it("unblocks after release is called", () => {
    let capturedRelease: (() => void) | undefined;
    const handler = vi.fn((release: () => void) => {
      capturedRelease = release;
    });
    const guardedFn = guarded(handler);

    guardedFn();
    capturedRelease!();
    guardedFn();

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("release is idempotent — calling twice does not break anything", () => {
    let capturedRelease: (() => void) | undefined;
    const handler = vi.fn((release: () => void) => {
      capturedRelease = release;
    });
    const guardedFn = guarded(handler);

    guardedFn();
    capturedRelease!();
    capturedRelease!(); // second call — should be no-op

    guardedFn();
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
