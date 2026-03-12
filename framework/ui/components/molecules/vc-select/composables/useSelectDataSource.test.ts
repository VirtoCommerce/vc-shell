import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed, nextTick } from "vue";
import { useSelectDataSource } from "./useSelectDataSource";

// Helper: create a mock async loader
function createMockLoader(items: any[] = [], totalCount?: number) {
  return vi.fn().mockResolvedValue({
    results: items,
    totalCount: totalCount ?? items.length,
  });
}

// Helper: flush all pending promises
function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

// Helper: standard options factory
function createDataSource(overrides: Record<string, any> = {}) {
  const defaults = {
    options: () => [] as any[],
    getOptionValue: computed(() => (opt: any) => opt.id),
    getOptionLabel: computed(() => (opt: any) => opt.name),
    isSelectVisible: ref(true),
    debounce: () => 0,
    emit: { search: vi.fn() },
  };
  return useSelectDataSource({ ...defaults, ...overrides });
}

describe("useSelectDataSource", () => {
  describe("open()", () => {
    it("loads data on first open for async loader", async () => {
      const items = [{ id: "1", name: "Alpha" }, { id: "2", name: "Beta" }];
      const loader = createMockLoader(items, 2);
      const ds = createDataSource({ options: () => loader });

      await ds.open();

      expect(loader).toHaveBeenCalledTimes(1);
      expect(ds.displayItems.value).toEqual(items);
      expect(ds.loading.value).toBe(false);
    });

    it("uses cache on second open — no additional API call", async () => {
      const items = [{ id: "1", name: "Alpha" }];
      const loader = createMockLoader(items, 1);
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      ds.close();
      await ds.open();

      expect(loader).toHaveBeenCalledTimes(1);
      expect(ds.displayItems.value).toEqual(items);
    });

    it("loads static array on first open", async () => {
      const items = [{ id: "1", name: "Alpha" }, { id: "2", name: "Beta" }];
      const ds = createDataSource({ options: () => items });

      await ds.open();

      expect(ds.displayItems.value).toEqual(items);
    });

    it("caches empty results — no re-fetch on second open", async () => {
      const loader = createMockLoader([], 0);
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      ds.close();
      await ds.open();

      expect(loader).toHaveBeenCalledTimes(1);
      expect(ds.displayItems.value).toEqual([]);
    });
  });

  describe("close()", () => {
    it("clears search results without API call", async () => {
      const items = [{ id: "1", name: "Alpha" }];
      const loader = createMockLoader(items, 1);
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      ds.close();

      expect(loader).toHaveBeenCalledTimes(1); // no additional call
      expect(ds.filterString.value).toBeUndefined();
    });
  });
});
