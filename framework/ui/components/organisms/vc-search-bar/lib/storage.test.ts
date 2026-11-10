import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalPresetStore, mergeModulePresets, type StoredPreset } from "./storage";

const K = "t1";
const RAW = "VC_SEARCHBAR_T1";
const user = (id: string): StoredPreset => ({
  id,
  name: id,
  values: { a: ["x"] },
  scope: "user",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("preset store", () => {
  it("round trips presets and replaces by id", async () => {
    const s = createLocalPresetStore(K);
    await s.save(user("p1"));
    await s.save(user("p2"));
    await s.save({ ...user("p1"), name: "renamed" });
    const list = await s.list();
    expect(list.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(list[0].name).toBe("renamed");
    await s.remove("p1");
    expect((await s.list()).map((p) => p.id)).toEqual(["p2"]);
  });

  it("stores relative dates as RelativeDate", async () => {
    const s = createLocalPresetStore(K);
    await s.save({ ...user("p"), values: { d: { relative: "7d" } } });
    expect((await s.list())[0].values.d).toEqual({ relative: "7d" });
  });

  it("keeps only presets: an applied state left by an older version is dropped on the next save", async () => {
    localStorage.setItem(RAW, JSON.stringify({ v: 1, presets: [], applied: { search: "q", values: {} } }));
    await createLocalPresetStore(K).save(user("p1"));
    expect(JSON.parse(localStorage.getItem(RAW)!)).toEqual({ v: 1, presets: [expect.objectContaining({ id: "p1" })] });
  });

  it("ignores unknown version and malformed JSON", async () => {
    localStorage.setItem(RAW, JSON.stringify({ v: 99, presets: [user("p")], applied: { search: "x", values: {} } }));
    expect(await createLocalPresetStore(K).list()).toEqual([]);
    localStorage.setItem(RAW, "{nope");
    expect(await createLocalPresetStore(K).list()).toEqual([]);
  });

  it("filters malformed stored presets", async () => {
    localStorage.setItem(RAW, JSON.stringify({ v: 1, presets: [null, {}, { id: 1 }, user("ok")] }));
    const s = createLocalPresetStore(K);
    expect((await s.list()).map((p) => p.id)).toEqual(["ok"]);
    await expect(s.save(user("p2"))).resolves.toBeUndefined();
    expect(mergeModulePresets([], await s.list())).toHaveLength(2);
  });

  it("stamps updatedAt on save", async () => {
    const s = createLocalPresetStore(K);
    const { updatedAt: _u, ...noStamp } = user("p");
    await s.save(noStamp);
    expect(Number.isNaN(Date.parse((await s.list())[0].updatedAt))).toBe(false);
  });

  it("keeps presets in memory when storage fails", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("quota");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const s = createLocalPresetStore(K);
    await s.save(user("p"));
    expect((await s.list()).map((p) => p.id)).toEqual(["p"]);
    await s.remove("p");
    expect(await s.list()).toEqual([]);
  });

  it("does not throw when storage fails", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("quota");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const s = createLocalPresetStore(K);
    expect(await s.list()).toEqual([]);
    await expect(s.save(user("p"))).resolves.toBeUndefined();
    await expect(s.remove("p")).resolves.toBeUndefined();
  });
});

describe("mergeModulePresets", () => {
  const m = (id: string, version = 1) => ({ id, name: `${id}-v${version}`, values: {}, version });
  const stored = (id: string, extra: Partial<StoredPreset> = {}): StoredPreset => ({
    ...m(id),
    scope: "module",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...extra,
  });

  it("adds a new module preset with scope module", () => {
    const r = mergeModulePresets([m("a")], []);
    expect(r).toHaveLength(1);
    expect(r[0]).toMatchObject({ id: "a", scope: "module" });
    expect(Number.isNaN(Date.parse(r[0].updatedAt))).toBe(false);
  });

  it("replaces a non-edited stored preset, keeping hidden and pinned", () => {
    const r = mergeModulePresets([m("a", 2)], [stored("a", { hidden: true, pinned: true })]);
    expect(r[0]).toMatchObject({ name: "a-v2", version: 2, hidden: true, pinned: true, scope: "module" });
  });

  it("keeps updatedAt for an unchanged module preset", () => {
    const r = mergeModulePresets([m("a")], [stored("a")]);
    expect(r[0].updatedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("keeps an edited preset and remembers baseVersion", () => {
    const r = mergeModulePresets([m("a", 3)], [stored("a", { edited: true, name: "mine" })]);
    expect(r[0]).toMatchObject({ name: "mine", edited: true, baseVersion: 3 });
  });

  it("drops module presets removed from code, keeps user presets in order after module ones", () => {
    const r = mergeModulePresets([m("b"), m("a")], [user("u2"), stored("gone"), stored("a"), user("u1")]);
    expect(r.map((p) => p.id)).toEqual(["b", "a", "u2", "u1"]);
  });
});
