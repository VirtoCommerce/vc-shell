import { describe, it, expect } from "vitest";
import { mountWithSetup } from "@framework/test-helpers";
import { useDataTableSort } from "./useDataTableSort";

describe("useDataTableSort", () => {
  describe("initialization", () => {
    it("initializes with undefined/0 by default", () => {
      const { result } = mountWithSetup(() => useDataTableSort());
      expect(result.sortField.value).toBeUndefined();
      expect(result.sortOrder.value).toBe(0);
      expect(result.sortExpression.value).toBeUndefined();
    });

    it("initializes with provided field and direction DESC", () => {
      const { result } = mountWithSetup(() =>
        useDataTableSort({ initialField: "createdDate", initialDirection: "DESC" }),
      );
      expect(result.sortField.value).toBe("createdDate");
      expect(result.sortOrder.value).toBe(-1);
      expect(result.sortExpression.value).toBe("createdDate:DESC");
    });

    it("initializes with provided field and direction ASC", () => {
      const { result } = mountWithSetup(() => useDataTableSort({ initialField: "name", initialDirection: "ASC" }));
      expect(result.sortField.value).toBe("name");
      expect(result.sortOrder.value).toBe(1);
      expect(result.sortExpression.value).toBe("name:ASC");
    });
  });

  describe("sortExpression", () => {
    it("returns undefined when sortField is undefined", () => {
      const { result } = mountWithSetup(() => useDataTableSort());
      expect(result.sortExpression.value).toBeUndefined();
    });

    it("returns undefined when sortOrder is 0", () => {
      const { result } = mountWithSetup(() => useDataTableSort({ initialField: "name", initialDirection: "ASC" }));
      result.sortOrder.value = 0;
      expect(result.sortExpression.value).toBeUndefined();
    });

    it("maps sortOrder 1 to ASC", () => {
      const { result } = mountWithSetup(() => useDataTableSort());
      result.sortField.value = "name";
      result.sortOrder.value = 1;
      expect(result.sortExpression.value).toBe("name:ASC");
    });

    it("maps sortOrder -1 to DESC", () => {
      const { result } = mountWithSetup(() => useDataTableSort());
      result.sortField.value = "price";
      result.sortOrder.value = -1;
      expect(result.sortExpression.value).toBe("price:DESC");
    });
  });

  describe("resetSort", () => {
    it("resets to initial values", () => {
      const { result } = mountWithSetup(() => useDataTableSort({ initialField: "date", initialDirection: "DESC" }));
      result.sortField.value = "name";
      result.sortOrder.value = 1;
      result.resetSort();
      expect(result.sortField.value).toBe("date");
      expect(result.sortOrder.value).toBe(-1);
      expect(result.sortExpression.value).toBe("date:DESC");
    });

    it("resets to undefined/0 when no initial options", () => {
      const { result } = mountWithSetup(() => useDataTableSort());
      result.sortField.value = "name";
      result.sortOrder.value = 1;
      result.resetSort();
      expect(result.sortField.value).toBeUndefined();
      expect(result.sortOrder.value).toBe(0);
      expect(result.sortExpression.value).toBeUndefined();
    });
  });

  describe("v-model reactivity", () => {
    it("sortExpression updates when sortField changes", () => {
      const { result } = mountWithSetup(() => useDataTableSort({ initialField: "name", initialDirection: "ASC" }));
      expect(result.sortExpression.value).toBe("name:ASC");
      result.sortField.value = "price";
      expect(result.sortExpression.value).toBe("price:ASC");
    });

    it("sortExpression updates when sortOrder changes", () => {
      const { result } = mountWithSetup(() => useDataTableSort({ initialField: "name", initialDirection: "ASC" }));
      result.sortOrder.value = -1;
      expect(result.sortExpression.value).toBe("name:DESC");
    });
  });
});
