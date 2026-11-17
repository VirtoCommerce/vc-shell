import { describe, expect, it } from "vitest";
import type { SearchBarField } from "../types";
import { normalizeFields } from "./fields";
import { SYSTEM_VIEW_ID, isViewModified, sameValues, type BarView } from "./views";

const fields = normalizeFields([
  {
    id: "status",
    label: "Status",
    filter: {
      options: [
        { value: "paid", label: "Paid" },
        { value: "new", label: "New" },
      ],
      multiple: true,
    },
  },
  { id: "kind", label: "Kind", filter: { options: [{ value: "a", label: "A" }] } },
  { id: "urgent", label: "Urgent", filter: { toggle: true } },
] as SearchBarField[]);

const view = (values: BarView["values"]): BarView => ({ id: "v", name: "V", values, scope: "user" });

describe("isViewModified", () => {
  it("is not modified after removing and re-adding the same value", () => {
    const v = view({ status: ["paid", "new"], urgent: true });
    let values: BarView["values"] = { status: ["paid", "new"], urgent: true };
    values = { ...values, status: ["new"] };
    expect(isViewModified(fields, values, v)).toBe(true);
    values = { ...values, status: ["new", "paid"] };
    const { urgent: _u, ...withoutUrgent } = values;
    expect(isViewModified(fields, withoutUrgent, v)).toBe(true);
    expect(isViewModified(fields, { ...withoutUrgent, urgent: true }, v)).toBe(false);
  });

  it("treats empty values as absent", () => {
    const system: BarView = { id: SYSTEM_VIEW_ID, name: "All", values: {}, scope: "system" };
    expect(isViewModified(fields, { status: [], kind: "" }, system)).toBe(false);
    expect(isViewModified(fields, { kind: "a" }, system)).toBe(true);
  });
});

describe("sameValues", () => {
  it("ignores array order and empty values, ignores unknown fields", () => {
    expect(sameValues(fields, { status: ["paid", "new"], kind: "", gone: 1 }, { status: ["new", "paid"] })).toBe(true);
    expect(sameValues(fields, { kind: "a" }, {})).toBe(false);
  });
});
