import { AsyncAction, useApiClient, useAsync, useLoading, useLanguages } from "@vc-shell/framework";
import { VcmpSellerCatalogClient } from "@vcmp-vendor-portal/api/marketplacevendor";
import { ComputedRef, Ref, onBeforeUnmount, ref } from "vue";

interface UseMultilanguage {
  loading: ComputedRef<boolean>;
  currentLocale: Ref<string>;
  languages: Ref<string[]>;
  setLocale: (locale: string) => void;
  localesOptions: Ref<{ label: string | undefined; value: string }[]>;
  getLanguages: AsyncAction<void, void>;
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

const currentLocale = ref("en-US");
const languages = ref<string[]>([]);
const localesOptions = ref([]) as Ref<{ label: string | undefined; value: string }[]>;

export const useMultilanguage = (): UseMultilanguage => {
  const { getLocaleByTag } = useLanguages();

  const { loading: languagesLoading, action: getLanguages } = useAsync(async () => {
    languages.value = await (await getApiClient()).getAvailableLanguages();
    localesOptions.value = languages.value.map((x) => ({
      label: getLocaleByTag(x),
      value: x,
    }));
  });

  const setLocale = (locale: string) => {
    currentLocale.value = locale;
  };

  onBeforeUnmount(() => {
    currentLocale.value = "en-US";
  });

  return {
    loading: useLoading(languagesLoading),
    currentLocale,
    languages,
    setLocale,
    localesOptions,
    getLanguages,
  };
};
