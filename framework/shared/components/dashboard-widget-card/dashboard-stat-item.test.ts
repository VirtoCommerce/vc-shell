import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardStatItem from "@shared/components/dashboard-widget-card/dashboard-stat-item.vue";

describe("DashboardStatItem", () => {
  it("renders value and label", () => {
    const wrapper = mount(DashboardStatItem, {
      props: { value: 142, label: "Total" },
    });
    expect(wrapper.text()).toContain("142");
    expect(wrapper.text()).toContain("Total");
  });

  it("renders string value", () => {
    const wrapper = mount(DashboardStatItem, {
      props: { value: "$1,234", label: "Revenue" },
    });
    expect(wrapper.text()).toContain("$1,234");
  });

  it("applies variant class for warning", () => {
    const wrapper = mount(DashboardStatItem, {
      props: { value: 14, label: "Pending", variant: "warning" },
    });
    expect(wrapper.find(".dashboard-stat-item__value").classes()).toContain(
      "dashboard-stat-item__value--warning",
    );
  });

  it("applies default variant when no variant prop", () => {
    const wrapper = mount(DashboardStatItem, {
      props: { value: 8, label: "Today" },
    });
    expect(wrapper.find(".dashboard-stat-item__value").classes()).not.toContain(
      "dashboard-stat-item__value--warning",
    );
  });
});
