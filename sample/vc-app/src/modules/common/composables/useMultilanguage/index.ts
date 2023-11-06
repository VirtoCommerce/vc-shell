import { AsyncAction, useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import { VcmpSellerCatalogClient } from "@vc-app/api";
import { ComputedRef, Ref, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

interface UseMultilanguage {
  loading: ComputedRef<boolean>;
  currentLocale: Ref<string>;
  languages: Ref<string[]>;
  setLocale: (locale: string) => void;
  localesOptions: Ref<{ label: string; value: string }[]>;
  getLanguages: AsyncAction<void, void>;
}

const { getApiClient } = useApiClient(VcmpSellerCatalogClient);

const currentLocale = ref("en-US");
const languages = ref<string[]>([]);
const localesOptions = ref([]);

export const useMultilanguage = (): UseMultilanguage => {
  const { loading: languagesLoading, action: getLanguages } = useAsync(async () => {
    languages.value = await (await getApiClient()).getAvailableLanguages();
    localesOptions.value = languages.value.map((x) => ({
      label: t(`LANGUAGES.${x}`, x),
      value: x,
    }));
  });

  const { t } = useI18n({ useScope: "global" });

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
