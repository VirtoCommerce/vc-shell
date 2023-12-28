import { Ref, WritableComputedRef, computed, ref, watch } from "vue";
import {
  useDetailsFactory,
  UseDetails,
  useApiClient,
  DynamicBladeForm,
  useUser,
  DetailsBaseBladeScope,
  useAssets,
} from "@vc-shell/framework";
import {
  CustomerAddress,
  ISeller,
  ISellerDetails,
  SellerDetails,
  UpdateSellerCommand,
  VcmpSellerSecurityClient,
  Image,
  IImage,
} from "@vcmp-vendor-portal/api/marketplacevendor";
import * as _ from "lodash-es";

interface SellerDetailsScope extends DetailsBaseBladeScope {
  logoHandler: WritableComputedRef<{ url: string; name: string; title: string }[]>;
}

interface ILocation {
  id: string;
  name: string;
}

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export const useSellerDetails = (args?: {
  props: InstanceType<typeof DynamicBladeForm>["$props"];
  emit: InstanceType<typeof DynamicBladeForm>["$emit"];
  mounted: Ref<boolean>;
}): UseDetails<ISeller> => {
  const detailsFactory = useDetailsFactory<ISeller>({
    load: async () => (await getApiClient()).getCurrentSeller(),
    saveChanges: async (seller) => {
      return (await getApiClient()).updateSeller(
        new UpdateSellerCommand({
          sellerId: seller.id!,
          sellerDetails: new SellerDetails({
            ...(seller as ISellerDetails),
            addresses: seller.addresses!.map((address) => new CustomerAddress(address)),
          }),
          commissionFeeId: seller.commissionFee!.id!,
        }),
      );
    },
  });

  const { load, item, saveChanges, remove, loading, validationState } = detailsFactory();
  const { user } = useUser();
  const { upload: uploadImage, remove: removeImage, loading: imageLoading } = useAssets();

  const countriesList = ref<ILocation[]>([]);
  const regionsList = ref<ILocation[]>([]);

  const logoHandler = computed({
    get() {
      return item.value?.logo ? [{ url: item.value.logo, name: user.value?.userName ?? "", title: "" }] : [];
    },
    set(value) {
      if (value) {
        item.value!.logo = value.find(() => true)?.url;
      } else {
        item.value!.logo = undefined;
      }
    },
  });

  const computedFee = computed(() => {
    if (item.value && item.value.commissionFee) {
      return `${item.value.commissionFee?.name} (${item.value.commissionFee?.fee} ${
        item.value.commissionFee?.calculationType === "Percent" ? "%" : "Fixed"
      })`;
    }
    return "";
  });

  async function getCountries() {
    try {
      const result = await fetch("/api/platform/common/countries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "application/json",
        },
      });

      result.text().then((response) => {
        countriesList.value = JSON.parse(response);
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async function getRegions(countryId: string) {
    try {
      const result = await fetch(`/api/platform/common/countries/${countryId}/regions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json-patch+json",
          Accept: "application/json",
        },
      });

      result.text().then((response) => {
        regionsList.value = JSON.parse(response);
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  function setCountry(countryId: string) {
    if (countryId) {
      const countryInfo = countriesList.value.find((x) => x.id === countryId);
      if (countryInfo && item.value!.addresses) {
        item.value!.addresses[0].countryCode = countryInfo.id;
        item.value!.addresses[0].countryName = countryInfo.name;
      }
    }
  }

  function setRegion(regionId: string) {
    if (regionId) {
      const regionInfo = regionsList.value.find((x) => x.id === regionId);
      if (regionInfo && item.value!.addresses) {
        item.value!.addresses[0].regionId = regionInfo.id;
        item.value!.addresses[0].regionName = regionInfo.name;
      }
    }
  }

  async function onCountryChange(e: string) {
    setCountry(e);
    getRegions(e);
  }

  async function resetEntries() {
    item.value = _.cloneDeep(validationState.value.cachedValue) as SellerDetails;
  }

  const scope = ref<SellerDetailsScope>({
    logoHandler,
    onCountryChange,
    countriesList,
    setRegion,
    regionsList,
    computedFee,
    assetsHandler: {
      images: {
        loading: imageLoading,
        async upload(files: FileList) {
          return (await uploadImage(files, `seller_logos/${item.value!.id}`)).map((x) => new Image(x));
        },
        remove: (files: IImage[]) => {
          return removeImage(files, logoHandler.value);
        },
      },
    },
    toolbarOverrides: {
      reset: {
        clickHandler() {
          resetEntries();
        },
        disabled: computed(() => !validationState.value.modified),
      },
      saveChanges: {
        disabled: computed(() => !validationState.value.valid || !validationState.value.modified),
      },
    },
  });

  watch(
    () => args?.mounted.value,
    async () => {
      await load();
      await getCountries();

      if (item.value?.addresses && item.value?.addresses[0]?.countryCode) {
        await getRegions(item.value?.addresses[0]?.countryCode);
      }
    },
  );

  return {
    load,
    item,
    saveChanges,
    remove,
    loading,
    validationState,
    scope: computed(() => scope.value),
    bladeTitle: computed(() => "Seller Details"),
  };
};
