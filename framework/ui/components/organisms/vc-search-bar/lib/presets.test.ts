import { describe, expect, it } from "vitest";
import type { SearchBarField, SearchBarPreset } from "../types";
import { normalizeFields } from "./fields";
import {
  applyPreset,
  applyPresetSearch,
  isPresetLit,
  litPresetIds,
  removePreset,
  removePresetSearch,
  sameValues,
  suggestPresetName,
} from "./presets";

const fields = normalizeFields([
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "paid", label: "Paid" },
        { value: "new", label: "New" },
        { value: "x", label: "X" },
      ],
      multiple: true,
    },
  },
  {
    id: "kind",
    label: "Kind",
    filter: {
      options: [
        { value: "a", label: "A" },
        { value: "b", label: "B" },
      ],
    },
  },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
  { id: "urgent", label: "Urgent", filter: { toggle: true } },
] as SearchBarField[]);

const t = (k: string) => k;
const preset = (values: SearchBarPreset["values"], search?: string): SearchBarPreset => ({
  id: "p",
  name: "P",
  values,
  search,
});

describe("applyPreset", () => {
  it("combines different fields", () => {
    expect(applyPreset(fields, { kind: "a" }, preset({ urgent: true }))).toEqual({ kind: "a", urgent: true });
  });
  it("unions the same multiselect field", () => {
    expect(applyPreset(fields, { status: ["paid"] }, preset({ status: ["new", "paid"] }))).toEqual({
      status: ["paid", "new"],
    });
  });
  it("preset wins on single and range fields", () => {
    const r = { start: "2026-01-01", end: "2026-01-31" };
    expect(
      applyPreset(fields, { kind: "a", created: { start: "2025-01-01" } }, preset({ kind: "b", created: r })),
    ).toEqual({
      kind: "b",
      created: r,
    });
  });
  it("ignores unknown field ids and does not mutate", () => {
    const values = { kind: "a" };
    expect(applyPreset(fields, values, preset({ ghost: 1 }))).toEqual({ kind: "a" });
    expect(values).toEqual({ kind: "a" });
  });
});

describe("isPresetLit", () => {
  it("is lit when every preset value is present, multiselect as subset", () => {
    const p = preset({ status: ["paid"], kind: "a" });
    expect(isPresetLit(fields, { status: ["new", "paid"], kind: "a" }, p)).toBe(true);
    expect(isPresetLit(fields, { status: ["new"], kind: "a" }, p)).toBe(false);
    expect(isPresetLit(fields, { status: ["paid"], kind: "b" }, p)).toBe(false);
  });
  it("compares ranges structurally", () => {
    const p = preset({ created: { relative: "7d" } });
    expect(isPresetLit(fields, { created: { relative: "7d" } }, p)).toBe(true);
    expect(isPresetLit(fields, { created: { relative: "30d" } }, p)).toBe(false);
  });
  it("requires equal search when the preset has one", () => {
    const p = preset({ kind: "a" }, "acme");
    expect(isPresetLit(fields, { kind: "a" }, p, "acme")).toBe(true);
    expect(isPresetLit(fields, { kind: "a" }, p, "")).toBe(false);
  });
  it("an empty preset is never lit", () => {
    expect(isPresetLit(fields, { kind: "a" }, preset({}))).toBe(false);
  });
  it("two chips can be lit at once, and removing one keeps the other lit", () => {
    const paid = preset({ status: ["paid"] });
    const fresh = preset({ status: ["new"] });
    let values = applyPreset(fields, applyPreset(fields, {}, paid), fresh);
    expect(isPresetLit(fields, values, paid)).toBe(true);
    expect(isPresetLit(fields, values, fresh)).toBe(true);
    values = removePreset(fields, values, paid);
    expect(isPresetLit(fields, values, paid)).toBe(false);
    expect(isPresetLit(fields, values, fresh)).toBe(true);
  });
});

