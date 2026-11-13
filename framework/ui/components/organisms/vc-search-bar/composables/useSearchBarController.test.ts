import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import VcSearchBar from "../VcSearchBar.vue";
import type { SearchBarChange } from "../types";
import { fakeQueryState, fields, global, lastChange } from "../bar.test-helpers";
import {
  createSearchBarController,
  SearchBarControllerScope,
  type SearchBarController,
} from "./useSearchBarController";

/** Each props object mounts one bar inside the same scope */
function mountInScope(
  props: Record<string, unknown> | Record<string, unknown>[],
  provide: Record<symbol, unknown> = {},
) {
  const controller = createSearchBarController();
  const bars = Array.isArray(props) ? props : [props];
  const Host = defineComponent({
    setup: () => () =>
      h(SearchBarControllerScope, { controller }, () => bars.map((p) => h(VcSearchBar, { fields, ...p }))),
  });
  const w = mount(Host, { global: { ...global, provide }, attachTo: document.body });
  return { w, controller, bar: () => w.findComponent(VcSearchBar) };
}

describe("search bar controller", () => {
  let unmount: (() => void) | undefined;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    unmount?.();
    unmount = undefined;
    vi.useRealTimers();
    localStorage.clear();
  });

  it("is empty and its actions do nothing without a bar", () => {
    const c = createSearchBarController();
    expect(c.mode.value).toBe("wide");
    expect(c.filterCount.value).toBe(0);
    expect(c.search.value).toBe("");
    expect(c.filtered.value).toBe(false);
    expect(c.appliedFields.value).toEqual([]);
    expect(() => {
      c.clearAll();
      c.clearFilters();
      c.removeFilter("status");
    }).not.toThrow();
  });

  it("reports the applied fields with their chip text", () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1;status:a" } });
    const { w, controller } = mountInScope({ storageKey: "orders", search: "acme" }, url.provide);
    unmount = () => w.unmount();
    expect(controller.filterCount.value).toBe(2);
    expect(controller.search.value).toBe("acme");
    expect(controller.filtered.value).toBe(true);
    expect(controller.appliedFields.value).toEqual([
      { id: "status", label: "Status", text: "Status: A" },
      { id: "overdue", label: "Overdue", text: "Overdue" },
    ]);
  });

  it("a value for a field the bar does not have is not counted", () => {
    const { w, controller } = mountInScope({ modelValue: { search: "", values: { status: ["a"], gone: true } } });
    unmount = () => w.unmount();
    expect(controller.filterCount.value).toBe(1);
    expect(controller.appliedFields.value.map((f) => f.id)).toEqual(["status"]);
  });

  it("drives the bar: removeFilter, clearFilters, clearAll in one change", async () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1;status:a" } });
    const { w, controller, bar } = mountInScope({ storageKey: "orders", search: "acme" }, url.provide);
    unmount = () => w.unmount();
    const changes = () => (bar().emitted("change") ?? []) as SearchBarChange[][];

    controller.removeFilter("overdue");
    expect(lastChange(bar())).toMatchObject({ search: "acme", filters: { status: ["a"] } });
    await nextTick();
    expect(controller.filterCount.value).toBe(1);

    controller.clearFilters();
    expect(lastChange(bar())).toMatchObject({ search: "acme", filters: {} });

    const before = changes().length;
    controller.clearAll();
    expect(changes()).toHaveLength(before + 1);
    expect(lastChange(bar())).toMatchObject({ search: "", filters: {} });
    await nextTick();
    expect(controller.filtered.value).toBe(false);
  });

  it("a second bar in the scope is not connected while the first one is", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { w, controller } = mountInScope([
      { modelValue: { search: "", values: { status: ["a"] } } },
      { modelValue: { search: "other", values: { overdue: true, store: "x" } } },
    ]);
    unmount = () => w.unmount();
    expect(controller.appliedFields.value.map((f) => f.id)).toEqual(["status"]);
    expect(controller.search.value).toBe("");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("already connected");
    // the second bar's actions do not reach the controller either
    await w.findAllComponents(VcSearchBar)[1].get(".vc-search-bar__filters-x").trigger("click");
    expect(controller.filterCount.value).toBe(1);
    warn.mockRestore();
  });

  it("a bar without a controller works as before", async () => {
    const url = fakeQueryState({ orders: { filters: "overdue:1" } });
    const w = mount(VcSearchBar, {
      props: { fields, storageKey: "orders" },
      global: { ...global, provide: url.provide },
      attachTo: document.body,
    });
    unmount = () => w.unmount();
    await w.get(".vc-search-bar__filters-x").trigger("click");
    expect(lastChange(w)).toMatchObject({ filters: {} });
  });

  it("disconnects when the bar unmounts", () => {
    const { w, controller } = mountInScope({ modelValue: { search: "x", values: { status: ["a"] } } });
    expect(controller.filtered.value).toBe(true);
    w.unmount();
    expect((controller as SearchBarController).filterCount.value).toBe(0);
    expect(controller.search.value).toBe("");
  });
});
