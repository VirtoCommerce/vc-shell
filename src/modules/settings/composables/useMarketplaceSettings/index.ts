import { Ref, ref } from "vue";
import { useUser } from "@vc-shell/framework";
import { MarketplaceSettings, VcmpCommonClient } from "../../../../api_client/marketplacevendor";

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
  loadSettings: () => Promise<void>;
}

export default (): IUseSettings => {
  const { getAccessToken } = useUser();

  const settings = ref<MarketplaceSettings>();
  const defaultCurrency = ref<ICurrency>();
  const currencies = ref<ICurrency[]>([]);
  const defaultLanguage = ref<string>();
  const languages = ref<string[]>([]);
  const currentLanguage = ref<string>();

  async function loadSettings() {
    const token = await getAccessToken();
    const client = new VcmpCommonClient();
    client.setAuthToken(await getAccessToken());

    if (token) {
      try {
        settings.value = await client.getVcmpSettings();

        defaultCurrency.value = {
          title: settings.value.defaultCurrency,
          value: settings.value.defaultCurrency,
        };
        currencies.value = settings.value.currencies?.map((currency) => ({
          title: currency,
          value: currency,
        }));

        defaultLanguage.value = settings.value.defaultLanguage;
        languages.value = settings.value.languages;

        if (!currentLanguage.value) {
          currentLanguage.value = defaultLanguage.value;
        }
      } catch (e) {
        console.error(e);
        throw e;
      }
    }
  }

  return {
    defaultCurrency,
    currencies,
    defaultLanguage,
    languages,
    currentLanguage,
    loadSettings,
  };
};
