import { describe, it, expect } from "vitest";
import { normalizeFields } from "./fields";
import { stateToUrl, unknownSegments, urlToState } from "./urlState";
import type { SearchBarField, SearchBarState, SearchBarValue } from "../types";

const fields = normalizeFields([
  { id: "name", label: "Name", filter: true },
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "Paid", label: "Paid" },
        { value: "New", label: "New" },
      ],
      multiple: true,
    },
    operators: ["any", "not"],
  },
  {
    id: "kind",
    label: "Kind",
    filter: {
      options: [
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
      ],
    },
  },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "total", label: "Total", filter: { number: true } },
  { id: "cust", label: "Cust", filter: { component: {} as never, label: (v) => String(v) } },
] satisfies SearchBarField[]);

const state = (values: Record<string, SearchBarValue>): SearchBarState => ({ search: "", values });
const roundTrip = (values: Record<string, SearchBarValue>) => urlToState(fields, stateToUrl(fields, state(values)));

describe("stateToUrl", () => {
  it("writes the compact format per kind", () => {
    expect(stateToUrl(fields, state({ status: ["Paid", "New"] }))).toBe("status:Paid,New");
    expect(stateToUrl(fields, state({ status: { not: ["Paid"] } }))).toBe("!status:Paid");
    expect(stateToUrl(fields, state({ created: { relative: "7d" } }))).toBe("created:7d");
    expect(stateToUrl(fields, state({ created: { start: "2026-01-01", end: "2026-01-31" } }))).toBe(
      "created:2026-01-01..2026-01-31",
    );
    expect(stateToUrl(fields, state({ created: { start: "2026-01-01" } }))).toBe("created:2026-01-01..");
    expect(stateToUrl(fields, state({ overdue: true }))).toBe("overdue:1");
    expect(stateToUrl(fields, state({ total: { op: "gte", min: 100 } }))).toBe("total:>=100");
    expect(stateToUrl(fields, state({ total: { op: "lte", max: 100 } }))).toBe("total:<=100");
    expect(stateToUrl(fields, state({ total: { op: "eq", min: 100 } }))).toBe("total:=100");
    expect(stateToUrl(fields, state({ total: { op: "between", min: 100, max: 200 } }))).toBe("total:100..200");
    expect(stateToUrl(fields, state({ name: "bob" }))).toBe("name:bob");
    expect(stateToUrl(fields, state({ kind: 2 }))).toBe("kind:2");
  });

  it("joins fields with ';', skips empty values, unknown ids and the search words", () => {
    const s: SearchBarState = { search: "words", values: { status: ["Paid"], overdue: true, name: "", gone: "x" } };
    expect(stateToUrl(fields, s)).toBe("status:Paid;overdue:1");
    expect(stateToUrl(fields, { search: "only words", values: {} })).toBe("");
  });

  it("stores the advanced query as '~' + the query", () => {
    expect(stateToUrl(fields, { search: "", values: {}, query: "status:Paid OR name:a;b" })).toBe(
      "~status:Paid OR name:a;b",
    );
  });

  it("JSON-encodes a custom editor value", () => {
    expect(stateToUrl(fields, state({ cust: { a: 1 } }))).toBe('cust:{"a"\\:1}');
  });
});

describe("urlToState round trip", () => {
  it.each<[string, Record<string, SearchBarValue>]>([
    ["multiselect", { status: ["Paid", "New"] }],
    ["not", { status: { not: ["Paid", "New"] } }],
    ["single select keeps the option type", { kind: 2 }],
    ["relative date", { created: { relative: "today" } }],
    ["30d", { created: { relative: "30d" } }],
    ["absolute range", { created: { start: "2026-01-01", end: "2026-01-31" } }],
    ["open start", { created: { end: "2026-01-31" } }],
    ["open end", { created: { start: "2026-01-01" } }],
    ["toggle", { overdue: true }],
    ["gte", { total: { op: "gte", min: 100 } }],
    ["lte", { total: { op: "lte", max: -5.5 } }],
    ["eq", { total: { op: "eq", min: 0 } }],
    ["between", { total: { op: "between", min: 1.5, max: 200 } }],
    ["text", { name: "bob" }],
    ["custom", { cust: { a: [1, "x;y"], b: "c:d,e" } }],
    ["several", { status: ["Paid"], created: { relative: "7d" }, overdue: true, total: { op: "gte", min: 1 } }],
  ])("%s", (_name, values) => {
    expect(roundTrip(values)).toEqual(state(values));
  });

  it.each([
    "a;b",
    "a,b",
    "a:b",
    "with spaces",
    "\"quoted\" 'single'",
    "Ünïcødé 日本 🙂",
    "back\\slash",
    "!lead",
    "~lead",
    "a\\;b",
  ])("escapes %j in text and select values", (v) => {
    expect(roundTrip({ name: v })).toEqual(state({ name: v }));
    expect(roundTrip({ status: [v, "New"] })).toEqual(state({ status: [v, "New"] }));
    expect(roundTrip({ status: { not: [v] } })).toEqual(state({ status: { not: [v] } }));
  });

  it("round-trips the advanced query", () => {
    const s: SearchBarState = { search: "", values: {}, query: "a OR (b;c, d:e)" };
    expect(urlToState(fields, stateToUrl(fields, s))).toEqual(s);
  });

  it("returns null for an empty state", () => {
    expect(urlToState(fields, stateToUrl(fields, state({})))).toBeNull();
    expect(urlToState(fields, "")).toBeNull();
    expect(urlToState(fields, "~")).toBeNull();
  });
});

describe("urlToState on bad input", () => {
  it("drops unknown ids", () => {
    expect(urlToState(fields, "gone:x;name:a")).toEqual(state({ name: "a" }));
  });

  it.each([
    "name",
    ":a",
    "name:",
    "name:a:b",
    "overdue:yes",
    "total:abc",
    "total:>=",
    "total:1..",
    "created:yesterday",
    "created:..",
    "created:2026-13-1..x",
    "!name:a",
    "!kind:1",
    "kind:1,2",
    "cust:{bad",
    "status:,",
    ";;;",
  ])("skips the malformed segment %j without throwing", (raw) => {
    expect(() => urlToState(fields, raw)).not.toThrow();
    expect(urlToState(fields, `${raw};overdue:1`)).toEqual(state({ overdue: true }));
  });

  it("survives a dangling escape", () => {
    expect(() => urlToState(fields, "name:a\\")).not.toThrow();
    expect(urlToState(fields, "name:a\\")).toEqual(state({ name: "a" }));
  });

  it("keeps an option value it does not know as text", () => {
    expect(urlToState(fields, "status:Later")).toEqual(state({ status: ["Later"] }));
  });
});

describe("unknownSegments", () => {
  it("returns the segments of unknown fields as written", () => {
    expect(unknownSegments(fields, "name:a;!late:x\\;y;other:1")).toEqual(["!late:x\\;y", "other:1"]);
  });

  it("ignores queries, empty values and malformed segments", () => {
    expect(unknownSegments(fields, "~late:x")).toEqual([]);
    expect(unknownSegments(fields, "")).toEqual([]);
    expect(unknownSegments(fields, "late;:x")).toEqual([]);
  });
});
