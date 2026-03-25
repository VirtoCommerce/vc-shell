import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import VcTableCounter from "./vc-table-counter.vue";

describe("VcTableCounter", () => {
  it("renders with default props", () => {
    const wrapper = mount(VcTableCounter);
    expect(wrapper.find(".vc-table-counter").exists()).toBe(true);
  });

  it("renders label text", () => {
    const wrapper = mount(VcTableCounter, { props: { label: "Items", value: 5 } });
    expect(wrapper.find(".vc-table-counter__label").text()).toContain("Items");
  });

  it("renders value", () => {
    const wrapper = mount(VcTableCounter, { props: { label: "Total", value: 42 } });
    expect(wrapper.find(".vc-table-counter__value").text()).toBe("42");
  });

  it("defaults label to 'Total'", () => {
    const wrapper = mount(VcTableCounter);
    expect(wrapper.find(".vc-table-counter__label").text()).toContain("Total");
  });

  it("defaults value to 0", () => {
    const wrapper = mount(VcTableCounter);
    expect(wrapper.find(".vc-table-counter__value").text()).toBe("0");
  });

  it("updates when value prop changes", async () => {
    const wrapper = mount(VcTableCounter, { props: { label: "Count", value: 10 } });
    expect(wrapper.find(".vc-table-counter__value").text()).toBe("10");
    await wrapper.setProps({ value: 25 });
    expect(wrapper.find(".vc-table-counter__value").text()).toBe("25");
  });

  it("updates when label prop changes", async () => {
    const wrapper = mount(VcTableCounter, { props: { label: "Old", value: 0 } });
    expect(wrapper.find(".vc-table-counter__label").text()).toContain("Old");
    await wrapper.setProps({ label: "New" });
    expect(wrapper.find(".vc-table-counter__label").text()).toContain("New");
  });

  it("renders zero value correctly", () => {
    const wrapper = mount(VcTableCounter, { props: { label: "Empty", value: 0 } });
    expect(wrapper.find(".vc-table-counter__value").text()).toBe("0");
  });

  it("renders large numbers", () => {
    const wrapper = mount(VcTableCounter, { props: { label: "Big", value: 999999 } });
    expect(wrapper.find(".vc-table-counter__value").text()).toBe("999999");
  });
});