describe("removePreset", () => {
  it("takes the difference for multiselect and drops the key when empty", () => {
    expect(removePreset(fields, { status: ["paid", "new"] }, preset({ status: ["paid"] }))).toEqual({
      status: ["new"],
    });
    expect(removePreset(fields, { status: ["paid"] }, preset({ status: ["paid"] }))).toEqual({});
  });
  it("clears single and range fields only when equal", () => {
    expect(removePreset(fields, { kind: "a" }, preset({ kind: "a" }))).toEqual({});
    expect(removePreset(fields, { kind: "b" }, preset({ kind: "a" }))).toEqual({ kind: "b" });
    const r = { start: "1", end: "2" };
    expect(removePreset(fields, { created: { ...r } }, preset({ created: r }))).toEqual({});
    expect(removePreset(fields, { created: { start: "1", end: "3" } }, preset({ created: r }))).toEqual({
      created: { start: "1", end: "3" },
    });
  });
});

describe("preset search", () => {
  it("apply sets and remove clears only when equal", () => {
    const p = preset({}, "acme");
    expect(applyPresetSearch(p, "x")).toBe("acme");
    expect(applyPresetSearch(preset({}), "x")).toBe("x");
    expect(removePresetSearch(p, "acme")).toBe("");
    expect(removePresetSearch(p, "other")).toBe("other");
  });
});

describe("sameValues", () => {
  it("ignores array order and empty values", () => {
    expect(sameValues(fields, { status: ["a", "b"], kind: "" }, { status: ["b", "a"] })).toBe(true);
  });
  it("detects differences", () => {
    expect(sameValues(fields, { kind: "a" }, { kind: "b" })).toBe(false);
    expect(sameValues(fields, { kind: "a" }, {})).toBe(false);
    expect(sameValues(fields, { created: { relative: "7d" } }, { created: { relative: "7d" } })).toBe(true);
  });
});

describe("suggestPresetName", () => {
  it("joins labels of set values in field order", () => {
    expect(suggestPresetName(fields, { kind: "b", status: ["paid", "new"] }, t)).toBe("Paid, New, B");
  });
  it("returns empty when nothing is set", () => {
    expect(suggestPresetName(fields, { kind: "" }, t)).toBe("");
  });
  it("truncates to 40 chars with an ellipsis", () => {
    const long = normalizeFields([
      { id: "n", label: "N", filter: { options: [{ value: "v", label: "x".repeat(60) }] } },
    ] as SearchBarField[]);
    const name = suggestPresetName(long, { n: "v" }, t);
    expect(name).toHaveLength(40);
    expect(name.endsWith("…")).toBe(true);
  });
});

describe("litPresetIds", () => {
  const mk = (id: string, values: SearchBarPreset["values"], search?: string): SearchBarPreset => ({
    id,
    name: id,
    values,
    search,
  });
  const ids = (values: Record<string, unknown>, presets: SearchBarPreset[], search = "") =>
    [...litPresetIds(fields, values as never, search, presets)].sort();

  it("lights only the superset when one preset contains another", () => {
    const a = mk("a", { status: ["paid"] });
    const b = mk("b", { status: ["paid"], kind: "a" });
    expect(ids({ status: ["paid"], kind: "a" }, [a, b])).toEqual(["b"]);
    expect(ids({ status: ["paid"] }, [a, b])).toEqual(["a"]);
  });
  it("keeps independently lit presets", () => {
    const a = mk("a", { status: ["paid"] });
    const u = mk("u", { urgent: true });
    expect(ids({ status: ["paid"], urgent: true }, [a, u])).toEqual(["a", "u"]);
  });
  it("keeps equal presets lit together", () => {
    const a = mk("a", { status: ["paid"] });
    const b = mk("b", { status: ["paid"] });
    expect(ids({ status: ["paid"] }, [a, b])).toEqual(["a", "b"]);
  });
  it("resolves a chain A < B < C to C", () => {
    const a = mk("a", { status: ["paid"] });
    const b = mk("b", { status: ["paid"], kind: "a" });
    const c = mk("c", { status: ["paid", "new"], kind: "a" });
    expect(ids({ status: ["paid", "new"], kind: "a" }, [a, b, c])).toEqual(["c"]);
  });
  it("handles search-only containment", () => {
    const a = mk("a", {}, "acme");
    const b = mk("b", { kind: "a" }, "acme");
    expect(ids({ kind: "a" }, [a, b], "acme")).toEqual(["b"]);
    expect(ids({}, [a, b], "acme")).toEqual(["a"]);
  });
});
