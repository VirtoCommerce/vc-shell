import { IOfferPrice, OfferPrice, OfferPriceList } from "@vcmp-vendor-portal/api/marketplacevendor";
import {
  DetailsBaseBladeScope,
  DynamicBladeForm,
  IBladeToolbar,
  UseDetails,
  useDetailsFactory,
  useLoading,
} from "@vc-shell/framework";
import { Ref, computed, nextTick, reactive, ref, watch, WritableComputedRef } from "vue";
import * as _ from "lodash-es";
import useMarketplaceSettings, { ICurrency } from "../../../settings/composables/useMarketplaceSettings";
import { useI18n } from "vue-i18n";

export interface SpecialPricesDetailsScope extends DetailsBaseBladeScope {
  memberIds: WritableComputedRef<{ id: string }[]>;
  removePrice: (idx: number) => void;
  addPrice: () => void;
  currencies: Ref<ICurrency[]>;
  toolbarOverrides: {
    saveChanges: IBladeToolbar;
    remove: IBladeToolbar;
  };
}

export const useSpecialPriceDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"] & { options?: { item: OfferPriceList } };
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<OfferPriceList> => {
  const { t } = useI18n({ useScope: "global" });

  const internalModel = ref<OfferPriceList | undefined>(_.cloneDeep(args.props.options?.item));

  const detailsFactory = useDetailsFactory<OfferPriceList>({
    load: async () => {
      return internalModel.value;
    },
    saveChanges: (details) => {
      if (!details.name || details.name == "") {
        details.name = generatePriceName(details);
      }
      args.emit("parent:call", {
        method: "saveSpecialPrice",
        args: { item: details },
      });
    },
    remove: () => {
      args.emit("parent:call", {
        method: "removeSpecialPrice",
        args: { item: internalModel.value },
      });
    },
  });

  const { load, saveChanges, remove, loading, item, validationState } = detailsFactory();
  const { currencies, loadSettings } = useMarketplaceSettings();
  const pricesLoading = ref(false);
  const duplicates = ref<string[]>([]);
  const pricingEqual = ref(false);

  function removePrice(idx: number) {
    item.value?.prices?.splice(idx, 1);
  }

  function addPrice() {
    if (item.value && !item.value.prices) {
      item.value.prices = [];
    }
    item.value?.prices?.push(
      new OfferPrice({
        currency: "USD",
        listPrice: null,
        minQuantity: null,
      } as unknown as IOfferPrice),
    );
  }

  function generatePriceName(price: OfferPriceList): string {
    let name = "";
    if (price.memberIds && price.memberIds.length > 0) {
      name = "For " + price.memberIds.join(", ");
    }
    if (price.startDate) {
      if (name.length > 0) {
        name += ", ";
      }
      name += "Start " + price.startDate.toDateString();
    }
    if (price.endDate) {
      if (name.length > 0) {
        name += ", ";
      }
      name += "End " + price.endDate.toDateString();
    }

    return name != "" ? name : "Default";
  }

  const scope = ref<SpecialPricesDetailsScope>({
    memberIds: computed({
      get() {
        return item.value?.memberIds?.map((id) => ({ id })) ?? [];
      },
      set(value) {
        item.value!.memberIds = value.map((v) => v.id);
      },
    }),
    removePrice,
    addPrice,
    currencies,
    toolbarOverrides: {
      saveChanges: {
        disabled: computed(() => {
          return !(
            item.value?.prices &&
            item.value?.prices?.length > 0 &&
            validationState.value.valid &&
            validationState.value.modified
          );
        }),
      },
      remove: {
        isVisible: computed(() => !!args.props.options?.item && !loading.value),
      },
    },
  });

  watch(
    () => item.value?.prices,
    (newVal) => {
      nextTick(() => {
        const dupes: string[] = [];

        newVal?.forEach((o, idx) => {
          if (
            newVal.some((o2, idx2) => {
              return (
                idx !== idx2 &&
                !!o.minQuantity &&
                !!o2.minQuantity &&
                o.minQuantity === o2.minQuantity &&
                o.currency === o2.currency
              );
            })
          ) {
            dupes.push(`minQuantity_${idx}`);
          }
        });

        duplicates.value = dupes;
        pricingEqual.value = !!dupes.length;
      });
    },
    { deep: true },
  );

  watch(duplicates, (newVal, oldVal) => {
    validationState.value.setErrors(
      Object.values(oldVal).reduce(
        (obj, curr) => {
          obj[curr] = undefined;
          return obj;
        },
        {} as Record<string, undefined>,
      ),
    );

    validationState.value.setErrors(
      Object.values(newVal).reduce(
        (obj, curr) => {
          obj[curr] = "Min quantity can't be the same";
          return obj;
        },
        {} as Record<string, string>,
      ),
    );
  });

  watch(
    () => args?.mounted.value,
    async () => {
      try {
        pricesLoading.value = true;
        await loadSettings();

        if (!args.props.param) {
          await load();
        }

        if (!args.props.options?.item) {
          item.value = reactive(new OfferPriceList());
          addPrice();

          validationState.value.resetModified(item.value, true);
        }
      } finally {
        pricesLoading.value = false;
      }
    },
  );

  return {
    load,
    saveChanges,
    remove,
    loading: useLoading(loading, pricesLoading),
    item,
    validationState,
    scope: computed(() => scope.value),
    bladeTitle: computed(() => {
      return args.props.options?.item
        ? item.value?.name
          ? item.value.name + " " + t("SPECIAL_PRICES.PAGES.DETAILS.SPECIAL_PRICE_DETAILS")
          : ""
        : t("SPECIAL_PRICES.PAGES.DETAILS.TITLE");
    }),
  };
};
