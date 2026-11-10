import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { effectScope, ref, type EffectScope } from "vue";
import { normalizeFields } from "../lib/fields";
import { usePresets } from "./usePresets";
import type { SearchBarField, SearchBarPreset, SearchBarState } from "../types";

const rawFields: SearchBarField[] = [
  {
    id: "status",
    label: "Status",
    filter: {
      options: ["New", "Paid", "Shipped"].map((v) => ({ value: v, label: v })),
      multiple: true,
    },
  },
  { id: "customer", label: "Customer", filter: true },
];
const fields = normalizeFields(rawFields);

const paid: SearchBarPreset = { id: "paid", name: "Paid", values: { status: ["Paid"] }, version: 1 };

const scopes: EffectScope[] = [];
afterEach(() => scopes.splice(0).forEach((s) => s.stop()));
beforeEach(() => localStorage.clear());

const t = (k: string) => k;

function setup(o: { storageKey?: string; presets?: SearchBarPreset[]; state?: SearchBarState } = {}) {
  const state = ref<SearchBarState>(o.state ?? { search: "", values: {} });
  const applied: SearchBarState[] = [];
  const modulePresets = ref(o.presets ?? [paid]);
  const scope = effectScope();
  scopes.push(scope);
  const api = scope.run(() =>
    usePresets({
      storageKey: () => o.storageKey,
      modulePresets: () => modulePresets.value,
      fields: () => fields,
      state,
      apply: (s) => {
        applied.push(s);
        state.value = s;
      },
      t,
    }),
  )!;
  return { api, state, applied, modulePresets };
}

