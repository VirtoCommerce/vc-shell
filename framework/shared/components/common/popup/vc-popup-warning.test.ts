import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import VcPopupWarning from "./vc-popup-warning.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const VcPopupBaseStub = {
  name: "VcPopupBase",
  template: `<div class="vc-popup-base-stub">
    <slot name="header" />
    <slot />
  </div>`,
  props: ["variant", "mode", "confirmLabel", "cancelLabel", "confirmAsText", "title"],
  emits: ["close", "confirm"],
};

function mountPopupWarning(props = {}, slots = {}) {
  return mount(VcPopupWarning, {
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

describe("VcPopupWarning", () => {
  it("renders the component", () => {
    const wrapper = mountPopupWarning();
    expect(wrapper.find(".vc-popup-base-stub").exists()).toBe(true);
  });

  it("passes variant=warning to VcPopupBase", () => {
    const wrapper = mountPopupWarning();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("variant")).toBe("warning");
  });

  it("passes mode=confirm to VcPopupBase", () => {
    const wrapper = mountPopupWarning();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("mode")).toBe("confirm");
  });

  it("passes confirmAsText to VcPopupBase", () => {
    const wrapper = mountPopupWarning();
    const base = wrapper.findComponent(VcPopupBaseStub);
    // confirm-as-text is a boolean prop — when set without value, Vue passes "" which the stub receives as prop
    const propVal = base.props("confirmAsText");
    // Vue coerces the boolean attr to "" (string) since stub doesn't declare Boolean type
    expect(propVal === true || propVal === "").toBe(true);
  });

  it("passes title prop through to VcPopupBase", () => {
    const wrapper = mountPopupWarning({ title: "Warning!" });
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("title")).toBe("Warning!");
  });

  it("passes translated confirm-label to VcPopupBase", () => {
    const wrapper = mountPopupWarning();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("confirmLabel")).toBe("COMPONENTS.ORGANISMS.VC_POPUP.CONFIRM");
  });

  it("passes translated cancel-label to VcPopupBase", () => {
    const wrapper = mountPopupWarning();
    const base = wrapper.findComponent(VcPopupBaseStub);
    expect(base.props("cancelLabel")).toBe("COMPONENTS.ORGANISMS.VC_POPUP.CANCEL");
  });

  it("emits close when VcPopupBase emits close", async () => {
    const wrapper = mountPopupWarning();
    await wrapper.findComponent(VcPopupBaseStub).vm.$emit("close");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("emits confirm when VcPopupBase emits confirm", async () => {
    const wrapper = mountPopupWarning();
    await wrapper.findComponent(VcPopupBaseStub).vm.$emit("confirm");
    expect(wrapper.emitted("confirm")).toHaveLength(1);
  });

  it("renders default slot content", () => {
    const wrapper = mountPopupWarning({}, { default: "Are you sure?" });
    expect(wrapper.text()).toContain("Are you sure?");
  });

  it("renders header slot when provided", () => {
    const wrapper = mountPopupWarning({}, { header: "<span>Careful!</span>" });
    expect(wrapper.text()).toContain("Careful!");
  });
});
