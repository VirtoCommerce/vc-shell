import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import DateRangeEditor from "./editors/DateRangeEditor.vue";
import SelectEditor from "./editors/SelectEditor.vue";
import NumberEditor from "./editors/NumberEditor.vue";
import MenuHost from "./MenuHost.vue";
import { normalizeField } from "../lib/fields";
import type { SearchBarField } from "../types";

const DatePickerStub = defineComponent({
  name: "VcDatePicker",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup: () => () => h("div", { class: "date-picker-stub" }),
});
const InputStub = defineComponent({
  name: "VcInput",
  props: ["modelValue"],
  emits: ["update:modelValue", "blur"],
  setup:
    (props, { emit }) =>
    () =>
      h("input", {
        class: "input-stub",
        value: props.modelValue,
        onInput: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).value),
        onBlur: () => emit("blur"),
      }),
});
const stubs = { VcDatePicker: DatePickerStub, VcInput: InputStub, VcIcon: true, VcCheckbox: true };
const global = {
  stubs,
  mocks: { $t: (k: string, p?: Record<string, string>) => (p ? `${k}:${Object.values(p).join(",")}` : k) },
};

const D = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.";
const E = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.EDITOR.";
const PRESET = ".vc-search-bar-editor__preset";
const FIND = ".vc-search-bar-editor__find";

const fields: SearchBarField[] = [
  { id: "status", label: "Status", filter: { options: [{ value: "a", label: "A" }], multiple: true } },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
];

describe("DateRangeEditor", () => {
  const field = normalizeField(fields[1]);
  const radios = (w: ReturnType<typeof mount>) => w.findAll("[role='radio']");

  it("writing the same range twice emits once", async () => {
    const w = mount(DateRangeEditor, { props: { field, value: undefined }, global });
    const picker = w.findComponent(DatePickerStub);
    const range = [new Date(2026, 0, 5), new Date(2026, 0, 9)];
    picker.vm.$emit("update:modelValue", range);
    expect(w.emitted("update:value")).toEqual([[{ start: "2026-01-05", end: "2026-01-09" }]]);
    await w.setProps({ value: { start: "2026-01-05", end: "2026-01-09" } });
    picker.vm.$emit("update:modelValue", range);
    expect(w.emitted("update:value")).toHaveLength(1);
  });

  it("lists Any time first, then the relative ranges; a range writes a relative value", async () => {
    const w = mount(DateRangeEditor, { props: { field, value: undefined }, global });
    expect(radios(w).map((r) => r.text())).toEqual([`${D}ANY`, `${D}TODAY`, `${D}LAST_7`, `${D}LAST_30`]);
    expect(radios(w)[0].attributes("aria-checked")).toBe("true");
    await radios(w)[2].trigger("click");
    expect(w.emitted("update:value")).toEqual([[{ relative: "7d" }]]);
  });

  it("Any time clears the value", async () => {
    const w = mount(DateRangeEditor, { props: { field, value: { relative: "today" } }, global });
    expect(radios(w)[1].attributes("aria-checked")).toBe("true");
    expect(radios(w)[0].attributes("aria-checked")).toBe("false");
    await radios(w)[0].trigger("click");
    expect(w.emitted("update:value")).toEqual([[undefined]]);
  });

  it("shows a count per relative range when counts are given", () => {
    const w = mount(DateRangeEditor, { props: { field, value: undefined, counts: { "7d": 12 } }, global });
    expect(radios(w)[2].find(".vc-search-bar-editor__count").text()).toBe("12");
    expect(radios(w)[1].find(".vc-search-bar-editor__count").exists()).toBe(false);
  });
});

