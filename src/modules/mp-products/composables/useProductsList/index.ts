import { DynamicBladeList, useBladeNavigation } from "@vc-shell/framework";
import { useProductsList } from "../../../products/composables/useProductsList";
import { Ref, computed, ref } from "vue";
import * as _ from "lodash-es";

export const useProductsListExtended = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
}): ReturnType<typeof useProductsList> => {
  const { items, load, loading, query, pagination, remove, scope } = useProductsList(args);
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const loadWrap = async () => {
    query.value = Object.assign(query.value, { isPublished: true, searchFromAllSellers: true });

    await load(query.value);
  };

  async function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    await openBlade({
      blade: resolveBladeByName("MpProduct"),
      ...args,
    });
  }

  const extendedScope = _.merge(
    ref({}),
    ref(scope?.value),
    ref({
      openDetailsBlade,
    }),
  );

  return { items, load: loadWrap, loading, query, pagination, remove, scope: computed(() => extendedScope.value) };
};
