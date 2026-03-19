import { describe, it, expect, vi } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useTableSort } from "./useTableSort";

// Mock createLogger
vi.mock("@core/utilities", () => ({
  createLogger: () => ({
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("useTableSort", () => {
  describe("initialization", () => {
    it("initializes with null sort state by default", () => {
      const { result } = mountWithSetup(() => useTableSort());
      expect(result.currentSort.value).toEqual({ property: null, direction: null });
      expect(result.sortExpression.value).toBeUndefined();
    });

    it("initializes with provided initial values", () => {
      const { result } = mountWithSetup(() =>
        useTableSort({ initialProperty: "name", initialDirection: "ASC" }),
      );
      expect(result.currentSort.value).toEqual({ property: "name", direction: "ASC" });
      expect(result.sortExpression.value).toBe("name:ASC");
    });
  });

  describe("handleSortChange", () => {
    it("sets sort from 'property:DIRECTION' format", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name:ASC");
      expect(result.currentSort.value).toEqual({ property: "name", direction: "ASC" });
      expect(result.sortExpression.value).toBe("name:ASC");
    });

    it("handles lowercase direction", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("price:desc");
      expect(result.currentSort.value).toEqual({ property: "price", direction: "DESC" });
    });

    it("defaults to ASC when only property name is given (new column)", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name");
      expect(result.currentSort.value).toEqual({ property: "name", direction: "ASC" });
    });

    it("toggles ASC -> DESC on same column without direction", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name");
      expect(result.currentSort.value.direction).toBe("ASC");
      result.handleSortChange("name");
      expect(result.currentSort.value.direction).toBe("DESC");
    });

    it("toggles DESC -> clear on same column without direction (3-state cycle)", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name");
      result.handleSortChange("name"); // ASC -> DESC
      result.handleSortChange("name"); // DESC -> clear
      expect(result.currentSort.value).toEqual({ property: null, direction: null });
      expect(result.sortExpression.value).toBeUndefined();
    });

    it("sets explicit direction on same column when direction provided", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name:ASC");
      result.handleSortChange("name:DESC");
      expect(result.currentSort.value.direction).toBe("DESC");
    });

    it("switches to new column with ASC default", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name:DESC");
      result.handleSortChange("price");
      expect(result.currentSort.value).toEqual({ property: "price", direction: "ASC" });
    });

    it("switches to new column with explicit direction", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name:ASC");
      result.handleSortChange("price:DESC");
      expect(result.currentSort.value).toEqual({ property: "price", direction: "DESC" });
    });

    it("handles invalid direction in format", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name:INVALID");
      // newSortDirection is undefined, so it defaults to "ASC" for new column
      expect(result.currentSort.value).toEqual({ property: "name", direction: "ASC" });
    });
  });

  describe("currentSort writable computed", () => {
    it("allows direct set via computed setter", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.currentSort.value = { property: "date", direction: "DESC" };
      expect(result.sortExpression.value).toBe("date:DESC");
    });

    it("clears sort via setter", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name:ASC");
      result.currentSort.value = { property: null, direction: null };
      expect(result.sortExpression.value).toBeUndefined();
    });
  });

  describe("resetSort", () => {
    it("resets to null when no initial options", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("name:ASC");
      result.resetSort();
      expect(result.currentSort.value).toEqual({ property: null, direction: null });
    });

    it("resets to initial values when options provided", () => {
      const { result } = mountWithSetup(() =>
        useTableSort({ initialProperty: "date", initialDirection: "DESC" }),
      );
      result.handleSortChange("name:ASC");
      result.resetSort();
      expect(result.currentSort.value).toEqual({ property: "date", direction: "DESC" });
    });
  });

  describe("sortExpression", () => {
    it("is undefined when no sort is active", () => {
      const { result } = mountWithSetup(() => useTableSort());
      expect(result.sortExpression.value).toBeUndefined();
    });

    it("returns property:direction format when sort is active", () => {
      const { result } = mountWithSetup(() => useTableSort());
      result.handleSortChange("title:ASC");
      expect(result.sortExpression.value).toBe("title:ASC");
    });
  });
});
