import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref, type EffectScope } from "vue";
import type { ITableQueryStateService, TableQueryPatch } from "@core/blade-navigation/table-query-state";
import type { SearchBarField, SearchBarState, SearchBarView } from "../types";
import { normalizeFields } from "../lib/fields";
import { SYSTEM_VIEW_ID } from "../lib/views";
import { createLocalViewStore } from "../lib/storage";
import { useViews } from "./useViews";

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
] as SearchBarField[]);

const MODULE: SearchBarView[] = [
  { id: "paid", name: "Paid", values: { status: ["paid"] } },
  { id: "urgent", name: "Urgent", values: { urgent: true }, default: true },
];

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

const scopes: EffectScope[] = [];
beforeEach(() => localStorage.clear());
afterEach(() => scopes.splice(0).forEach((s) => s.stop()));

function setup(
  o: {
    moduleViews?: SearchBarView[] | (() => SearchBarView[]);
    state?: SearchBarState;
    queryState?: ITableQueryStateService;
    storageKey?: string;
  } = {},
) {
  const state = ref<SearchBarState>(o.state ?? { search: "", values: {} });
  const apply = vi.fn((s: SearchBarState) => {
    state.value = { search: state.value.search, values: { ...s.values } };
  });
  const scope = effectScope();
  scopes.push(scope);
  const api = scope.run(() =>
    useViews({
      storageKey: () => ("storageKey" in o ? o.storageKey : "orders"),
      moduleViews:
        typeof o.moduleViews === "function" ? o.moduleViews : () => (o.moduleViews as SearchBarView[]) ?? MODULE,
      fields: () => fields,
      state,
      apply,
      queryState: o.queryState,
      t: (k) => (k === "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.VIEWS.ALL" ? "All" : k),
    }),
  )!;
  return { api, state, apply };
}

