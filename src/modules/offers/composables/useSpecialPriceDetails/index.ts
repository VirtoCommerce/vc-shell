import { IOfferPrice, OfferPrice, OfferPriceList } from "@vcmp-vendor-portal/api/marketplacevendor";
import { DynamicBladeForm, UseDetails, useDetailsFactory, useLoading } from "@vc-shell/framework";
import { Ref, computed, nextTick, reactive, ref, watch } from "vue";
import * as _ from "lodash-es";
import useMarketplaceSettings from "../../../settings/composables/useMarketplaceSettings";

export const useSpecialPriceDetails = (args: {
  props: InstanceType<typeof DynamicBladeForm>["$props"] & { options?: { item: OfferPriceList } };
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<OfferPriceList> => {
  const internalModel = ref<OfferPriceList>();

  watch(
    () => args.props.options?.item,
    (value) => {
      internalModel.value = _.cloneDeep(value);
    },
    { immediate: true },
  );

  const detailsFactory = useDetailsFactory<OfferPriceList>({
    load: async () => {
      return internalModel.value;
    },
    saveChanges: async (details) => {
      args.emit("parent:call", {
        method: "tryToSaveChanges",
        args: { item: details },
      });
    },
    // remove: () => {},
  });

  const { load, saveChanges, remove, loading, item, validationState } = detailsFactory();
  const { currencies, settingUseDefaultOffer, productTypes, loadSettings } = useMarketplaceSettings();
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

  const scope = ref({
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
    () => {
      try {
        pricesLoading.value = true;
        loadSettings();

        if (!args.props.param) {
          item.value = reactive(new OfferPriceList());
          addPrice();
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
    bladeTitle: computed(() => item.value?.name ?? ""),
  };
};
