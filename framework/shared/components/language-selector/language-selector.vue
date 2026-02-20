<template>
  <SettingsMenuItem
    ref="menuItemRef"
    icon="material-language"
    :title="$t('COMPONENTS.LANGUAGE_SELECTOR.TITLE')"
    :value="currentLanguageName"
    :show-chevron="true"
    :is-active="isSubMenuOpen"
    @trigger:click="isSubMenuOpen = !isSubMenuOpen"
  />

  <VcDropdownPanel
    v-model:show="isSubMenuOpen"
    :anchor-ref="menuItemRef?.triggerRef ?? null"
    placement="right-start"
    width="180px"
    max-width="260px"
  >
    <div class="tw-p-1">
      <VcDropdownItem
        v-for="lang in languageItems"
        :key="lang.lang"
        :title="lang.title"
        :active="lang.lang === currentLocale"
        @click="handleLanguageSelect(lang)"
      />
    </div>
  </VcDropdownPanel>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useLanguages } from "@core/composables";
import { ref, computed } from "vue";
import { SettingsMenuItem } from "@shared/components/settings-menu-item";
import { VcDropdownPanel } from "@ui/components";
import VcDropdownItem from "@ui/components/molecules/vc-dropdown/_internal/VcDropdownItem.vue";

interface ILanguage {
  lang: string;
  title: string;
  clickHandler: (lang: string) => void;
}

const { availableLocales, getLocaleMessage } = useI18n({ useScope: "global" });
const { setLocale, currentLocale } = useLanguages();

const isSubMenuOpen = ref(false);
const menuItemRef = ref<InstanceType<typeof SettingsMenuItem> | null>(null);

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
  isSubMenuOpen.value = false;
};
</script>
