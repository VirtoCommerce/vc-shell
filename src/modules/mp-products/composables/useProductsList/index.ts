import { DynamicBladeList, useBladeNavigation } from "@vc-shell/framework";
import { useProductsList } from "../../../products/composables/useProductsList";
import { ref } from "vue";

export const useProductsListExtended = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"];
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
}) => {
  const { items, load, loading, query, pagination, remove, scope } = useProductsList(args);
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  const loadWrap = async () => {
    query.value = Object.assign(query.value, { isPublished: true, searchFromAllSellers: true });

    await load(query.value);
  };

  function openDetailsBlade(args?: Omit<Parameters<typeof openBlade>["0"], "blade">) {
    openBlade({
      blade: resolveBladeByName("MpProduct"),
      ...args,
    });
  }

  const extendedScope = ref({
    ...scope.value,
    openDetailsBlade,
  });

  return { items, load: loadWrap, loading, query, pagination, remove, scope: extendedScope };
};
