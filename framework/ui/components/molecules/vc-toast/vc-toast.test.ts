import { describe, expect, it, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import VcToast from "@ui/components/molecules/vc-toast/vc-toast.vue";

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(globalThis as any).ResizeObserver = MockResizeObserver;

describe("VcToast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const mountComponent = (props: Record<string, unknown> = {}) => {
    vi.useFakeTimers();
    return mount(VcToast as any, {
      props: {
        notificationId: 1,
        content: "Test notification",
        type: "default",
        ...props,
      },
      global: {
        stubs: {
          VcIcon: true,
        },
      },
    });
  };

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-notification").exists()).toBe(true);
  });

  it("renders string content", () => {
    const wrapper = mountComponent({ content: "Hello World" });
    expect(wrapper.find(".vc-notification__content").text()).toBe("Hello World");
  });

  it("applies type-specific class for success", () => {
    const wrapper = mountComponent({ type: "success" });
    expect(wrapper.find(".vc-notification--success").exists()).toBe(true);
  });

  it("applies type-specific class for error", () => {
    const wrapper = mountComponent({ type: "error" });
    expect(wrapper.find(".vc-notification--error").exists()).toBe(true);
  });

  it("applies type-specific class for warning", () => {
    const wrapper = mountComponent({ type: "warning" });
    expect(wrapper.find(".vc-notification--warning").exists()).toBe(true);
  });

  it("uses alert role for error type", () => {
    const wrapper = mountComponent({ type: "error" });
    expect(wrapper.find(".vc-notification").attributes("role")).toBe("alert");
  });

  it("uses status role for non-error types", () => {
    const wrapper = mountComponent({ type: "success" });
    expect(wrapper.find(".vc-notification").attributes("role")).toBe("status");
  });

  it("renders dismiss button", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-notification__dismiss-button").exists()).toBe(true);
  });

  it("emits close when dismiss is clicked", async () => {
    const wrapper = mountComponent();
    await wrapper.find(".vc-notification__dismiss-button").trigger("click");
    vi.advanceTimersByTime(300);
    expect(wrapper.emitted("close")).toBeTruthy();
    expect(wrapper.emitted("close")![0]).toEqual([1]);
  });

  it("sets notification id as element id", () => {
    const wrapper = mountComponent({ notificationId: 42 });
    expect(wrapper.find(".vc-notification").attributes("id")).toBe("42");
  });

  it("renders icon for notification type", () => {
    const wrapper = mountComponent({ type: "success" });
    expect(wrapper.findComponent({ name: "VcIcon" }).exists()).toBe(true);
  });
});
