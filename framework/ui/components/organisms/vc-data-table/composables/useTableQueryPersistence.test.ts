import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { mount } from "@vue/test-utils";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import { useTableQueryPersistence } from "./useTableQueryPersistence";

function harness(service: ITableQueryStateService | undefined, initialProps: Record<string, unknown> = {}) {
  const emitted: Array<[string, unknown]> = [];
  const internalSearchValue = ref("");

  const Comp = defineComponent({
    props: ["sortField", "sortOrder", "searchValue", "pagination", "stateKey"],
    setup(props) {
      useTableQueryPersistence({
        props: props as never,
        emit: ((event: string, value: unknown) => emitted.push([event, value])) as never,
        internalSearchValue,
      });
      return () => h("div");
    },
  });

  const wrapper = mount(Comp, {
    props: {
      sortField: undefined,
      sortOrder: 0,
      searchValue: undefined,
      pagination: undefined,
      stateKey: undefined,
      ...initialProps,
    },
    global: { provide: { [TableQueryStateKey as symbol]: service } },
  });

  return { wrapper, emitted, internalSearchValue };
}

describe("useTableQueryPersistence", () => {
  it("does nothing when no service is provided", async () => {
    const { emitted } = harness(undefined, { pagination: { currentPage: 1, pages: 5 } });
    await nextTick();
    expect(emitted).toEqual([]);
  });

  it("seeds sort/search/page from the service on init", async () => {
    const service: ITableQueryStateService = {
      read: () => ({ sort: "name:DESC", search: "foo", page: 3 }),
      write: vi.fn(),
    };
    const { emitted, internalSearchValue } = harness(service);

    expect(emitted).toContainEqual(["update:sortField", "name"]);
    expect(emitted).toContainEqual(["update:sortOrder", -1]);
    expect(emitted).toContainEqual(["sort", { sortField: "name", sortOrder: -1 }]);
    expect(emitted).toContainEqual(["update:searchValue", "foo"]);
    expect(emitted).toContainEqual(["search", "foo"]);
    expect(emitted).toContainEqual(["pagination-click", 3]);
    expect(internalSearchValue.value).toBe("foo");
  });

  it("does NOT write back the value it just restored (echo dedup)", async () => {
    const write = vi.fn();
    const service: ITableQueryStateService = { read: () => ({ page: 2 }), write };
    const { wrapper } = harness(service, { pagination: { currentPage: 1, pages: 5 } });

    // Parent applies the restored page (echo) after the pagination-click emit.
    await wrapper.setProps({ pagination: { currentPage: 2, pages: 5 } });
    await nextTick();

    // restored.page (2) was recorded as last-applied → echo to 2 is skipped.
    expect(write).not.toHaveBeenCalled();
  });

  it("writes a genuine sort change", async () => {
    const write = vi.fn();
    const service: ITableQueryStateService = { read: () => ({}), write };
    const { wrapper } = harness(service);

    await wrapper.setProps({ sortField: "createdDate", sortOrder: -1 });
    await nextTick();

    expect(write).toHaveBeenCalledWith(undefined, { sort: "createdDate:DESC" });
  });

  it("writes a genuine page change", async () => {
    const write = vi.fn();
    const service: ITableQueryStateService = { read: () => ({}), write };
    const { wrapper } = harness(service, { pagination: { currentPage: 1, pages: 5 } });

    await wrapper.setProps({ pagination: { currentPage: 4, pages: 5 } });
    await nextTick();

    expect(write).toHaveBeenCalledWith(undefined, { page: 4 });
  });

  it("clears the page param (writes undefined) when navigating to page 1", async () => {
    const write = vi.fn();
    const service: ITableQueryStateService = { read: () => ({ page: 3 }), write };
    const { wrapper } = harness(service, { pagination: { currentPage: 3, pages: 5 } });

    await wrapper.setProps({ pagination: { currentPage: 1, pages: 5 } });
    await nextTick();

    expect(write).toHaveBeenCalledWith(undefined, { page: undefined });
  });
});
