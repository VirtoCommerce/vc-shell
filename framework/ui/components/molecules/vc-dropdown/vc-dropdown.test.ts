import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import VcDropdown from "@ui/components/molecules/vc-dropdown/vc-dropdown.vue";

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
});
