import { computed, ref, Ref } from "vue";
import { DynamicBladeList, ListBaseBladeScope, useBladeNavigation, useListFactory } from "@vc-shell/framework";
import { loadMockItemsList } from "../../../mocks";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DynamicItemsScope extends ListBaseBladeScope {}

export default (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}) => {
  const factory = useListFactory({
    load: async () => {
      return await loadMockItemsList();
    },
    remove: () => {
      throw new Error("Function not implemented.");
    }
  });

  const { load, remove, items, pagination, loading, query } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(data?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    await openBlade({
      blade: resolveBladeByName("DynamicItem"),
      ...data,
    });
  }

  const scope = ref<DynamicItemsScope>({
    openDetailsBlade,
    deleteItem: () => {
      alert("Delete item");
    },
  });

  return {
    items,
    load,
    remove,
    loading,
    pagination,
    query,
    scope: computed(() => scope.value),
  };
};
