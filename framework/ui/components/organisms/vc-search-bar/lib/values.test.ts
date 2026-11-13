import { describe, it, expect, vi, afterEach } from "vitest";
import { reactive } from "vue";
import { cloneValue, isEmptyValue, pickerToRange, toFlatFilters, chipLabel } from "./values";
import { normalizeFields } from "./fields";
import type { SearchBarField } from "../types";

const fields: SearchBarField[] = [
  { id: "keyword", label: "Keyword", filter: "keyword" },
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "Paid", label: "Paid" },
        { value: "New", label: "New" },
        { value: "Shipped", label: "Shipped" },
        { value: "Void", label: "Void" },
      ],
      multiple: true,
    },
  },
  { id: "createdDate", label: "Created", filter: { range: ["startDate", "endDate"] } },
  { id: "vip", label: "VIP", filter: { toggle: true } },
  { id: "total", label: "Total", filter: { number: true } },
  { id: "cust", label: "Cust", filter: { component: {} as never, label: (v) => `C:${String(v)}` } },
];
const bar = normalizeFields(fields);
const byId = (id: string) => bar.find((f) => f.id === id)!;
const t = (k: string) => k;

afterEach(() => vi.useRealTimers());

describe("isEmptyValue", () => {
  it.each([null, undefined, "", [], false, {}, { start: undefined, end: "" }, { not: [] }])("%j is empty", (v) => {
    expect(isEmptyValue(v)).toBe(true);
  });
  it.each([
    "a",
    ["a"],
    true,
    0,
    { start: "2026-01-01" },
    { end: "2026-01-02" },
    { not: ["a"] },
    { relative: "7d" },
    { op: "gte", min: 1 },
  ])("%j is not empty", (v) => {
    expect(isEmptyValue(v)).toBe(false);
  });
});

describe("relative dates", () => {
  it("resolve in local calendar days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 7, 23, 30));
    const today = new Date();
    const flat = (relative: string) => toFlatFilters(bar, { createdDate: { relative } }, today);
    expect(flat("today")).toEqual({ startDate: "2026-11-07", endDate: "2026-11-07" });
    expect(flat("7d")).toEqual({ startDate: "2026-11-01", endDate: "2026-11-07" });
    expect(flat("30d")).toEqual({ startDate: "2026-10-09", endDate: "2026-11-07" });
  });
});

describe("toFlatFilters", () => {
  const today = new Date(2026, 10, 7);
  it("matches GlobalFiltersPanel payload for existing kinds", () => {
    expect(
      toFlatFilters(
        bar,
        { status: ["Paid", "New"], createdDate: { start: "2026-01-01", end: "2026-01-31" }, keyword: "abc" },
        today,
      ),
    ).toEqual({ status: ["Paid", "New"], startDate: "2026-01-01", endDate: "2026-01-31", keyword: "abc" });
  });
  it("skips empty and partial range sides", () => {
    expect(toFlatFilters(bar, { status: [], keyword: "", createdDate: { end: "2026-01-31" } }, today)).toEqual({
      endDate: "2026-01-31",
    });
  });
  it("resolves relative dates", () => {
    expect(toFlatFilters(bar, { createdDate: { relative: "7d" } }, today)).toEqual({
      startDate: "2026-11-01",
      endDate: "2026-11-07",
    });
  });
  it("handles new kinds", () => {
    const num = { op: "gte", min: 5 };
    expect(toFlatFilters(bar, { vip: true, total: num, status: { not: ["Void"] }, cust: { x: 1 } }, today)).toEqual({
      vip: true,
      total: num,
      status: { not: ["Void"] },
      cust: { x: 1 },
    });
    expect(toFlatFilters(bar, { vip: false }, today)).toEqual({});
  });
});

