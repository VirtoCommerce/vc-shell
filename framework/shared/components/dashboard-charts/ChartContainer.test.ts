import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ChartContainer from "./ChartContainer.vue";
import type { ChartConfig } from "./types";

const baseConfig: ChartConfig = {
  revenue: { label: "Revenue", color: "#ff0000" },
  profit: { label: "Profit", color: "#00ff00" },
};

describe("ChartContainer", () => {
  it("renders a container div with the correct class", () => {
    const wrapper = mount(ChartContainer, {
      props: { config: baseConfig },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
  });

  it("sets CSS custom properties from config colors", () => {
    const wrapper = mount(ChartContainer, {
      props: { config: baseConfig },
    });
    const el = wrapper.find(".dashboard-chart-container");
    expect(el.attributes("style")).toContain("--vis-color0: #ff0000");
    expect(el.attributes("style")).toContain("--vis-color1: #00ff00");
  });

  it("renders default slot content", () => {
    const wrapper = mount(ChartContainer, {
      props: { config: baseConfig },
      slots: { default: "<span class='child'>Chart here</span>" },
    });
    expect(wrapper.find(".child").text()).toBe("Chart here");
  });

  it("handles config with no colors gracefully", () => {
    const noColorConfig: ChartConfig = {
      a: { label: "A", color: "" },
    };
    const wrapper = mount(ChartContainer, {
      props: { config: noColorConfig },
    });
    // Empty string is falsy so no CSS var should be set
    expect(wrapper.find(".dashboard-chart-container").attributes("style")).toBeUndefined();
  });

  it("handles empty config", () => {
    const wrapper = mount(ChartContainer, {
      props: { config: {} },
    });
    expect(wrapper.find(".dashboard-chart-container").exists()).toBe(true);
    expect(wrapper.find(".dashboard-chart-container").attributes("style")).toBeUndefined();
  });

  it("updates CSS vars when config changes", async () => {
    const wrapper = mount(ChartContainer, {
      props: { config: { a: { label: "A", color: "#111" } } },
    });
    expect(wrapper.find(".dashboard-chart-container").attributes("style")).toContain("--vis-color0: #111");

    await wrapper.setProps({
      config: { b: { label: "B", color: "#222" } },
    });
    expect(wrapper.find(".dashboard-chart-container").attributes("style")).toContain("--vis-color0: #222");
  });
});
