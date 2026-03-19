import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChartLegend from "./ChartLegend.vue";
import type { ChartConfig } from "./types";

const config: ChartConfig = {
  revenue: { label: "Revenue", color: "#ff0000" },
  profit: { label: "Profit", color: "#00ff00" },
};

describe("ChartLegend", () => {
  it("renders a legend item for each config entry", () => {
    const wrapper = mount(ChartLegend, { props: { config } });
    const items = wrapper.findAll(".dashboard-chart-legend__item");
    expect(items).toHaveLength(2);
  });

  it("displays the correct label text", () => {
    const wrapper = mount(ChartLegend, { props: { config } });
    const labels = wrapper.findAll(".dashboard-chart-legend__label");
    expect(labels[0].text()).toBe("Revenue");
    expect(labels[1].text()).toBe("Profit");
  });

  it("sets the indicator background color from config", () => {
    const wrapper = mount(ChartLegend, { props: { config } });
    const indicators = wrapper.findAll(".dashboard-chart-legend__indicator");
    expect(indicators[0].attributes("style")).toContain("background: rgb(255, 0, 0)");
    expect(indicators[1].attributes("style")).toContain("background: rgb(0, 255, 0)");
  });

  it("renders nothing in the list for empty config", () => {
    const wrapper = mount(ChartLegend, { props: { config: {} } });
    expect(wrapper.findAll(".dashboard-chart-legend__item")).toHaveLength(0);
  });

  it("renders the root element with correct class", () => {
    const wrapper = mount(ChartLegend, { props: { config } });
    expect(wrapper.find(".dashboard-chart-legend").exists()).toBe(true);
  });
});
