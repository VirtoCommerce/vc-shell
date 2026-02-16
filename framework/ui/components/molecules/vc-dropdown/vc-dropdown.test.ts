import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import VcDropdown from "./vc-dropdown.vue";

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
});
