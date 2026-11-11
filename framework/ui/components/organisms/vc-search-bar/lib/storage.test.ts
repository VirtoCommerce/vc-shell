import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLocalViewStore, type StoredView } from "./storage";

const K = "t1";
const VIEWS_RAW = "VC_SEARCHBAR_T1";

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("view store", () => {
  const view = (id: string, extra: Partial<StoredView> = {}): StoredView => ({
    id,
    name: id,
    values: { a: ["x"] },
    scope: "user",
    ...extra,
  });

  it("round trips views as a v2 entry and replaces by id", () => {
    const s = createLocalViewStore(K);
    s.save(view("u1"));
    s.save(view("m1", { scope: "module" }));
    s.save(view("u1", { name: "renamed" }));
    expect(s.list().map((v) => [v.id, v.name])).toEqual([
      ["u1", "renamed"],
      ["m1", "m1"],
    ]);
    expect(JSON.parse(localStorage.getItem(VIEWS_RAW)!)).toMatchObject({ v: 2, views: [{ id: "u1" }, { id: "m1" }] });
    s.remove("u1");
    expect(
      createLocalViewStore(K)
        .list()
        .map((v) => v.id),
    ).toEqual(["m1"]);
  });

  it("ignores v1 preset data, malformed JSON and malformed views", () => {
    localStorage.setItem(VIEWS_RAW, JSON.stringify({ v: 1, presets: [view("p")] }));
    expect(createLocalViewStore(K).list()).toEqual([]);
    localStorage.setItem(VIEWS_RAW, "{nope");
    expect(createLocalViewStore(K).list()).toEqual([]);
    localStorage.setItem(
      VIEWS_RAW,
      JSON.stringify({ v: 2, views: [null, {}, { id: 1 }, view("ok"), view("s", { scope: "system" as never })] }),
    );
    expect(
      createLocalViewStore(K)
        .list()
        .map((v) => v.id),
    ).toEqual(["ok"]);
  });

  it("keeps views in memory when storage fails", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("quota");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const s = createLocalViewStore(K);
    s.save(view("v"));
    expect(s.list().map((v) => v.id)).toEqual(["v"]);
    s.remove("v");
    expect(s.list()).toEqual([]);
  });
});
