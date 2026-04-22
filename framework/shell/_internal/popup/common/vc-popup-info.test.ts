import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import VcPopupInfo from "./vc-popup-info.vue";

const VcPopupBaseStub = {
  name: "VcPopupBase",
  template: `<div class="vc-popup-base-stub">
    <slot name="header" />
    <slot />
  </div>`,
  props: ["variant", "mode", "actionLabel", "title"],
  emits: ["close"],
};

function mountPopupInfo(props = {}, slots = {}) {
  return mount(VcPopupInfo, {
    props,
    slots,
    global: {
      stubs: {
        VcPopupBase: VcPopupBaseStub,
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  });
}

describe("VcPopupInfo", () => {
  it("renders the component", () => {
    const wrapper = mountPopupInfo();
    expect(wrapper.find(".vc-popup-base-stub").exists()).toBe(true);
  });

  it("passes variant=info to VcPopupBase", () => {
    const wrapper = mountPopupInfo();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("variant")).toBe("info");
  });

  it("passes mode=acknowledge to VcPopupBase", () => {
    const wrapper = mountPopupInfo();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("mode")).toBe("acknowledge");
  });

  it("passes title prop through to VcPopupBase", () => {
    const wrapper = mountPopupInfo({ title: "Information" });
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("title")).toBe("Information");
  });

  it("passes translated action-label to VcPopupBase", () => {
    const wrapper = mountPopupInfo();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("actionLabel")).toBe("COMPONENTS.ORGANISMS.VC_POPUP.OK");
  });

  it("emits close when VcPopupBase emits close", async () => {
    const wrapper = mountPopupInfo();
    await wrapper.findComponent(VcPopupBaseStub).vm.$emit("close");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("renders default slot content", () => {
    const wrapper = mountPopupInfo({}, { default: "Info message here" });
    expect(wrapper.text()).toContain("Info message here");
  });

  it("renders header slot when provided", () => {
    const wrapper = mountPopupInfo({}, { header: "<span>Info Header</span>" });
    expect(wrapper.text()).toContain("Info Header");
  });
});