describe("NumberEditor", () => {
  const field = normalizeField({ id: "total", label: "Total", filter: { number: true } });
  const inputs = (w: ReturnType<typeof mount>) => w.findAll(".input-stub");
  const apply = (w: ReturnType<typeof mount>) => w.get(".vc-search-bar-editor__apply");

  it("shows From and To; Apply is disabled until the range changes", async () => {
    const w = mount(NumberEditor, { props: { field, value: { op: "gte", min: 5 } }, global });
    expect(inputs(w)).toHaveLength(2);
    expect((inputs(w)[0].element as HTMLInputElement).value).toBe("5");
    expect(apply(w).attributes()).toHaveProperty("disabled");
    await inputs(w)[1].setValue("9");
    expect(apply(w).attributes()).not.toHaveProperty("disabled");
    await apply(w).trigger("click");
    expect(w.emitted("update:value")).toEqual([[{ op: "between", min: 5, max: 9 }]]);
  });

  it("Enter applies: From only is at least, To only is at most", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await inputs(w)[0].setValue("5");
    await inputs(w)[0].trigger("keydown", { key: "Enter" });
    await inputs(w)[0].setValue("");
    await inputs(w)[1].setValue("9");
    await inputs(w)[1].trigger("keydown", { key: "Enter" });
    expect(w.emitted("update:value")).toEqual([[{ op: "gte", min: 5 }], [{ op: "lte", max: 9 }]]);
  });

  it("blur does not apply; non-numeric input never applies", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await inputs(w)[0].setValue("7");
    await inputs(w)[0].trigger("blur");
    expect(w.emitted("update:value")).toBeUndefined();
    await inputs(w)[0].setValue("abc");
    expect(apply(w).attributes()).toHaveProperty("disabled");
    await inputs(w)[0].trigger("keydown", { key: "Enter" });
    expect(w.emitted("update:value")).toBeUndefined();
  });

  it("emptying both bounds and applying clears the value", async () => {
    const w = mount(NumberEditor, { props: { field, value: { op: "lte", max: 3 } }, global });
    await inputs(w)[1].setValue("");
    await apply(w).trigger("click");
    expect(w.emitted("update:value")).toEqual([[undefined]]);
  });

  it("presets come from the field and apply at once; none without them", async () => {
    expect(
      mount(NumberEditor, { props: { field, value: undefined }, global })
        .find(PRESET)
        .exists(),
    ).toBe(false);
    const withPresets = normalizeField({
      id: "total",
      label: "Total",
      filter: { number: true, presets: [{ label: "Under 100", value: { op: "lte", max: 100 } }] },
    });
    const w = mount(NumberEditor, { props: { field: withPresets, value: undefined }, global });
    await w.get(PRESET).trigger("click");
    expect(w.emitted("update:value")).toEqual([[{ op: "lte", max: 100 }]]);
    await w.setProps({ value: { op: "lte", max: 100 } });
    expect(w.get(PRESET).attributes("aria-pressed")).toBe("true");
  });
});

describe("SelectEditor", () => {
  const options = (n: number) => Array.from({ length: n }, (_, i) => ({ value: `v${i}`, label: `Option ${i}` }));
  const multi = (n: number, operators: ("any" | "not")[] = ["any"]) =>
    normalizeField({ id: "s", label: "S", operators, filter: { options: options(n), multiple: true } });
  const stubsCb = {
    ...stubs,
    VcCheckbox: {
      props: ["modelValue"],
      emits: ["update:modelValue"],
      template:
        "<label><input type='checkbox' :checked='modelValue' @change=\"$emit('update:modelValue', $event.target.checked)\" /><slot /></label>",
    },
  };
  const g = { ...global, stubs: stubsCb };
  const rows = (w: ReturnType<typeof mount>) => w.findAll(".vc-search-bar-editor__row");

  it("keeps Is not chosen with nothing selected and writes a not value", async () => {
    const w = mount(SelectEditor, { props: { field: multi(1, ["any", "not"]), value: undefined }, global: g });
    const [any, not] = w.findAll(".vc-search-bar-editor__segment");
    await not.trigger("click");
    expect(not.attributes("aria-pressed")).toBe("true");
    expect(any.attributes("aria-pressed")).toBe("false");
    await w.find("input[type='checkbox']").setValue(true);
    expect(w.emitted("update:value")).toEqual([[{ not: ["v0"] }]]);
  });

  it("a find box appears above 6 options and filters them", async () => {
    expect(
      mount(SelectEditor, { props: { field: multi(6), value: undefined }, global: g })
        .find(FIND)
        .exists(),
    ).toBe(false);
    const w = mount(SelectEditor, { props: { field: multi(7), value: undefined }, global: g });
    await w.get(FIND).setValue("option 3");
    expect(rows(w).map((r) => r.text())).toEqual([`Option 3${E}ONLY`]);
    await w.get(FIND).setValue("zzz");
    expect(rows(w)).toHaveLength(0);
    expect(w.text()).toContain(`${E}NOTHING_FOUND`);
  });

  it("Only sets just that value", async () => {
    const w = mount(SelectEditor, { props: { field: multi(3), value: ["v0", "v1"] }, global: g });
    await rows(w)[2].get(".vc-search-bar-editor__only").trigger("click");
    expect(w.emitted("update:value")).toEqual([[["v2"]]]);
  });

  it("Only keeps the Is not mode", async () => {
    const w = mount(SelectEditor, {
      props: { field: multi(3, ["any", "not"]), value: { not: ["v0"] } },
      global: g,
    });
    await rows(w)[1].get(".vc-search-bar-editor__only").trigger("click");
    expect(w.emitted("update:value")).toEqual([[{ not: ["v1"] }]]);
  });

  it("shows counts; zero-count unselected rows dim only when counts are given", async () => {
    const plain = mount(SelectEditor, { props: { field: multi(3), value: undefined }, global: g });
    expect(plain.findAll(".vc-search-bar-editor__count")).toHaveLength(0);
    expect(plain.findAll(".vc-search-bar-editor__row--dim")).toHaveLength(0);
    const w = mount(SelectEditor, {
      props: { field: multi(3), value: ["v1"], counts: { v0: 4, v1: 0, v2: 0 } },
      global: g,
    });
    expect(rows(w).map((r) => r.find(".vc-search-bar-editor__count").text())).toEqual(["4", "0", "0"]);
    expect(rows(w).map((r) => r.classes().includes("vc-search-bar-editor__row--dim"))).toEqual([false, false, true]);
    await w.setProps({ counts: { v0: 1, v1: 2, v2: 3 } });
    expect(rows(w).map((r) => r.find(".vc-search-bar-editor__count").text())).toEqual(["1", "2", "3"]);
  });

  it("a single select picks one option and unpicks it on a second click", async () => {
    const field = normalizeField({ id: "s", label: "S", filter: { options: options(2) } });
    const w = mount(SelectEditor, { props: { field, value: "v1" }, global: g });
    expect(rows(w)[1].attributes("aria-pressed")).toBe("true");
    await rows(w)[0].trigger("click");
    await rows(w)[1].trigger("click");
    expect(w.emitted("update:value")).toEqual([["v0"], [undefined]]);
  });
});

