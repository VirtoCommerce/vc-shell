import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { nextTick, ref } from "vue";

const mockIsOnline = ref(true);

const { mockNotification } = vi.hoisted(() => {
  const mockNotification = {
    warning: vi.fn(),
    remove: vi.fn(),
  };
  return { mockNotification };
});

vi.mock("@core/notifications/notification", () => ({
  notification: mockNotification,
}));

vi.mock("@core/composables/useConnectionStatus", () => ({
  useConnectionStatus: () => ({
    isOnline: mockIsOnline,
  }),
}));

// Must be imported after vi.stubGlobal for navigator.connection mock
let useSlowNetworkDetection: (typeof import("./index"))["useSlowNetworkDetection"];
let _resetForTest: (typeof import("./index"))["_resetForTest"];

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
      vi.advanceTimersByTime(9999);
      expect(isSlowNetwork.value).toBe(false);

      untrackRequest("req-1");
      expect(isSlowNetwork.value).toBe(false);
    });

    it("isSlowNetwork becomes true when request exceeds threshold", () => {
      const { isSlowNetwork, trackRequest } = useSlowNetworkDetection();

      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      expect(isSlowNetwork.value).toBe(true);
    });

    it("isSlowNetwork becomes false when slow request completes", () => {
      const { isSlowNetwork, trackRequest, untrackRequest } = useSlowNetworkDetection();

      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      expect(isSlowNetwork.value).toBe(true);

      untrackRequest("req-1");
      expect(isSlowNetwork.value).toBe(false);
    });

    it("tracks multiple concurrent slow requests independently", () => {
      const { isSlowNetwork, trackRequest, untrackRequest } = useSlowNetworkDetection();

      trackRequest("req-1");
      trackRequest("req-2");
      vi.advanceTimersByTime(10000);
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
      const _connection = mockConnection("slow-2g");
      const mod = await import("./index");
      const { isSlowNetwork } = mod.useSlowNetworkDetection();
      expect(isSlowNetwork.value).toBe(true);
      mod._resetForTest?.();
      vi.unstubAllGlobals();
    });

    it("detects 2g as slow network", async () => {
      const _connection = mockConnection("2g");
      const mod = await import("./index");
      const { isSlowNetwork } = mod.useSlowNetworkDetection();
      expect(isSlowNetwork.value).toBe(true);
      mod._resetForTest?.();
      vi.unstubAllGlobals();
    });

    it("does not flag 4g as slow", async () => {
      const _connection = mockConnection("4g");
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

  // The slow state is published as a class on <html>, the way useConnectionStatus
  // publishes `vc-offline` — never as a toast (VCST-6045).
  describe("document state", () => {
    const isMarked = () => document.documentElement.classList.contains("vc-slow-network");

    beforeEach(() => {
      mockIsOnline.value = true;
      mockNotification.warning.mockClear();
      mockNotification.remove.mockClear();
      document.documentElement.classList.remove("vc-slow-network");
    });

    it("marks the document when isSlowNetwork becomes true", async () => {
      const { trackRequest } = useSlowNetworkDetection();
      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      await nextTick();
      expect(isMarked()).toBe(true);
    });

    it("never raises a notification", async () => {
      const { trackRequest, untrackRequest } = useSlowNetworkDetection();
      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      await nextTick();
      untrackRequest("req-1");
      vi.advanceTimersByTime(3000);
      expect(mockNotification.warning).not.toHaveBeenCalled();
      expect(mockNotification.remove).not.toHaveBeenCalled();
    });

    it("unmarks with a 3s delay when isSlowNetwork becomes false", async () => {
      const { trackRequest, untrackRequest } = useSlowNetworkDetection();
      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      await nextTick();
      untrackRequest("req-1");
      await nextTick();
      expect(isMarked()).toBe(true);
      vi.advanceTimersByTime(3000);
      expect(isMarked()).toBe(false);
    });

    it("cancels the unmark if slow again within the 3s window", async () => {
      const { trackRequest, untrackRequest } = useSlowNetworkDetection();
      // Start req-2 early so it crosses threshold during the dismiss window
      trackRequest("req-2");
      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      await nextTick();
      // Both are now slow; untrack req-1
      untrackRequest("req-1");
      await nextTick();
      // isSlowNetwork is still true (req-2 still slow) — no dismiss timer started
      vi.advanceTimersByTime(3000);
      expect(isMarked()).toBe(true);
    });

    it("does not mark the document when offline", async () => {
      mockIsOnline.value = false;
      const { trackRequest } = useSlowNetworkDetection();
      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      await nextTick();
      expect(isMarked()).toBe(false);
    });

    it("unmarks immediately when going offline", async () => {
      const { trackRequest } = useSlowNetworkDetection();
      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      await nextTick();
      expect(isMarked()).toBe(true);
      mockIsOnline.value = false;
      await nextTick();
      expect(isMarked()).toBe(false);
    });

    it("keeps the mark for 3s after recovery", async () => {
      const { trackRequest, untrackRequest } = useSlowNetworkDetection();
      trackRequest("req-1");
      vi.advanceTimersByTime(10000);
      await nextTick();
      untrackRequest("req-1");
      await nextTick();
      vi.advanceTimersByTime(2999);
      expect(isMarked()).toBe(true);
      vi.advanceTimersByTime(1);
      expect(isMarked()).toBe(false);
    });
  });
});
