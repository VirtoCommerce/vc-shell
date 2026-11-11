import { describe, it, expect, afterEach } from "vitest";
import { computed } from "vue";
import {
  registerExternalSearchFilters,
  unregisterExternalSearchFilters,
  getExternalSearchFilters,
} from "./search-filters-service";
import type { SearchBarField } from "@ui/components/organisms/vc-search-bar/types";

const field = (id: string) => ({ id, label: id }) as unknown as SearchBarField;
const ids = ["a", "b", "c", "late"];

describe("search-filters-service", () => {
  afterEach(() => ids.forEach((id) => unregisterExternalSearchFilters(id)));

  it("registers and unregisters", () => {
    registerExternalSearchFilters({ id: "a", targetBlades: ["orders"], fields: [field("x")] });
    expect(getExternalSearchFilters("orders").map((r) => r.id)).toEqual(["a"]);
    unregisterExternalSearchFilters("a");
    expect(getExternalSearchFilters("orders")).toEqual([]);
  });

  it("ignores unknown id on unregister", () => {
    expect(() => unregisterExternalSearchFilters("nope")).not.toThrow();
  });

  it("replaces by id, keeping original order", () => {
    registerExternalSearchFilters({ id: "a", targetBlades: ["orders"], fields: [field("x")] });
    registerExternalSearchFilters({ id: "b", targetBlades: ["orders"], fields: [field("y")] });
    registerExternalSearchFilters({ id: "a", targetBlades: ["orders"], fields: [field("z")] });
    const result = getExternalSearchFilters("orders");
    expect(result.map((r) => r.id)).toEqual(["a", "b"]);
    expect(result[0].fields[0].id).toBe("z");
  });

  it("matches targets case-insensitively", () => {
    registerExternalSearchFilters({ id: "a", targetBlades: ["Orders"], fields: [field("x")] });
    expect(getExternalSearchFilters("ORDERS")).toHaveLength(1);
    expect(getExternalSearchFilters("offers")).toHaveLength(0);
  });

  it("sorts by priority (default 100), stable by registration order", () => {
    registerExternalSearchFilters({ id: "a", targetBlades: ["orders"], fields: [] });
    registerExternalSearchFilters({ id: "b", targetBlades: ["orders"], priority: 10, fields: [] });
    registerExternalSearchFilters({ id: "c", targetBlades: ["orders"], priority: 100, fields: [] });
    expect(getExternalSearchFilters("orders").map((r) => r.id)).toEqual(["b", "a", "c"]);
  });

  it("is reactive for late registrations", () => {
    const list = computed(() => getExternalSearchFilters("Orders").map((r) => r.id));
    expect(list.value).toEqual([]);
    registerExternalSearchFilters({ id: "late", targetBlades: ["orders"], fields: [] });
    expect(list.value).toEqual(["late"]);
  });

  it("keeps the views of a registration", () => {
    const views = [{ id: "v", name: "V", values: { x: "1" }, default: true }];
    registerExternalSearchFilters({ id: "a", targetBlades: ["orders"], fields: [field("x")], views });
    expect(getExternalSearchFilters("orders")[0].views).toEqual(views);
  });
});
