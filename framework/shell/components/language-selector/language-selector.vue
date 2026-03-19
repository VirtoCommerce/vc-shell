<template>
  <SettingsMenuItem
    icon="lucide-languages"
    :title="$t('COMPONENTS.LANGUAGE_SELECTOR.TITLE')"
    :value="currentLanguageName"
  >
    <template #submenu>
      <VcDropdownItem
        v-for="lang in languageItems"
        :key="lang.lang"
        :title="lang.title"
        :active="lang.lang === currentLocale"
        @click="handleLanguageSelect(lang)"
      />
    </template>
  </SettingsMenuItem>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useLanguages } from "@core/composables";
import { computed } from "vue";
import { SettingsMenuItem } from "@shell/components/settings-menu-item";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";

interface ILanguage {
  lang: string;
  title: string;
  clickHandler: (lang: string) => void;
}

const { availableLocales, getLocaleMessage } = useI18n({ useScope: "global" });
const { setLocale, currentLocale } = useLanguages();

const languageItems: ILanguage[] = availableLocales
  .map((locale: string) => ({
    lang: locale,
    title: (getLocaleMessage(locale) as { language_name: string }).language_name,
    async clickHandler(lang: string) {
      await setLocale(lang);
    },
  }))
  .filter((item) => item.title);

const currentLanguageName = computed(() => {
  const current = languageItems.find((l) => l.lang === currentLocale.value);
  return current?.title;
});

const handleLanguageSelect = (lang: ILanguage) => {
  if (Object.prototype.hasOwnProperty.call(lang, "clickHandler")) {
    lang.clickHandler(lang.lang);
  }
};
</script>
