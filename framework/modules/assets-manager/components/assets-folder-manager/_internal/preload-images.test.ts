import { describe, it, expect, vi, afterEach } from "vitest";
import { preloadImages } from "./preload-images";

class FakeImage {
  static all: FakeImage[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = "";
  constructor() {
    FakeImage.all.push(this);
  }
}

describe("preloadImages", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    FakeImage.all = [];
  });

  it("resolves at once for no urls", async () => {
    await expect(preloadImages([], 1000)).resolves.toBeUndefined();
  });

  it("resolves when every image has loaded or failed", async () => {
    vi.stubGlobal("Image", FakeImage);
    let done = false;
    const pending = preloadImages(["/a.png", "/b.png"], 10_000).then(() => (done = true));
    expect(FakeImage.all.map((i) => i.src)).toEqual(["/a.png", "/b.png"]);
    FakeImage.all[0].onload?.();
    await Promise.resolve();
    expect(done).toBe(false);
    FakeImage.all[1].onerror?.();
    await pending;
    expect(done).toBe(true);
  });

  it("gives up after the timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("Image", FakeImage);
    const pending = preloadImages(["/slow.png"], 1500);
    await vi.advanceTimersByTimeAsync(1500);
    await expect(pending).resolves.toBeUndefined();
  });
});
