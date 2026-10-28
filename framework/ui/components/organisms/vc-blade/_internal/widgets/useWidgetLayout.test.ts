import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import type { IWidget } from "@core/services/widget-service";
import { computeWidgetLayout, useWidgetLayout, widgetLayoutStorageKey, WIDGET_STRIP_MAX } from "./useWidgetLayout";

const ids = (s: string) => s.split("");
const mk = (s: string) => ids(s).map((id) => ({ id }) as unknown as IWidget);
const KEY = widgetLayoutStorageKey("Order");

describe("computeWidgetLayout", () => {
  it("default is registration order, first 5 in strip", () => {
    expect(computeWidgetLayout(ids("abcdefg"), null)).toEqual({ strip: ids("abcde"), overflow: ids("fg") });
  });

  it("honours saved order", () => {
    const saved = { strip: ["c", "a"], overflow: ["b"] };
    expect(computeWidgetLayout(ids("abc"), saved)).toEqual({ strip: ["c", "a"], overflow: ["b"] });
  });

  it("promotes saved overflow only into slots of non-rendered saved strip ids", () => {
    const saved = { strip: ids("abc"), overflow: ids("de") };
    expect(computeWidgetLayout(ids("acde"), saved)).toEqual({ strip: ids("acd"), overflow: ["e"] });
    expect(computeWidgetLayout(ids("abcde"), saved)).toEqual({ strip: ids("abc"), overflow: ids("de") });
  });

  it("never-saved ids still fill free room after promotion", () => {
    const saved = { strip: ids("ab"), overflow: ["c"] };
    expect(computeWidgetLayout(ids("abcxy"), saved)).toEqual({ strip: ids("abxy"), overflow: ["c"] });
  });

  it("unknown goes to strip end if room, else overflow end", () => {
    const saved = { strip: ids("abcde"), overflow: ["f"] };
    expect(computeWidgetLayout(ids("abcdefg"), saved)).toEqual({ strip: ids("abcde"), overflow: ["f", "g"] });
    expect(computeWidgetLayout(ids("abcdg"), { strip: ids("abc"), overflow: [] })).toEqual({
      strip: ids("abcdg"),
      overflow: [],
    });
  });

  it("caps a saved strip longer than max", () => {
    expect(computeWidgetLayout(ids("abcd"), { strip: ids("abcd"), overflow: [] }, 3)).toEqual({
      strip: ids("abc"),
      overflow: ["d"],
    });
  });
});

describe("useWidgetLayout", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  const setup = (name: string, widgets: any) => {
    const scope = effectScope();
    const api = scope.run(() => useWidgetLayout(name, widgets))!;
    return { api, scope };
  };
  const stripIds = (api: ReturnType<typeof useWidgetLayout>) => api.strip.value.map((w) => w.id);

  it("restores slot when hidden widget becomes visible; storage untouched", () => {
    localStorage.setItem(KEY, JSON.stringify({ strip: ids("abcde"), overflow: ["f"] }));
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const widgets = ref(mk("abdef"));
    const { api } = setup("Order", widgets);
    expect(stripIds(api)).toEqual(ids("abdef"));
    widgets.value = mk("abcdef");
    expect(stripIds(api)).toEqual(ids("abcde"));
    expect(api.overflow.value.map((w) => w.id)).toEqual(["f"]);
    expect(setItem).not.toHaveBeenCalled();
  });

  it("falls back on invalid storage", () => {
    for (const raw of ["{bad", '{"strip":"x"}']) {
      localStorage.setItem(KEY, raw);
      const { api } = setup("Order", mk("abcdefg"));
      expect(stripIds(api)).toEqual(ids("abcde"));
    }
  });

  it("survives throwing storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    const { api } = setup("Order", mk("abcdefg"));
    expect(stripIds(api)).toEqual(ids("abcde"));
    api.startEdit();
    api.moveToOverflow("a");
    expect(() => api.commit()).not.toThrow();
  });

  it("commit keeps non-rendered saved ids", async () => {
    localStorage.setItem(KEY, JSON.stringify({ strip: ["a", "x"], overflow: ["y"] }));
    const { api } = setup("Order", mk("abc"));
    api.startEdit();
    api.moveToStrip("c");
    api.commit();
    await nextTick();
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ strip: ["a", "b", "c", "x"], overflow: ["y"] });
    expect(api.editing.value).toBe(false);
  });

  it("nothing is written until commit", async () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { api } = setup("Order", mk("abcdefg"));
    api.startEdit();
    api.moveToStrip("f", 0);
    api.moveToOverflow("a");
    api.moveToStrip("f");
    api.reorder("strip", 0, 1);
    await nextTick();
    expect(setItem).not.toHaveBeenCalled();
  });

  it("edits draft: move, insert at index, reorder", () => {
    const { api } = setup("Order", mk("abcdefg"));
    api.startEdit();
    api.moveToOverflow("b", 0);
    expect(api.draft.value).toEqual({ strip: ids("acde"), overflow: ids("bfg") });
    api.moveToStrip("g", 1);
    expect(api.draft.value.strip).toEqual(ids("agcde"));
    api.reorder("strip", 0, 4);
    expect(api.draft.value.strip).toEqual(ids("gcdea"));
    expect(stripIds(api)).toEqual(ids("gcdea"));
  });

  it("moveToStrip is a no-op when full; canAddToStrip false at 5", () => {
    const { api } = setup("Order", mk("abcdefg"));
    api.startEdit();
    expect(api.draft.value.strip).toHaveLength(WIDGET_STRIP_MAX);
    expect(api.canAddToStrip.value).toBe(false);
    api.moveToStrip("f");
    expect(api.draft.value.strip).toEqual(ids("abcde"));
    expect(api.draft.value.overflow).toEqual(ids("fg"));
    api.moveToOverflow("e");
    expect(api.canAddToStrip.value).toBe(true);
  });

  it("reset removes key and returns to default", async () => {
    localStorage.setItem(KEY, JSON.stringify({ strip: ["c"], overflow: ids("abdefg") }));
    const { api } = setup("Order", mk("abcdefg"));
    expect(stripIds(api)[0]).toBe("c");
    api.startEdit();
    api.reset();
    await nextTick();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(stripIds(api)).toEqual(ids("abcde"));
    expect(api.editing.value).toBe(false);
  });

  it("two instances share layout", async () => {
    const a = setup("Order", mk("abcdefg"));
    const b = setup("Order", mk("abcdefg"));
    a.api.startEdit();
    a.api.moveToOverflow("a");
    a.api.commit();
    await nextTick();
    expect(stripIds(b.api)).toEqual(ids("bcde"));
  });

  it("a widget removed from the strip stays in overflow after commit (4 widgets)", async () => {
    const { api } = setup("Order", mk("abcd"));
    expect(stripIds(api)).toEqual(ids("abcd"));
    api.startEdit();
    api.moveToOverflow("b");
    api.commit();
    await nextTick();
    expect(stripIds(api)).toEqual(ids("acd"));
    expect(api.overflow.value.map((w) => w.id)).toEqual(["b"]);
    const again = setup("Order", mk("abcd"));
    expect(stripIds(again.api)).toEqual(ids("acd"));
  });
});
