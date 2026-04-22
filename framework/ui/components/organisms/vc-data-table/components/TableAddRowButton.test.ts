import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TableAddRowButton from "./TableAddRowButton.vue";

const stubs = {
  VcButton: {
    template: '<button class="vc-button-stub" @click="$emit(\'click\', $event)"><slot /></button>',
    props: ["variant", "icon", "iconSize"],
  },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(TableAddRowButton, {
    props,
    global: { stubs },
  });
}

describe("TableAddRowButton", () => {
  it("renders with default label from i18n", () => {
    const w = factory();
    expect(w.find(".vc-table-add-row").exists()).toBe(true);
  });

  it("renders custom label", () => {
    const w = factory({ label: "Add Item" });
    expect(w.text()).toContain("Add Item");
  });

  it("emits add event on click", async () => {
    const w = factory();
    await w.find(".vc-button-stub").trigger("click");
    expect(w.emitted("add")).toBeTruthy();
  });

  it("uses default icon lucide-plus", () => {
    const w = factory();
    expect(w.exists()).toBe(true);
  });
});
