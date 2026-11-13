import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readViews, writeViews, type StoredView } from "./storage";

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

  it("round trips views as a v2 entry", () => {
    writeViews(K, [view("u1"), view("m1", { scope: "module" })]);
    expect(readViews(K).map((v) => [v.id, v.scope])).toEqual([
      ["u1", "user"],
      ["m1", "module"],
    ]);
    expect(JSON.parse(localStorage.getItem(VIEWS_RAW)!)).toMatchObject({ v: 2, views: [{ id: "u1" }, { id: "m1" }] });
  });

  it("ignores v1 preset data, malformed JSON and malformed views", () => {
    localStorage.setItem(VIEWS_RAW, JSON.stringify({ v: 1, presets: [view("p")] }));
    expect(readViews(K)).toEqual([]);
    localStorage.setItem(VIEWS_RAW, "{nope");
    expect(readViews(K)).toEqual([]);
    localStorage.setItem(
      VIEWS_RAW,
      JSON.stringify({ v: 2, views: [null, {}, { id: 1 }, view("ok"), view("s", { scope: "system" as never })] }),
    );
    expect(readViews(K).map((v) => v.id)).toEqual(["ok"]);
  });

  it("reads as empty and writes nothing when storage fails", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("quota");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => writeViews(K, [view("v")])).not.toThrow();
    expect(readViews(K)).toEqual([]);
  });
});

describe("view store values", () => {
  it("drops values holding prototype keys at any depth, keeps the view (field checks run when it is applied)", () => {
    localStorage.setItem(
      VIEWS_RAW,
      JSON.stringify({
        v: 2,
        views: [
          {
            id: "u",
            name: "u",
            scope: "user",
            values: {
              ok: ["a"],
              num: { op: "gte", min: 1 },
              not: { not: [1] },
              deep: { a: { b: { c: 1 } } },
              bad: JSON.parse('{"__proto__":{"x":1}}'),
              ctor: { constructor: 1 },
            },
          },
        ],
      }),
    );
    const [v] = readViews(K);
    expect(Object.keys(v.values)).toEqual(["ok", "num", "not", "deep"]);
  });

  it("drops a __proto__ field id", () => {
    localStorage.setItem(
      VIEWS_RAW,
      `{"v":2,"views":[{"id":"u","name":"u","scope":"user","values":{"__proto__":["a"],"x":["b"]}}]}`,
    );
    const [v] = readViews(K);
    expect(Object.keys(v.values)).toEqual(["x"]);
    expect(Object.getPrototypeOf(v.values)).toBe(Object.prototype);
  });
});
