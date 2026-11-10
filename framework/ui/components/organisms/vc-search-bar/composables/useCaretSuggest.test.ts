import { describe, it, expect } from "vitest";
import { normalizeFields } from "../lib/fields";
import { suggestionsAt } from "./useCaretSuggest";

const fields = normalizeFields([
  {
    id: "status",
    label: "Status",
    key: "status",
    filter: {
      options: [
        { value: "New", label: "New", count: 12 },
        { value: "Paid", label: "Paid", count: 31 },
        { value: "Shipped", label: "Shipped" },
      ],
      multiple: true,
    },
  },
  { id: "priority", label: "Priority", filter: { options: [{ value: "Low", label: "Low" }] } },
  { id: "created", label: "Created", key: "createddate", filter: { range: ["a", "b"] } },
  { id: "total", label: "Total", filter: { number: true } },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "customer", label: "Customer", filter: true },
]);
const today = new Date(2026, 10, 6);
const at = (text: string, opts = {}) => suggestionsAt(text, text.length, fields, { today, ...opts });

describe("suggestionsAt", () => {
  it("suggests field keys for a typed prefix and anchors at the word start", () => {
    const r = at("foo sta");
    expect(r.items.map((i) => i.insert)).toEqual(["status:"]);
    expect(r.from).toBe(4);
    expect(r.to).toBe(7);
  });

  it("uses the field key, not the id", () => {
    expect(at("cre").items.map((i) => i.insert)).toEqual(["createddate:"]);
  });

  it("suggests nothing for an empty word unless forced", () => {
    expect(at("status:Paid ").items).toEqual([]);
    expect(at("status:Paid ", { force: true }).items.length).toBe(fields.length);
  });

  it("offers options with counts after the colon", () => {
    const r = at("status:");
    expect(r.items.map((i) => [i.insert, i.hint])).toEqual([
      ["New", "12"],
      ["Paid", "31"],
      ["Shipped", undefined],
    ]);
    expect(r.from).toBe(7);
  });

  it("offers the remaining options after a comma", () => {
    const r = at("status:Paid,");
    expect(r.items.map((i) => i.insert)).toEqual(["New", "Shipped"]);
    expect(r.from).toBe(12);
  });

  it("filters options by the typed part and hides an exact match", () => {
    expect(at("status:Ne").items.map((i) => i.insert)).toEqual(["New"]);
    expect(at("status:New").items).toEqual([]);
  });

  it("works after a negation sign", () => {
    const r = at("!status:Paid,N");
    expect(r.items.map((i) => i.insert)).toEqual(["New"]);
    expect(r.from).toBe(13);
  });

  it("does not offer a second value for a single select", () => {
    expect(at("priority:Low,").items).toEqual([]);
  });

  it("treats quoted and differently cased used values as used", () => {
    const f = normalizeFields([
      {
        id: "s",
        label: "S",
        filter: {
          options: [
            { value: "In progress", label: "x" },
            { value: "Paid", label: "y" },
          ],
          multiple: true,
        },
      },
    ]);
    const r = suggestionsAt('s:"in progress",', 16, f);
    expect(r.items.map((i) => i.insert)).toEqual(["Paid"]);
  });

  it("quotes an option that needs it", () => {
    const f = normalizeFields([{ id: "s", label: "S", filter: { options: [{ value: "In progress", label: "x" }] } }]);
    const r = suggestionsAt("s:", 2, f);
    expect(r.items[0].insert).toBe('"In progress"');
  });

  it("offers ready ranges for a date field", () => {
    const r = at("createddate:");
    expect(r.items.map((i) => i.insert)).toEqual([
      "[2026-11-06 TO 2026-11-06]",
      "[2026-10-31 TO 2026-11-06]",
      "[2026-10-08 TO 2026-11-06]",
    ]);
  });

  it("offers range templates for a number and true for a toggle", () => {
    expect(at("total:").items.map((i) => i.insert)).toEqual(["[ TO]", "[TO ]", "[ TO ]"]);
    expect(at("overdue:").items.map((i) => i.insert)).toEqual(["true"]);
  });

  it("offers nothing for free text fields and unknown keys", () => {
    expect(at("customer:").items).toEqual([]);
    expect(at("nope:").items).toEqual([]);
  });

  it("offers nothing inside quotes", () => {
    expect(at('customer:"sta').items).toEqual([]);
    expect(at('"sta').items).toEqual([]);
    expect(at('status:"Pa').items).toEqual([]);
  });

  it("uses the caret, not the end of the text", () => {
    const r = suggestionsAt("sta rest", 3, fields);
    expect(r.items.map((i) => i.insert)).toEqual(["status:"]);
    expect(r.to).toBe(3);
  });
});
