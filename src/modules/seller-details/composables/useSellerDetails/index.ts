import { ComputedRef, Ref, WritableComputedRef, computed, ref, toRefs, watch } from "vue";
import {
  useDetailsFactory,
  UseDetails,
  useApiClient,
  DetailsComposableArgs,
  useUser,
  DetailsBaseBladeScope,
  useAssets,
  i18n,
  IBladeToolbar,
  ICommonAsset,
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
import { useRoute } from "vue-router";

interface SellerDetailsScope extends DetailsBaseBladeScope {
  logoHandler: WritableComputedRef<{ url: string; name: string; title: string }[]>;
  onCountryChange: (e: string) => Promise<void>;
  countriesList: Ref<
    {
      id: string;
      name: string;
    }[]
  >;
  setRegion: (regionId: string) => void;
  regionsList: Ref<
    {
      id: string;
      name: string;
    }[]
  >;
  computedFee: ComputedRef<string>;
  assetsHandler: {
    images: {
      loading: ComputedRef<boolean>;
      upload(files: FileList): Promise<Image[]>;
      remove: (files: IImage[]) => ICommonAsset[];
    };
  };
  toolbarOverrides: {
    reset: IBladeToolbar;
    saveChanges: IBladeToolbar;
  };
}

interface ILocation {
  id: string;
  name: string;
}

const { getApiClient } = useApiClient(VcmpSellerSecurityClient);

export const useSellerDetails = (args?: DetailsComposableArgs): UseDetails<ISeller, SellerDetailsScope> => {
  const { t } = i18n.global;

  const detailsFactory = useDetailsFactory<ISeller>({
    load: async () => {
      const sellerId = await GetSellerId();
      if (sellerId) return (await getApiClient()).getSellerById(sellerId);
      else return (await getApiClient()).getCurrentSeller();
    },
    saveChanges: async (seller) => {
      const sellerId = await GetSellerId();
      return (await getApiClient()).updateSeller(
        new UpdateSellerCommand({
          sellerId: sellerId ?? seller.id!,
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
  const route = useRoute();

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
        item.value!.addresses = [
          new CustomerAddress({
            ...item.value!.addresses[0],
            countryCode: countryInfo.id,
            countryName: countryInfo.name,
          }),
        ];
        item.value!.addresses[0].regionName = undefined;
        item.value!.addresses[0].regionId = undefined;
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
  }

  async function resetEntries() {
    item.value = _.cloneDeep(validationState.value.cachedValue) as SellerDetails;
  }

  const scope = {
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
  };

  watch(
    () => item.value?.addresses?.[0],
    (newVal) => {
      if (newVal && newVal.countryCode) {
        getRegions(newVal.countryCode);
      }
    },
    { deep: true },
  );

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

  async function GetSellerId(): Promise<string> {
    const result = route?.params?.sellerId as string;
    return result;
  }

  return {
    load,
    item,
    saveChanges,
    remove,
    loading,
    validationState,
    scope,
    bladeTitle: computed(() => t("SELLER_DETAILS.TITLE")),
  };
};
