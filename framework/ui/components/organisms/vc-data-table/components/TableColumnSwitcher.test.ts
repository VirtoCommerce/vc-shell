import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import TableColumnSwitcher from "./TableColumnSwitcher.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (k: string) => k }),
}));

const columns = [
  { id: "name", label: "Name", visible: true },
  { id: "email", label: "Email", visible: true },
  { id: "phone", label: "Phone", visible: false },
];

const stubs = {
  VcDropdownPanel: {
    template: '<div class="vc-dropdown-panel-stub"><slot /><slot name="footer" /></div>',
    props: ["show", "anchorRef", "title", "width", "maxWidth"],
    emits: ["update:show"],
  },
  VcCheckbox: {
    template:
      '<input type="checkbox" class="vc-checkbox-stub" :checked="modelValue" @change="$emit(\'update:modelValue\', !modelValue)" />',
    props: ["modelValue"],
    emits: ["update:modelValue"],
  },
  VcButton: {
    template: '<button class="vc-button-stub" @click="$emit(\'click\')"><slot /></button>',
    props: ["variant", "size"],
  },
};

function factory(props: Record<string, unknown> = {}) {
  return mount(TableColumnSwitcher, {
    props: {
      columns,
      show: true,
      ...props,
    },
    global: {
      stubs,
      mocks: { $t: (k: string) => k },
    },
  });
}

describe("TableColumnSwitcher", () => {
  it("renders panel", () => {
    const w = factory();
    expect(w.find(".vc-dropdown-panel-stub").exists()).toBe(true);
  });

  it("renders a checkbox per column", () => {
    const w = factory();
    expect(w.findAll(".vc-checkbox-stub").length).toBe(3);
  });

  it("renders column labels", () => {
    const w = factory();
    const labels = w.findAll(".vc-column-switcher-panel__label");
    expect(labels[0].text()).toBe("Name");
    expect(labels[1].text()).toBe("Email");
  });

  it("falls back to column id when no label", () => {
    const w = factory({ columns: [{ id: "foo" }] });
    expect(w.find(".vc-column-switcher-panel__label").text()).toBe("foo");
  });

  it("emits update:visibleColumns on toggle", async () => {
    const w = factory({ visibleColumns: ["name", "email"] });
    await w.findAll(".vc-checkbox-stub")[0].trigger("change");
    expect(w.emitted("update:visibleColumns")).toBeTruthy();
  });

  it("emits update:visibleColumns with all columns on show all", async () => {
    const w = factory({ visibleColumns: ["name"] });
    const buttons = w.findAll(".vc-button-stub");
    // First button is "Show all"
    await buttons[0].trigger("click");
    const emitted = w.emitted("update:visibleColumns");
    expect(emitted).toBeTruthy();
    expect(emitted![0][0]).toEqual(["name", "email", "phone"]);
  });

  it("emits reset event (not update:visibleColumns) on reset", async () => {
    const w = factory({ visibleColumns: ["name", "email", "phone"] });
    const buttons = w.findAll(".vc-button-stub");
    // Second button is "Reset"
    await buttons[1].trigger("click");
    expect(w.emitted("reset")).toBeTruthy();
    expect(w.emitted("reset")!.length).toBeGreaterThanOrEqual(1);
    // Reset no longer emits update:visibleColumns
    expect(w.emitted("update:visibleColumns")).toBeFalsy();
  });
});
