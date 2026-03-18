import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Must be imported after vi.stubGlobal for navigator.connection mock
let useSlowNetworkDetection: typeof import("./index")["useSlowNetworkDetection"];
let _resetForTest: typeof import("./index")["_resetForTest"];

describe("useSlowNetworkDetection", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    // Reset module to clear singleton state
    vi.resetModules();
    const mod = await import("./index");
    useSlowNetworkDetection = mod.useSlowNetworkDetection;
    _resetForTest = mod._resetForTest;
  });

  afterEach(() => {
    _resetForTest?.();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("request timer channel", () => {
    it("isSlowNetwork stays false when request completes before threshold", () => {
      const { isSlowNetwork, trackRequest, untrackRequest } = useSlowNetworkDetection();

      trackRequest("req-1");
      vi.advanceTimersByTime(4999);
      expect(isSlowNetwork.value).toBe(false);

      untrackRequest("req-1");
      expect(isSlowNetwork.value).toBe(false);
    });

    it("isSlowNetwork becomes true when request exceeds threshold", () => {
      const { isSlowNetwork, trackRequest } = useSlowNetworkDetection();

      trackRequest("req-1");
      vi.advanceTimersByTime(5000);
      expect(isSlowNetwork.value).toBe(true);
    });

    it("isSlowNetwork becomes false when slow request completes", () => {
      const { isSlowNetwork, trackRequest, untrackRequest } = useSlowNetworkDetection();

      trackRequest("req-1");
      vi.advanceTimersByTime(5000);
      expect(isSlowNetwork.value).toBe(true);

      untrackRequest("req-1");
      expect(isSlowNetwork.value).toBe(false);
    });

    it("tracks multiple concurrent slow requests independently", () => {
      const { isSlowNetwork, trackRequest, untrackRequest } = useSlowNetworkDetection();

      trackRequest("req-1");
      trackRequest("req-2");
      vi.advanceTimersByTime(5000);
      expect(isSlowNetwork.value).toBe(true);

      untrackRequest("req-1");
      expect(isSlowNetwork.value).toBe(true); // req-2 still slow

      untrackRequest("req-2");
      expect(isSlowNetwork.value).toBe(false);
    });

    it("handles untrackRequest for unknown id gracefully (no-op)", () => {
      const { isSlowNetwork, untrackRequest } = useSlowNetworkDetection();

      untrackRequest("never-tracked");
      expect(isSlowNetwork.value).toBe(false);
    });
  });

  describe("effectiveType channel", () => {
    function mockConnection(effectiveType: string) {
      const listeners: Array<() => void> = [];
      const connection = {
        effectiveType,
        addEventListener: (_event: string, fn: () => void) => {
          listeners.push(fn);
        },
        removeEventListener: (_event: string, fn: () => void) => {
          const idx = listeners.indexOf(fn);
          if (idx >= 0) listeners.splice(idx, 1);
        },
        _simulateChange(newType: string) {
          connection.effectiveType = newType;
          listeners.forEach((fn) => fn());
        },
      };
      vi.stubGlobal("navigator", {
        ...navigator,
        connection,
        onLine: true,
      });
      return connection;
    }

    it("detects slow-2g as slow network", async () => {
      const connection = mockConnection("slow-2g");
      const mod = await import("./index");
      const { isSlowNetwork } = mod.useSlowNetworkDetection();
      expect(isSlowNetwork.value).toBe(true);
      mod._resetForTest?.();
      vi.unstubAllGlobals();
    });

    it("detects 2g as slow network", async () => {
      const connection = mockConnection("2g");
      const mod = await import("./index");
      const { isSlowNetwork } = mod.useSlowNetworkDetection();
      expect(isSlowNetwork.value).toBe(true);
      mod._resetForTest?.();
      vi.unstubAllGlobals();
    });

    it("does not flag 4g as slow", async () => {
      const connection = mockConnection("4g");
      const mod = await import("./index");
      const { isSlowNetwork } = mod.useSlowNetworkDetection();
      expect(isSlowNetwork.value).toBe(false);
      mod._resetForTest?.();
      vi.unstubAllGlobals();
    });

    it("reacts to connection type changes", async () => {
      const connection = mockConnection("4g");
      const mod = await import("./index");
      const { isSlowNetwork } = mod.useSlowNetworkDetection();
      expect(isSlowNetwork.value).toBe(false);

      connection._simulateChange("2g");
      expect(isSlowNetwork.value).toBe(true);

      connection._simulateChange("4g");
      expect(isSlowNetwork.value).toBe(false);

      mod._resetForTest?.();
      vi.unstubAllGlobals();
    });
  });
});
