import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardDonutChart from "./DashboardDonutChart.vue";
import type { ChartConfig } from "./types";

vi.mock("@unovis/vue", () => ({
  VisSingleContainer: { name: "VisSingleContainer", template: "<div><slot /></div>", props: ["data", "height"] },
  VisDonut: { name: "VisDonut", template: "<div />", props: ["value", "color", "arcWidth", "cornerRadius", "padAngle", "centralLabel", "centralSubLabel"] },
  VisTooltip: { name: "VisTooltip", template: "<div />", props: ["allowHover", "className", "verticalShift", "triggers"] },
  VisDonutSelectors: { segment: "[data-segment]" },
}));

const config: ChartConfig = {
  apples: { label: "Apples", color: "#ff0000" },
  oranges: { label: "Oranges", color: "#ffa500" },
};

const data = [
  { category: "apples", count: 30 },
  { category: "oranges", count: 70 },
];

describe("DashboardDonutChart", () => {
  it("renders ChartContainer", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data, config, valueKey: "count" },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
  });

  it("renders ChartLegend by default", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data, config, valueKey: "count" },
    });
    expect(wrapper.find(".dashboard-chart-legend").exists()).toBe(true);
  });

  it("hides ChartLegend when showLegend is false", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data, config, valueKey: "count", showLegend: false },
    });
    expect(wrapper.find(".dashboard-chart-legend").exists()).toBe(false);
  });

  it("renders VisDonut component", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data, config, valueKey: "count" },
    });
    expect(wrapper.findComponent({ name: "VisDonut" }).exists()).toBe(true);
  });

  it("hides tooltip when showTooltip is false", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data, config, valueKey: "count", showTooltip: false },
    });
    expect(wrapper.findComponent({ name: "VisTooltip" }).exists()).toBe(false);
  });

  it("shows tooltip by default", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data, config, valueKey: "count" },
    });
    expect(wrapper.findComponent({ name: "VisTooltip" }).exists()).toBe(true);
  });

  it("passes centralLabel and centralSubLabel props", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data, config, valueKey: "count", centralLabel: "Total", centralSubLabel: "100" },
    });
    const donut = wrapper.findComponent({ name: "VisDonut" });
    expect(donut.props("centralLabel")).toBe("Total");
    expect(donut.props("centralSubLabel")).toBe("100");
  });

  it("renders with empty data", () => {
    const wrapper = mount(DashboardDonutChart, {
      props: { data: [], config, valueKey: "count" },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
  });
});
