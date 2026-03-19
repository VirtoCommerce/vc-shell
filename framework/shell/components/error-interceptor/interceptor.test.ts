import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import Interceptor from "./interceptor";

// Mock useErrorHandler
const mockError = ref<Error | string | null>(null);
const mockReset = vi.fn(() => {
  mockError.value = null;
});

vi.mock("@core/composables/useErrorHandler", () => ({
  useErrorHandler: vi.fn(() => ({
    error: mockError,
    reset: mockReset,
  })),
}));

vi.mock("@core/utilities/pendingErrorNotifications", () => ({
  cancelPendingErrorNotification: vi.fn(),
}));

// We don't inject blade context, so hasBlade will be false
function mountInterceptor(slotFn?: (args: { error: any; reset: any }) => any) {
  return mount(Interceptor, {
    props: { capture: false },
    slots: {
      default: slotFn
        ? slotFn
        : (args: any) => h("div", { class: "interceptor-content" }, String(args.error ?? "no-error")),
    },
  });
}

describe("ErrorInterceptor", () => {
  beforeEach(() => {
    mockError.value = null;
    mockReset.mockClear();
  });

  it("renders slot content with error=null initially", () => {
    const wrapper = mountInterceptor();
    expect(wrapper.find(".interceptor-content").exists()).toBe(true);
    expect(wrapper.find(".interceptor-content").text()).toBe("no-error");
  });

  it("passes error value to slot when error is set", async () => {
    const wrapper = mountInterceptor();
    mockError.value = "Something went wrong";
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".interceptor-content").text()).toBe("Something went wrong");
  });

  it("passes reset function to slot", () => {
    let resetFn: (() => void) | undefined;
    mount(Interceptor, {
      props: { capture: false },
      slots: {
        default: (args: any) => {
          resetFn = args.reset;
          return h("div");
        },
      },
    });
    expect(typeof resetFn).toBe("function");
  });

  it("reset clears the error", async () => {
    let resetFn: (() => void) | undefined;
    const wrapper = mount(Interceptor, {
      props: { capture: false },
      slots: {
        default: (args: any) => {
          resetFn = args.reset;
          return h("div", { class: "content" }, String(args.error ?? "none"));
        },
      },
    });

    mockError.value = "Error!";
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".content").text()).toBe("Error!");

    resetFn!();
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".content").text()).toBe("none");
  });

  it("accepts capture prop", () => {
    const wrapper = mount(Interceptor, {
      props: { capture: true },
      slots: {
        default: () => h("div"),
      },
    });
    expect(wrapper.props("capture")).toBe(true);
  });

  it("renders with Error object", async () => {
    const wrapper = mountInterceptor();
    mockError.value = new Error("Test error");
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".interceptor-content").text()).toContain("Test error");
  });
});
