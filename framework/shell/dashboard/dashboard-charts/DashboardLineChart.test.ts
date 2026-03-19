import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardLineChart from "./DashboardLineChart.vue";
import type { ChartConfig } from "./types";

vi.mock("@unovis/vue", () => ({
  VisXYContainer: { name: "VisXYContainer", template: "<div><slot /></div>", props: ["data", "height", "margin"] },
  VisLine: { name: "VisLine", template: "<div />", props: ["x", "y", "color", "curveType", "lineWidth"] },
  VisAxis: { name: "VisAxis", template: "<div />", props: ["type", "tickLine", "domainLine", "gridLine", "numTicks", "tickFormat"] },
  VisTooltip: { name: "VisTooltip", template: "<div />", props: ["allowHover", "className", "verticalShift"] },
  VisCrosshair: { name: "VisCrosshair", template: "<div />", props: ["x", "y", "color", "template"] },
}));

const config: ChartConfig = {
  views: { label: "Views", color: "#0000ff" },
  clicks: { label: "Clicks", color: "#00ff00" },
};

const data = [
  { day: 1, views: 100, clicks: 20 },
  { day: 2, views: 150, clicks: 30 },
  { day: 3, views: 120, clicks: 25 },
];

describe("DashboardLineChart", () => {
  it("renders ChartContainer", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"] },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
  });

  it("renders one VisLine per yKey", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"] },
    });
    const lines = wrapper.findAllComponents({ name: "VisLine" });
    expect(lines).toHaveLength(2);
  });

  it("renders ChartLegend by default", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"] },
    });
    expect(wrapper.find(".dashboard-chart-legend").exists()).toBe(true);
  });

  it("hides ChartLegend when showLegend is false", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"], showLegend: false },
    });
    expect(wrapper.find(".dashboard-chart-legend").exists()).toBe(false);
  });

  it("hides tooltip and crosshair when showTooltip is false", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"], showTooltip: false },
    });
    expect(wrapper.findComponent({ name: "VisTooltip" }).exists()).toBe(false);
    expect(wrapper.findComponent({ name: "VisCrosshair" }).exists()).toBe(false);
  });

  it("shows tooltip and crosshair by default", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"] },
    });
    expect(wrapper.findComponent({ name: "VisTooltip" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "VisCrosshair" }).exists()).toBe(true);
  });

  it("hides x-axis when showXAxis is false", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"], showXAxis: false },
    });
    const axes = wrapper.findAllComponents({ name: "VisAxis" });
    const xAxes = axes.filter((a) => a.props("type") === "x");
    expect(xAxes).toHaveLength(0);
  });

  it("hides y-axis when showYAxis is false", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views", "clicks"], showYAxis: false },
    });
    const axes = wrapper.findAllComponents({ name: "VisAxis" });
    const yAxes = axes.filter((a) => a.props("type") === "y");
    expect(yAxes).toHaveLength(0);
  });

  it("renders with empty data", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data: [], config, xKey: "day", yKeys: ["views", "clicks"] },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
  });

  it("renders single line for single yKey", () => {
    const wrapper = mount(DashboardLineChart, {
      props: { data, config, xKey: "day", yKeys: ["views"] },
    });
    const lines = wrapper.findAllComponents({ name: "VisLine" });
    expect(lines).toHaveLength(1);
  });
});
