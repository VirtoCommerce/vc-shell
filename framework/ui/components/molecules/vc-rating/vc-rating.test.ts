import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import VcRating from "@ui/components/molecules/vc-rating/vc-rating.vue";

describe("VcRating", () => {
  const mountComponent = (props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) =>
    mount(VcRating as any, {
      props,
      slots,
      global: {
        stubs: {
          VcLabel: {
            template: '<div class="stub-label"><slot /><slot name="tooltip" /></div>',
            props: ["required"],
          },
          VcIcon: {
            template: '<span class="stub-icon" />',
            props: ["icon"],
          },
        },
      },
    });

  it("renders correctly", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".vc-rating").exists()).toBe(true);
  });

  it("renders label when provided", () => {
    const wrapper = mountComponent({ label: "Product Rating" });
    expect(wrapper.find(".stub-label").exists()).toBe(true);
    expect(wrapper.find(".stub-label").text()).toContain("Product Rating");
  });

  it("does not render label when not provided", () => {
    const wrapper = mountComponent();
    expect(wrapper.find(".stub-label").exists()).toBe(false);
  });

  it("renders stars variant by default", () => {
    const wrapper = mountComponent({ modelValue: 3 });
    expect(wrapper.find(".vc-rating__stars").exists()).toBe(true);
  });

  it("renders correct number of filled stars", () => {
    const wrapper = mountComponent({ modelValue: 3, max: 5 });
    const allIcons = wrapper.findAll(".stub-icon");
    const emptyIcons = wrapper.findAll(".vc-rating__icon--empty");
    expect(allIcons.length - emptyIcons.length).toBe(3);
  });

  it("renders correct number of empty stars", () => {
    const wrapper = mountComponent({ modelValue: 3, max: 5 });
    const emptyStars = wrapper.findAll(".vc-rating__icon--empty");
    expect(emptyStars.length).toBe(2);
  });

  it("renders text variant", () => {
    const wrapper = mountComponent({ modelValue: 4, max: 5, variant: "text" });
    expect(wrapper.find(".vc-rating__rating").exists()).toBe(true);
    expect(wrapper.find(".vc-rating__rating").text()).toBe("4/5");
  });

  it("renders star-and-text variant", () => {
    const wrapper = mountComponent({ modelValue: 4, max: 5, variant: "star-and-text" });
    expect(wrapper.find(".vc-rating__text-container").exists()).toBe(true);
    expect(wrapper.find(".vc-rating__rating").text()).toBe("4/5");
  });

  it("shows placeholder when no modelValue", () => {
    const wrapper = mountComponent({ placeholder: "No rating" });
    expect(wrapper.find(".vc-rating__placeholder").exists()).toBe(true);
    expect(wrapper.find(".vc-rating__placeholder").text()).toBe("No rating");
  });

  it("sets correct aria-label with value", () => {
    const wrapper = mountComponent({ modelValue: 3, max: 5 });
    expect(wrapper.find(".vc-rating__content").attributes("aria-label")).toBe("Rating: 3 out of 5");
  });

  it("sets correct aria-label with placeholder", () => {
    const wrapper = mountComponent({ placeholder: "N/A" });
    expect(wrapper.find(".vc-rating__content").attributes("aria-label")).toBe("N/A");
  });

  it("uses default max of 5", () => {
    const wrapper = mountComponent({ modelValue: 2 });
    const allStars = wrapper.findAll(".stub-icon");
    expect(allStars.length).toBe(5);
  });

  it("renders details slot in text variant", () => {
    const wrapper = mountComponent(
      { modelValue: 4, variant: "text" },
      { details: '<span class="review-count">(120 reviews)</span>' },
    );
    expect(wrapper.find(".review-count").exists()).toBe(true);
  });
});
