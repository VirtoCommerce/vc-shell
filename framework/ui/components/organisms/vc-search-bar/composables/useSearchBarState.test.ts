import { describe, it, expect, afterEach, vi } from "vitest";
import { effectScope, ref, type EffectScope } from "vue";
import { registerExternalSearchFilters, unregisterExternalSearchFilters } from "@core/services/search-filters-service";
import type { ITableQueryStateService, TableQueryPatch } from "@core/blade-navigation/table-query-state";
import { useSearchBarState } from "./useSearchBarState";
import type { SearchBarChange, SearchBarField, SearchBarState } from "../types";

const text = (id: string, extra: Partial<SearchBarField> = {}): SearchBarField => ({
  id,
  label: id,
  filter: true,
  ...extra,
});

const scopes: EffectScope[] = [];
afterEach(() => {
  scopes.splice(0).forEach((s) => s.stop());
  unregisterExternalSearchFilters("ext");
  unregisterExternalSearchFilters("ext2");
});

/** In-memory stand-in for the blade's URL query service */
function fakeQueryState(initial: Record<string, TableQueryPatch> = {}) {
  const store: Record<string, TableQueryPatch> = { ...initial };
  const service = {
    read: vi.fn((key?: string) => ({ ...(store[key ?? ""] ?? {}) })),
    write: vi.fn((key: string | undefined, patch: TableQueryPatch) => {
      store[key ?? ""] = { ...(store[key ?? ""] ?? {}), ...patch };
    }),
  } satisfies ITableQueryStateService;
  return { service, store };
}

function setup(
  o: {
    fields?: SearchBarField[];
    target?: string;
    storageKey?: string;
    model?: SearchBarState;
    queryState?: ITableQueryStateService;
  } = {},
) {
  const model = ref<SearchBarState | undefined>(o.model);
  const changes: SearchBarChange[] = [];
  const scope = effectScope();
  scopes.push(scope);
  const api = scope.run(() =>
    useSearchBarState({
      fields: () => o.fields ?? [text("name")],
      target: () => o.target,
      storageKey: () => o.storageKey,
      queryState: o.queryState,
      model,
      onChange: (c) => changes.push(c),
    }),
  )!;
  return { api, model, changes };
}

