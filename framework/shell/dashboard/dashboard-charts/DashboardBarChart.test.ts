import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardBarChart from "./DashboardBarChart.vue";
import type { ChartConfig } from "./types";

// Stub all Unovis and child chart components
vi.mock("@unovis/vue", () => ({
  VisXYContainer: { name: "VisXYContainer", template: "<div><slot /></div>", props: ["data", "height", "margin"] },
  VisGroupedBar: {
    name: "VisGroupedBar",
    template: "<div />",
    props: ["x", "y", "color", "roundedCorners", "barPadding"],
  },
  VisAxis: {
    name: "VisAxis",
    template: "<div />",
    props: ["type", "tickLine", "domainLine", "gridLine", "numTicks", "tickFormat"],
  },
  VisTooltip: {
    name: "VisTooltip",
    template: "<div />",
    props: ["allowHover", "className", "verticalShift", "triggers"],
  },
  VisGroupedBarSelectors: { bar: "[data-bar]" },
}));

const config: ChartConfig = {
  revenue: { label: "Revenue", color: "#ff0000" },
  profit: { label: "Profit", color: "#00ff00" },
};

const data = [
  { month: 1, revenue: 100, profit: 50 },
  { month: 2, revenue: 200, profit: 80 },
];

describe("DashboardBarChart", () => {
  it("renders ChartContainer with config", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data, config, xKey: "month", yKeys: ["revenue", "profit"] },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
  });

  it("renders ChartLegend when showLegend is true (default)", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data, config, xKey: "month", yKeys: ["revenue", "profit"] },
    });
    expect(wrapper.find(".dashboard-chart-legend").exists()).toBe(true);
  });

  it("hides ChartLegend when showLegend is false", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data, config, xKey: "month", yKeys: ["revenue", "profit"], showLegend: false },
    });
    expect(wrapper.find(".dashboard-chart-legend").exists()).toBe(false);
  });

  it("hides tooltip when showTooltip is false", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data, config, xKey: "month", yKeys: ["revenue", "profit"], showTooltip: false },
    });
    expect(wrapper.findComponent({ name: "VisTooltip" }).exists()).toBe(false);
  });

  it("shows tooltip by default", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data, config, xKey: "month", yKeys: ["revenue", "profit"] },
    });
    expect(wrapper.findComponent({ name: "VisTooltip" }).exists()).toBe(true);
  });

  it("hides x-axis when showXAxis is false", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data, config, xKey: "month", yKeys: ["revenue", "profit"], showXAxis: false },
    });
    const axes = wrapper.findAllComponents({ name: "VisAxis" });
    // Only y-axis should be present
    const xAxes = axes.filter((a) => a.props("type") === "x");
    expect(xAxes).toHaveLength(0);
  });

  it("hides y-axis when showYAxis is false", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data, config, xKey: "month", yKeys: ["revenue", "profit"], showYAxis: false },
    });
    const axes = wrapper.findAllComponents({ name: "VisAxis" });
    const yAxes = axes.filter((a) => a.props("type") === "y");
    expect(yAxes).toHaveLength(0);
  });

  it("renders with empty data", () => {
    const wrapper = mount(DashboardBarChart, {
      props: { data: [], config, xKey: "month", yKeys: ["revenue", "profit"] },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
  });
});
