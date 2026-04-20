import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import { IsDesktopKey } from "@framework/injection-keys";
import UserSidebar from "./user-sidebar.vue";

vi.mock("@shell/components/settings-menu", () => ({
  SettingsMenu: defineComponent({
    name: "SettingsMenu",
    setup() {
      return () => h("div", { class: "mock-settings-menu" }, "Settings Menu");
    },
  }),
}));

vi.mock("@ui/components/organisms/vc-sidebar", () => ({
  VcSidebar: defineComponent({
    name: "VcSidebar",
    props: ["modelValue", "position", "teleport", "title"],
    emits: ["update:modelValue"],
    setup(props, { slots, emit: _emit }) {
      return () => h("div", { class: "mock-vc-sidebar" }, [props.modelValue ? slots.default?.() : null]);
    },
  }),
}));

function mountSidebar(isOpened = false, isDesktop = ref(true)) {
  return mount(UserSidebar, {
    props: { isOpened },
    global: {
      provide: { [IsDesktopKey as symbol]: isDesktop },
      mocks: {
        $t: (key: string) => key,
      },
    },
  });
}

describe("user-sidebar.vue", () => {
  it("renders VcSidebar", () => {
    const wrapper = mountSidebar(false);
    expect(wrapper.find(".mock-vc-sidebar").exists()).toBe(true);
  });

  it("shows SettingsMenu when isOpened is true", () => {
    const wrapper = mountSidebar(true);
    expect(wrapper.find(".mock-settings-menu").exists()).toBe(true);
  });

  it("hides SettingsMenu when isOpened is false", () => {
    const wrapper = mountSidebar(false);
    expect(wrapper.find(".mock-settings-menu").exists()).toBe(false);
  });

  it("emits update:isOpened(false) when menu area is clicked", async () => {
    const wrapper = mountSidebar(true);
    await wrapper.find(".vc-user-sidebar__menu").trigger("click");
    expect(wrapper.emitted("update:isOpened")).toBeTruthy();
    expect(wrapper.emitted("update:isOpened")![0][0]).toBe(false);
  });
});
