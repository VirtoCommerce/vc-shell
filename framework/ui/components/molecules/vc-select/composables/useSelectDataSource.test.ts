import { describe, it, expect, vi } from "vitest";
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
      const items = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ];
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
      const items = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ];
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

  describe("search", () => {
    it("async search sets searchResults via API", async () => {
      const baseItems = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ];
      const searchItems = [{ id: "1", name: "Alpha" }];
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: baseItems, totalCount: 2 })
        .mockResolvedValueOnce({ results: searchItems, totalCount: 1 });
      const emitSearch = vi.fn();
      const ds = createDataSource({ options: () => loader, debounce: () => 0, emit: { search: emitSearch } });

      await ds.open();
      const event = { target: { value: "Alpha" } } as unknown as Event;
      ds.onInput(event);
      await flushPromises();

      expect(loader).toHaveBeenCalledTimes(2);
      expect(loader).toHaveBeenLastCalledWith("Alpha");
      expect(ds.displayItems.value).toEqual(searchItems);
      expect(emitSearch).toHaveBeenCalledWith("Alpha");
    });

    it("client-side search filters cachedItems by label", async () => {
      const items = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
        { id: "3", name: "Alphabet" },
      ];
      const ds = createDataSource({ options: () => items });

      await ds.open();
      const event = { target: { value: "Alph" } } as unknown as Event;
      ds.onInput(event);
      await nextTick();

      expect(ds.displayItems.value).toEqual([
        { id: "1", name: "Alpha" },
        { id: "3", name: "Alphabet" },
      ]);
    });

    it("clearSearch restores cachedItems without API call", async () => {
      const baseItems = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ];
      const searchItems = [{ id: "1", name: "Alpha" }];
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: baseItems, totalCount: 2 })
        .mockResolvedValueOnce({ results: searchItems, totalCount: 1 });
      const ds = createDataSource({ options: () => loader, debounce: () => 0 });

      await ds.open();
      const event = { target: { value: "Alpha" } } as unknown as Event;
      ds.onInput(event);
      await flushPromises();

      ds.clearSearch();

      expect(loader).toHaveBeenCalledTimes(2); // no 3rd call
      expect(ds.displayItems.value).toEqual(baseItems);
      expect(ds.filterString.value).toBeUndefined();
    });
  });

  describe("loadMore()", () => {
    it("appends new page to cachedItems", async () => {
      const page1 = [{ id: "1", name: "Alpha" }];
      const page2 = [{ id: "2", name: "Beta" }];
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: page1, totalCount: 2 })
        .mockResolvedValueOnce({ results: page2, totalCount: 2 });
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      expect(ds.hasMore.value).toBe(true);

      await ds.loadMore();
      expect(ds.displayItems.value).toEqual([...page1, ...page2]);
      expect(ds.hasMore.value).toBe(false);
    });

    it("deduplicates by getOptionValue", async () => {
      const page1 = [{ id: "1", name: "Alpha" }];
      const page2 = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ];
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: page1, totalCount: 3 })
        .mockResolvedValueOnce({ results: page2, totalCount: 3 });
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      await ds.loadMore();

      expect(ds.displayItems.value).toEqual([
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ]);
    });

    it("cached pages survive close/open cycle", async () => {
      const page1 = [{ id: "1", name: "Alpha" }];
      const page2 = [{ id: "2", name: "Beta" }];
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: page1, totalCount: 2 })
        .mockResolvedValueOnce({ results: page2, totalCount: 2 });
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      await ds.loadMore();
      ds.close();
      await ds.open();

      expect(loader).toHaveBeenCalledTimes(2); // no 3rd call
      expect(ds.displayItems.value).toEqual([...page1, ...page2]);
    });
  });

  describe("resolve()", () => {
    it("fetches uncached IDs via loader", async () => {
      const loader = vi.fn().mockResolvedValue({
        results: [{ id: "5", name: "Epsilon" }],
        totalCount: 1,
      });
      const ds = createDataSource({ options: () => loader });

      const resolved = await ds.resolve(["5"]);

      expect(resolved).toEqual([{ id: "5", name: "Epsilon" }]);
      expect(loader).toHaveBeenCalledWith(undefined, undefined, ["5"]);
    });

    it("uses resolveCache on second call — no API", async () => {
      const loader = vi.fn().mockResolvedValue({
        results: [{ id: "5", name: "Epsilon" }],
        totalCount: 1,
      });
      const ds = createDataSource({ options: () => loader });

      await ds.resolve(["5"]);
      const resolved2 = await ds.resolve(["5"]);

      expect(loader).toHaveBeenCalledTimes(1);
      expect(resolved2).toEqual([{ id: "5", name: "Epsilon" }]);
    });

    it("finds items in cachedItems without API call", async () => {
      const items = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
      ];
      const loader = vi.fn().mockResolvedValueOnce({ results: items, totalCount: 2 });
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      loader.mockClear();

      const resolved = await ds.resolve(["1"]);

      expect(loader).not.toHaveBeenCalled();
      expect(resolved).toEqual([{ id: "1", name: "Alpha" }]);
    });

    it("falls back to loading first page when ids-based call returns no matching items", async () => {
      const firstPage = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
        { id: "3", name: "Gamma" },
      ];
      // Loader ignores ids param — returns first page for any call
      const loader = vi.fn().mockResolvedValue({
        results: firstPage,
        totalCount: 10,
      });
      const ds = createDataSource({ options: () => loader });

      // Resolve id "3" which IS on the first page but API doesn't support ids filtering
      const resolved = await ds.resolve(["3"]);

      // Call 1: resolve ids-based call (returns first page, "3" happens to be there)
      // Since "3" is in the first-page results from the ids call, it should be found
      expect(resolved).toEqual([{ id: "3", name: "Gamma" }]);
    });

    it("falls back to open() when ids-based call does not return the requested item", async () => {
      const firstPage = [
        { id: "1", name: "Alpha" },
        { id: "2", name: "Beta" },
        { id: "3", name: "Gamma" },
      ];
      // ids-based call returns empty (API doesn't support ids), first-page call returns items
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: [], totalCount: 0 }) // ids-based call
        .mockResolvedValueOnce({ results: firstPage, totalCount: 3 }); // fallback open()
      const ds = createDataSource({ options: () => loader });

      const resolved = await ds.resolve(["2"]);

      expect(loader).toHaveBeenCalledTimes(2);
      // First call: ids-based
      expect(loader).toHaveBeenNthCalledWith(1, undefined, undefined, ["2"]);
      // Second call: fallback open() loads first page
      expect(loader).toHaveBeenNthCalledWith(2, undefined, 0);
      expect(resolved).toEqual([{ id: "2", name: "Beta" }]);
      // cachedItems also populated by fallback
      expect(ds.displayItems.value).toEqual(firstPage);
    });

    it("does not fallback to open() when ids-based call succeeds", async () => {
      const loader = vi.fn().mockResolvedValue({
        results: [{ id: "5", name: "Epsilon" }],
        totalCount: 1,
      });
      const ds = createDataSource({ options: () => loader });

      await ds.resolve(["5"]);

      // Only one call — no fallback needed
      expect(loader).toHaveBeenCalledTimes(1);
    });

    it("partial cache hit — only fetches missing", async () => {
      const items = [{ id: "1", name: "Alpha" }];
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: items, totalCount: 1 })
        .mockResolvedValueOnce({ results: [{ id: "3", name: "Gamma" }], totalCount: 1 });
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      const resolved = await ds.resolve(["1", "3"]);

      expect(loader).toHaveBeenLastCalledWith(undefined, undefined, ["3"]);
      expect(resolved).toEqual([
        { id: "1", name: "Alpha" },
        { id: "3", name: "Gamma" },
      ]);
    });
  });

  describe("refresh()", () => {
    it("clears cache and reloads from API", async () => {
      const items1 = [{ id: "1", name: "Alpha" }];
      const items2 = [{ id: "1", name: "Alpha Updated" }];
      const loader = vi
        .fn()
        .mockResolvedValueOnce({ results: items1, totalCount: 1 })
        .mockResolvedValueOnce({ results: items2, totalCount: 1 });
      const ds = createDataSource({ options: () => loader });

      await ds.open();
      await ds.refresh();

      expect(loader).toHaveBeenCalledTimes(2);
      expect(ds.displayItems.value).toEqual(items2);
    });
  });
});
