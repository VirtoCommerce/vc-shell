import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChartTooltip from "./ChartTooltip.vue";

const items = [
  { label: "Revenue", value: 1000, color: "#ff0000" },
  { label: "Profit", value: 500, color: "#00ff00" },
];

describe("ChartTooltip", () => {
  it("renders the title when provided", () => {
    const wrapper = mount(ChartTooltip, {
      props: { title: "January", items },
    });
    expect(wrapper.find(".dashboard-chart-tooltip__title").text()).toBe("January");
  });

  it("hides the title when not provided", () => {
    const wrapper = mount(ChartTooltip, {
      props: { items },
    });
    expect(wrapper.find(".dashboard-chart-tooltip__title").exists()).toBe(false);
  });

  it("renders one item row per items entry", () => {
    const wrapper = mount(ChartTooltip, {
      props: { items },
    });
    expect(wrapper.findAll(".dashboard-chart-tooltip__item")).toHaveLength(2);
  });

  it("displays item labels and values", () => {
    const wrapper = mount(ChartTooltip, {
      props: { items },
    });
    const labels = wrapper.findAll(".dashboard-chart-tooltip__label");
    const values = wrapper.findAll(".dashboard-chart-tooltip__value");
    expect(labels[0].text()).toBe("Revenue");
    expect(values[0].text()).toBe("1000");
    expect(labels[1].text()).toBe("Profit");
    expect(values[1].text()).toBe("500");
  });

  it("sets indicator background color from item.color", () => {
    const wrapper = mount(ChartTooltip, {
      props: { items },
    });
    const indicators = wrapper.findAll(".dashboard-chart-tooltip__indicator");
    expect(indicators[0].attributes("style")).toContain("background: rgb(255, 0, 0)");
  });

  it("renders with empty items array", () => {
    const wrapper = mount(ChartTooltip, {
      props: { items: [] },
    });
    expect(wrapper.findAll(".dashboard-chart-tooltip__item")).toHaveLength(0);
    expect(wrapper.find(".dashboard-chart-tooltip__items").exists()).toBe(true);
  });

  it("renders string values correctly", () => {
    const wrapper = mount(ChartTooltip, {
      props: { items: [{ label: "Count", value: "$1,234", color: "#000" }] },
    });
    expect(wrapper.find(".dashboard-chart-tooltip__value").text()).toBe("$1,234");
  });
});
