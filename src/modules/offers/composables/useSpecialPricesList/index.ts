import { UseList, DynamicBladeList, useListFactory, useBladeNavigation, TOpenBladeArgs } from "@vc-shell/framework";
import { OfferPriceList } from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, ref, watch } from "vue";
import * as _ from "lodash-es";

export const useSpecialPricesList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"] & { options?: { priceLists: OfferPriceList[] } };
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): UseList<OfferPriceList[], any> => {
  const internalModel = ref<OfferPriceList[]>([]);

  watch(
    () => args.props.options?.priceLists,
    (value) => {
      internalModel.value = _.cloneDeep(value) ?? [];
    },
    { immediate: true, deep: true },
  );

  const factory = useListFactory({
    load: async () => {
      return await {
        results: internalModel.value ?? [],
        totalCount: internalModel.value.length ?? 0,
      };
    },
  });

  const { load, remove, items, query, loading, pagination } = factory();
  const { openBlade, resolveBladeByName } = useBladeNavigation();

  async function openDetailsBlade(data?: TOpenBladeArgs) {
    await openBlade({
      blade: resolveBladeByName("SpecialPriceDetails"),
      options: {},
      ...data,
    });
  }

  async function onListItemClick(args: { item?: OfferPriceList }) {
    await openDetailsBlade({
      param: args.item?.id,
      options: { item: args.item },
      ...args,
    });
  }

  const scope = ref({
    openDetailsBlade,
    onListItemClick,
    tryToSaveChanges: (data: { item: OfferPriceList }) => {
      args.emit("parent:call", {
        method: "saveSpecialPrices",
        args: { item: data.item },
      });
    },
  });

  return {
    load,
    remove,
    items,
    query,
    loading,
    pagination,
    scope: computed(() => scope.value),
  };
};
