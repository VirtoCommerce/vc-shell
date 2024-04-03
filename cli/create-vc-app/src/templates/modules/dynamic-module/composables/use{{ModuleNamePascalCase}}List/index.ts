import { computed, ref, Ref } from "vue";
import {
  DynamicBladeList,
  ListBaseBladeScope,
  useBladeNavigation,
  useListFactory,
  type TOpenBladeArgs,
} from "@vc-shell/framework";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DynamicItemsScope extends ListBaseBladeScope {}

export default (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}) => {
  const factory = useListFactory({
    load: async () => {
      return {
        totalCount: 0,
        results: [],
      };
    },
    remove: () => {
      throw new Error("Function not implemented.");
    },
  });

  const { load, remove, items, pagination, loading, query } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(data?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("{{ModuleNamePascalCase}}Details"),
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