describe("usePresets", () => {
  it("module presets are pinned by default and unpinned when the module says so", async () => {
    const { api } = setup({ presets: [paid, { id: "b", name: "B", values: { status: ["New"] }, pinned: false }] });
    await api.ready;
    expect(api.all.value.map((p) => p.id)).toEqual(["paid", "b"]);
    expect(api.pinned.value.map((p) => p.id)).toEqual(["paid"]);
  });

  it("clicking applies, clicking a lit chip removes", async () => {
    const { api, state } = setup({ state: { search: "", values: { status: ["New"] } } });
    await api.ready;
    const p = api.all.value[0];
    expect(api.lit(p.id)).toBe(false);
    api.click(p);
    expect(state.value.values.status).toEqual(["New", "Paid"]);
    expect(api.lit(p.id)).toBe(true);
    api.click(p);
    expect(state.value.values.status).toEqual(["New"]);
  });

  describe("a chip contained in another lit chip", () => {
    const paidAcme: SearchBarPreset = {
      id: "paid-acme",
      name: "Paid Acme",
      values: { status: ["Paid"], customer: "Acme" },
    };
    const both = (): SearchBarState => ({ search: "", values: { status: ["Paid"], customer: "Acme" } });

    it("shows unlit, and a click removes its values (presence decides, not the display)", async () => {
      const { api, state } = setup({ presets: [paid, paidAcme], state: both() });
      await api.ready;
      expect(api.lit("paid")).toBe(false);
      expect(api.lit("paid-acme")).toBe(true);
      api.click(api.all.value.find((p) => p.id === "paid")!);
      expect(state.value.values).toEqual({ customer: "Acme" });
    });

    it("a hidden superset does not dim a visible chip", async () => {
      const { api } = setup({ storageKey: "k", presets: [paid, paidAcme], state: both() });
      await api.ready;
      await api.hide("paid-acme");
      expect(api.all.value.map((p) => p.id)).toEqual(["paid"]);
      expect(api.lit("paid")).toBe(true);
    });
  });

  it("a click that changes nothing applies nothing", async () => {
    const empty: SearchBarPreset = { id: "empty", name: "Empty", values: {} };
    const { api, applied } = setup({ presets: [empty], state: { search: "x", values: { customer: "Acme" } } });
    await api.ready;
    api.click(api.all.value[0]);
    expect(applied).toEqual([]);
  });

  it("a no-op click still applies search text typed during the pause", async () => {
    const empty: SearchBarPreset = { id: "empty", name: "Empty", values: {} };
    const state = ref<SearchBarState>({ search: "", values: {} });
    const applied: SearchBarState[] = [];
    const scope = effectScope();
    scopes.push(scope);
    const api = scope.run(() =>
      usePresets({
        storageKey: () => undefined,
        modulePresets: () => [empty],
        fields: () => fields,
        state,
        apply: (s) => {
          applied.push(s);
          state.value = s;
        },
        flushSearch: () => (state.value = { ...state.value, search: "typed" }),
        t,
      }),
    )!;
    await api.ready;
    api.click(api.all.value[0]);
    expect(applied).toEqual([{ search: "typed", values: {} }]);
  });

  it("applies and removes a preset's search text", async () => {
    const withSearch = { id: "s", name: "S", values: {}, search: "abc" };
    const { api, state } = setup({ presets: [withSearch] });
    await api.ready;
    api.click(api.all.value[0]);
    expect(state.value.search).toBe("abc");
    api.click(api.all.value[0]);
    expect(state.value.search).toBe("");
  });

  it("clicking a chip while a query is active drops the query", async () => {
    const { api, state } = setup({ state: { search: "", values: {}, query: "status:New" } });
    await api.ready;
    api.click(api.all.value[0]);
    expect(state.value).toEqual({ search: "", values: { status: ["Paid"] } });
  });

  it("a double commit creates one preset", async () => {
    const { api } = setup({ storageKey: "k", state: { search: "", values: { customer: "Acme" } } });
    await api.ready;
    api.startSave();
    await Promise.all([api.commitSave("A"), api.commitSave("A")]);
    expect(api.all.value.filter((p) => p.scope === "user")).toHaveLength(1);
  });

  it("a write made before the initial read resolves is not overwritten by it", async () => {
    localStorage.clear();
    const { api } = setup({ storageKey: "k" });
    await api.hide("paid");
    await api.ready;
    expect(api.all.value).toEqual([]);
  });

  describe("canSave", () => {
    it("is false without a storageKey", async () => {
      const { api } = setup({ state: { search: "", values: { customer: "x" } } });
      await api.ready;
      expect(api.canSave.value).toBe(false);
    });

    it("is false when nothing is set", async () => {
      const { api } = setup({ storageKey: "k" });
      await api.ready;
      expect(api.canSave.value).toBe(false);
    });

    it("is false when a query is set", async () => {
      const { api } = setup({ storageKey: "k", state: { search: "", values: {}, query: "a:b" } });
      await api.ready;
      expect(api.canSave.value).toBe(false);
    });

    it("is false when a preset has the same values, in any order", async () => {
      const two = { id: "two", name: "Two", values: { status: ["New", "Paid"] } };
      const { api, state } = setup({
        storageKey: "k",
        presets: [two],
        state: { search: "", values: { status: ["Paid", "New"] } },
      });
      await api.ready;
      expect(api.canSave.value).toBe(false);
      state.value = { search: "", values: { status: ["Paid"] } };
      expect(api.canSave.value).toBe(true);
    });
  });

  it("saves a user preset, lights it and reloads it from the same store", async () => {
    const first = setup({ storageKey: "k", state: { search: "", values: { customer: "Acme" } } });
    await first.api.ready;
    expect(first.api.startSave()).toBe("Acme");
    expect(first.api.saving.value).toBe(true);
    await first.api.commitSave("Acme orders");
    expect(first.api.saving.value).toBe(false);
    const saved = first.api.all.value.find((p) => p.name === "Acme orders")!;
    expect(saved.scope).toBe("user");
    expect(first.api.lit(saved.id)).toBe(true);
    expect(first.api.flashId.value).toBe(saved.id);
    expect(first.api.pinned.value.map((p) => p.id)).toContain(saved.id);
    expect(first.api.canSave.value).toBe(false);

    const second = setup({ storageKey: "k" });
    await second.api.ready;
    expect(second.api.all.value.map((p) => p.name)).toEqual(["Paid", "Acme orders"]);
  });

  it("ignores an empty name", async () => {
    const { api } = setup({ storageKey: "k", state: { search: "", values: { customer: "Acme" } } });
    await api.ready;
    api.startSave();
    await api.commitSave("   ");
    expect(api.all.value).toHaveLength(1);
    expect(api.saving.value).toBe(true);
  });

  it("hides a module preset, remembers it, and shows it again", async () => {
    const a = setup({ storageKey: "k" });
    await a.api.ready;
    await a.api.hide("paid");
    expect(a.api.all.value).toEqual([]);
    expect(a.api.hiddenCount.value).toBe(1);

    const b = setup({ storageKey: "k" });
    await b.api.ready;
    expect(b.api.all.value).toEqual([]);
    await b.api.showHidden();
    expect(b.api.all.value.map((p) => p.id)).toEqual(["paid"]);
    const c = setup({ storageKey: "k" });
    await c.api.ready;
    expect(c.api.all.value.map((p) => p.id)).toEqual(["paid"]);
  });

  it("without a storageKey, hide works for the session only", async () => {
    const a = setup();
    await a.api.ready;
    await a.api.hide("paid");
    expect(a.api.all.value).toEqual([]);
    const b = setup();
    await b.api.ready;
    expect(b.api.all.value).toHaveLength(1);
  });

  it("renames and updates a module preset, then restores its default name and values", async () => {
    const { api, state } = setup({ storageKey: "k" });
    await api.ready;
    await api.rename("paid", "Money in");
    state.value = { search: "", values: { status: ["Shipped"] } };
    await api.update("paid");
    let p = api.all.value[0];
    expect(p).toMatchObject({ name: "Money in", values: { status: ["Shipped"] }, edited: true });
    await api.restoreDefault("paid");
    p = api.all.value[0];
    expect(p).toMatchObject({ name: "Paid", values: { status: ["Paid"] } });
    expect(p.edited).toBeFalsy();
  });

  it("toggles pin and deletes a user preset", async () => {
    const { api } = setup({ storageKey: "k", state: { search: "", values: { customer: "x" } } });
    await api.ready;
    api.startSave();
    await api.commitSave("X");
    const id = api.all.value[1].id;
    await api.togglePin(id);
    expect(api.pinned.value.map((p) => p.id)).toEqual(["paid"]);
    await api.togglePin(id);
    expect(api.pinned.value.map((p) => p.id)).toEqual(["paid", id]);
    await api.remove(id);
    expect(api.all.value.map((p) => p.id)).toEqual(["paid"]);
  });

  describe("actionsFor", () => {
    const ids = (a: { id: string }[]) => a.map((x) => x.id);

    it("module preset: rename, update, pin, hide; restore only when edited", async () => {
      const { api } = setup({ storageKey: "k" });
      await api.ready;
      expect(ids(api.actionsFor(api.all.value[0]))).toEqual(["rename", "update", "pin", "remove"]);
      await api.rename("paid", "Other");
      expect(ids(api.actionsFor(api.all.value[0]))).toEqual(["rename", "update", "pin", "restore", "remove"]);
    });

    it("user preset: rename, update, pin, delete", async () => {
      const { api } = setup({ storageKey: "k", state: { search: "", values: { customer: "x" } } });
      await api.ready;
      api.startSave();
      await api.commitSave("X");
      const actions = api.actionsFor(api.all.value[1]);
      expect(ids(actions)).toEqual(["rename", "update", "pin", "remove"]);
      expect(actions.at(-1)?.label).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.PRESETS.DELETE");
    });

    it("update is disabled when nothing is set or the preset already matches", async () => {
      const { api, state } = setup({ storageKey: "k" });
      await api.ready;
      const update = () => api.actionsFor(api.all.value[0]).find((a) => a.id === "update")!;
      expect(update().disabled).toBe(true);
      state.value = { search: "", values: { status: ["Paid"] } };
      expect(update().disabled).toBe(true);
      state.value = { search: "", values: { status: ["New"] } };
      expect(update().disabled).toBe(false);
    });

    it("without a storageKey a module preset can only be hidden", async () => {
      const { api } = setup();
      await api.ready;
      expect(ids(api.actionsFor(api.all.value[0]))).toEqual(["remove"]);
    });
  });
});
