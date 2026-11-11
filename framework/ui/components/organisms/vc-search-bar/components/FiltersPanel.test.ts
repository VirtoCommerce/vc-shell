import { afterEach, describe, expect, it } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { createI18n } from "vue-i18n";
import en from "../../../../../locales/en.json";
import de from "../../../../../locales/de.json";
import FiltersPanel from "./FiltersPanel.vue";
import FieldAccordion from "./FieldAccordion.vue";
import { normalizeFields } from "../lib/fields";
import type { SearchBarField, SearchBarState } from "../types";
import { InputStub, K, makeViews, stopViews, t } from "./views.test-helpers";
import type { ViewsApi } from "../composables/useViews";

const SwitchStub = defineComponent({
  name: "VcSwitch",
  props: { modelValue: Boolean, ariaLabel: String },
  emits: ["update:modelValue"],
  setup:
    (props, { emit }) =>
    () =>
      h("input", {
        type: "checkbox",
        role: "switch",
        class: "switch-stub",
        checked: props.modelValue,
        "aria-label": props.ariaLabel,
        onChange: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).checked),
      }),
});
const CheckboxStub = defineComponent({
  name: "VcCheckbox",
  props: { modelValue: Boolean },
  emits: ["update:modelValue"],
  setup:
    (props, { emit, slots }) =>
    () =>
      h("label", [
        h("input", {
          type: "checkbox",
          checked: props.modelValue,
          onChange: (e: Event) => emit("update:modelValue", (e.target as HTMLInputElement).checked),
        }),
        slots.default?.(),
      ]),
});
const global = {
  stubs: { VcInput: InputStub, VcIcon: true, VcSwitch: SwitchStub, VcCheckbox: CheckboxStub, VcDatePicker: true },
  mocks: { $t: t },
};

const P = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PANEL.";
const fields = normalizeFields([
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "paid", label: "Paid" },
        { value: "new", label: "New" },
      ],
      multiple: true,
    },
  },
  { id: "urgent", label: "Urgent", filter: { toggle: true } },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
  { id: "total", label: "Total", filter: { number: true } },
] as SearchBarField[]);

const wrappers: VueWrapper[] = [];
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount());
  stopViews();
});

function mountPanel(props: { state?: SearchBarState; views?: ViewsApi; [k: string]: unknown } = {}) {
  const views = props.views ?? makeViews().views;
  const w = mount(FiltersPanel, {
    props: { fields, state: { search: "", values: {} }, ...props, views },
    global,
    attachTo: document.body,
  });
  wrappers.push(w);
  return w;
}

const accLabels = (w: VueWrapper) => w.findAll(".vc-search-bar__acc-label").map((l) => l.text());
const expanded = (w: VueWrapper) =>
  w
    .findAll(".vc-search-bar__acc-toggle")
    .filter((b) => b.attributes("aria-expanded") === "true")
    .map((b) => b.find(".vc-search-bar__acc-label").text());
const clearBtn = (w: VueWrapper) => w.get(".vc-search-bar__panel-clear");