describe("useViews", () => {
  it("system view is first and has no values", () => {
    const { api } = setup({ moduleViews: [MODULE[0]] });
    createLocalViewStore("orders").save({ id: "u", name: "Mine", values: { urgent: true }, scope: "user" });
    const { api: withUser } = setup({ moduleViews: [MODULE[0]] });
    expect(api.all.value[0]).toMatchObject({ id: SYSTEM_VIEW_ID, name: "All", values: {}, scope: "system" });
    expect(withUser.all.value.map((v) => [v.id, v.scope])).toEqual([
      [SYSTEM_VIEW_ID, "system"],
      ["paid", "module"],
      ["u", "user"],
    ]);
  });

  it("opens on the module default view when the URL has nothing", () => {
    const { service } = fakeQueryState();
    const { api, state, apply } = setup({ queryState: service });
    expect(api.current.value.id).toBe("urgent");
    expect(apply).toHaveBeenCalledTimes(1);
    expect(state.value.values).toEqual({ urgent: true });
    expect(api.modified.value).toBe(false);
  });

  it("URL filters win over the default view and the URL view id names the current view", () => {
    const filtersOnly = fakeQueryState({ orders: { filters: "status:new" } });
    const a = setup({ queryState: filtersOnly.service, state: { search: "", values: { status: ["new"] } } });
    expect(a.apply).not.toHaveBeenCalled();
    // no view named: the system view, modified
    expect(a.api.current.value.id).toBe("all");
    expect(a.api.modified.value).toBe(true);

    const named = fakeQueryState({ orders: { filters: "status:paid", view: "paid" } });
    const b = setup({ queryState: named.service, state: { search: "", values: { status: ["paid"] } } });
    expect(b.apply).not.toHaveBeenCalled();
    expect(b.api.current.value.id).toBe("paid");
    expect(b.api.modified.value).toBe(false);
  });

  it("initial values win over the default view: no apply, system view, modified", () => {
    const { service } = fakeQueryState();
    const { api, state, apply } = setup({ queryState: service, state: { search: "", values: { status: ["new"] } } });
    expect(apply).not.toHaveBeenCalled();
    expect(state.value.values).toEqual({ status: ["new"] });
    expect(api.current.value.id).toBe("all");
    expect(api.modified.value).toBe(true);
  });

  it("an empty initial state with an empty URL still opens on the default view", () => {
    const { service } = fakeQueryState();
    const { api, apply } = setup({ queryState: service, state: { search: "q", values: { status: [] } } });
    expect(apply).toHaveBeenCalledTimes(1);
    expect(api.current.value.id).toBe("urgent");
  });

  it("unknown URL view id: system view, URL filters kept, no throw", () => {
    const { service } = fakeQueryState({ orders: { filters: "status:new", view: "gone" } });
    const { api, state, apply } = setup({ queryState: service, state: { search: "", values: { status: ["new"] } } });
    expect(api.current.value.id).toBe(SYSTEM_VIEW_ID);
    expect(apply).not.toHaveBeenCalled();
    expect(state.value.values).toEqual({ status: ["new"] });
    expect(api.modified.value).toBe(true);
    expect(service.write).not.toHaveBeenCalledWith("orders", { view: undefined });
  });

  it("saveAs creates a user view that becomes current and is persisted", () => {
    const { api, state } = setup();
    state.value = { search: "q", values: { status: ["new"] } };
    api.saveAs("New ones");
    expect(api.current.value).toMatchObject({ name: "New ones", scope: "user", values: { status: ["new"] } });
    expect(api.modified.value).toBe(false);
    expect(api.all.value.at(-1)!.id).toBe(api.current.value.id);
    const stored = createLocalViewStore("orders").list();
    expect(stored).toEqual([expect.objectContaining({ id: api.current.value.id, name: "New ones", scope: "user" })]);
    expect(stored[0]).not.toHaveProperty("search");
  });

  it("saveChanges updates a user view, stores an override for a module view, and is a no-op for the system view", () => {
    const { api, state } = setup();
    api.saveAs("Mine");
    const id = api.current.value.id;
    state.value = { search: "", values: { urgent: true, status: ["paid"] } };
    api.saveChanges();
    expect(api.current.value.values).toEqual({ urgent: true, status: ["paid"] });
    expect(api.modified.value).toBe(false);

    api.select("paid");
    state.value = { search: "", values: { status: ["paid", "new"] } };
    api.saveChanges();
    expect(api.current.value).toMatchObject({ id: "paid", scope: "module", name: "Paid" });
    expect(api.modified.value).toBe(false);
    const stored = createLocalViewStore("orders").list();
    expect(stored.find((v) => v.id === id)!.values).toEqual({ urgent: true, status: ["paid"] });
    expect(stored.find((v) => v.id === "paid")).toMatchObject({ scope: "module", values: { status: ["paid", "new"] } });
    // the override is merged over the module view on the next load
    const reloaded = setup();
    expect(reloaded.api.all.value.find((v) => v.id === "paid")!.values).toEqual({ status: ["paid", "new"] });
    expect(reloaded.api.all.value.filter((v) => v.id === "paid")).toHaveLength(1);

    api.select(SYSTEM_VIEW_ID);
    state.value = { search: "", values: { urgent: true } };
    api.saveChanges();
    expect(api.current.value.values).toEqual({});
    expect(createLocalViewStore("orders").list()).toHaveLength(2);
  });

  it("revert restores the current view's values and keeps the search", () => {
    const { api, state, apply } = setup();
    api.select("paid");
    state.value = { search: "words", values: { urgent: true } };
    expect(api.modified.value).toBe(true);
    apply.mockClear();
    api.revert();
    expect(apply).toHaveBeenCalledWith({ search: "words", values: { status: ["paid"] } });
    expect(state.value).toEqual({ search: "words", values: { status: ["paid"] } });
    expect(api.modified.value).toBe(false);
  });

  it("rename and remove work for user views only; removing the current selects system", () => {
    const { api, state } = setup();
    api.saveAs("Mine");
    const id = api.current.value.id;
    api.rename(id, "Renamed");
    api.rename("paid", "Nope");
    api.rename(SYSTEM_VIEW_ID, "Nope");
    expect(api.current.value.name).toBe("Renamed");
    expect(api.all.value.find((v) => v.id === "paid")!.name).toBe("Paid");
    expect(api.all.value[0].name).toBe("All");
    expect(createLocalViewStore("orders").list()[0].name).toBe("Renamed");

    api.remove("paid");
    api.remove(SYSTEM_VIEW_ID);
    expect(api.all.value.map((v) => v.id)).toEqual([SYSTEM_VIEW_ID, "paid", "urgent", id]);

    api.remove(id);
    expect(api.all.value.map((v) => v.id)).toEqual([SYSTEM_VIEW_ID, "paid", "urgent"]);
    expect(api.current.value.id).toBe(SYSTEM_VIEW_ID);
    expect(state.value.values).toEqual({});
    expect(createLocalViewStore("orders").list()).toEqual([]);
  });

  it("clearToSystem selects the system view and empties the values", () => {
    const { api, state } = setup();
    state.value = { search: "q", values: { urgent: true, status: ["new"] } };
    api.clearToSystem();
    expect(api.current.value.id).toBe(SYSTEM_VIEW_ID);
    expect(state.value).toEqual({ search: "q", values: {} });
  });

  it("writes the current view id to the query state", async () => {
    const { service, store } = fakeQueryState();
    const { api } = setup({ queryState: service });
    await nextTick();
    expect(store.orders.view).toBe("urgent");
    api.select("paid");
    await nextTick();
    expect(store.orders.view).toBe("paid");
    api.clearToSystem();
    await nextTick();
    // with a default view a missing key would reopen it, so the system view is named
    expect(store.orders.view).toBe(SYSTEM_VIEW_ID);
    const writes = service.write.mock.calls.length;
    api.clearToSystem();
    await nextTick();
    expect(service.write.mock.calls.length).toBe(writes);
  });

  it("without a default view the system view clears the URL key", async () => {
    const { service, store } = fakeQueryState();
    const { api } = setup({ queryState: service, moduleViews: [MODULE[0]] });
    await nextTick();
    expect(service.write).not.toHaveBeenCalled();
    api.select("paid");
    await nextTick();
    expect(store.orders.view).toBe("paid");
    api.clearToSystem();
    await nextTick();
    expect(store.orders).toHaveProperty("view", undefined);
  });

  it("keeps the system view across a reload when a default view exists", async () => {
    const { service } = fakeQueryState();
    const first = setup({ queryState: service });
    first.api.clearToSystem();
    await nextTick();
    const reloaded = setup({ queryState: service });
    expect(reloaded.api.current.value.id).toBe(SYSTEM_VIEW_ID);
    expect(reloaded.apply).not.toHaveBeenCalled();
  });

  it("keeps the system view with URL filters across a reload when a default view exists", async () => {
    const { service, store } = fakeQueryState();
    const first = setup({ queryState: service });
    first.api.clearToSystem();
    await nextTick();
    store.orders.filters = "status:new";
    const reloaded = setup({ queryState: service, state: { search: "", values: { status: ["new"] } } });
    expect(reloaded.api.current.value.id).toBe(SYSTEM_VIEW_ID);
    expect(reloaded.apply).not.toHaveBeenCalled();
    expect(reloaded.api.modified.value).toBe(true);
  });

  it("a URL view id registered after setup becomes current and stays in the URL", async () => {
    const { service, store } = fakeQueryState({ orders: { filters: "status:new", view: "x" } });
    const views = ref<SearchBarView[]>([MODULE[0]]);
    const { api, apply } = setup({
      queryState: service,
      moduleViews: () => views.value,
      state: { search: "", values: { status: ["new"] } },
    });
    await nextTick();
    expect(api.current.value.id).toBe(SYSTEM_VIEW_ID);
    expect(api.modified.value).toBe(true);
    expect(store.orders.view).toBe("x");
    expect(service.write).not.toHaveBeenCalled();
    views.value = [MODULE[0], { id: "x", name: "X", values: { status: ["new"] } }];
    await nextTick();
    expect(api.current.value.id).toBe("x");
    expect(api.modified.value).toBe(false);
    expect(store.orders.view).toBe("x");
    expect(service.write).not.toHaveBeenCalled();
    expect(apply).not.toHaveBeenCalled();
  });

  it("works without a storage key: views live in memory and nothing is written", () => {
    const { service } = fakeQueryState();
    const { api } = setup({ storageKey: undefined, queryState: service });
    api.saveAs("Mine");
    expect(api.current.value.name).toBe("Mine");
    expect(service.read).not.toHaveBeenCalled();
    expect(service.write).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });
});
