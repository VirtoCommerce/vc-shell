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
export const stubs = { VcInput: InputStub, VcIcon: true, VcCheckbox: true, VcDatePicker: true };
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
export const LIST_ITEM = ".vc-search-bar__menu-item";
export const listItems = () => [...document.body.querySelectorAll<HTMLElement>(LIST_ITEM)];
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
  return async (width: number) => {
    await nextTick();
    for (const o of observers)
      if (o.el?.isConnected) o.cb([{ contentRect: { width } } as ResizeObserverEntry], o as unknown as ResizeObserver);
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
