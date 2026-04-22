import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, defineComponent, markRaw } from "vue";
import SettingsMenu from "./settings-menu.vue";

const DummyComp = markRaw(
  defineComponent({
    props: { label: String },
    template: '<div class="dummy-item">{{ label }}</div>',
  }),
);

const mockItems = ref<Array<{ id: string; group?: string; component: unknown; props?: Record<string, unknown> }>>([]);

vi.mock("@core/composables/useSettingsMenu", () => ({
  useSettingsMenu: () => ({ items: mockItems }),
}));

function factory() {
  return mount(SettingsMenu, {
    global: { stubs: {} },
  });
}

describe("SettingsMenu", () => {
  beforeEach(() => {
    mockItems.value = [];
  });

  it("renders empty when no items", () => {
    const w = factory();
    expect(w.find(".vc-settings-menu").exists()).toBe(true);
    expect(w.find(".vc-settings-menu__group").exists()).toBe(false);
  });

  it("renders items in a single group", () => {
    mockItems.value = [
      { id: "a", component: DummyComp, props: { label: "Item A" } },
      { id: "b", component: DummyComp, props: { label: "Item B" } },
    ];
    const w = factory();
    expect(w.findAll(".dummy-item").length).toBe(2);
    expect(w.findAll(".vc-settings-menu__group").length).toBe(1);
  });

  it("groups items by group name and shows separators", () => {
    mockItems.value = [
      { id: "a", group: "general", component: DummyComp, props: { label: "A" } },
      { id: "b", group: "account", component: DummyComp, props: { label: "B" } },
    ];
    const w = factory();
    expect(w.findAll(".vc-settings-menu__group").length).toBe(2);
    expect(w.findAll(".vc-settings-menu__separator").length).toBe(1);
  });

  it("defaults group name to general when not specified", () => {
    mockItems.value = [
      { id: "a", component: DummyComp, props: { label: "A" } },
      { id: "b", component: DummyComp, props: { label: "B" } },
    ];
    const w = factory();
    // Both in same group, no separator
    expect(w.findAll(".vc-settings-menu__separator").length).toBe(0);
    expect(w.findAll(".vc-settings-menu__group").length).toBe(1);
  });

  it("passes props to dynamic components", () => {
    mockItems.value = [{ id: "a", component: DummyComp, props: { label: "Hello" } }];
    const w = factory();
    expect(w.text()).toContain("Hello");
  });

  it("reactively updates when items change", async () => {
    mockItems.value = [{ id: "a", component: DummyComp, props: { label: "First" } }];
    const w = factory();
    expect(w.findAll(".dummy-item").length).toBe(1);

    mockItems.value = [
      { id: "a", component: DummyComp, props: { label: "First" } },
      { id: "b", component: DummyComp, props: { label: "Second" } },
    ];
    await w.vm.$nextTick();
    expect(w.findAll(".dummy-item").length).toBe(2);
  });
});
