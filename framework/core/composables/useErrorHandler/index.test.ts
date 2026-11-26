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
import { BladeCloseCancelledError } from "@core/blade-navigation/closeCancelled";
import { defineComponent, h, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import type { DisplayableError } from "@core/utilities/error";

// A child that throws from setup, under a parent that captures with useErrorHandler
function captureFrom(error: Error) {
  let captured!: Ref<DisplayableError | null>;
  const Child = defineComponent({
    setup() {
      throw error;
    },
  });
  const Parent = defineComponent({
    setup() {
      captured = useErrorHandler(true).error;
      return () => h(Child);
    },
  });
  mount(Parent);
  return captured;
}

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

  it("records a real error from a child", () => {
    expect(captureFrom(new Error("boom")).value?.message).toBe("boom");
  });

  it("does not turn a kept-open child blade into an error", () => {
    expect(captureFrom(new BladeCloseCancelledError()).value).toBeNull();
  });
});
