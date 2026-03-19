import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardFeedRow from "./dashboard-feed-row.vue";

describe("DashboardFeedRow", () => {
  it("renders the root element with correct class", () => {
    const wrapper = mount(DashboardFeedRow);
    expect(wrapper.find(".dashboard-feed-row").exists()).toBe(true);
  });

  it("renders default slot content", () => {
    const wrapper = mount(DashboardFeedRow, {
      slots: { default: "<span class='content'>Hello</span>" },
    });
    expect(wrapper.find(".content").text()).toBe("Hello");
  });

  it("renders trailing slot when provided", () => {
    const wrapper = mount(DashboardFeedRow, {
      slots: {
        default: "<span>Main</span>",
        trailing: "<span class='trail'>Trail</span>",
      },
    });
    expect(wrapper.find(".trail").text()).toBe("Trail");
  });

  it("hides trailing container when trailing slot is not provided", () => {
    const wrapper = mount(DashboardFeedRow, {
      slots: { default: "<span>Main</span>" },
    });
    // The trailing div wrapper should not be rendered (v-if="$slots.trailing")
    const divs = wrapper.findAll("div");
    // Root div + the flex container for default slot = 2 divs, no trailing wrapper
    const trailingDiv = divs.find((d) => d.classes().includes("tw-flex-shrink-0"));
    expect(trailingDiv).toBeUndefined();
  });

  it("emits click event when clicked", async () => {
    const wrapper = mount(DashboardFeedRow);
    await wrapper.find(".dashboard-feed-row").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("emits click on each click", async () => {
    const wrapper = mount(DashboardFeedRow);
    await wrapper.find(".dashboard-feed-row").trigger("click");
    await wrapper.find(".dashboard-feed-row").trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(2);
  });
});
