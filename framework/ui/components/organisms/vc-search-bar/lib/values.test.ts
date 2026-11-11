import { describe, it, expect, vi, afterEach } from "vitest";
import { reactive } from "vue";
import {
  cloneValue,
  isEmptyValue,
  pickerToRange,
  resolveRelative,
  toFlatFilters,
  pillLabel,
  chipLabel,
} from "./values";
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

describe("resolveRelative", () => {
  it("resolves in local calendar days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 7, 23, 30));
    const today = new Date();
    expect(resolveRelative({ relative: "today" }, today)).toEqual({ start: "2026-11-07", end: "2026-11-07" });
    expect(resolveRelative({ relative: "7d" }, today)).toEqual({ start: "2026-11-01", end: "2026-11-07" });
    expect(resolveRelative({ relative: "30d" }, today)).toEqual({ start: "2026-10-09", end: "2026-11-07" });
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

describe("pillLabel", () => {
  it("joins option labels and collapses after 2", () => {
    expect(pillLabel(byId("status"), ["Paid", "New"], t)).toBe("Paid, New");
    expect(pillLabel(byId("status"), ["Paid", "New", "Shipped", "Void"], t)).toBe("Paid, New +2");
  });
  it("uses option labels, not values", () => {
    const f = normalizeFields([
      { id: "s", label: "S", filter: { options: [{ value: "p", label: "Paid" }], multiple: true } },
    ])[0];
    expect(pillLabel(f, ["p"], t)).toBe("Paid");
  });
  it("labels not values", () => {
    expect(pillLabel(byId("status"), { not: ["Void"] }, t)).toBe("Void");
  });
  it("labels dates", () => {
    expect(pillLabel(byId("createdDate"), { relative: "today" }, t)).toBe(
      "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.TODAY",
    );
    expect(pillLabel(byId("createdDate"), { relative: "7d" }, t)).toBe(
      "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.LAST_7",
    );
    expect(pillLabel(byId("createdDate"), { relative: "30d" }, t)).toBe(
      "COMPONENTS.ORGANISMS.VC_SEARCH_BAR.DATE.LAST_30",
    );
    expect(pillLabel(byId("createdDate"), { start: "2026-01-01", end: "2026-01-31" }, t)).toBe(
      "2026-01-01 – 2026-01-31",
    );
    expect(pillLabel(byId("createdDate"), { start: "2026-01-01" }, t)).toBe("2026-01-01 –");
    expect(pillLabel(byId("createdDate"), { end: "2026-01-31" }, t)).toBe("– 2026-01-31");
  });
  it("labels number and custom", () => {
    expect(pillLabel(byId("total"), { op: "gte", min: 5 }, t)).toBe("≥ 5");
    expect(pillLabel(byId("total"), { op: "lte", max: 9 }, t)).toBe("≤ 9");
    expect(pillLabel(byId("total"), { op: "eq", min: 3 }, t)).toBe("= 3");
    expect(pillLabel(byId("total"), { op: "between", min: 1, max: 9 }, t)).toBe("1 – 9");
    expect(pillLabel(byId("cust"), 7, t)).toBe("C:7");
  });
  it("labels select, text, toggle", () => {
    expect(pillLabel(byId("status"), "Paid", t)).toBe("Paid");
    expect(pillLabel(byId("keyword"), "abc", t)).toBe("abc");
    expect(pillLabel(byId("vip"), true, t)).toBe("VIP");
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
