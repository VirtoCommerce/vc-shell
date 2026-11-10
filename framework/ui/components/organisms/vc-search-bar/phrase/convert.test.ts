import { describe, it, expect } from "vitest";
import { normalizeFields } from "../lib/fields";
import type { SearchBarField, SearchBarState } from "../types";
import { matchRelative, phraseToState, stateToPhrase } from "./convert";

const Stub = {} as never;
const fields = normalizeFields([
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "Paid", label: "Paid" },
        { value: "In progress", label: "In progress" },
        { value: "a,b", label: "ab" },
        { value: "AND", label: "and" },
        { value: 'say "hi"', label: "hi" },
      ],
      multiple: true,
    },
  },
  {
    id: "kind",
    label: "Kind",
    operators: ["any", "not"],
    filter: {
      options: [
        { value: "x", label: "X" },
        { value: "y", label: "Y" },
      ],
    },
  },
  { id: "createdDate", label: "Created", key: "createddate", filter: { range: ["startDate", "endDate"] } },
  { id: "isOverdue", label: "Overdue", key: "isoverdue", filter: { toggle: true } },
  { id: "total", label: "Total", filter: { number: true } },
  { id: "name", label: "Name", filter: "name" },
  {
    id: "custom",
    label: "Custom",
    filter: { component: Stub, label: () => "c", toPhrase: (v: unknown) => `custom:${String(v)}!` },
  },
] as SearchBarField[]);

const today = new Date(2026, 10, 6);
const roundTrip = (state: SearchBarState) => {
  const phrase = stateToPhrase(fields, state, today);
  const back = phraseToState(phrase, fields, today);
  if ("reason" in back) throw new Error(`${phrase} -> ${back.reason}`);
  return { phrase, state: back.state };
};

describe("round trip", () => {
  it.each<[string, SearchBarState, string]>([
    ["multiselect", { search: "", values: { status: ["Paid", "In progress"] } }, 'status:Paid,"In progress"'],
    ["select", { search: "", values: { kind: "x" } }, "kind:x"],
    ["not", { search: "", values: { kind: { not: ["x", "y"] } } }, "!kind:x,y"],
    [
      "date range",
      { search: "", values: { createdDate: { start: "2026-01-01", end: "2026-01-31" } } },
      "createddate:[2026-01-01 TO 2026-01-31]",
    ],
    ["open date", { search: "", values: { createdDate: { start: "2026-01-01" } } }, "createddate:[2026-01-01 TO]"],
    ["toggle", { search: "", values: { isOverdue: true } }, "isoverdue:true"],
    ["gte", { search: "", values: { total: { op: "gte", min: 5 } } }, "total:[5 TO]"],
    ["lte", { search: "", values: { total: { op: "lte", max: 9 } } }, "total:[TO 9]"],
    ["eq", { search: "", values: { total: { op: "eq", min: 7 } } }, "total:7"],
    ["between", { search: "", values: { total: { op: "between", min: 1, max: 3 } } }, "total:[1 TO 3]"],
    ["text", { search: "", values: { name: "Bob Smith" } }, 'name:"Bob Smith"'],
    ["search first", { search: "foo bar", values: { kind: "y", isOverdue: true } }, "foo bar kind:y isoverdue:true"],
  ])("%s", (_n, state, expected) => {
    const r = roundTrip(state);
    expect(r.phrase).toBe(expected);
    expect(r.state).toEqual(state);
  });

  it("keeps awkward values intact", () => {
    const state: SearchBarState = { search: "", values: { status: ["In progress", "a,b", "AND", 'say "hi"'] } };
    expect(roundTrip(state).state).toEqual(state);
  });

  it("writes relative dates as real dates and reads them back as the choice", () => {
    const r = roundTrip({ search: "", values: { createdDate: { relative: "7d" } } });
    expect(r.phrase).toBe("createddate:[2026-10-31 TO 2026-11-06]");
    expect(r.state.values.createdDate).toEqual({ relative: "7d" });
  });

  it("writes custom fields with toPhrase", () => {
    expect(stateToPhrase(fields, { search: "", values: { custom: 1 } }, today)).toBe("custom:1!");
  });
});

describe("matchRelative", () => {
  it("matches choices", () => {
    expect(matchRelative("2026-10-31", "2026-11-06", today)).toBe("7d");
    expect(matchRelative("2026-11-06", "2026-11-06", today)).toBe("today");
    expect(matchRelative("2026-10-08", "2026-11-06", today)).toBe("30d");
    expect(matchRelative("2026-10-30", "2026-11-06", today)).toBeNull();
  });
});

describe("phraseToState reasons", () => {
  it.each([
    ["status:", "PARSE"],
    ["nope:1", "UNKNOWN_FIELD"],
    ["kind:x OR isoverdue:true", "OR_BETWEEN_FIELDS"],
    ["(kind:x)", "BRACKETS"],
    ["total:(1 TO 5]", "EXCLUSIVE_BOUND"],
    ["kind:x kind:y", "FIELD_TWICE"],
    ["!status:Paid", "NOT_ALLOWED"],
    ["custom:1", "CUSTOM_FIELD"],
    ["kind:x,y", "MULTI_VALUE"],
    ["name:a,b", "MULTI_VALUE"],
    ["total:1,2", "MULTI_VALUE"],
    ["createddate:2026-01-01,2026-01-02", "MULTI_VALUE"],
    ["isoverdue:true,true", "MULTI_VALUE"],
    ["createddate:[yesterday TO today]", "PARSE"],
    ["createddate:[2026-1-1 TO]", "PARSE"],
    ["total:0x10", "PARSE"],
    ["total:Infinity", "PARSE"],
    ["total:[1e3 TO]", "PARSE"],
  ])("%s -> %s", (src, reason) => {
    expect(phraseToState(src, fields, today)).toEqual({ reason });
  });

  it("looks up fields case-insensitively", () => {
    expect(phraseToState("KIND:x", fields, today)).toEqual({ state: { search: "", values: { kind: "x" } } });
  });

  it("keeps the quotes of a quoted keyword", () => {
    expect(phraseToState('"hello" status:Paid', fields, today)).toEqual({
      state: { search: '"hello"', values: { status: ["Paid"] } },
    });
  });

  it("collects bare words, keeping quotes where needed", () => {
    expect(phraseToState('foo "a b" kind:x', fields, today)).toEqual({
      state: { search: 'foo "a b"', values: { kind: "x" } },
    });
  });
});