describe("useSearchBarState", () => {
  describe("filters in the URL", () => {
    it("model wins over the URL and does not emit at init", () => {
      const { service } = fakeQueryState({ k: { filters: "name:url" } });
      const { api, changes } = setup({ storageKey: "k", queryState: service, model: { search: "m", values: {} } });
      expect(api.state.value).toEqual({ search: "m", values: {} });
      expect(changes).toEqual([]);
    });

    it("restores the filters from the URL when the model is undefined and emits once", () => {
      const { service } = fakeQueryState({ k: { filters: "name:a;gone:x" } });
      const { api, changes } = setup({ storageKey: "k", queryState: service });
      expect(service.read).toHaveBeenCalledWith("k");
      expect(api.state.value).toEqual({ search: "", values: { name: "a" } });
      expect(changes).toHaveLength(1);
      expect(changes[0].filters).toEqual({ name: "a" });
    });

    it("restores an advanced query", () => {
      const { service } = fakeQueryState({ k: { filters: "~name:a OR name:b" } });
      const { api, changes } = setup({ storageKey: "k", queryState: service });
      expect(api.state.value).toEqual({ search: "", values: {}, query: "name:a OR name:b" });
      expect(changes).toHaveLength(1);
    });

    it("an empty or unusable URL value emits nothing and writes nothing", () => {
      const { service } = fakeQueryState({ k: { filters: "gone:x" } });
      const { changes } = setup({ storageKey: "k", queryState: service });
      expect(changes).toEqual([]);
      expect(service.write).not.toHaveBeenCalled();
    });

    it("a change writes the filters (not the search words) under the key", () => {
      const { service, store } = fakeQueryState();
      const { api, model, changes } = setup({ storageKey: "k", queryState: service });
      api.setValue("name", "bob");
      expect(service.write).toHaveBeenLastCalledWith("k", { filters: "name:bob" });
      api.setSearch("hi");
      expect(model.value).toEqual({ search: "hi", values: { name: "bob" } });
      expect(changes.at(-1)).toMatchObject({ search: "hi", filters: { name: "bob" }, phrase: "hi name:bob" });
      // the search words alone do not change the filters value, so nothing new is written
      expect(service.write).toHaveBeenCalledTimes(1);
      api.clearAll();
      expect(service.write).toHaveBeenLastCalledWith("k", { filters: "" });
      expect(store.k.filters).toBe("");
    });

    it("an external model change writes the URL without onChange", () => {
      const { service } = fakeQueryState();
      const { api, model, changes } = setup({ storageKey: "k", queryState: service });
      model.value = { search: "ext", values: { name: "a", gone: "x" } };
      expect(api.state.value).toEqual({ search: "ext", values: { name: "a" } });
      expect(changes).toEqual([]);
      expect(service.write).toHaveBeenLastCalledWith("k", { filters: "name:a" });
    });

    it("without a key nothing is read or written", () => {
      const { service } = fakeQueryState({ "": { filters: "name:a" } });
      const { api, changes } = setup({ queryState: service });
      api.setValue("name", "b");
      expect(service.read).not.toHaveBeenCalled();
      expect(service.write).not.toHaveBeenCalled();
      expect(changes).toHaveLength(1);
    });

    it("without a service nothing is remembered and localStorage is not touched", () => {
      const first = setup({ storageKey: "k" });
      first.api.setValue("name", "a");
      expect(setup({ storageKey: "k" }).api.state.value).toEqual({ search: "", values: {} });
      expect(localStorage.length).toBe(0);
    });
  });

  describe("external model changes", () => {
    it("ignores an equal object and undefined", () => {
      const { api, model, changes } = setup({ model: { search: "s", values: {} } });
      const before = api.state.value;
      model.value = { search: "s", values: {} };
      expect(api.state.value).toBe(before);
      model.value = undefined;
      expect(api.state.value).toBe(before);
      expect(changes).toEqual([]);
    });

    it("own commit does not re-trigger the watcher", () => {
      const { api, changes } = setup();
      api.setSearch("x");
      expect(changes).toHaveLength(1);
    });
  });

  it("clearValue removes one value", () => {
    const { api } = setup({ fields: [text("a"), text("b")] });
    api.setValue("a", "1");
    api.setValue("b", "2");
    api.clearValue("a");
    expect(api.state.value.values).toEqual({ b: "2" });
  });

  it("external fields appear after late register and vanish with their values on unregister", () => {
    const { api, changes } = setup({ target: "orders" });
    expect(api.fields.value.map((f) => f.id)).toEqual(["name"]);
    registerExternalSearchFilters({
      id: "ext",
      targetBlades: ["orders"],
      fields: [text("x")],
      views: [{ id: "p", name: "P", values: {} }],
    });
    expect(api.fields.value.map((f) => f.id)).toEqual(["name", "x"]);
    expect(api.externalViews.value.map((p) => p.id)).toEqual(["p"]);
    api.setValue("x", "1");
    const before = changes.length;
    unregisterExternalSearchFilters("ext");
    expect(api.fields.value.map((f) => f.id)).toEqual(["name"]);
    expect(api.state.value.values).toEqual({});
    expect(changes).toHaveLength(before + 1);
    expect(changes.at(-1)!.filters).toEqual({});
  });

  it("own field beats external on id clash; externals ordered by priority", () => {
    registerExternalSearchFilters({
      id: "ext",
      targetBlades: ["orders"],
      priority: 200,
      fields: [text("name", { label: "ext" }), text("z")],
    });
    registerExternalSearchFilters({ id: "ext2", targetBlades: ["orders"], priority: 1, fields: [text("y")] });
    const { api } = setup({ target: "orders" });
    expect(api.fields.value.map((f) => f.id)).toEqual(["name", "y", "z"]);
    expect(api.fields.value[0].label).toBe("name");
  });

  it("query: phrase equals query, values cleared, filters empty; setValue clears query", () => {
    const { api, changes } = setup();
    api.setValue("name", "a");
    api.setQuery("a OR b");
    expect(api.state.value).toEqual({ search: "", values: {}, query: "a OR b" });
    expect(changes.at(-1)).toMatchObject({ phrase: "a OR b", filters: {} });
    api.setValue("name", "c");
    expect(api.state.value.query).toBeUndefined();
    expect(changes.at(-1)!.phrase).toBe("name:c");
  });

  it("clearAll empties search, values and query", () => {
    const { api, model } = setup();
    api.setSearch("s");
    api.setQuery("q");
    api.clearAll();
    expect(api.state.value).toEqual({ search: "", values: {} });
    expect(model.value).toEqual({ search: "", values: {} });
  });

  it("applyState replaces state", () => {
    const { api } = setup({ fields: [text("a"), text("b")] });
    api.applyState({ search: "s", values: { b: "1" } });
    expect(api.state.value).toEqual({ search: "s", values: { b: "1" } });
  });

  it("order lists the set fields in the order they were set", () => {
    const { api } = setup({ fields: [text("a"), text("b"), text("c")], model: { search: "", values: { c: "1" } } });
    expect(api.order.value).toEqual(["c"]);
    api.setValue("a", "1");
    api.setValue("b", "1");
    api.setValue("a", "2");
    expect(api.order.value).toEqual(["c", "a", "b"]);
    api.clearValue("a");
    expect(api.order.value).toEqual(["c", "b"]);
    api.setValue("a", "3");
    expect(api.order.value).toEqual(["c", "b", "a"]);
  });
});