describe("MenuHost", () => {
  const PopoverStub = defineComponent({
    name: "VcPopover",
    props: ["show", "anchorRef", "title", "closeOnClickOutside", "width", "maxWidth"],
    emits: ["update:show"],
    setup:
      (_, { slots }) =>
      () =>
        h("div", { class: "popover-stub" }, slots.default?.()),
  });
  const SidebarStub = defineComponent({
    name: "VcSidebar",
    props: ["modelValue", "position", "size", "draggable", "dragHandle", "closeButton", "inset", "title"],
    emits: ["update:modelValue"],
    setup:
      (_, { slots }) =>
      () =>
        h("div", { class: "sidebar-stub" }, slots.default?.()),
  });
  const mountHost = (props: Record<string, unknown>) =>
    mount(MenuHost, {
      props,
      slots: { default: "<span class='content'>menu</span>" },
      global: { stubs: { VcPopover: PopoverStub, VcSidebar: SidebarStub } },
    });

  it("renders a popover anchored to the element", () => {
    const anchor = document.createElement("button");
    const w = mountHost({ sheet: false, anchor, title: "T", closeOnOutside: true });
    const pop = w.findComponent(PopoverStub);
    expect(pop.exists()).toBe(true);
    expect(w.findComponent(SidebarStub).exists()).toBe(false);
    expect(pop.props()).toMatchObject({
      show: true,
      anchorRef: anchor,
      title: "T",
      closeOnClickOutside: true,
      width: "280px",
      maxWidth: "360px",
    });
    expect(w.find(".content").exists()).toBe(true);
  });

  it("renders a bottom sheet when sheet", () => {
    const w = mountHost({ sheet: true, title: "T" });
    const sb = w.findComponent(SidebarStub);
    expect(sb.exists()).toBe(true);
    expect(w.findComponent(PopoverStub).exists()).toBe(false);
    expect(sb.props()).toMatchObject({
      modelValue: true,
      position: "bottom",
      size: "sm",
      draggable: true,
      dragHandle: true,
      closeButton: false,
      inset: false,
      title: "T",
    });
    expect(w.find(".content").exists()).toBe(true);
  });

  it("emits close from either host", async () => {
    const p = mountHost({ sheet: false });
    await p.findComponent(PopoverStub).vm.$emit("update:show", false);
    expect(p.emitted("close")).toHaveLength(1);
    const s = mountHost({ sheet: true });
    await s.findComponent(SidebarStub).vm.$emit("update:modelValue", false);
    expect(s.emitted("close")).toHaveLength(1);
  });
});
