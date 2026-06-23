import { describe, it, expect, vi } from "vitest";
import { defineComponent, h, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { TableQueryStateKey } from "@core/blade-navigation/table-query-state";
import type { ITableQueryStateService } from "@core/blade-navigation/table-query-state";
import { useTableSearch } from "./useTableSearch";

function harness(service: ITableQueryStateService | undefined, opts: { stateKey?: string; initial?: string } = {}) {
  let api!: ReturnType<typeof useTableSearch>;
  const Comp = defineComponent({
    setup() {
      api = useTableSearch(opts);
      return () => h("div");
    },
  });
  const wrapper = mount(Comp, { global: { provide: { [TableQueryStateKey as symbol]: service } } });
  return { wrapper, api };
}

describe("useTableSearch", () => {
  it("defaults to undefined and does not touch a service when no stateKey", () => {
    const write = vi.fn();
    const { api } = harness({ read: () => ({}), write });
    expect(api.searchValue.value).toBeUndefined();
    expect(write).not.toHaveBeenCalled();
  });

  it("seeds searchValue from the restored URL slice", () => {
    const read = vi.fn(() => ({ search: "foo" }));
    const { api } = harness({ read, write: vi.fn() }, { stateKey: "offers_list" });
    expect(read).toHaveBeenCalledWith("offers_list");
    expect(api.searchValue.value).toBe("foo");
  });

  it("writes the slice on change but not for the just-restored value", async () => {
    const write = vi.fn();
    const { api } = harness({ read: () => ({ search: "foo" }), write }, { stateKey: "offers_list" });
    await nextTick();
    expect(write).not.toHaveBeenCalled();

    api.searchValue.value = "bar";
    await nextTick();
    expect(write).toHaveBeenCalledWith("offers_list", { search: "bar" });
  });

  it("no-op when stateKey set but no service provided", () => {
    const { api } = harness(undefined, { stateKey: "offers_list" });
    expect(api.searchValue.value).toBeUndefined();
    expect(() => (api.searchValue.value = "x")).not.toThrow();
  });

  it("uses the initial option when nothing is restored from the URL", () => {
    const { api } = harness({ read: () => ({}), write: vi.fn() }, { stateKey: "offers_list", initial: "seed" });
    expect(api.searchValue.value).toBe("seed");
  });

  it("URL state overrides the initial option", () => {
    const { api } = harness(
      { read: () => ({ search: "fromUrl" }), write: vi.fn() },
      { stateKey: "offers_list", initial: "seed" },
    );
    expect(api.searchValue.value).toBe("fromUrl");
  });
});
