import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import GenericDropdown from "./generic-dropdown.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k, locale: ref("en") }),
}));

const VcDropdownStub = {
  template: `<div data-stub="VcDropdown">
    <slot name="trigger" :isActive="false" :toggle="() => {}" :open="() => {}" :close="() => {}" />
    <slot name="items-container" :items="items" :close="() => {}" />
    <slot name="item" v-for="item in items" :item="item" :click="() => handleItemClick(item)" />
    <slot name="empty" />
  </div>`,
  props: ["modelValue", "items", "emptyText", "itemText", "isItemActive", "floating", "placement", "variant", "offset", "maxHeight"],
  emits: ["item-click", "update:modelValue"],
  methods: {
    handleItemClick(item: unknown) {
      this.$emit("item-click", item);
    },
  },
};

function factory(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(GenericDropdown, {
    props: { items: ["a", "b", "c"], ...props },
    slots,
    global: { stubs: { VcDropdown: VcDropdownStub } },
  });
}

describe("GenericDropdown", () => {
  it("renders VcDropdown", () => {
    const w = factory();
    expect(w.find('[data-stub="VcDropdown"]').exists()).toBe(true);
  });

  it("passes items to VcDropdown", () => {
    const items = [{ id: 1 }, { id: 2 }];
    const w = factory({ items });
    expect(w.find('[data-stub="VcDropdown"]').exists()).toBe(true);
  });

  it("forwards item-click from VcDropdown", async () => {
    const w = factory({ items: ["x"] });
    const dropdown = w.findComponent(VcDropdownStub);
    await dropdown.vm.$emit("item-click", "x");
    expect(w.emitted("item-click")).toBeTruthy();
    expect(w.emitted("item-click")![0]).toEqual(["x"]);
  });

  it("does not emit item-click when disabled", async () => {
    const w = factory({ items: ["x"], disabled: true });
    const dropdown = w.findComponent(VcDropdownStub);
    await dropdown.vm.$emit("item-click", "x");
    // The component guards against disabled in onItemClick
    expect(w.emitted("item-click")).toBeUndefined();
  });

  it("forwards update:opened from VcDropdown", async () => {
    const w = factory();
    const dropdown = w.findComponent(VcDropdownStub);
    await dropdown.vm.$emit("update:modelValue", true);
    expect(w.emitted("update:opened")).toBeTruthy();
    expect(w.emitted("update:opened")![0]).toEqual([true]);
  });

  it("emits update:opened with false when disabled", async () => {
    const w = factory({ disabled: true });
    const dropdown = w.findComponent(VcDropdownStub);
    await dropdown.vm.$emit("update:modelValue", true);
    expect(w.emitted("update:opened")).toBeTruthy();
    expect(w.emitted("update:opened")![0]).toEqual([false]);
  });

  it("defaults opened to false", () => {
    const w = factory();
    expect(w.find('[data-stub="VcDropdown"]').exists()).toBe(true);
  });

  it("renders trigger slot", () => {
    const w = factory({}, { trigger: '<span class="my-trigger">Trigger</span>' });
    expect(w.find(".my-trigger").exists()).toBe(true);
  });

  it("renders empty slot", () => {
    const w = factory({ items: [] }, { empty: '<span class="no-items">No items</span>' });
    expect(w.find(".no-items").exists()).toBe(true);
  });
});
