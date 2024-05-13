import {
  UseList,
  DynamicBladeList,
  useListFactory,
  useBladeNavigation,
  TOpenBladeArgs,
  TListItemClickArgs,
  ListBaseBladeScope,
  IBladeToolbar,
  useBeforeUnload,
  usePopup,
} from "@vc-shell/framework";
import { OfferPriceList } from "@vcmp-vendor-portal/api/marketplacevendor";
import { Ref, computed, ref, watch, unref } from "vue";
import * as _ from "lodash-es";
import { useI18n } from "vue-i18n";

export interface SpecialPricesListScope extends ListBaseBladeScope<OfferPriceList> {
  openDetailsBlade: (data?: TOpenBladeArgs) => Promise<void>;
  onListItemClick: (args: TListItemClickArgs<OfferPriceList>) => Promise<void>;
  saveSpecialPrice: (data: { item: OfferPriceList }) => void;
  removeSpecialPrice: (data: { item: OfferPriceList }) => void;
  toolbarOverrides: {
    save: IBladeToolbar;
  };
}

export const useSpecialPricesList = (args: {
  props: InstanceType<typeof DynamicBladeList>["$props"] & { options?: { priceLists: OfferPriceList[] } };
  emit: InstanceType<typeof DynamicBladeList>["$emit"];
  mounted: Ref<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): UseList<OfferPriceList[], any, SpecialPricesListScope> => {
  const internalModel = ref<OfferPriceList[]>(_.cloneDeep(args.props.options?.priceLists) ?? []);
  const selectedItem = ref<OfferPriceList>();
  const modified = ref(false);
  const { onBeforeClose } = useBladeNavigation();
  const { showConfirmation } = usePopup();
  const { t } = useI18n({ useScope: "global" });

  watch(
    () => internalModel.value,
    (value) => {
      modified.value = !_.isEqual(value, args.props.options?.priceLists);
    },
    { deep: true },
  );

  const factory = useListFactory({
    load: () => {
      return {
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
      ...data,
    });
  }

  async function onListItemClick(args: TListItemClickArgs<OfferPriceList>) {
    selectedItem.value = args.item;

    await openBlade({
      blade: resolveBladeByName("SpecialPriceDetails"),
      options: {
        item: selectedItem.value,
      },
      ...args,
    });
  }

  const scope = ref<SpecialPricesListScope>({
    openDetailsBlade,
    onListItemClick,
    saveSpecialPrice: (data: { item: OfferPriceList }) => {
      const index = internalModel.value.findIndex((item) => item === selectedItem.value);

      if (data.item.id) {
        internalModel.value[index] = data.item;
      } else {
        if (index !== -1) {
          internalModel.value[index] = data.item;
        } else {
          internalModel.value.push(data.item);
        }
      }
    },
    removeSpecialPrice: (data: { item: OfferPriceList }) => {
      args.emit("parent:call", {
        method: "removeSpecialPrice",
        args: { item: data.item },
      });
    },
    toolbarOverrides: {
      save: {
        clickHandler() {
          args.emit("parent:call", {
            method: "saveSpecialPrices",
            args: { items: internalModel.value },
          });

          modified.value = false;
          args.emit("close:blade");
        },
        disabled: computed(() => !modified.value),
      },
    },
  });

  onBeforeClose(async () => {
    if (modified.value) {
      return await showConfirmation(unref(computed(() => t("SPECIAL_PRICES.PAGES.ALERTS.CLOSE_CONFIRMATION"))));
    }
  });

  useBeforeUnload(computed(() => modified.value));

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
