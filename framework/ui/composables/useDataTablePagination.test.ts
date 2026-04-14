import { describe, it, expect, vi } from "vitest";
import { ref, computed } from "vue";
import { mountWithSetup } from "@framework/test-helpers";
import { useDataTablePagination } from "./useDataTablePagination";

describe("useDataTablePagination", () => {
  describe("initialization", () => {
    it("initializes with page 1, skip 0, default pageSize 20", () => {
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100) }),
      );
      expect(result.currentPage.value).toBe(1);
      expect(result.skip.value).toBe(0);
      expect(result.pageSize.value).toBe(20);
    });

    it("computes pages from totalCount and pageSize", () => {
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(95), pageSize: 20 }),
      );
      expect(result.pages.value).toBe(5); // ceil(95/20) = 5
    });

    it("accepts custom pageSize", () => {
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(50), pageSize: 10 }),
      );
      expect(result.pageSize.value).toBe(10);
      expect(result.pages.value).toBe(5);
    });

    it("returns pages=0 when totalCount is 0", () => {
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(0) }),
      );
      expect(result.pages.value).toBe(0);
    });
  });

  describe("goToPage", () => {
    it("updates currentPage and skip", () => {
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100), pageSize: 20 }),
      );
      result.goToPage(3);
      expect(result.currentPage.value).toBe(3);
      expect(result.skip.value).toBe(40); // (3-1)*20
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
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100) }),
      );
      expect(() => result.goToPage(2)).not.toThrow();
    });
  });

  describe("reset", () => {
    it("resets currentPage to 1", () => {
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100), pageSize: 20 }),
      );
      result.goToPage(4);
      expect(result.currentPage.value).toBe(4);
      result.reset();
      expect(result.currentPage.value).toBe(1);
      expect(result.skip.value).toBe(0);
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

  describe("paginationProps", () => {
    it("returns object matching DataTablePagination shape", () => {
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(45), pageSize: 10 }),
      );
      result.goToPage(2);
      expect(result.paginationProps.value).toEqual({
        currentPage: 2,
        pages: 5,
        pageSize: 10,
      });
    });
  });

  describe("reactivity", () => {
    it("pages recomputes when totalCount changes", () => {
      const totalCount = ref(100);
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount, pageSize: 20 }),
      );
      expect(result.pages.value).toBe(5);
      totalCount.value = 50;
      expect(result.pages.value).toBe(3); // ceil(50/20) = 3
    });

    it("accepts pageSize as a reactive getter", () => {
      const size = ref(10);
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(100), pageSize: computed(() => size.value) }),
      );
      expect(result.pages.value).toBe(10); // 100/10
      size.value = 25;
      expect(result.pages.value).toBe(4); // 100/25
      expect(result.pageSize.value).toBe(25);
    });

    it("skip recomputes after goToPage and pageSize change", () => {
      const size = ref(20);
      const { result } = mountWithSetup(() =>
        useDataTablePagination({ totalCount: ref(200), pageSize: computed(() => size.value) }),
      );
      result.goToPage(3);
      expect(result.skip.value).toBe(40); // (3-1)*20
      size.value = 50;
      expect(result.skip.value).toBe(100); // (3-1)*50
    });
  });
});
