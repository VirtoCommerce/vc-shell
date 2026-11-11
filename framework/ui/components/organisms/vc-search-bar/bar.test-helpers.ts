import { vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import {
  TableQueryStateKey,
  type ITableQueryStateService,
  type TableQueryPatch,
} from "@core/blade-navigation/table-query-state";
import VcSearchBar from "./VcSearchBar.vue";
import type { SearchBarChange, SearchBarField } from "./types";

export const InputStub = defineComponent({
  name: "VcInput",
  props: { modelValue: { type: String, default: undefined } },
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
export const SwitchStub = defineComponent({
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
export const stubs = {
  VcInput: InputStub,
  VcIcon: true,
  VcCheckbox: true,
  VcDatePicker: true,
  VcSwitch: SwitchStub,
};
export const global = {
  stubs,
  mocks: { $t: (k: string, p?: Record<string, string>) => (p ? `${k}:${Object.values(p).join(",")}` : k) },
};

export const fields: SearchBarField[] = [
  { id: "status", label: "Status", filter: { options: [{ value: "a", label: "A" }], multiple: true } },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "store", label: "Store", filter: true },
];

export const SEARCH = ".vc-search-bar__search-input";
export const CHIP = ".vc-search-bar__row .vc-search-bar__chip";
export const panel = () => document.body.querySelector<HTMLElement>(".vc-search-bar__panel");
/** Field labels of every accordion on the page (the panel's or the "+N" popover's) */
export const accLabels = () =>
  [...document.body.querySelectorAll<HTMLElement>(".vc-search-bar__acc-label")].map((l) => l.textContent?.trim());
/** Opens a field's editor in an accordion by its label */
export const expandField = async (label: string) => {
  [...document.body.querySelectorAll<HTMLElement>(".vc-search-bar__acc-toggle")]
    .find((b) => b.textContent?.includes(label))!
    .click();
  await nextTick();
};
export const editor = () => document.body.querySelector(".vc-search-bar__editor");

/** ResizeObserver stand-in: `resize(w)` reports a new width of the bar and its row */
export function fakeResizeObserver() {
  const observers: { cb: ResizeObserverCallback; el?: Element }[] = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      el?: Element;
      constructor(public cb: ResizeObserverCallback) {
        observers.push(this);
      }
      observe(el: Element) {
        this.el = el;
      }
      disconnect() {}
    },
  );
  /** `content` defaults to `width`: the bar's padding is left out unless given */
  return async (width: number, content = width) => {
    await nextTick();
    const entry = { contentRect: { width: content }, borderBoxSize: [{ inlineSize: width }] };
    for (const o of observers)
      if (o.el?.isConnected) o.cb([entry as unknown as ResizeObserverEntry], o as unknown as ResizeObserver);
    // the chip overflow measures after the next render
    await nextTick();
    await nextTick();
    await nextTick();
  };
}

/** Chips are 150px wide and the Filters button 80px */
export function fakeWidths() {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const width = this.classList.contains("vc-search-bar__chip")
      ? 150
      : this.classList.contains("vc-search-bar__filters-btn")
        ? 80
        : 0;
    return { width } as DOMRect;
  });
}

export const mountBar = (props: Record<string, unknown> = {}, provide: Record<symbol, unknown> = {}) =>
  mount(VcSearchBar, { props: { fields, ...props }, global: { ...global, provide }, attachTo: document.body });

/** In-memory stand-in for the blade's URL query service */
export function fakeQueryState(initial: Record<string, TableQueryPatch> = {}) {
  const store: Record<string, TableQueryPatch> = { ...initial };
  const service: ITableQueryStateService = {
    read: (key = "") => ({ ...(store[key] ?? {}) }),
    write: (key = "", patch) => {
      store[key] = { ...(store[key] ?? {}), ...patch };
    },
  };
  return { store, provide: { [TableQueryStateKey as symbol]: service } };
}

export const lastChange = (w: ReturnType<typeof mountBar>) => (w.emitted("change") as SearchBarChange[][]).at(-1)![0];
