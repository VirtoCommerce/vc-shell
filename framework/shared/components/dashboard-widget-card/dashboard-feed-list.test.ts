import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardFeedList from "./dashboard-feed-list.vue";

describe("DashboardFeedList", () => {
  it("renders a container div with divider classes", () => {
    const wrapper = mount(DashboardFeedList);
    const root = wrapper.find("div");
    expect(root.exists()).toBe(true);
    expect(root.classes()).toContain("tw-divide-y");
  });

  it("renders default slot content", () => {
    const wrapper = mount(DashboardFeedList, {
      slots: {
        default: "<div class='feed-item'>Item 1</div><div class='feed-item'>Item 2</div>",
      },
    });
    expect(wrapper.findAll(".feed-item")).toHaveLength(2);
  });

  it("renders empty when no slot content is provided", () => {
    const wrapper = mount(DashboardFeedList);
    expect(wrapper.find("div").text()).toBe("");
  });
});
