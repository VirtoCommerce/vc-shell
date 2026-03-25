import { describe, it, expect } from "vitest";
import { computed, defineComponent, h, provide, ref } from "vue";
import { mount } from "@vue/test-utils";
import { useTableContext } from "./useTableContext";
import { TableContextKey, type TableContext } from "@ui/components/organisms/vc-data-table/keys";

function mountWithTableContext<T>(setupFn: () => T, ctx: TableContext) {
  let result: T;
  const Inner = defineComponent({
    setup() {
      result = setupFn();
      return () => h("div");
    },
  });
  const Outer = defineComponent({
    setup() {
      provide(TableContextKey, ctx);
      return () => h(Inner);
    },
  });
  const wrapper = mount(Outer);
  return { result: result!, wrapper };
}

describe("useTableContext", () => {
  it("returns null when no provider exists", () => {
    let result: ReturnType<typeof useTableContext> | undefined;
    const Comp = defineComponent({
      setup() {
        result = useTableContext();
        return () => h("div");
      },
    });
    mount(Comp);
    expect(result).toBeNull();
  });

  it("returns the provided context when provider exists", () => {
    const ctx: TableContext = {
      selectedRowIndex: computed(() => 5),
      setSelectedRowIndex: () => {},
      variant: computed(() => "default"),
    };
    const { result } = mountWithTableContext(() => useTableContext(), ctx);
    expect(result).not.toBeNull();
    expect(result!.selectedRowIndex.value).toBe(5);
    expect(result!.variant.value).toBe("default");
  });
});
