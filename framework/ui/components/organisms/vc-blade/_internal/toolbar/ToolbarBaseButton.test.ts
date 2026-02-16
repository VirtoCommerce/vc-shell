import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { computed, nextTick, ref } from "vue";

vi.mock("../../../../", () => ({
  VcIcon: {
    name: "VcIcon",
    props: ["icon", "size"],
    template: "<i class='vc-icon-stub' />",
  },
}));

import ToolbarBaseButton from "./ToolbarBaseButton.vue";

describe("ToolbarBaseButton", () => {
  it("treats computed disabled as reactive and blocks click", async () => {
    const onClick = vi.fn();

    const wrapper = mount(ToolbarBaseButton as any, {
      props: {
        icon: "material-add",
        title: "Create",
        disabled: computed(() => true),
        onClick,
      },
    });

    await wrapper.find("button").trigger("click");

    expect(onClick).not.toHaveBeenCalled();
    expect(wrapper.find("button").classes()).toContain("vc-blade-toolbar-base-button--disabled");
  });

  it("locks repeated async clicks while handler is pending", async () => {
    let resolveClick: (() => void) | undefined;
    const onClick = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveClick = resolve;
        }),
    );

    const wrapper = mount(ToolbarBaseButton as any, {
      props: {
        icon: "material-add",
        title: "Create",
        disabled: false,
        onClick,
      },
    });

    const button = wrapper.find("button");
    await button.trigger("click");
    await button.trigger("click");

    expect(onClick).toHaveBeenCalledTimes(1);

    resolveClick?.();
    await nextTick();
  });

  it("renders reactive title values from Ref", async () => {
    const title = ref("Initial");

    const wrapper = mount(ToolbarBaseButton as any, {
      props: {
        icon: "material-add",
        title,
      },
    });

    expect(wrapper.text()).toContain("Initial");

    title.value = "Updated";
    await nextTick();

    expect(wrapper.text()).toContain("Updated");
  });
});
