import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import VcAiAgentHeader from "./VcAiAgentHeader.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

function factory(props: Record<string, unknown> = {}) {
  return mount(VcAiAgentHeader, {
    props: { isExpanded: false, ...props },
    global: {
      stubs: {
        VcIcon: { name: "VcIcon", props: ["icon"], template: '<i class="vc-icon-stub" />' },
        teleport: true,
      },
    },
  });
}

describe("VcAiAgentHeader", () => {
  it("renders title text", () => {
    const wrapper = factory({ title: "AI Assistant" });
    expect(wrapper.find(".vc-ai-agent-header__title").text()).toBe("AI Assistant");
  });

  describe("close control", () => {
    it("has role=button, tabindex=0, non-empty aria-label, and aria-keyshortcuts=Escape", () => {
      const wrapper = factory();
      const buttons = wrapper.findAll(".vc-blade-header__button");
      const closeButton = buttons[buttons.length - 1];
      expect(closeButton.attributes("role")).toBe("button");
      expect(closeButton.attributes("tabindex")).toBe("0");
      expect(closeButton.attributes("aria-label")).toBeTruthy();
      expect(closeButton.attributes("aria-keyshortcuts")).toBe("Escape");
    });

    it("emits close on click", async () => {
      const wrapper = factory();
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[buttons.length - 1].trigger("click");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("emits close on keydown.enter", async () => {
      const wrapper = factory();
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[buttons.length - 1].trigger("keydown.enter");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("emits close on keydown.space", async () => {
      const wrapper = factory();
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[buttons.length - 1].trigger("keydown.space");
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("keeps Close as the last header control before focus enters the iframe", () => {
      const wrapper = factory();
      const controls = wrapper.findAll('.vc-blade-header__button[tabindex="0"]');

      expect(controls.at(-1)?.attributes("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.CLOSE");
    });
  });

  describe("maximize control (isExpanded=false)", () => {
    it("has role=button, tabindex=0, non-empty aria-label, and aria-keyshortcuts matching +\\", () => {
      const wrapper = factory({ isExpanded: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      const expandButton = buttons[0];
      expect(expandButton.attributes("role")).toBe("button");
      expect(expandButton.attributes("tabindex")).toBe("0");
      expect(expandButton.attributes("aria-label")).toBeTruthy();
      expect(expandButton.attributes("aria-keyshortcuts")).toMatch(/\+\\$/);
    });

    it("emits expand on click", async () => {
      const wrapper = factory({ isExpanded: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[0].trigger("click");
      expect(wrapper.emitted("expand")).toBeTruthy();
    });

    it("emits expand on keydown.enter", async () => {
      const wrapper = factory({ isExpanded: false });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[0].trigger("keydown.enter");
      expect(wrapper.emitted("expand")).toBeTruthy();
    });
  });

  describe("restore control (isExpanded=true)", () => {
    it("has role=button, tabindex=0, non-empty aria-label, and aria-keyshortcuts matching +\\", () => {
      const wrapper = factory({ isExpanded: true });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      const collapseButton = buttons[0];
      expect(collapseButton.attributes("role")).toBe("button");
      expect(collapseButton.attributes("tabindex")).toBe("0");
      expect(collapseButton.attributes("aria-label")).toBeTruthy();
      expect(collapseButton.attributes("aria-keyshortcuts")).toMatch(/\+\\$/);
    });

    it("emits collapse on click", async () => {
      const wrapper = factory({ isExpanded: true });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[0].trigger("click");
      expect(wrapper.emitted("collapse")).toBeTruthy();
    });

    it("emits collapse on keydown.enter", async () => {
      const wrapper = factory({ isExpanded: true });
      const buttons = wrapper.findAll(".vc-blade-header__button");
      await buttons[0].trigger("keydown.enter");
      expect(wrapper.emitted("collapse")).toBeTruthy();
    });
  });

  // Maximize and Restore swap nodes, so without a handoff focus drops to <body>.
  it("moves focus to the replacement control when isExpanded flips", async () => {
    const wrapper = mount(VcAiAgentHeader, {
      attachTo: document.body,
      props: { isExpanded: false },
      global: { stubs: { VcIcon: true, VcTooltip: { template: "<div><slot /></div>" } } },
    });
    const control = wrapper.element.querySelector<HTMLElement>("[data-blade-expand-control]")!;
    control.focus();

    await wrapper.setProps({ isExpanded: true });
    await nextTick();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    const replacement = wrapper.element.querySelector<HTMLElement>("[data-blade-expand-control]");
    expect(replacement).not.toBe(control);
    expect(document.activeElement).toBe(replacement);
    wrapper.unmount();
  });
});
