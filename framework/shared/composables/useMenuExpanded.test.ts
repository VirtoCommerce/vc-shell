import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useMenuExpanded } from "./useMenuExpanded";

// Mock useLocalStorage to use a simple ref instead of actual localStorage
vi.mock("@vueuse/core", () => ({
  useLocalStorage: (_key: string, defaultValue: boolean) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ref } = require("vue");
    return ref(defaultValue);
  },
}));

describe("useMenuExpanded", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes with isExpanded=true and isHoverExpanded=false", () => {
    const { result } = mountWithSetup(() => useMenuExpanded());
    expect(result.isExpanded.value).toBe(true);
    expect(result.isHoverExpanded.value).toBe(false);
  });

  describe("toggleExpanded", () => {
    it("toggles isExpanded from true to false", () => {
      const { result } = mountWithSetup(() => useMenuExpanded());
      expect(result.isExpanded.value).toBe(true);
      result.toggleExpanded();
      expect(result.isExpanded.value).toBe(false);
    });

    it("toggles isExpanded from false to true", () => {
      const { result } = mountWithSetup(() => useMenuExpanded());
      result.isExpanded.value = false;
      result.toggleExpanded();
      expect(result.isExpanded.value).toBe(true);
    });
  });

  describe("toggleHoverExpanded", () => {
    it("sets isHoverExpanded=true after delay when shouldExpand=true", () => {
      const { result } = mountWithSetup(() => useMenuExpanded());
      result.toggleHoverExpanded(true);
      // Not yet set — delayed
      expect(result.isHoverExpanded.value).toBe(false);
      vi.advanceTimersByTime(200);
      expect(result.isHoverExpanded.value).toBe(true);
    });

    it("sets isHoverExpanded=false immediately when shouldExpand=false", () => {
      const { result } = mountWithSetup(() => useMenuExpanded());
      // First expand it
      result.toggleHoverExpanded(true);
      vi.advanceTimersByTime(200);
      expect(result.isHoverExpanded.value).toBe(true);
      // Now collapse immediately
      result.toggleHoverExpanded(false);
      expect(result.isHoverExpanded.value).toBe(false);
    });

    it("cancels pending expand when called again with false", () => {
      const { result } = mountWithSetup(() => useMenuExpanded());
      result.toggleHoverExpanded(true);
      vi.advanceTimersByTime(100); // halfway
      result.toggleHoverExpanded(false);
      vi.advanceTimersByTime(200); // past original timeout
      expect(result.isHoverExpanded.value).toBe(false);
    });

    it("does nothing when shouldExpand is undefined", () => {
      const { result } = mountWithSetup(() => useMenuExpanded());
      result.toggleHoverExpanded(undefined);
      vi.advanceTimersByTime(300);
      expect(result.isHoverExpanded.value).toBe(false);
    });

    it("cancels previous timeout when called rapidly", () => {
      const { result } = mountWithSetup(() => useMenuExpanded());
      result.toggleHoverExpanded(true);
      vi.advanceTimersByTime(100);
      result.toggleHoverExpanded(true); // resets timer
      vi.advanceTimersByTime(100);
      expect(result.isHoverExpanded.value).toBe(false); // still not triggered
      vi.advanceTimersByTime(100);
      expect(result.isHoverExpanded.value).toBe(true); // now triggered
    });
  });

  describe("cleanup on unmount", () => {
    it("cleans up timeout when component unmounts", () => {
      const { result, wrapper } = mountWithSetup(() => useMenuExpanded());
      result.toggleHoverExpanded(true);
      wrapper.unmount();
      // After unmount, advancing timers should not cause errors
      vi.advanceTimersByTime(300);
    });
  });
});
