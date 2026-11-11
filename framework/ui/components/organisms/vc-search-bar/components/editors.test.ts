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

const fields: SearchBarField[] = [
  { id: "status", label: "Status", filter: { options: [{ value: "a", label: "A" }], multiple: true } },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
];

describe("DateRangeEditor", () => {
  it("writing the same range twice emits once", async () => {
    const field = normalizeField(fields[1]);
    const w = mount(DateRangeEditor, { props: { field, value: undefined }, global });
    const picker = w.findComponent(DatePickerStub);
    const range = [new Date(2026, 0, 5), new Date(2026, 0, 9)];
    picker.vm.$emit("update:modelValue", range);
    expect(w.emitted("update:value")).toEqual([[{ start: "2026-01-05", end: "2026-01-09" }]]);
    await w.setProps({ value: { start: "2026-01-05", end: "2026-01-09" } });
    picker.vm.$emit("update:modelValue", range);
    expect(w.emitted("update:value")).toHaveLength(1);
  });

  it("a quick button writes a relative value", async () => {
    const field = normalizeField(fields[1]);
    const w = mount(DateRangeEditor, { props: { field, value: undefined }, global });
    await w.findAll("button")[1].trigger("click");
    expect(w.emitted("update:value")).toEqual([[{ relative: "7d" }]]);
  });
});

describe("NumberEditor", () => {
  const field = normalizeField({ id: "total", label: "Total", filter: { number: true } });
  const type = async (w: ReturnType<typeof mount>, i: number, v: string) => {
    const inputs = w.findAll(".input-stub");
    await inputs[i].setValue(v);
    await inputs[i].trigger("blur");
  };

  it("emits gte with min on blur", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await type(w, 0, "5");
    expect(w.emitted("update:value")).toEqual([[{ op: "gte", min: 5 }]]);
  });

  it("emits lte with max, never a min", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await w.findAll("button")[1].trigger("click");
    await type(w, 0, "9");
    expect(w.emitted("update:value")).toEqual([[{ op: "lte", max: 9 }]]);
  });

  it("emits between only with both bounds", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await w.findAll("button")[3].trigger("click");
    await type(w, 0, "1");
    expect(w.emitted("update:value")).toBeUndefined();
    await type(w, 1, "4");
    expect(w.emitted("update:value")).toEqual([[{ op: "between", min: 1, max: 4 }]]);
  });

  it("emits nothing for non-numeric input", async () => {
    const w = mount(NumberEditor, { props: { field, value: undefined }, global });
    await type(w, 0, "abc");
    expect(w.emitted("update:value")).toBeUndefined();
  });
});

describe("SelectEditor", () => {
  const field = normalizeField({
    id: "s",
    label: "S",
    operators: ["any", "not"],
    filter: { options: [{ value: "a", label: "A" }], multiple: true },
  });
  const stubsCb = {
    ...stubs,
    VcCheckbox: {
      props: ["modelValue"],
      emits: ["update:modelValue"],
      template: "<input type='checkbox' @change=\"$emit('update:modelValue', $event.target.checked)\" />",
    },
  };

  it("keeps Is not chosen with nothing selected and writes a not value", async () => {
    const w = mount(SelectEditor, { props: { field, value: undefined }, global: { ...global, stubs: stubsCb } });
    const [any, not] = w.findAll(".vc-search-bar-editor__segment");
    await not.trigger("click");
    expect(not.attributes("aria-pressed")).toBe("true");
    expect(any.attributes("aria-pressed")).toBe("false");
    await w.find("input").setValue(true);
    expect(w.emitted("update:value")).toEqual([[{ not: ["a"] }]]);
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
