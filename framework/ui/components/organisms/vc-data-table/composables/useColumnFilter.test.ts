import { describe, it, expect } from "vitest";
import { useColumnFilter } from "./useColumnFilter";

describe("useColumnFilter", () => {
  const {
    getFilterType,
    getFilterField,
    getRangeFields,
    getFilterOptions,
    isMultipleSelect,
    hasFilter,
    isSelectFilter,
    isSelectFilterWithField,
    isDateRangeFilter,
  } = useColumnFilter();

  // --- getFilterType ---
  describe("getFilterType", () => {
    it('returns "none" for undefined', () => {
      expect(getFilterType(undefined)).toBe("none");
    });

    it('returns "text" for true', () => {
      expect(getFilterType(true)).toBe("text");
    });

    it('returns "text" for a string', () => {
      expect(getFilterType("keyword")).toBe("text");
    });

    it('returns "select" for object with options', () => {
      expect(getFilterType({ options: [{ value: "a", label: "A" }] })).toBe("select");
    });

    it('returns "dateRange" for object with range', () => {
      expect(getFilterType({ range: ["start", "end"] })).toBe("dateRange");
    });

    it('returns "none" for empty object', () => {
      expect(getFilterType({} as any)).toBe("none");
    });
  });

  // --- getFilterField ---
  describe("getFilterField", () => {
    it("returns columnId when filter is undefined", () => {
      expect(getFilterField("status", undefined)).toBe("status");
    });

    it("returns columnId when filter is true", () => {
      expect(getFilterField("status", true)).toBe("status");
    });

    it("returns the string when filter is a string", () => {
      expect(getFilterField("search", "keyword")).toBe("keyword");
    });

    it("returns columnId for select filter without field", () => {
      expect(getFilterField("status", { options: [{ value: "a", label: "A" }] })).toBe("status");
    });

    it("returns field from select filter with field", () => {
      expect(getFilterField("type", { field: "orderType", options: [{ value: "a", label: "A" }] })).toBe("orderType");
    });

    it("returns columnId for dateRange filter", () => {
      expect(getFilterField("created", { range: ["startDate", "endDate"] })).toBe("created");
    });
  });

  // --- getRangeFields ---
  describe("getRangeFields", () => {
    it("returns tuple for dateRange filter", () => {
      expect(getRangeFields({ range: ["startDate", "endDate"] })).toEqual(["startDate", "endDate"]);
    });

    it("returns undefined for non-range filters", () => {
      expect(getRangeFields(true)).toBeUndefined();
      expect(getRangeFields(undefined)).toBeUndefined();
    });
  });

  // --- getFilterOptions ---
  describe("getFilterOptions", () => {
    it("returns options for select filter", () => {
      const opts = [{ value: "a", label: "A" }];
      expect(getFilterOptions({ options: opts })).toEqual(opts);
    });

    it("returns undefined for non-select filters", () => {
      expect(getFilterOptions(true)).toBeUndefined();
      expect(getFilterOptions(undefined)).toBeUndefined();
    });
  });

  // --- isMultipleSelect ---
  describe("isMultipleSelect", () => {
    it("returns true when multiple is true", () => {
      expect(isMultipleSelect({ options: [], multiple: true })).toBe(true);
    });

    it("returns false when multiple is missing", () => {
      expect(isMultipleSelect({ options: [] })).toBe(false);
    });

    it("returns false for non-select filters", () => {
      expect(isMultipleSelect(true)).toBe(false);
    });
  });

  // --- hasFilter ---
  describe("hasFilter", () => {
    it("returns true for truthy filter configs", () => {
      expect(hasFilter(true)).toBe(true);
      expect(hasFilter("keyword")).toBe(true);
      expect(hasFilter({ options: [] })).toBe(true);
    });

    it("returns false for undefined/null", () => {
      expect(hasFilter(undefined)).toBe(false);
    });
  });

  // --- type guards ---
  describe("type guards", () => {
    it("isSelectFilter detects select config", () => {
      expect(isSelectFilter({ options: [] })).toBe(true);
      expect(isSelectFilter(true as any)).toBe(false);
    });

    it("isSelectFilterWithField detects field + options", () => {
      expect(isSelectFilterWithField({ field: "f", options: [] })).toBe(true);
      expect(isSelectFilterWithField({ options: [] })).toBe(false);
    });

    it("isDateRangeFilter detects range config", () => {
      expect(isDateRangeFilter({ range: ["a", "b"] })).toBe(true);
      expect(isDateRangeFilter({ options: [] })).toBe(false);
    });
  });
});
