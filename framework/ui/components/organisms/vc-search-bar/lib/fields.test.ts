import { describe, it, expect, vi, expectTypeOf } from "vitest";
import { defineComponent } from "vue";
import { normalizeField, normalizeFields } from "./fields";
import type { SearchBarField } from "../types";
import type { GlobalFilterConfig } from "../../vc-data-table/types";

const options = [{ value: "a", label: "A" }];

describe("normalizeField", () => {
  it("maps multiple options to multiselect", () => {
    const f = normalizeField({ id: "s", label: "S", filter: { options, multiple: true } });
    expect(f.kind).toBe("multiselect");
    expect(f.options).toEqual(options);
  });
  it("maps options to select", () => {
    expect(normalizeField({ id: "s", label: "S", filter: { options } }).kind).toBe("select");
  });
  it("maps range to dateRange", () => {
    const f = normalizeField({ id: "d", label: "D", filter: { range: ["startDate", "endDate"] } });
    expect(f.kind).toBe("dateRange");
    expect(f.range).toEqual(["startDate", "endDate"]);
  });
  it("maps true to text keyed by id", () => {
    const f = normalizeField({ id: "name", label: "N", filter: true });
    expect(f.kind).toBe("text");
    expect(f.textField).toBe("name");
  });
  it("maps a string to text on that field", () => {
    const f = normalizeField({ id: "c", label: "C", filter: "customerName" });
    expect(f.kind).toBe("text");
    expect(f.textField).toBe("customerName");
  });
  it("maps toggle, number and custom", () => {
    expect(normalizeField({ id: "t", label: "T", filter: { toggle: true } }).kind).toBe("toggle");
    expect(normalizeField({ id: "n", label: "N", filter: { number: true } }).kind).toBe("number");
    const component = defineComponent({ render: () => null });
    expect(normalizeField({ id: "x", label: "X", filter: { component, label: () => "" } }).kind).toBe("custom");
  });
  it("applies defaults", () => {
    const f = normalizeField({ id: "s", label: "S", filter: { options } });
    expect(f.key).toBe("s");
    expect(f.pinned).toBe(true);
    expect(f.operators).toEqual(["any"]);
  });
  it("respects explicit key, pinned and operators", () => {
    const f = normalizeField({
      id: "s",
      label: "S",
      filter: { options },
      key: "st",
      pinned: false,
      operators: ["any", "not"],
    });
    expect([f.key, f.pinned, f.operators]).toEqual(["st", false, ["any", "not"]]);
  });
  it("normalises the vendor-portal orders config without loss", () => {
    const statuses = ["New", "Pending", "Processing", "Paid", "Shipped", "Cancelled"].map((v) => ({
      value: v,
      label: v,
    }));
    const [status, created] = normalizeFields([
      { id: "status", label: "Status", filter: { options: statuses, multiple: true } },
      { id: "createdDate", label: "Created", filter: { range: ["startDate", "endDate"] } },
    ]);
    expect(status.kind).toBe("multiselect");
    expect(status.options).toEqual(statuses);
    expect(created.kind).toBe("dateRange");
    expect(created.range).toEqual(["startDate", "endDate"]);
  });
});

describe("normalizeFields", () => {
  it("drops duplicate ids, first wins, and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = normalizeFields([
      { id: "a", label: "first", filter: true },
      { id: "a", label: "second", filter: true },
    ]);
    expect(res).toHaveLength(1);
    expect(res[0].label).toBe("first");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("skips a field with filter: false (no pill), like the old panel", () => {
    const res = normalizeFields([
      { id: "a", label: "A", filter: false },
      { id: "b", label: "B", filter: true },
    ]);
    expect(res.map((f) => f.id)).toEqual(["b"]);
  });
});

describe("types", () => {
  it("GlobalFilterConfig is assignable to SearchBarField", () => {
    expectTypeOf<GlobalFilterConfig>().toMatchTypeOf<SearchBarField>();
    const f: SearchBarField = {} as GlobalFilterConfig;
    expect(f).toBeDefined();
  });
});
