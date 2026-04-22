import { describe, it, expect, vi } from "vitest";
import { computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { createMockUserManagement } from "@framework/test-mock-factories";

// Mock dependencies
vi.mock("@core/composables/useAppInsights", () => ({
  useAppInsights: () => ({ appInsights: null }),
}));

const mockUserManagement = createMockUserManagement({
  user: computed(() => ({ id: "user1", userName: "testuser" }) as any),
});
vi.mock("@core/composables/useUserManagement", () => ({
  useUserManagement: () => mockUserManagement,
}));

vi.mock("@core/utilities/error", () => ({
  parseError: (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      message: msg,
      originalError: err,
      name: "DisplayableError",
    };
  },
  DisplayableError: class DisplayableError extends Error {
    originalError: unknown;
    constructor(message: string, originalError?: unknown) {
      super(message);
      this.originalError = originalError;
    }
  },
}));

import { useErrorHandler } from "./index";

describe("useErrorHandler", () => {
  it("returns the expected API shape", () => {
    const { result } = mountWithSetup(() => useErrorHandler());
    expect(result).toHaveProperty("error");
    expect(result).toHaveProperty("reset");
    expect(result.error.value).toBeNull();
  });

  it("error starts as null", () => {
    const { result } = mountWithSetup(() => useErrorHandler());
    expect(result.error.value).toBeNull();
  });

  it("reset sets error back to null", () => {
    const { result } = mountWithSetup(() => useErrorHandler());
    // Manually set error to simulate captured error
    result.error.value = { message: "test", originalError: new Error("test") } as any;
    result.reset();
    expect(result.error.value).toBeNull();
  });

  it("reset is a callable function", () => {
    const { result } = mountWithSetup(() => useErrorHandler());
    expect(typeof result.reset).toBe("function");
    // Should not throw
    result.reset();
  });
});