describe("chipLabel", () => {
  it("shows the first value and +N, the title lists all", () => {
    expect(chipLabel(byId("status"), ["Paid", "New", "Void"], t)).toEqual({
      text: "Paid +2",
      title: "Paid, New, Void",
    });
    expect(chipLabel(byId("status"), ["Paid"], t)).toEqual({ text: "Paid", title: "Paid" });
  });
  it("puts Is not first", () => {
    const not = "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.OPERATOR.NOT";
    expect(chipLabel(byId("status"), { not: ["New", "Void"] }, t).text).toBe(`${not} New +1`);
  });
  it("uses the field's own label for single values", () => {
    expect(chipLabel(byId("cust"), "x", t)).toEqual({ text: "C:x", title: "C:x" });
    expect(chipLabel(byId("total"), { op: "gte", min: 5 }, t).text).toBe("≥ 5");
  });
});

describe("chipLabel of single values", () => {
  const label = (id: string, v: unknown) => chipLabel(byId(id), v as never, t).text;
  const day = (ymd: string) =>
    new Intl.DateTimeFormat(navigator.language, { year: "numeric", month: "numeric", day: "numeric" }).format(
      new Date(`${ymd}T00:00`),
    );
  it("labels dates", () => {
    expect(label("createdDate", { relative: "today" })).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.TODAY");
    expect(label("createdDate", { relative: "7d" })).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.LAST_7");
    expect(label("createdDate", { relative: "30d" })).toBe("COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.LAST_30");
  });
  it("shows a custom range in the date picker's local format", () => {
    expect(label("createdDate", { start: "2026-01-01", end: "2026-01-31" })).toBe(
      `${day("2026-01-01")} – ${day("2026-01-31")}`,
    );
    expect(label("createdDate", { start: "2026-01-01" })).toBe(`${day("2026-01-01")} –`);
    expect(label("createdDate", { end: "2026-01-31" })).toBe(`– ${day("2026-01-31")}`);
    expect(label("createdDate", { start: "2026-01-01" })).not.toContain("2026-01-01");
  });
  it("labels number and custom", () => {
    expect(label("total", { op: "gte", min: 5 })).toBe("≥ 5");
    expect(label("total", { op: "lte", max: 9 })).toBe("≤ 9");
    expect(label("total", { op: "eq", min: 3 })).toBe("= 3");
    expect(label("total", { op: "between", min: 1, max: 9 })).toBe("1 – 9");
    expect(label("cust", 7)).toBe("C:7");
  });
  it("groups the digits of numbers in the app's language, like the presets' labels", () => {
    const total = byId("total");
    expect(chipLabel(total, { op: "between", min: 100, max: 1000 }, t, "en").text).toBe("100 – 1,000");
    expect(chipLabel(total, { op: "gte", min: 25000 }, t, "de").text).toBe("≥ 25.000");
  });
  it("uses option labels, not values", () => {
    const f = normalizeFields([{ id: "s", label: "S", filter: { options: [{ value: "p", label: "Paid" }] } }])[0];
    expect(chipLabel(f, "p", t).text).toBe("Paid");
  });
  it("labels select, text, toggle", () => {
    expect(label("status", "Paid")).toBe("Paid");
    expect(label("keyword", "abc")).toBe("abc");
    expect(label("vip", true)).toBe("VIP");
  });
});

describe("cloneValue", () => {
  it("copies nested reactive arrays and objects into plain ones that structuredClone accepts", () => {
    const state = reactive({ values: { status: ["a"], created: { start: "2026-01-01" } } as Record<string, unknown> });
    const spread = { ...state.values };
    expect(() => structuredClone(spread)).toThrow();
    const copy = cloneValue(spread);
    expect(() => structuredClone(copy)).not.toThrow();
    expect(copy).toEqual({ status: ["a"], created: { start: "2026-01-01" } });
    expect(copy.status).not.toBe(state.values.status);
  });

  it("keeps non-plain objects as they are", () => {
    const d = new Date();
    expect(cloneValue({ d }).d).toBe(d);
  });
});

describe("pickerToRange", () => {
  it("formats local dates as YYYY-MM-DD and drops an all-empty range", () => {
    expect(pickerToRange([new Date(2026, 0, 5), null])).toEqual({ start: "2026-01-05", end: undefined });
    expect(pickerToRange([null, null])).toBeUndefined();
  });
});
