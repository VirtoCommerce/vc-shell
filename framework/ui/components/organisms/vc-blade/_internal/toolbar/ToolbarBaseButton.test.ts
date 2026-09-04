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

import ToolbarBaseButton from "@ui/components/organisms/vc-blade/_internal/toolbar/ToolbarBaseButton.vue";

describe("ToolbarBaseButton", () => {
  it("treats computed disabled as reactive and blocks click", async () => {
    const onClick = vi.fn();

    const wrapper = mount(ToolbarBaseButton as any, {
      props: {
        icon: "lucide-plus",
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
        icon: "lucide-plus",
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
        icon: "lucide-plus",
        title,
      },
    });

    expect(wrapper.text()).toContain("Initial");

    title.value = "Updated";
    await nextTick();

    expect(wrapper.text()).toContain("Updated");
  });

  it("sets aria-keyshortcuts when a shortcut is present", () => {
    const wrapper = mount(ToolbarBaseButton, {
      props: { id: "save", title: "Save", icon: "lucide-save", shortcut: { key: "s", mod: true } },
    });
    const button = wrapper.get("button");
    // canonical form is OS-independent: Control+S or Meta+S depending on runner
    expect(button.attributes("aria-keyshortcuts")).toMatch(/\+S$/);
  });

  it("does not set aria-keyshortcuts without a shortcut", () => {
    const wrapper = mount(ToolbarBaseButton, {
      props: { id: "save", title: "Save", icon: "lucide-save" },
    });
    expect(wrapper.get("button").attributes("aria-keyshortcuts")).toBeUndefined();
  });
});

/**
 * The state used to live only in a CSS modifier class, so assistive tech was told
 * these were ordinary actionable buttons while they did nothing (VCST-5861).
 */
describe("ToolbarBaseButton disabled state", () => {
  it("announces a disabled button as unavailable", () => {
    const wrapper = mount(ToolbarBaseButton as any, {
      props: { icon: "lucide-plus", title: "Save", disabled: true },
    });

    expect(wrapper.find("button").attributes("aria-disabled")).toBe("true");
  });

  it("says nothing when the button is actionable", () => {
    const wrapper = mount(ToolbarBaseButton as any, {
      props: { icon: "lucide-plus", title: "Save" },
    });

    expect(wrapper.find("button").attributes("aria-disabled")).toBeUndefined();
  });

  // A toolbar button stays reachable so a keyboard user can find it and be told it
  // is unavailable, rather than having it disappear from the tab order.
  it("stays in the tab order while disabled", () => {
    const wrapper = mount(ToolbarBaseButton as any, {
      props: { icon: "lucide-plus", title: "Save", disabled: true },
    });

    expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    expect(wrapper.find("button").attributes("tabindex")).not.toBe("-1");
  });

  it("announces the in-flight state of its own click too", async () => {
    let finish: (() => void) | undefined;
    const wrapper = mount(ToolbarBaseButton as any, {
      props: {
        icon: "lucide-plus",
        title: "Save",
        onClick: () => new Promise<void>((resolve) => (finish = resolve)),
      },
    });

    await wrapper.find("button").trigger("click");
    expect(wrapper.find("button").attributes("aria-disabled")).toBe("true");

    finish?.();
    await nextTick();
    await nextTick();
    expect(wrapper.find("button").attributes("aria-disabled")).toBeUndefined();
  });

  it("announces it on the shortcut variant, which renders a separate button", () => {
    const wrapper = mount(ToolbarBaseButton as any, {
      props: { icon: "lucide-save", title: "Save", disabled: true, shortcut: { mod: true, key: "s" } },
      global: { stubs: { VcTooltip: { template: "<div><slot /><slot name='tooltip' /></div>" } } },
    });

    expect(wrapper.find("button").attributes("aria-disabled")).toBe("true");
  });
});
