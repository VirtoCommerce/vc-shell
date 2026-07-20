import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useToastStack } from "./useToastStack";

describe("useToastStack", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts collapsed and not interacting", () => {
    const stack = useToastStack();
    expect(stack.expanded.value).toBe(false);
    expect(stack.interacting.value).toBe(false);
  });

  it("expandStack sets expanded immediately", () => {
    const stack = useToastStack();
    stack.expandStack();
    expect(stack.expanded.value).toBe(true);
  });

  it("collapseStack collapses after the 200ms debounce", () => {
    const stack = useToastStack();
    stack.expandStack();

    stack.collapseStack();
    // still expanded before the timer fires
    expect(stack.expanded.value).toBe(true);

    vi.advanceTimersByTime(199);
    expect(stack.expanded.value).toBe(true);

    vi.advanceTimersByTime(1);
    expect(stack.expanded.value).toBe(false);
  });

  it("expandStack cancels a pending collapse timer", () => {
    const stack = useToastStack();
    stack.expandStack();
    stack.collapseStack();

    // re-expand before the debounce elapses
    vi.advanceTimersByTime(100);
    stack.expandStack();

    // let the original timer's window pass — must NOT collapse
    vi.advanceTimersByTime(200);
    expect(stack.expanded.value).toBe(true);
  });

  it("collapseStack is a no-op while interacting", () => {
    const stack = useToastStack();
    stack.expandStack();
    stack.setInteracting(true);

    stack.collapseStack();
    vi.advanceTimersByTime(1000);
    expect(stack.expanded.value).toBe(true);
  });

  it("reportHeight stores rounded heights", () => {
    const stack = useToastStack();
    stack.reportHeight("a", 50.4);
    expect(stack.heightsMap.get("a")).toBe(50);
    stack.reportHeight("a", 50.6);
    expect(stack.heightsMap.get("a")).toBe(51);
  });

  it("forgetHeight removes a single entry", () => {
    const stack = useToastStack();
    stack.reportHeight("a", 10);
    stack.reportHeight("b", 20);
    stack.forgetHeight("a");
    expect(stack.heightsMap.has("a")).toBe(false);
    expect(stack.heightsMap.get("b")).toBe(20);
  });

  it("clearHeights empties the map", () => {
    const stack = useToastStack();
    stack.reportHeight("a", 10);
    stack.reportHeight("b", 20);
    stack.clearHeights();
    expect(stack.heightsMap.size).toBe(0);
  });

  it("setInteracting toggles the interacting ref", () => {
    const stack = useToastStack();
    stack.setInteracting(true);
    expect(stack.interacting.value).toBe(true);
    stack.setInteracting(false);
    expect(stack.interacting.value).toBe(false);
  });
});
