/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UseList,
  ListComposableArgs,
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
import { Ref, computed, ref, watch, unref, onMounted } from "vue";
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
  modified: Ref<boolean>;
  internalModel: Ref<OfferPriceList[]>;
}

export const useSpecialPricesList = (
  args: ListComposableArgs<{ options?: { priceLists: OfferPriceList[] } }>,
): UseList<OfferPriceList[], any, SpecialPricesListScope> => {
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
      replaceCurrentBlade: true,
    });
  }

  async function onListItemClick(args: TListItemClickArgs<OfferPriceList>) {
    await openBlade({
      blade: resolveBladeByName("SpecialPriceDetails"),
      options: {
        item: args.item,
      },
      replaceCurrentBlade: true,
      onOpen: () => {
        selectedItem.value = args.item;

        args.onOpen?.();
      },
      onClose: () => {
        selectedItem.value = undefined;

        args.onClose?.();
      },
    });
  }

  const scope: SpecialPricesListScope = {
    openDetailsBlade,
    onListItemClick,
    modified,
    internalModel,
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
      const index = internalModel.value.findIndex((item) => _.isEqual(item, data.item));

      if (index !== -1) {
        internalModel.value.splice(index, 1);
      }
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
  };

  onBeforeClose(async () => {
    if (modified.value) {
      return await showConfirmation(unref(computed(() => t("SPECIAL_PRICES.PAGES.ALERTS.CLOSE_CONFIRMATION"))));
    }
  });

  useBeforeUnload(computed(() => modified.value));

  if (!internalModel.value.length) {
    openBlade({
      blade: resolveBladeByName("SpecialPriceDetails"),
      options: {
        priceLists: internalModel.value,
      },
      replaceCurrentBlade: true,
    });
  }

  return {
    load,
    remove,
    items,
    query,
    loading,
    pagination,
    scope,
  };
};
