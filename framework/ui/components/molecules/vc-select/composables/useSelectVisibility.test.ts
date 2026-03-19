import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useSelectVisibility } from "./useSelectVisibility";

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  // Helper to trigger entries
  trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.callback(entries as IntersectionObserverEntry[], this as any);
  }
}

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useSelectVisibility", () => {
  it("initializes with isSelectVisible = false", () => {
    const { result } = mountWithSetup(() => useSelectVisibility());
    expect(result.isSelectVisible.value).toBe(false);
  });

  it("selectRootRef starts as null", () => {
    const { result } = mountWithSetup(() => useSelectVisibility());
    expect(result.selectRootRef.value).toBeNull();
  });

  it("ensureVisibility sets isSelectVisible when element is in viewport", () => {
    const { result } = mountWithSetup(() => useSelectVisibility());

    const el = document.createElement("div");
    Object.defineProperty(el, "getBoundingClientRect", {
      value: () => ({ top: 0, bottom: 100, left: 0, right: 100 }),
    });
    result.selectRootRef.value = el as any;

    result.ensureVisibility();
    expect(result.isSelectVisible.value).toBe(true);
  });

  it("ensureVisibility does nothing when already visible", () => {
    const { result } = mountWithSetup(() => useSelectVisibility());

    result.isSelectVisible.value = true;
    const el = document.createElement("div");
    result.selectRootRef.value = el as any;

    // Should not throw or change anything
    result.ensureVisibility();
    expect(result.isSelectVisible.value).toBe(true);
  });

  it("ensureVisibility does nothing when no element", () => {
    const { result } = mountWithSetup(() => useSelectVisibility());

    result.ensureVisibility();
    expect(result.isSelectVisible.value).toBe(false);
  });

  it("returns ensureVisibility function", () => {
    const { result } = mountWithSetup(() => useSelectVisibility());
    expect(typeof result.ensureVisibility).toBe("function");
  });
});
