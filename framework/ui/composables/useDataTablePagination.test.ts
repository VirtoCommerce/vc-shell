import { describe, it, expect, vi } from "vitest";
import { ref, computed } from "vue";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import { useDataTablePagination } from "./useDataTablePagination";

describe("useDataTablePagination", () => {
  describe("initialization", () => {
    it("initializes with page 1, skip 0, default pageSize 20", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(100) }));
      expect(result.currentPage).toBe(1);
      expect(result.skip).toBe(0);
      expect(result.pageSize).toBe(20);
    });

    it("computes pages from totalCount and pageSize", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(95), pageSize: 20 }));
      expect(result.pages).toBe(5); // ceil(95/20) = 5
    });

    it("accepts custom pageSize", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(50), pageSize: 10 }));
      expect(result.pageSize).toBe(10);
      expect(result.pages).toBe(5);
    });

    it("returns pages=0 when totalCount is 0", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(0) }));
      expect(result.pages).toBe(0);
    });

    it("exposes totalCount as a reactive property", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(95), pageSize: 20 }));
      expect(result.totalCount).toBe(95);
    });
  });

  describe("goToPage", () => {
    it("updates currentPage and skip", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(100), pageSize: 20 }));
      result.goToPage(3);
      expect(result.currentPage).toBe(3);
      expect(result.skip).toBe(40); // (3-1)*20
    });

    it("fires onPageChange with page and skip", () => {
      const onPageChange = vi.fn();
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100), pageSize: 20, onPageChange }),
      );
      result.goToPage(5);
      expect(onPageChange).toHaveBeenCalledOnce();
      expect(onPageChange).toHaveBeenCalledWith({ page: 5, skip: 80 });
    });

    it("does not throw when onPageChange is not provided", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(100) }));
      expect(() => result.goToPage(2)).not.toThrow();
    });
  });

  describe("setPage", () => {
    it("updates currentPage and skip", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(100), pageSize: 20 }));
      result.setPage(3);
      expect(result.currentPage).toBe(3);
      expect(result.skip).toBe(40);
    });

    it("does NOT fire onPageChange", () => {
      const onPageChange = vi.fn();
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100), pageSize: 20, onPageChange }),
      );
      result.setPage(4);
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe("reset", () => {
    it("resets currentPage to 1", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(100), pageSize: 20 }));
      result.goToPage(4);
      expect(result.currentPage).toBe(4);
      result.reset();
      expect(result.currentPage).toBe(1);
      expect(result.skip).toBe(0);
    });

    it("does NOT fire onPageChange", () => {
      const onPageChange = vi.fn();
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100), pageSize: 20, onPageChange }),
      );
      result.goToPage(3);
      onPageChange.mockClear();
      result.reset();
      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe("direct VcDataTable binding", () => {
    it("return object has plain numbers passable as :pagination prop", () => {
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(45), pageSize: 10 }));
      result.goToPage(2);
      // reactive() unwraps refs — VcDataTable receives plain numbers
      expect(result.currentPage).toBe(2);
      expect(result.pages).toBe(5);
      expect(result.pageSize).toBe(10);
      expect(typeof result.currentPage).toBe("number");
      expect(typeof result.pages).toBe("number");
    });
  });

  describe("reactivity", () => {
    it("pages and totalCount recompute when totalCount changes", () => {
      const totalCount = ref(100);
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount, pageSize: 20 }));
      expect(result.pages).toBe(5);
      expect(result.totalCount).toBe(100);
      totalCount.value = 50;
      expect(result.pages).toBe(3); // ceil(50/20) = 3
      expect(result.totalCount).toBe(50);
    });

    it("accepts pageSize as a reactive getter", () => {
      const size = ref(10);
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100), pageSize: computed(() => size.value) }),
      );
      expect(result.pages).toBe(10); // 100/10
      size.value = 25;
      expect(result.pages).toBe(4); // 100/25
      expect(result.pageSize).toBe(25);
    });

    it("skip recomputes after goToPage and pageSize change", () => {
      const size = ref(20);
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(200), pageSize: computed(() => size.value) }),
      );
      result.goToPage(3);
      expect(result.skip).toBe(40); // (3-1)*20
      size.value = 50;
      expect(result.skip).toBe(100); // (3-1)*50
    });
  });

  describe("stateKey URL sync", () => {
    function harness(
      service: ITableQueryStateService | undefined,
      onPageChange?: (s: { page: number; skip: number }) => void,
    ) {
      let result!: ReturnType<typeof useDataTablePagination>;
      const Comp = defineComponent({
        setup() {
          result = useDataTablePagination({
            stateKey: "offers_list",
            totalCount: ref(100),
            pageSize: 20,
            onPageChange,
          });
          return () => h("div");
        },
      });
      mount(Comp, { global: { provide: { [TableQueryStateKey as symbol]: service } } });
      return result;
    }

    it("seeds currentPage from the restored URL slice without firing onPageChange", () => {
      const read = vi.fn(() => ({ page: 3 }));
      const onPageChange = vi.fn();
      const result = harness({ read, write: vi.fn() }, onPageChange);
      expect(read).toHaveBeenCalledWith("offers_list");
      expect(result.currentPage).toBe(3);
      expect(onPageChange).not.toHaveBeenCalled();
    });

    it("writes the slice on page change (page 1 clears the param)", async () => {
      const write = vi.fn();
      const result = harness({ read: () => ({ page: 3 }), write });
      await nextTick();
      expect(write).not.toHaveBeenCalled();

      result.goToPage(4);
      await nextTick();
      expect(write).toHaveBeenCalledWith("offers_list", { page: 4 });

      result.goToPage(1);
      await nextTick();
      expect(write).toHaveBeenCalledWith("offers_list", { page: undefined });
    });
  });
});
