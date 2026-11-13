import { describe, it, expect } from "vitest";
import { normalizeFields } from "../lib/fields";
import type { SearchBarField } from "../types";
import { chipFromTyped, getSuggestions, isAmbiguousTyped } from "./useSearchSyntax";

const fields = normalizeFields([
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "new", label: "New" },
        { value: "paid", label: "Paid" },
        { value: "in stock", label: "In stock" },
      ],
      multiple: true,
    },
  },
  { id: "store", key: "shop", label: "Store", filter: { options: [{ value: 1, label: "Main" }] } },
  { id: "overdue", label: "Overdue", filter: { toggle: true } },
  { id: "created", label: "Created", filter: { range: ["from", "to"] } },
  { id: "name", label: "Name", filter: true },
] as SearchBarField[]);

describe("getSuggestions", () => {
  it("suggests the values of a typed field", () => {
    const r = getSuggestions("acme status:", fields);
    expect(r.explicit).toBe(true);
    expect(r.items.map((i) => i.text)).toEqual(["status:new ", "status:paid "]);
  });

  it("filters values by value or label prefix", () => {
    expect(getSuggestions("status:Pa", fields).items.map((i) => i.label)).toEqual(["Paid"]);
    expect(getSuggestions("shop:ma", fields).items.map((i) => i.text)).toEqual(["shop:1 "]);
  });

  it("suggests on for a toggle and the relative ids for a date", () => {
    expect(getSuggestions("overdue:", fields).items.map((i) => i.text)).toEqual(["overdue:on "]);
    expect(getSuggestions("created:", fields).items.map((i) => i.text)).toEqual([
      "created:today ",
      "created:7d ",
      "created:30d ",
    ]);
  });

  it("suggests fields after two letters, not after one or for a text field", () => {
    expect(getSuggestions("s", fields).items).toEqual([]);
    const r = getSuggestions("st", fields);
    expect(r.explicit).toBe(false);
    expect(r.items.map((i) => i.text)).toEqual(["status:", "shop:"]);
    expect(getSuggestions("na", fields).items).toEqual([]);
  });

  it("suggests nothing after a space or for an unknown field", () => {
    expect(getSuggestions("status ", fields).items).toEqual([]);
    expect(getSuggestions("foo:", fields).items).toEqual([]);
  });
});

describe("chipFromTyped", () => {
  it("status:new + space becomes a chip and leaves the rest of the text", () => {
    expect(chipFromTyped("acme status:new ", fields)).toEqual({ fieldId: "status", value: ["new"], rest: "acme " });
  });

  it("keeps one space after the text left, so the next word does not glue onto it", () => {
    expect(chipFromTyped("acme   status:new ", fields)?.rest).toBe("acme ");
    expect(chipFromTyped("status:new ", fields)?.rest).toBe("");
  });

  it("matches labels, unique prefixes, the key and the case", () => {
    expect(chipFromTyped("Status:PAI ", fields)?.value).toEqual(["paid"]);
    expect(chipFromTyped("shop:main ", fields)).toEqual({ fieldId: "store", value: 1, rest: "" });
  });

  it("reads toggles and relative dates", () => {
    expect(chipFromTyped("overdue:on ", fields)?.value).toBe(true);
    expect(chipFromTyped("created:7d ", fields)?.value).toEqual({ relative: "7d" });
  });

  it("an ambiguous prefix stays text; an exact match wins over other prefixes", () => {
    const f = normalizeFields([
      {
        id: "status",
        label: "Status",
        filter: {
          options: [
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "pa", label: "PA" },
            { value: "partial", label: "Partial" },
          ],
        },
      },
    ] as SearchBarField[]);
    expect(chipFromTyped("status:p ", f)).toBeNull();
    expect(chipFromTyped("status:par ", f)?.value).toBe("partial");
    expect(chipFromTyped("status:PA ", f)?.value).toBe("pa");
    expect(chipFromTyped("status:Pending ", f)?.value).toBe("pending");
    expect(isAmbiguousTyped("status:p ", f)).toBe(true);
    expect(isAmbiguousTyped("status:par ", f)).toBe(false);
    expect(isAmbiguousTyped("status:xyz ", f)).toBe(false);
  });

  it("unknown field or value stays search text", () => {
    expect(chipFromTyped("status:xyz ", fields)).toBeNull();
    expect(chipFromTyped("foo:bar ", fields)).toBeNull();
    expect(chipFromTyped("overdue:off ", fields)).toBeNull();
    expect(chipFromTyped("name:acme ", fields)).toBeNull();
    expect(chipFromTyped("status:new", fields)).toBeNull();
  });
});
