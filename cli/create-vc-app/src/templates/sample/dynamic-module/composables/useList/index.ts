import { computed, ref, Ref } from "vue";
import {
  DynamicBladeList,
  ListBaseBladeScope,
  useBladeNavigation,
  useListFactory,
  type TOpenBladeArgs,
  UseList,
} from "@vc-shell/framework";
import { loadMockItemsList, removeMockItem } from "../../sample-data/methods";
import { MockedItem, MockedQuery } from "../../sample-data";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DynamicItemsScope extends ListBaseBladeScope {}

export default (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}): UseList<MockedItem[], MockedQuery, DynamicItemsScope> => {
  const factory = useListFactory<MockedItem[], MockedQuery>({
    load: loadMockItemsList,
    remove: async (query, customQuery) => {
      if (customQuery?.ids === null) return;
      for (const id of customQuery.ids) {
        await removeMockItem({ id });
      }
    },
  });

  const { load, remove, items, pagination, loading, query } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(data?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("SampleDetails"),
      ...data,
    });
  }

  const scope = ref<DynamicItemsScope>({
    openDetailsBlade,
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