describe("FiltersPanel", () => {
  it("lists the toggles as switches, then every other field in the accordion", () => {
    const w = mountPanel();
    const body = w.get(".vc-search-bar__panel-body").element;
    expect(w.get(".vc-search-bar__panel-section").text()).toBe(`${P}TOGGLES`);
    expect(w.findAll(".vc-search-bar__toggle").map((r) => r.text())).toEqual(["Urgent"]);
    expect(w.get(".switch-stub").attributes("aria-label")).toBe("Urgent");
    expect(accLabels(w)).toEqual(["Status", "Created", "Total"]);
    const toggles = body.querySelector(".vc-search-bar__toggle")!;
    const accordion = body.querySelector(".vc-search-bar__acc")!;
    expect(toggles.compareDocumentPosition(accordion) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("no Toggles section without toggle fields", () => {
    const w = mountPanel({ fields: fields.filter((f) => f.kind !== "toggle") });
    expect(w.find(".vc-search-bar__panel-section").exists()).toBe(false);
  });

  it("the first applied field starts expanded, else the first field", () => {
    expect(expanded(mountPanel())).toEqual(["Status"]);
    const w = mountPanel({
      state: { search: "", values: { total: { op: "gte", min: 1 }, created: { relative: "7d" } } },
    });
    expect(expanded(w)).toEqual(["Created"]);
  });

  it("the first field in applied order starts expanded when the order is given", () => {
    const values = { total: { op: "gte", min: 1 }, created: { relative: "7d" } };
    const w = mountPanel({ state: { search: "", values }, order: ["total", "created"] });
    expect(expanded(w)).toEqual(["Total"]);
  });

  it("applies at once: a switch sets or clears its toggle, an editor sets its field", async () => {
    const w = mountPanel();
    await w.get(".switch-stub").setValue(true);
    await w.get(".vc-search-bar__acc input[type='checkbox']").setValue(true);
    expect(w.emitted("set")).toEqual([
      ["urgent", true],
      ["status", ["paid"]],
    ]);
    await w.setProps({ state: { search: "", values: { urgent: true } } });
    await w.get(".switch-stub").setValue(false);
    expect(w.emitted("clear-field")).toEqual([["urgent"]]);
  });

  it("a set field shows its value and a remove button; an unset one reads Any", async () => {
    const w = mountPanel({ state: { search: "", values: { status: ["paid"] } } });
    const values = w.findAll(".vc-search-bar__acc-value").map((v) => v.text());
    expect(values).toEqual(["Paid", `${P}ANY`, `${P}ANY`]);
    expect(w.findAll(".vc-search-bar__acc-value--set")).toHaveLength(1);
    const x = w.findAll(".vc-search-bar__acc-clear");
    expect(x).toHaveLength(1);
    expect(x[0].attributes("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.REMOVE_FILTER:Status");
    await x[0].trigger("click");
    expect(w.emitted("clear-field")).toEqual([["status"]]);
  });

  it("a header row opens its editor and closes the open one", async () => {
    const w = mountPanel();
    const toggles = w.findAll(".vc-search-bar__acc-toggle");
    expect(expanded(w)).toEqual(["Status"]);
    await toggles[1].trigger("click");
    expect(expanded(w)).toEqual(["Created"]);
    expect(w.findAll(".vc-search-bar__acc-body")).toHaveLength(1);
    await toggles[1].trigger("click");
    expect(expanded(w)).toEqual([]);
  });

  it("the header counts the active filters; close emits close", async () => {
    const w = mountPanel({ state: { search: "", values: { status: ["paid"], urgent: true } } });
    expect(w.get(".vc-search-bar__panel-active").text()).toBe(`${P}ACTIVE:2`);
    await w.get(".vc-search-bar__panel-close").trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
    expect(mountPanel().find(".vc-search-bar__panel-active").exists()).toBe(false);
  });

  it("the footer shows the result count when given, in singular and plural", () => {
    const status = (locale: "en" | "de", resultCount?: number) => {
      const i18n = createI18n({ legacy: false, locale, messages: { en, de } });
      const w = mount(FiltersPanel, {
        props: { fields, state: { search: "", values: {} }, views: makeViews().views, resultCount },
        // the setup file mocks $t for every mount; this test needs the real plural rules
        global: { stubs: global.stubs, plugins: [i18n], mocks: { $t: i18n.global.t } },
      });
      wrappers.push(w);
      return w.get(".vc-search-bar__panel-status").text();
    };
    expect(status("en", 1)).toBe("1 result · applied instantly");
    expect(status("en", 2)).toBe("2 results · applied instantly");
    expect(status("de", 1)).toBe("1 Ergebnis · sofort angewendet");
    expect(status("de", 2)).toBe("2 Ergebnisse · sofort angewendet");
    expect(status("en")).toBe("Applied instantly");
  });

  it("Clear filters is disabled with nothing set and clears all otherwise", async () => {
    expect(clearBtn(mountPanel()).attributes()).toHaveProperty("disabled");
    const w = mountPanel({ state: { search: "", values: { urgent: true } } });
    expect(clearBtn(w).attributes()).not.toHaveProperty("disabled");
    await clearBtn(w).trigger("click");
    expect(w.emitted("clear-all")).toHaveLength(1);
  });

  it("passes the field's counts to its editor", async () => {
    const w = mountPanel({ counts: { status: { paid: 3, new: 0 } } });
    const counts = () => w.findAll(".vc-search-bar__acc .vc-search-bar-editor__count").map((c) => c.text());
    expect(counts()).toEqual(["3", "0"]);
    await w.setProps({ counts: { status: { paid: 5, new: 1 } } });
    expect(counts()).toEqual(["5", "1"]);
  });

  it("a toggle row shows its count when given", () => {
    const w = mountPanel({ counts: { urgent: { true: 7 } } });
    expect(w.get(".vc-search-bar__toggle-count").text()).toBe("7");
  });

  it("the unsaved row shows only while the filters differ from the view", async () => {
    const { views, state, setValues } = makeViews();
    const w = mountPanel({ views, state: state.value });
    expect(w.find(".vc-search-bar__unsaved").exists()).toBe(false);
    setValues({ urgent: true });
    await w.setProps({ state: state.value });
    expect(w.get(".vc-search-bar__unsaved").text()).toContain(`${K}UNSAVED`);
  });

  it("after a revert from the unsaved row focus moves to the close button", async () => {
    const { views, state, setValues } = makeViews();
    setValues({ urgent: true });
    const w = mountPanel({ views, state: state.value });
    const revert = w.get<HTMLButtonElement>(".vc-search-bar__unsaved-revert");
    revert.element.focus();
    await revert.trigger("click");
    await nextTick();
    expect(w.find(".vc-search-bar__unsaved").exists()).toBe(false);
    expect(document.activeElement).toBe(w.get(".vc-search-bar__panel-close").element);
  });

  it("after Clear filters focus moves to the close button", async () => {
    const w = mountPanel({ state: { search: "", values: { urgent: true } } });
    (clearBtn(w).element as HTMLButtonElement).focus();
    await clearBtn(w).trigger("click");
    await w.setProps({ state: { search: "", values: {} } });
    await nextTick();
    expect(document.activeElement).toBe(w.get(".vc-search-bar__panel-close").element);
  });

  describe("touch (phone sheet)", () => {
    const H = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PHONE.";
    const chips = (w: VueWrapper) => w.findAll(".vc-search-bar__view-chip");

    it("a header with Clear, the title with the count and Done; no desktop header or footer", async () => {
      const w = mountPanel({ state: { search: "", values: { urgent: true } }, touch: true });
      expect(w.find(".vc-search-bar__panel-head").exists()).toBe(false);
      expect(w.find(".vc-search-bar__panel-foot").exists()).toBe(false);
      expect(w.get(".vc-search-bar__sheet-title").text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.FILTERS 1");
      expect(w.get(".vc-search-bar__sheet-count").text()).toBe("1");
      expect(w.get(".vc-search-bar__sheet-clear").text()).toBe(`${H}CLEAR`);
      await w.get(".vc-search-bar__sheet-clear").trigger("click");
      expect(w.emitted("clear-all")).toHaveLength(1);
      await w.get(".vc-search-bar__sheet-done").trigger("click");
      expect(w.emitted("close")).toHaveLength(1);
      expect(accLabels(w)).toEqual(["Status", "Created", "Total"]);
    });

    it("Clear is disabled and the count hidden without filters", () => {
      const w = mountPanel({ touch: true });
      expect(w.get(".vc-search-bar__sheet-clear").attributes()).toHaveProperty("disabled");
      expect(w.find(".vc-search-bar__sheet-count").exists()).toBe(false);
    });

    it("the views as chips; the current one is pressed and marked when modified", async () => {
      const { views, state, setValues } = makeViews();
      const w = mountPanel({ views, state: state.value, touch: true });
      expect(chips(w).map((c) => c.text())).toEqual(["All", "Paid"]);
      expect(chips(w)[0].attributes("aria-pressed")).toBe("true");
      expect(chips(w)[1].attributes("aria-pressed")).toBe("false");
      setValues({ urgent: true });
      await w.setProps({ state: state.value });
      expect(chips(w)[0].text()).toBe("All*");
      expect(w.get(".vc-search-bar__unsaved--touch").text()).toContain(`${K}UNSAVED`);
    });

    it("tapping a chip selects its view", async () => {
      const { views, state } = makeViews();
      const w = mountPanel({ views, state: state.value, touch: true });
      await chips(w)[1].trigger("click");
      expect(views.current.value.id).toBe("paid");
      expect(state.value.values).toEqual({ status: ["paid"] });
    });

    it("the footer button shows the result count and closes", async () => {
      const show = (w: VueWrapper) => w.get(".vc-search-bar__sheet-show");
      const w = mountPanel({ touch: true, resultCount: 12 });
      expect(show(w).text()).toBe(`${H}SHOW:12`);
      await show(w).trigger("click");
      expect(w.emitted("close")).toHaveLength(1);
      await w.setProps({ resultCount: 0 });
      expect(show(w).text()).toBe(`${H}NO_MATCH`);
      await w.setProps({ resultCount: undefined });
      expect(show(w).text()).toBe(`${H}SHOW_ANY`);
    });

    it("after Clear focus moves to Done", async () => {
      const w = mountPanel({ state: { search: "", values: { urgent: true } }, touch: true });
      const clear = w.get<HTMLButtonElement>(".vc-search-bar__sheet-clear");
      clear.element.focus();
      await clear.trigger("click");
      await w.setProps({ state: { search: "", values: {} } });
      await nextTick();
      expect(document.activeElement).toBe(w.get(".vc-search-bar__sheet-done").element);
    });
  });
});

describe("FieldAccordion", () => {
  it("opens the given field; without one nothing is open", () => {
    const list = fields.filter((f) => f.kind !== "toggle");
    const none = mount(FieldAccordion, { props: { fields: list, state: { search: "", values: {} } }, global });
    expect(none.findAll(".vc-search-bar__acc-body")).toHaveLength(0);
    const w = mount(FieldAccordion, {
      props: { fields: list, state: { search: "", values: {} }, initiallyOpen: "total" },
      global,
    });
    expect(expanded(w)).toEqual(["Total"]);
  });

  it("keeps one field open: opening B closes A, clicking B again closes it", async () => {
    const list = fields.filter((f) => f.kind !== "toggle");
    const w = mount(FieldAccordion, {
      props: { fields: list, state: { search: "", values: {} }, initiallyOpen: list[0].id },
      global,
    });
    const toggles = w.findAll(".vc-search-bar__acc-toggle");
    expect(expanded(w)).toEqual([list[0].label]);
    await toggles[1].trigger("click");
    expect(expanded(w)).toEqual([list[1].label]);
    expect(toggles[0].attributes("aria-expanded")).toBe("false");
    await toggles[1].trigger("click");
    expect(expanded(w)).toEqual([]);
    expect(w.findAll(".vc-search-bar__acc-body")).toHaveLength(0);
  });

  it("an editor that empties its field emits clear-field", async () => {
    const list = fields.filter((f) => f.id === "status");
    const w = mount(FieldAccordion, {
      props: { fields: list, state: { search: "", values: { status: ["paid"] } }, initiallyOpen: "status" },
      global,
    });
    await w.get("input[type='checkbox']").setValue(false);
    expect(w.emitted("clear-field")).toEqual([["status"]]);
    expect(w.emitted("set")).toBeUndefined();
  });
});
