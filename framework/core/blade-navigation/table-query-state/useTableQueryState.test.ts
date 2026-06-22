import { describe, it, expect, vi } from "vitest";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { TableQueryStateKey } from "./types";
import type { ITableQueryStateService, TableQueryPatch } from "./types";
import { useTableQueryState } from "./useTableQueryState";

function harness(service: ITableQueryStateService | undefined, stateKey?: string) {
  let patch: TableQueryPatch | undefined;
  const Comp = defineComponent({
    setup() {
      patch = useTableQueryState(stateKey).read();
      return () => h("div");
    },
  });
  mount(Comp, { global: { provide: { [TableQueryStateKey as symbol]: service } } });
  return patch!;
}

describe("useTableQueryState", () => {
  it("returns the restored patch from the injected service", () => {
    const read = vi.fn(() => ({ sort: "name:DESC", search: "foo", page: 3 }));
    const patch = harness({ read, write: vi.fn() });
    expect(patch).toEqual({ sort: "name:DESC", search: "foo", page: 3 });
  });

  it("forwards the stateKey to the service", () => {
    const read = vi.fn(() => ({}));
    harness({ read, write: vi.fn() }, "offers_list");
    expect(read).toHaveBeenCalledWith("offers_list");
  });

  it("returns an empty patch when no service is provided", () => {
    const patch = harness(undefined);
    expect(patch).toEqual({});
  });
});
