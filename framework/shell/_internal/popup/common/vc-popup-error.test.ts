import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import VcPopupError from "./vc-popup-error.vue";

const VcPopupBaseStub = {
  name: "VcPopupBase",
  template: `<div class="vc-popup-base-stub">
    <slot name="header" />
    <slot />
  </div>`,
  props: ["variant", "mode", "actionLabel", "title"],
  emits: ["close"],
};

function mountPopupError(props = {}, slots = {}) {
  return mount(VcPopupError, {
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

describe("VcPopupError", () => {
  it("renders the component", () => {
    const wrapper = mountPopupError();
    expect(wrapper.find(".vc-popup-base-stub").exists()).toBe(true);
  });

  it("passes variant=error to VcPopupBase", () => {
    const wrapper = mountPopupError();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("variant")).toBe("error");
  });

  it("passes mode=acknowledge to VcPopupBase", () => {
    const wrapper = mountPopupError();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("mode")).toBe("acknowledge");
  });

  it("passes title prop through to VcPopupBase", () => {
    const wrapper = mountPopupError({ title: "Error occurred" });
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("title")).toBe("Error occurred");
  });

  it("passes translated action-label to VcPopupBase", () => {
    const wrapper = mountPopupError();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("actionLabel")).toBe("COMPONENTS.ORGANISMS.VC_POPUP.OK");
  });

  it("emits close when VcPopupBase emits close", async () => {
    const wrapper = mountPopupError();
    await wrapper.findComponent(VcPopupBaseStub).vm.$emit("close");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("renders default slot content", () => {
    const wrapper = mountPopupError({}, { default: "Error details here" });
    expect(wrapper.text()).toContain("Error details here");
  });

  it("renders header slot when provided", () => {
    const wrapper = mountPopupError({}, { header: "<span>Error Header</span>" });
    expect(wrapper.text()).toContain("Error Header");
  });
});
