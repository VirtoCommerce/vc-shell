import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

// Mock @vueuse/core useNetwork with a proper ref
const mockOnlineRef = ref(true);
vi.mock("@vueuse/core", () => ({
  useNetwork: () => ({ isOnline: mockOnlineRef }),
}));

// Mock notification
vi.mock("@core/notifications/notification", () => ({
  notification: {
    warning: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  }),
}));

// Reset module-level singleton between tests
beforeEach(async () => {
  mockOnlineRef.value = true;
  vi.resetModules();
});

describe("useConnectionStatus", () => {
  it("returns the expected API shape", async () => {
    const { useConnectionStatus } = await import("./index");
    const result = useConnectionStatus();
    expect(result).toHaveProperty("isOnline");
  });

  it("isOnline defaults to true", async () => {
    const { useConnectionStatus } = await import("./index");
    const { isOnline } = useConnectionStatus();
    expect(isOnline.value).toBe(true);
  });

  it("isOnline is readonly boolean", async () => {
    const { useConnectionStatus } = await import("./index");
    const { isOnline } = useConnectionStatus();
    expect(typeof isOnline.value).toBe("boolean");
  });

  it("multiple calls return the same singleton state", async () => {
    const { useConnectionStatus } = await import("./index");
    const a = useConnectionStatus();
    const b = useConnectionStatus();
    expect(a.isOnline).toBe(b.isOnline);
  });
});
