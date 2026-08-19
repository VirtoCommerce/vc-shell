import { describe, it, expect, vi } from "vitest";

// The global setup stubs createLogger with fresh spies per call, so a warning cannot be observed
// through it. Override locally with a spy we hold, as that setup file instructs.
const { loggerWarn } = vi.hoisted(() => ({ loggerWarn: vi.fn() }));
vi.mock("@core/utilities", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@core/utilities")>();
  return {
    ...actual,
    createLogger: () => ({ debug: vi.fn(), info: vi.fn(), warn: loggerWarn, error: vi.fn() }),
  };
});
import { ref, computed, defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { mountWithSetup } from "@framework/test-helpers";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import { useDataTablePagination } from "./useDataTablePagination";

describe("useDataTablePagination", () => {
  // Writing to currentPage behaves like setPage: the page moves but onPageChange never fires, so
  // the table keeps the previous page's rows. It stays writable — a readonly reactive property is
  // dropped SILENTLY in a production Vue build, which would break existing consumers with no
  // error at all — but it now says so.
  describe("deprecated currentPage assignment", () => {
    it("warns, changes the page, and does not fire onPageChange", () => {
      loggerWarn.mockClear();
      const onPageChange = vi.fn();
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(100), onPageChange }));

      result.currentPage = 3;

      expect(result.currentPage).toBe(3);
      expect(result.skip).toBe(40);
      expect(onPageChange).not.toHaveBeenCalled();
      expect(loggerWarn).toHaveBeenCalledOnce();
      expect(loggerWarn.mock.calls.flat().join(" ")).toContain("goToPage");
    });

    it("does not warn for goToPage or setPage", () => {
      loggerWarn.mockClear();
      const { result } = mountWithSetup(() => useDataTablePagination({ totalCount: ref(100) }));

      result.goToPage(2);
      result.setPage(4);
      result.reset();

      expect(result.currentPage).toBe(1);
      expect(loggerWarn).not.toHaveBeenCalled();
    });
  });

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

    // A restore does not fire onPageChange (correctly — it would double-load), so this is the
    // only signal a consumer has that its first load must start at the restored offset.
    // Without it, an unconditional load at skip 0 left the paginator on page N showing page 1's
    // rows, with no error and no way out (VCST-5664).
    it("reports the restored page so the consumer can seed its first load", () => {
      const result = harness({ read: () => ({ page: 3 }), write: vi.fn() });
      expect(result.restoredPage).toBe(3);
      expect(result.skip).toBe(40); // (3 - 1) * 20 — already correct, but only if the caller uses it
    });

    it("leaves restoredPage undefined when the URL carried no page", () => {
      const result = harness({ read: () => ({}), write: vi.fn() });
      expect(result.restoredPage).toBeUndefined();
      expect(result.currentPage).toBe(1);
    });

    // Without a provider the feature vanishes entirely — no sync, no restore — and that is
    // indistinguishable from "the URL had no page". Happens outside a blade and in unit tests.
    it("warns when stateKey is set but no provider is in scope", () => {
      loggerWarn.mockClear();
      const result = harness(undefined);

      expect(result.restoredPage).toBeUndefined();
      expect(loggerWarn).toHaveBeenCalledOnce();
      expect(loggerWarn.mock.calls.flat().join(" ")).toContain("offers_list");
    });

    it("does not warn on the internal seed from a restore", () => {
      loggerWarn.mockClear();
      const result = harness({ read: () => ({ page: 3 }), write: vi.fn() });
      // The restore goes through the raw ref, not the deprecated public setter.
      expect(result.currentPage).toBe(3);
      expect(loggerWarn).not.toHaveBeenCalled();
    });

    it("does not warn when a provider is present", () => {
      loggerWarn.mockClear();
      harness({ read: () => ({}), write: vi.fn() });
      expect(loggerWarn).not.toHaveBeenCalled();
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
