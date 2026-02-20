import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardWidgetCard from "@shared/components/dashboard-widget-card/dashboard-widget-card.vue";

describe("DashboardWidgetCard", () => {
  it("renders header and icon", () => {
    const wrapper = mount(DashboardWidgetCard, {
      props: { header: "Products", icon: "lucide-package-open" },
      global: {
        stubs: { VcIcon: { template: '<span class="vc-icon-stub" />' } },
      },
    });
    expect(wrapper.text()).toContain("Products");
    expect(wrapper.find(".vc-icon-stub").exists()).toBe(true);
  });

  it("renders #actions slot", () => {
    const wrapper = mount(DashboardWidgetCard, {
      props: { header: "Products" },
      slots: { actions: '<button class="test-action">Add</button>' },
    });
    expect(wrapper.find(".test-action").exists()).toBe(true);
  });

  it("renders #content slot", () => {
    const wrapper = mount(DashboardWidgetCard, {
      props: { header: "Products" },
      slots: { content: '<div class="test-content">Table here</div>' },
    });
    expect(wrapper.find(".test-content").exists()).toBe(true);
  });

  it("renders #stats slot when provided", () => {
    const wrapper = mount(DashboardWidgetCard, {
      props: { header: "Products" },
      slots: { stats: '<div class="test-stats">142 total</div>' },
    });
    expect(wrapper.find(".dashboard-widget-card__stats").exists()).toBe(true);
    expect(wrapper.find(".test-stats").exists()).toBe(true);
  });

  it("hides stats area when #stats slot is empty", () => {
    const wrapper = mount(DashboardWidgetCard, {
      props: { header: "Products" },
    });
    expect(wrapper.find(".dashboard-widget-card__stats").exists()).toBe(false);
  });

  it("renders #footer slot when provided", () => {
    const wrapper = mount(DashboardWidgetCard, {
      props: { header: "Products" },
      slots: { footer: '<a class="test-footer">View all</a>' },
    });
    expect(wrapper.find(".dashboard-widget-card__footer").exists()).toBe(true);
    expect(wrapper.find(".test-footer").exists()).toBe(true);
  });

  it("hides footer when #footer slot is empty", () => {
    const wrapper = mount(DashboardWidgetCard, {
      props: { header: "Products" },
    });
    expect(wrapper.find(".dashboard-widget-card__footer").exists()).toBe(false);
  });

  it("works without any optional props (backward compat)", () => {
    const wrapper = mount(DashboardWidgetCard, {
      slots: { content: "<div>Content</div>" },
    });
    expect(wrapper.find(".dashboard-widget-card").exists()).toBe(true);
    expect(wrapper.text()).toContain("Content");
  });
});
