import { Ref, ref } from "vue";
import { MarketplaceSettings, VcmpCommonClient } from "@vc-app/api";

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

  async function loadSettings() {
    const client = new VcmpCommonClient();

    try {
      settings.value = await client.getVcmpSettings();

      defaultCurrency.value = {
        title: settings.value.defaultCurrency ?? "USD",
        value: settings.value.defaultCurrency ?? "USD",
      };
      currencies.value =
        settings.value.currencies?.map((currency) => ({
          title: currency,
          value: currency,
        })) ?? [];

      defaultLanguage.value = settings.value.defaultLanguage!;
      languages.value = settings.value.languages ?? [];

      if (!currentLanguage.value) {
        currentLanguage.value = defaultLanguage.value;
      }

      defaultProductType.value = settings.value.defaultProductType!;
      productTypes.value = settings.value.productTypes ?? [];
      settingUseDefaultOffer.value = settings.value.useDefaultOffer!;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

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
