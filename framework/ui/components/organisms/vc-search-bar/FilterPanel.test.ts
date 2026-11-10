import { describe, it, expect, vi, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import FilterPanel from "./components/FilterPanel.vue";
import { normalizeFields } from "./lib/fields";
import type { SearchBarField, SearchBarState } from "./types";

vi.mock("@framework/core/composables/useResponsive", () => ({
  useResponsive: () => ({ isMobile: ref(false), isDesktop: ref(true) }),
}));

// Real popover teleports and positions; the panel itself is what is under test
const Passthrough = defineComponent({
  props: ["show", "anchorRef", "title", "closeOnClickOutside", "width", "maxWidth", "maxHeight"],
  emits: ["update:show"],
  setup:
    (_p, { slots }) =>
    () =>
      h("div", { class: "vc-popover" }, slots.default?.()),
});
const SelectMenuStub = defineComponent({
  setup: () => () => h("div", { class: "vc-select__dropdown" }, [h("span", { class: "in-menu" }, "x")]),
});

const InputStub = defineComponent({
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
const SelectStub = defineComponent({
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup: () => () => h("div", { class: "select-stub" }),
});

const global = {
  stubs: { VcPopover: Passthrough, VcIcon: true, VcInput: InputStub, VcDatePicker: true, VcSelect: SelectStub },
  mocks: { $t: (k: string, p?: Record<string, string>) => (p ? `${k}:${Object.values(p).join(",")}` : k) },
};

const raw: SearchBarField[] = [
  { id: "status", label: "Status", filter: { options: [{ value: "a", label: "A" }], multiple: true } },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "store", label: "Store", filter: true },
];
const fields = normalizeFields(raw);

const mountPanel = (state: SearchBarState, props: Record<string, unknown> = {}) =>
  mount(FilterPanel, {
    props: { fields, state, builder: true, advanced: false, ...props },
    global,
    attachTo: document.body,
  });

const outside = async (target: Element) => {
  target.dispatchEvent(new Event("pointerdown", { bubbles: true }));
  target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r));
};

const addItems = () => [...document.body.querySelectorAll(".vc-search-bar__add-item")] as HTMLElement[];
const addMenu = () => addItems()[0]?.closest<HTMLElement>("[role=menu]") ?? null;
const addMenuOpen = () => addItems().length > 0;
const pick = async (i: number) => {
  addItems()[i].click();
  await new Promise((r) => setTimeout(r));
};

