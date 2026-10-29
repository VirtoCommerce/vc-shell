import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, onMounted } from "vue";
import VcDropdown from "@ui/components/molecules/vc-dropdown/vc-dropdown.vue";
import { panelAnchorRegistry } from "@ui/components/molecules/vc-popover/panel-anchor-registry";

describe("VcDropdown", () => {
  it("emits close reason and model update on Escape", async () => {
    const items = [
      { id: "1", title: "One" },
      { id: "2", title: "Two" },
    ];

    const wrapper = mount(VcDropdown as any, {
      props: {
        modelValue: true,
        items,
        itemText: (item: { title: string }) => item.title,
      },
      attachTo: document.body,
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    expect(wrapper.emitted("close")?.[0]).toEqual(["escape"]);

    wrapper.unmount();
  });

  it("keeps open for a click in, or Escape to, a popover opened from inside its panel", async () => {
    const wrapper = mount(VcDropdown as any, {
      props: { modelValue: true, items: [{ id: "1", title: "One" }], itemText: (i: { title: string }) => i.title },
      attachTo: document.body,
    });
    await nextTick();
    const anchor = document.createElement("span");
    document.querySelector(".vc-dropdown__dropdown")!.appendChild(anchor);
    const popover = document.createElement("div");
    popover.className = "vc-popover";
    const button = popover.appendChild(document.createElement("button"));
    document.body.appendChild(popover);
    panelAnchorRegistry.set(popover, anchor);

    button.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(wrapper.emitted("close")).toBeUndefined();

    // Once the popover closed, Escape reaches the dropdown again
    panelAnchorRegistry.delete(popover);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await nextTick();
    expect(wrapper.emitted("close")?.[0]).toEqual(["escape"]);

    popover.remove();
    wrapper.unmount();
  });

  it("calls preventDefault on Escape when open", async () => {
    const items = [
      { id: "1", title: "One" },
      { id: "2", title: "Two" },
    ];

    const wrapper = mount(VcDropdown as any, {
      props: {
        modelValue: true,
        items,
        itemText: (item: { title: string }) => item.title,
      },
      attachTo: document.body,
    });

    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    document.dispatchEvent(event);
    await nextTick();

    expect(event.defaultPrevented).toBe(true);

    wrapper.unmount();
  });

  it("supports arrow navigation and selects focused item on Enter", async () => {
    const items = [
      { id: "1", title: "One" },
      { id: "2", title: "Two" },
    ];

    const wrapper = mount(VcDropdown as any, {
      props: {
        modelValue: true,
        items,
        itemText: (item: { title: string }) => item.title,
      },
      attachTo: document.body,
    });

    const panel = wrapper.find(".vc-dropdown__dropdown");
    await panel.trigger("keydown", { key: "ArrowDown" });
    await panel.trigger("keydown", { key: "Enter" });

    expect(wrapper.emitted("item-click")?.[0]).toEqual([items[1]]);

    wrapper.unmount();
  });

  it("announces a disabled item and does not choose it by click or by key", async () => {
    const items = [
      { id: "1", title: "One", disabled: true },
      { id: "2", title: "Two" },
    ];

    const wrapper = mount(VcDropdown as any, {
      props: {
        modelValue: true,
        items,
        itemText: (item: { title: string }) => item.title,
        isItemDisabled: (item: { disabled?: boolean }) => !!item.disabled,
      },
      attachTo: document.body,
    });

    const [disabled, enabled] = wrapper.findAll(".vc-dropdown__item");
    expect(disabled.attributes("aria-disabled")).toBe("true");
    expect(enabled.attributes("aria-disabled")).toBeUndefined();

    await disabled.trigger("click");
    await wrapper.find(".vc-dropdown__dropdown").trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("item-click")).toBeUndefined();

    await enabled.trigger("click");
    expect(wrapper.emitted("item-click")).toEqual([[items[1]]]);

    wrapper.unmount();
  });

  describe("forceMount", () => {
    function mountWithProbe(props: Record<string, unknown>) {
      const onProbeMounted = vi.fn();
      const Probe = defineComponent({
        setup() {
          onMounted(() => onProbeMounted());
          return () => h("span", { class: "probe" }, "probe");
        },
      });
      const wrapper = mount(VcDropdown as any, {
        props: { items: [{ id: "1" }], ...props },
        slots: { item: () => h(Probe) },
        attachTo: document.body,
      });
      return { wrapper, onProbeMounted };
    }

    it("keeps content mounted while closed", async () => {
      const { wrapper, onProbeMounted } = mountWithProbe({ forceMount: true, modelValue: false });
      await nextTick();

      const panel = wrapper.find(".vc-dropdown__dropdown");
      expect(panel.exists()).toBe(true);
      expect((panel.element as HTMLElement).style.display).toBe("none");
      expect(panel.attributes()).toHaveProperty("inert");
      expect(onProbeMounted).toHaveBeenCalledTimes(1);

      await wrapper.setProps({ modelValue: true });
      expect((wrapper.find(".vc-dropdown__dropdown").element as HTMLElement).style.display).not.toBe("none");
      expect(wrapper.find(".vc-dropdown__dropdown").attributes()).not.toHaveProperty("inert");

      await wrapper.setProps({ modelValue: false });
      await wrapper.setProps({ modelValue: true });
      expect(onProbeMounted).toHaveBeenCalledTimes(1);

      wrapper.unmount();
    });

    it("default unmounts when closed", () => {
      const { wrapper, onProbeMounted } = mountWithProbe({ modelValue: false });

      expect(wrapper.find(".vc-dropdown__dropdown").exists()).toBe(false);
      expect(onProbeMounted).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it("hidden panel is not focusable and ignores outside click and Escape", async () => {
      const { wrapper } = mountWithProbe({ forceMount: true, modelValue: false, autoFocusPanel: true });
      await nextTick();

      const panel = wrapper.find(".vc-dropdown__dropdown");
      expect(document.activeElement).not.toBe(panel.element);
      expect(panel.attributes()).toHaveProperty("inert");

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      document.body.dispatchEvent(new MouseEvent("pointerdown", { bubbles: true }));
      document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await nextTick();
      expect(wrapper.emitted("close")).toBeUndefined();
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();

      wrapper.unmount();
    });
  });
});
