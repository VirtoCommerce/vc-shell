import { ref, computed, watchEffect, type Ref } from "vue";
import { useLanguages } from "../../core/composables";

interface LanguageOption {
  value: string;
  label: string | undefined;
}

interface LanguageOptionWithFlag extends LanguageOption {
  flag?: string;
}

interface UseBladeMultilanguageParams {
  localesOptions: Ref<LanguageOption[]>;
  currentLocale: Ref<string>;
  setLocale: (locale: string) => void;
}

interface UseBladeMultilanguageReturn {
  languageOptionsWithFlags: Ref<LanguageOptionWithFlag[]>;
  currentLanguageOption: Ref<LanguageOptionWithFlag | undefined>;
  isLoadingFlags: Ref<boolean>;
  setLocale: (locale: string) => void;
  isMultilanguage: Ref<boolean>;
}

/**
 * Composable for preparing data for the language switcher in blades.
 * @param {UseBladeMultilanguageParams} params - Parameters including languages, current locale, and a function to set it.
 * @returns {UseBladeMultilanguageReturn} - Reactive data and actions for use in DataContext.
 */
export function useBladeMultilanguage({
  localesOptions,
  currentLocale,
  setLocale,
}: UseBladeMultilanguageParams): UseBladeMultilanguageReturn {
  const { getFlag } = useLanguages();

  const languageOptionsWithFlags = ref<LanguageOptionWithFlag[]>([]);
  const isLoadingFlags = ref(false);

  const isMultilanguage = computed(() => localesOptions.value.length > 1);

  watchEffect(async () => {
    if (!isMultilanguage.value) {
      languageOptionsWithFlags.value = [];
      return;
    }

    isLoadingFlags.value = true;
    const options = await Promise.all(
      localesOptions.value.map(async (lang) => ({
        ...lang,
        flag: await getFlag(lang.value ?? ""),
      })),
    );

    console.log("options", options);

    languageOptionsWithFlags.value = options;
    isLoadingFlags.value = false;
  });

  const currentLanguageOption = computed(() => {
    return languageOptionsWithFlags.value.find((lang) => lang.value === currentLocale.value);
  });

  return {
    languageOptionsWithFlags,
    currentLanguageOption,
    isLoadingFlags,
    setLocale,
    isMultilanguage,
  };
}