describe("FilterPanel", () => {
  let w: ReturnType<typeof mountPanel> | undefined;
  afterEach(() => {
    w?.unmount();
    w = undefined;
  });

  it("starts with rows for the fields that have a value, with Where / and", () => {
    w = mountPanel({ search: "", values: { status: ["a"], store: "x" } });
    const rows = w.findAll(".vc-search-bar__crow");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("BUILDER.WHERE");
    expect(rows[1].text()).toContain("BUILDER.AND");
  });

  it("shows the empty state when nothing is set", () => {
    w = mountPanel({ search: "", values: {} });
    expect(w.find(".vc-search-bar__hint").text()).toContain("BUILDER.EMPTY");
  });

  it("Add condition lists only unused fields and a chosen one becomes a row", async () => {
    w = mountPanel({ search: "", values: { status: ["a"] } });
    await w.find(".vc-search-bar__add").trigger("click");
    expect(addItems().map((i) => i.textContent)).toEqual(["Created", "Overdue", "Store"]);
    await pick(2);
    expect(w.findAll(".vc-search-bar__crow")).toHaveLength(2);
    expect(addMenuOpen()).toBe(false);
    await w.find(".vc-search-bar__add").trigger("click");
    expect(addItems().map((i) => i.textContent)).toEqual(["Created", "Overdue"]);
  });

  it("Add condition opens a floating list outside the panel flow, anchored to the button", async () => {
    w = mountPanel({ search: "", values: {} });
    const btn = w.find(".vc-search-bar__add");
    await btn.trigger("click");
    expect(btn.attributes("aria-expanded")).toBe("true");
    const list = addMenu() as HTMLElement;
    expect(list).not.toBeNull();
    expect(w.find(".vc-search-bar__panel").element.contains(list)).toBe(false);
    expect(list.getAttribute("aria-label")).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.ADD");
    expect(btn.attributes("aria-controls")).toBe(list.id);
    // Teleported after the popover's anchors, so it must outrank the panel explicitly
    expect(list.style.zIndex).toBe("9400");
  });

  it("Apply emits the draft without empty rows and keeps search; the input state is untouched", async () => {
    const state: SearchBarState = { search: "abc", values: { status: ["a"] } };
    w = mountPanel(state);
    await w.find(".vc-search-bar__add").trigger("click");
    await pick(1); // Overdue toggle, set true
    await w.find(".vc-search-bar__add").trigger("click");
    await pick(1); // Store, left empty
    await w.findAll(".vc-search-bar__crow-x")[0].trigger("click"); // remove Status
    const buttons = w.findAll(".vc-search-bar__panel-foot button");
    await buttons[2].trigger("click");
    expect(w.emitted("apply")).toEqual([[{ search: "abc", values: { overdue: true } }]]);
    expect(state.values).toEqual({ status: ["a"] });
  });

  it("Cancel emits close and no apply", async () => {
    w = mountPanel({ search: "", values: { status: ["a"] } });
    await w.findAll(".vc-search-bar__crow-x")[0].trigger("click");
    await w.findAll(".vc-search-bar__panel-foot button")[1].trigger("click");
    expect(w.emitted("close")).toHaveLength(1);
    expect(w.emitted("apply")).toBeUndefined();
  });

  it("Clear all empties the draft but applies nothing until Apply", async () => {
    w = mountPanel({ search: "", values: { status: ["a"] } });
    await w.findAll(".vc-search-bar__panel-foot button")[0].trigger("click");
    expect(w.findAll(".vc-search-bar__crow")).toHaveLength(0);
    expect(w.emitted("apply")).toBeUndefined();
    await w.findAll(".vc-search-bar__panel-foot button")[2].trigger("click");
    expect(w.emitted("apply")).toEqual([[{ search: "", values: {} }]]);
  });

  it("a click in the floating add list counts as inside the panel; a click elsewhere closes the list", async () => {
    w = mountPanel({ search: "", values: {} });
    await w.find(".vc-search-bar__add").trigger("click");
    await outside(addMenu() as HTMLElement);
    expect(w.emitted("close")).toBeUndefined();
    expect(addMenuOpen()).toBe(true);
    await outside(w.find(".vc-search-bar__panel-foot").element);
    await w.vm.$nextTick();
    expect(addMenuOpen()).toBe(false);
    expect(w.emitted("close")).toBeUndefined();
  });

  it("an outside click on the page closes the panel; a click in a select menu does not", async () => {
    const menu = mount(SelectMenuStub, { attachTo: document.body });
    w = mountPanel({ search: "", values: {} });
    await outside(menu.find(".in-menu").element);
    expect(w.emitted("close")).toBeUndefined();
    await outside(document.body);
    expect(w.emitted("close")).toHaveLength(1);
    menu.unmount();
  });

  it("shows tabs only when both builder and advanced are on", () => {
    w = mountPanel({ search: "", values: {} }, { advanced: true });
    expect(w.findAll(".vc-search-bar__tab")).toHaveLength(2);
    w.unmount();
    w = mountPanel({ search: "", values: {} });
    expect(w.find(".vc-search-bar__tab").exists()).toBe(false);
  });

  it("advanced only renders the Advanced text, no rows", () => {
    w = mount(FilterPanel, {
      props: { fields, state: { search: "", values: {} }, builder: false, advanced: true },
      global,
      attachTo: document.body,
    });
    expect(w.find("textarea").exists()).toBe(true);
    expect(w.find(".vc-search-bar__add").exists()).toBe(false);
  });

  it("operator text per kind and a select where there is a choice", () => {
    const f = normalizeFields([
      { id: "pri", label: "Priority", filter: { options: [{ value: "a", label: "A" }] } },
      { id: "created", label: "Created", filter: { range: ["from", "to"] } },
      { id: "overdue", label: "Overdue", filter: { toggle: true } },
      { id: "cust", label: "Customer", filter: true },
      { id: "total", label: "Total", filter: { number: true } },
      {
        id: "st",
        label: "St",
        operators: ["any", "not"],
        filter: { options: [{ value: "a", label: "A" }], multiple: true },
      },
    ]);
    w = mountPanel(
      {
        search: "",
        values: {
          pri: "a",
          created: { relative: "today" },
          overdue: true,
          cust: "x",
          total: { op: "gte", min: 1 },
          st: ["a"],
        },
      },
      { fields: f },
    );
    const rows = w.findAll(".vc-search-bar__crow");
    const op = (i: number) => rows[i].find(".vc-search-bar__op-text");
    expect(op(0).text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.IS");
    expect(op(1).text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.IS");
    expect(op(2).text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.IS_ON");
    expect(op(3).text()).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.BUILDER.CONTAINS");
    expect(op(4).exists()).toBe(false);
    expect(rows[4].find(".vc-search-bar__crow-op .select-stub").exists()).toBe(true);
    expect(op(5).exists()).toBe(false);
    expect(rows[5].find(".vc-search-bar__crow-op .select-stub").exists()).toBe(true);
  });

  it("a toggle row still has all five cells, the remove button last", () => {
    w = mountPanel({ search: "", values: { overdue: true } });
    const row = w.find(".vc-search-bar__crow");
    expect([...row.element.children].map((c) => c.className)).toEqual([
      "vc-search-bar__crow-conj",
      "vc-search-bar__crow-field",
      "vc-search-bar__crow-op",
      "vc-search-bar__crow-val",
      "vc-search-bar__crow-x",
    ]);
    expect(row.find(".vc-search-bar__crow-val").element.children).toHaveLength(0);
  });

  it("Esc (the host dismissing) discards the draft; Esc in the add list closes only the list", async () => {
    w = mountPanel({ search: "", values: { status: ["a"] } });
    await w.find(".vc-search-bar__add").trigger("click");
    const reachedDocument = vi.fn();
    document.addEventListener("keydown", reachedDocument);
    const list = addMenu() as HTMLElement;
    list.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    document.removeEventListener("keydown", reachedDocument);
    await w.vm.$nextTick();
    expect(reachedDocument).not.toHaveBeenCalled();
    expect(addMenuOpen()).toBe(false);
    expect(w.emitted("close")).toBeUndefined();
    expect(document.activeElement).toBe(w.find(".vc-search-bar__add").element);
    await w.findAll(".vc-search-bar__crow-x")[0].trigger("click");
    w.findComponent(Passthrough).vm.$emit("update:show", false);
    expect(w.emitted("close")).toEqual([["dismiss"]]);
    expect(w.emitted("apply")).toBeUndefined();
  });

  it("the desktop panel has a fixed width that its content cannot change", () => {
    w = mountPanel({ search: "", values: {} });
    const host = w.findComponent(Passthrough);
    expect(host.props("width")).toBe("min(640px, calc(100vw - 32px))");
    expect(host.props("maxWidth")).toBe(host.props("width"));
  });

  it("number between without a second bound writes nothing", async () => {
    w = mountPanel(
      { search: "", values: { total: { op: "gte", min: 5 } } },
      {
        fields: normalizeFields([{ id: "total", label: "Total", filter: { number: true } }]),
      },
    );
    w.findComponent(SelectStub).vm.$emit("update:modelValue", "between");
    await w.vm.$nextTick();
    // first bound is kept, second is empty
    await w.find(".input-stub").trigger("blur");
    await w.findAll(".vc-search-bar__panel-foot button")[2].trigger("click");
    expect(w.emitted("apply")).toEqual([[{ search: "", values: { total: { op: "gte", min: 5 } } }]]);
  });

  it("an outside click closes with the outside reason", async () => {
    w = mountPanel({ search: "", values: {} });
    await outside(document.body);
    expect(w.emitted("close")).toEqual([["outside"]]);
  });
  describe("Advanced", () => {
    const apply = (wr: ReturnType<typeof mountPanel>) =>
      wr.findAll(".vc-search-bar__panel-foot button")[2].trigger("click");
    const type = async (wr: ReturnType<typeof mountPanel>, v: string) => {
      const ta = wr.find("textarea");
      (ta.element as HTMLTextAreaElement).value = v;
      await ta.trigger("input");
    };
    const options = () => [...document.body.querySelectorAll("[role=option]")] as HTMLElement[];
    const tabBtn = (wr: ReturnType<typeof mountPanel>, i: number) => wr.findAll(".vc-search-bar__tab")[i];

    it("opens on the text of the applied query", () => {
      w = mountPanel({ search: "", values: {}, query: "status:a OR store:x" }, { advanced: true });
      expect((w.find("textarea").element as HTMLTextAreaElement).value).toBe("status:a OR store:x");
      expect(w.find(".vc-search-bar__add").exists()).toBe(false);
    });

    it("writes the draft as text when switching Conditions -> Advanced", async () => {
      w = mountPanel({ search: "shoes", values: { status: ["a"] } }, { advanced: true });
      await tabBtn(w, 1).trigger("click");
      expect((w.find("textarea").element as HTMLTextAreaElement).value).toBe("shoes status:a");
    });

    it("reads the text back into rows when switching Advanced -> Conditions", async () => {
      w = mountPanel({ search: "", values: {} }, { advanced: true });
      await tabBtn(w, 1).trigger("click");
      await type(w, "boots store:x");
      await tabBtn(w, 0).trigger("click");
      expect(w.findAll(".vc-search-bar__crow")).toHaveLength(1);
      await apply(w);
      expect(w.emitted("apply")).toEqual([[{ search: "boots", values: { store: "x" } }]]);
    });

    it("applies readable text as state with the search words", async () => {
      w = mountPanel({ search: "", values: {} }, { builder: false, advanced: true });
      await type(w, "boots status:a");
      expect(w.text()).toContain("ADVANCED.WILL_APPLY");
      await apply(w);
      expect(w.emitted("apply")).toEqual([[{ search: "boots", values: { status: ["a"] } }]]);
    });

    it("unreadable text disables Conditions, explains why and applies as a query", async () => {
      w = mountPanel({ search: "", values: {} }, { advanced: true });
      await tabBtn(w, 1).trigger("click");
      await type(w, "status:a OR store:x");
      expect(tabBtn(w, 0).attributes("disabled")).toBeDefined();
      expect(w.find(".vc-search-bar__note").text()).toContain("ADVANCED.REASON_OR_BETWEEN_FIELDS");
      await apply(w);
      expect(w.emitted("apply")).toEqual([[{ search: "", values: {}, query: "status:a OR store:x" }]]);
    });

    it("empty text applies as no filters", async () => {
      w = mountPanel({ search: "x", values: {}, query: "a OR b" }, { builder: false, advanced: true });
      await type(w, "  ");
      await apply(w);
      expect(w.emitted("apply")).toEqual([[{ search: "", values: {} }]]);
    });

    it("suggests values as soon as ':' is typed by hand, and wires the combobox attributes", async () => {
      w = mountPanel({ search: "", values: {} }, { builder: false, advanced: true });
      await type(w, "sta");
      expect(options().map((o) => o.textContent)).toEqual(["status:Status"]);
      await type(w, "status:");
      await w.vm.$nextTick();
      expect(options().map((o) => o.textContent)).toEqual(["a"]);
      const ta = w.find("textarea");
      expect(ta.attributes("aria-autocomplete")).toBe("list");
      const list = document.body.querySelector("[role=listbox]") as HTMLElement;
      expect(ta.attributes("aria-controls")).toBe(list.id);
      expect(ta.attributes("aria-activedescendant")).toBe(options()[0].id);
    });

    it("closes the suggestions when focus leaves the text", async () => {
      w = mountPanel({ search: "", values: {} }, { builder: false, advanced: true });
      await type(w, "sta");
      expect(document.body.querySelector("[role=listbox]")).not.toBeNull();
      await w.find(".vc-search-bar__qwrap").trigger("focusout", { relatedTarget: document.body });
      expect(document.body.querySelector("[role=listbox]")).toBeNull();
    });

    it("the suggestion list floats outside the panel with a fixed width, long items truncate with a title", async () => {
      const long = "a".repeat(80);
      const f = normalizeFields([
        { id: "status", label: "Status", filter: { options: [{ value: long, label: long }], multiple: true } },
      ]);
      w = mountPanel({ search: "", values: {} }, { builder: false, advanced: true, fields: f });
      await type(w, "status:");
      await w.vm.$nextTick();
      const list = document.body.querySelector("[role=listbox]") as HTMLElement;
      expect(w.find(".vc-search-bar__panel").element.contains(list)).toBe(false);
      expect(list.style.position).toBe("fixed");
      expect(list.style.width).toBe("260px");
      expect(options()[0].getAttribute("title")).toBe(long);
    });

    it("an outside click handler treats a click in the suggestion list as inside the panel", async () => {
      w = mountPanel({ search: "", values: {} }, { builder: false, advanced: true });
      await type(w, "sta");
      await outside(document.body.querySelector("[role=listbox]") as HTMLElement);
      expect(w.emitted("close")).toBeUndefined();
    });

    it("Conditions is not disabled by the text while the Conditions tab is shown", async () => {
      w = mountPanel({ search: "", values: {} }, { advanced: true });
      expect(tabBtn(w, 0).attributes("disabled")).toBeUndefined();
    });

    it("syntax examples use the current fields and skip kinds that do not exist", async () => {
      w = mountPanel(
        { search: "", values: {} },
        { builder: false, advanced: true, fields: normalizeFields([{ id: "store", label: "Store", filter: true }]) },
      );
      await w.find(".vc-search-bar__syntax").trigger("click");
      expect(w.findAll(".vc-search-bar__token").map((t) => t.text())).toEqual(['"Acme Corp"']);
    });

    it("chips write the negation in lowercase", async () => {
      const f = normalizeFields([
        { id: "status", label: "Status", operators: ["any", "not"], filter: { options: [{ value: "a", label: "A" }] } },
      ]);
      w = mountPanel({ search: "", values: {} }, { builder: false, advanced: true, fields: f });
      await type(w, "!status:a");
      expect(w.find(".vc-search-bar__chip").text()).toContain("ADVANCED.CHIP_NOT A");
    });

    it("Syntax toggles the card with the docs link", async () => {
      w = mountPanel({ search: "", values: {} }, { builder: false, advanced: true });
      expect(w.find(".vc-search-bar__doclink").exists()).toBe(false);
      await w.find(".vc-search-bar__syntax").trigger("click");
      const link = w.find(".vc-search-bar__doclink");
      expect(link.attributes("href")).toContain("search-query-syntax-reference");
      expect(link.attributes("rel")).toBe("noopener");
      await w.find(".vc-search-bar__token").trigger("click");
      expect((w.find("textarea").element as HTMLTextAreaElement).value).toBe("status:a");
    });
  });
});
