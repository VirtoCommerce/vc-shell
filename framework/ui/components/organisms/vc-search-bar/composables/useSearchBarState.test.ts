import { describe, it, expect, afterEach, vi } from "vitest";
import { effectScope, ref, unref, type EffectScope, type Ref } from "vue";
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
    fields?: SearchBarField[] | Ref<SearchBarField[]>;
    target?: string;
    storageKey?: string;
    model?: SearchBarState;
    queryState?: ITableQueryStateService;
  } = {},
) {
  const model = ref<SearchBarState | undefined>(o.model);
  const changes: SearchBarChange[] = [];
  const searches: string[] = [];
  const scope = effectScope();
  scopes.push(scope);
  const api = scope.run(() =>
    useSearchBarState({
      fields: () => unref(o.fields) ?? [text("name")],
      target: () => o.target,
      storageKey: () => o.storageKey,
      queryState: o.queryState,
      model,
      debounce: () => 300,
      onSearch: (v) => searches.push(v),
      onChange: (c) => changes.push(c),
    }),
  )!;
  return { api, model, changes, searches };
}

describe("useSearchBarState", () => {
  describe("filters in the URL", () => {
    it("model values win over the URL and do not emit at init", () => {
      const { service } = fakeQueryState({ k: { filters: "name:url" } });
      const model = { search: "m", values: { name: "model" } };
      const { api, changes } = setup({ storageKey: "k", queryState: service, model });
      expect(api.state.value).toEqual(model);
      expect(changes).toEqual([]);
    });

    it("a model with only a search keeps it and starts from the URL's values", () => {
      const { service } = fakeQueryState({ k: { filters: "name:url" } });
      const { api, model, changes } = setup({
        storageKey: "k",
        queryState: service,
        model: { search: "m", values: {} },
      });
      expect(api.state.value).toEqual({ search: "m", values: { name: "url" } });
      expect(model.value).toEqual({ search: "m", values: { name: "url" } });
      expect(changes).toHaveLength(1);
    });

    it("restores the filters from the URL when the model is undefined and emits once", () => {
      const { service } = fakeQueryState({ k: { filters: "name:a;gone:x" } });
      const { api, model, changes } = setup({ storageKey: "k", queryState: service });
      expect(service.read).toHaveBeenCalledWith("k");
      expect(api.state.value).toEqual({ search: "", values: { name: "a" } });
      expect(model.value).toEqual({ search: "", values: { name: "a" } });
      expect(changes).toHaveLength(1);
      expect(changes[0].filters).toEqual({ name: "a" });
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
      vi.useFakeTimers();
      api.input("hi");
      vi.runAllTimers();
      vi.useRealTimers();
      expect(model.value).toEqual({ search: "hi", values: { name: "bob" } });
      expect(changes.at(-1)).toMatchObject({ search: "hi", filters: { name: "bob" } });
      // the search words alone do not change the filters value, so nothing new is written
      expect(service.write).toHaveBeenCalledTimes(1);
      api.applyValues({});
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

    it("keeps URL filters of fields that arrive later and applies them with one change", () => {
      const { service } = fakeQueryState({ k: { filters: "name:a;late:x" } });
      const fields = ref<SearchBarField[]>([text("name")]);
      const { api, changes } = setup({ fields, storageKey: "k", queryState: service });
      expect(api.state.value.values).toEqual({ name: "a" });
      expect(changes).toHaveLength(1);
      fields.value = [text("name"), text("late")];
      expect(api.state.value.values).toEqual({ name: "a", late: "x" });
      expect(changes).toHaveLength(2);
      expect(changes[1].filters).toEqual({ name: "a", late: "x" });
    });

    it("async fields: the URL stays as is until they arrive, then their filters apply", () => {
      const { service, store } = fakeQueryState({ k: { filters: "late:x" } });
      const fields = ref<SearchBarField[]>([]);
      const { api, changes } = setup({ fields, storageKey: "k", queryState: service });
      expect(changes).toEqual([]);
      expect(service.write).not.toHaveBeenCalled();
      fields.value = [text("late")];
      expect(api.state.value.values).toEqual({ late: "x" });
      expect(changes).toHaveLength(1);
      expect(changes[0].filters).toEqual({ late: "x" });
      expect(store.k.filters).toBe("late:x");
    });

    it("a change made before the fields arrive keeps their URL part", () => {
      const { service } = fakeQueryState({ k: { filters: "late:x" } });
      const fields = ref<SearchBarField[]>([text("name")]);
      const { api } = setup({ fields, storageKey: "k", queryState: service });
      api.setValue("name", "b");
      expect(service.write).toHaveBeenLastCalledWith("k", { filters: "name:b;late:x" });
      fields.value = [text("name"), text("late")];
      expect(api.state.value.values).toEqual({ name: "b", late: "x" });
    });

    it("an external registration that arrives later applies its URL filters", () => {
      const { service } = fakeQueryState({ k: { filters: "x:1" } });
      const { api, changes } = setup({ target: "orders", storageKey: "k", queryState: service });
      expect(changes).toEqual([]);
      registerExternalSearchFilters({ id: "ext", targetBlades: ["orders"], fields: [text("x")] });
      expect(api.state.value.values).toEqual({ x: "1" });
      expect(changes).toHaveLength(1);
    });

    it("a field that goes away leaves the filter but keeps its value in the URL; it returns with one change", () => {
      const { service, store } = fakeQueryState();
      const fields = ref<SearchBarField[]>([text("name"), text("late")]);
      const { api, changes } = setup({ fields, storageKey: "k", queryState: service });
      api.setValue("name", "a");
      api.setValue("late", "x;y");
      expect(store.k.filters).toBe("name:a;late:x\\;y");
      const before = changes.length;

      fields.value = [text("name")];
      expect(api.state.value.values).toEqual({ name: "a" });
      expect(changes).toHaveLength(before + 1);
      expect(changes.at(-1)!.filters).toEqual({ name: "a" });
      expect(store.k.filters).toBe("name:a;late:x\\;y");

      fields.value = [text("name"), text("late")];
      expect(api.state.value.values).toEqual({ name: "a", late: "x;y" });
      expect(changes).toHaveLength(before + 2);
      expect(changes.at(-1)!.filters).toEqual({ name: "a", late: "x;y" });
      expect(store.k.filters).toBe("name:a;late:x\\;y");
    });

    it("replacing the values drops URL filters still waiting for their fields", () => {
      const { service, store } = fakeQueryState({ k: { filters: "name:a;late:x" } });
      const fields = ref<SearchBarField[]>([text("name")]);
      const { api } = setup({ fields, storageKey: "k", queryState: service });
      api.applyValues({});
      expect(store.k.filters).toBe("");
      fields.value = [text("name"), text("late")];
      expect(api.state.value.values).toEqual({});
    });

    it("a host write that replaces the values drops URL filters still waiting for their fields", () => {
      const { service, store } = fakeQueryState({ k: { filters: "name:a;late:x" } });
      const fields = ref<SearchBarField[]>([text("name")]);
      const { api, model } = setup({ fields, storageKey: "k", queryState: service });
      model.value = { search: "", values: {} };
      expect(store.k.filters).toBe("");
      fields.value = [text("name"), text("late")];
      expect(api.state.value.values).toEqual({});
    });

    it("a host write of the search only keeps URL filters still waiting for their fields", () => {
      const { service, store } = fakeQueryState({ k: { filters: "name:a;late:x" } });
      const fields = ref<SearchBarField[]>([text("name")]);
      const { api, model } = setup({ fields, storageKey: "k", queryState: service });
      model.value = { search: "abc", values: { name: "a" } };
      expect(store.k.filters).toBe("name:a;late:x");
      fields.value = [text("name"), text("late")];
      expect(api.state.value.values).toEqual({ name: "a", late: "x" });
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
      api.setValue("name", "x");
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

  it("applyValues replaces the values and keeps the search", () => {
    const { api } = setup({ fields: [text("a"), text("b")], model: { search: "s", values: { a: "1" } } });
    api.applyValues({ b: "1" });
    expect(api.state.value).toEqual({ search: "s", values: { b: "1" } });
  });

  describe("search pause", () => {
    afterEach(() => vi.useRealTimers());

    it("the state takes the typed text after the pause, then search fires", () => {
      vi.useFakeTimers();
      const { api, changes, searches } = setup();
      api.input("a");
      api.input("ab");
      expect(api.searchText.value).toBe("ab");
      expect(changes).toEqual([]);
      vi.advanceTimersByTime(300);
      expect(api.state.value.search).toBe("ab");
      expect(changes).toHaveLength(1);
      expect(searches).toEqual(["ab"]);
    });

    it("a filter commit within the pause carries the typed text, searched first and once", () => {
      vi.useFakeTimers();
      const { api, changes, searches } = setup();
      api.input("ab");
      api.setValue("name", "x");
      expect(searches).toEqual(["ab"]);
      expect(changes).toHaveLength(1);
      expect(changes[0]).toMatchObject({ search: "ab", filters: { name: "x" } });
      vi.advanceTimersByTime(1000);
      expect(searches).toEqual(["ab"]);
      expect(changes).toHaveLength(1);
    });

    it("a host write ends the pause: its search replaces the typed text, nothing is emitted", () => {
      vi.useFakeTimers();
      const { api, model, changes, searches } = setup({ model: { search: "", values: {} } });
      api.input("ab");
      model.value = { search: "", values: {} };
      expect(api.searchText.value).toBe("");
      vi.advanceTimersByTime(1000);
      expect(api.state.value.search).toBe("");
      expect(changes).toEqual([]);
      expect(searches).toEqual([]);
    });

    it("a change of the bar's own within the pause (a field that goes away) keeps the pause", () => {
      vi.useFakeTimers();
      const fields = ref<SearchBarField[]>([text("name"), text("late")]);
      const { api, model, searches } = setup({ fields, model: { search: "", values: { late: "x" } } });
      api.input("ab");
      fields.value = [text("name")];
      expect(model.value).toEqual({ search: "", values: {} });
      expect(api.searchText.value).toBe("ab");
      vi.advanceTimersByTime(300);
      expect(searches).toEqual(["ab"]);
      expect(api.state.value.search).toBe("ab");
    });
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
