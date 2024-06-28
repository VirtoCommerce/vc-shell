import { Ref, ref } from "vue";
import { MarketplaceSettings, VcmpCommonClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { useApiClient, useAsync } from "@vc-shell/framework";

export interface ICurrency {
  title: string;
  value: string;
}

export interface IUseSettings {
  defaultCurrency: Ref<ICurrency>;
  currencies: Ref<ICurrency[]>;
  defaultLanguage: Ref<string>;
  languages: Ref<string[]>;
  currentLanguage: Ref<string>;
  defaultProductType: Ref<string>;
  productTypes: Ref<string[]>;
  settingUseDefaultOffer: Ref<boolean>;
  loadSettings: () => Promise<void>;
}

export default (): IUseSettings => {
  const settings = ref<MarketplaceSettings>();
  const defaultCurrency = ref() as Ref<ICurrency>;
  const currencies = ref<ICurrency[]>([]);
  const defaultLanguage = ref() as Ref<string>;
  const languages = ref<string[]>([]);
  const currentLanguage = ref() as Ref<string>;
  const defaultProductType = ref() as Ref<string>;
  const productTypes = ref<string[]>([]);
  const settingUseDefaultOffer = ref<boolean>(true);

  const { getApiClient } = useApiClient(VcmpCommonClient);

  const { loading, action: loadSettings } = useAsync(async () => {
    const settings = await (await getApiClient()).getVcmpSettings();
    defaultCurrency.value = {
      title: settings.defaultCurrency ?? "USD",
      value: settings.defaultCurrency ?? "USD",
    };
    currencies.value =
      settings.currencies?.map((currency) => ({
        title: currency,
        value: currency,
      })) ?? [];

    defaultLanguage.value = settings.defaultLanguage!;
    languages.value = settings.languages ?? [];

    if (!currentLanguage.value) {
      currentLanguage.value = defaultLanguage.value;
    }

    defaultProductType.value = settings.defaultProductType!;
    productTypes.value = settings.productTypes ?? [];
    settingUseDefaultOffer.value = settings.useDefaultOffer!;
  });

  return {
    defaultCurrency,
    currencies,
    defaultLanguage,
    languages,
    currentLanguage,
    defaultProductType,
    productTypes,
    settingUseDefaultOffer,
    loadSettings,
  };
};
