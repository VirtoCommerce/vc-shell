import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SchedulerBar from "@ui/components/organisms/vc-scheduler/_internal/SchedulerBar.vue";

const baseProps = {
  bar: { id: "a", resourceId: "r1", start: new Date("2026-01-01"), end: new Date("2026-01-03"), label: "Sale" },
  x: 0,
  width: 96,
  top: 0,
  height: 28,
  editable: true,
  selected: false,
};

describe("SchedulerBar", () => {
  it("renders label and is a button with an aria-label", () => {
    const wrapper = mount(SchedulerBar, { props: baseProps });
    const el = wrapper.get(".vc-scheduler__bar");
    expect(el.attributes("role")).toBe("button");
    expect(el.attributes("aria-label")).toContain("Sale");
    expect(wrapper.text()).toContain("Sale");
  });

  it("emits select on click", async () => {
    const wrapper = mount(SchedulerBar, { props: baseProps });
    await wrapper.get(".vc-scheduler__bar").trigger("click");
    expect(wrapper.emitted("select")).toBeTruthy();
  });

  it("hides resize handles when not editable", () => {
    const wrapper = mount(SchedulerBar, { props: { ...baseProps, editable: false } });
    expect(wrapper.findAll(".vc-scheduler__bar-handle")).toHaveLength(0);
  });

  it("emits resize-start with edge on handle pointerdown", async () => {
    const wrapper = mount(SchedulerBar, { props: baseProps });
    await wrapper.get(".vc-scheduler__bar-handle--end").trigger("pointerdown");
    expect(wrapper.emitted("resize-start")![0][0]).toMatchObject({ edge: "end" });
  });

  it("emits move-start on body pointerdown when editable", async () => {
    const wrapper = mount(SchedulerBar, { props: baseProps });
    await wrapper.get(".vc-scheduler__bar").trigger("pointerdown");
    expect(wrapper.emitted("move-start")).toBeTruthy();
  });

  it("does not emit move-start on body pointerdown when not editable", async () => {
    const wrapper = mount(SchedulerBar, { props: { ...baseProps, editable: false } });
    await wrapper.get(".vc-scheduler__bar").trigger("pointerdown");
    expect(wrapper.emitted("move-start")).toBeFalsy();
  });
});
