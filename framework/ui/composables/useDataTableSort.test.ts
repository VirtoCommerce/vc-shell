import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { useDataTableSort } from "./useDataTableSort";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";

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

  describe("stateKey URL sync", () => {
    function harness(service: ITableQueryStateService | undefined) {
      let result!: ReturnType<typeof useDataTableSort>;
      const Comp = defineComponent({
        setup() {
          result = useDataTableSort({ stateKey: "offers_list", initialField: "createdDate", initialDirection: "DESC" });
          return () => h("div");
        },
      });
      mount(Comp, { global: { provide: { [TableQueryStateKey as symbol]: service } } });
      return result;
    }

    it("seeds sortField/sortOrder from the restored URL slice", () => {
      const read = vi.fn(() => ({ sort: "name:DESC" }));
      const result = harness({ read, write: vi.fn() });
      expect(read).toHaveBeenCalledWith("offers_list");
      expect(result.sortField.value).toBe("name");
      expect(result.sortOrder.value).toBe(-1);
      expect(result.sortExpression.value).toBe("name:DESC");
    });

    it("writes the slice on sort change but not for the just-restored value", async () => {
      const write = vi.fn();
      const result = harness({ read: () => ({ sort: "name:DESC" }), write });
      await nextTick();
      expect(write).not.toHaveBeenCalled();

      result.sortField.value = "createdDate";
      result.sortOrder.value = 1;
      await nextTick();
      expect(write).toHaveBeenCalledWith("offers_list", { sort: "createdDate:ASC" });
    });

    it("writes undefined when sort is cleared (sortOrder 0)", async () => {
      const write = vi.fn();
      const result = harness({ read: () => ({ sort: "name:DESC" }), write });
      await nextTick();
      result.sortOrder.value = 0;
      await nextTick();
      expect(write).toHaveBeenCalledWith("offers_list", { sort: undefined });
    });

    it("no-op when stateKey set but no service provided", () => {
      const result = harness(undefined);
      expect(result.sortField.value).toBe("createdDate");
      expect(result.sortOrder.value).toBe(-1);
    });
  });
});
