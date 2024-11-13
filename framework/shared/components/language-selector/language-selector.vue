<template>
  <div>
    <SettingsMenuItem
      :image="currLocaleFlag"
      :empty-icon="'fas fa-globe'"
      :title="$t('COMPONENTS.LANGUAGE_SELECTOR.TITLE')"
      @click="opened = !opened"
    />

    <GenericDropdown
      :opened="opened"
      :items="languageItems"
      :is-item-active="(lang) => lang.lang === $i18n.locale"
      :on-item-click="(lang) => lang.hasOwnProperty('clickHandler') && lang.clickHandler(lang.lang)"
    >
      <template #item="{ item: lang, click }">
        <SettingsMenuItem
          class="tw-py-0"
          :image="lang.flag"
          :title="lang.title"
          :is-active="lang.lang === $i18n.locale"
          @click="click"
        />
      </template>
    </GenericDropdown>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useLanguages } from "../../../core/composables";
import { GenericDropdown } from "../generic-dropdown";
import { watch, ref } from "vue";
import { SettingsMenuItem } from "../menu-item";

interface ILanguage {
  lang: string;
  title: string;
  clickHandler: (lang: string) => void;
  flag: string;
}

const { availableLocales, getLocaleMessage, locale } = useI18n({ useScope: "global" });
const { setLocale, getFlag } = useLanguages();

const opened = ref(false);

const languageItems: ILanguage[] = availableLocales
  .map((locale: string) => ({
    lang: locale,
    title: (getLocaleMessage(locale) as { language_name: string }).language_name,
    clickHandler(lang: string) {
      setLocale(lang);
    },
    flag: "",
  }))
  .filter((item) => item.title);

const currLocaleFlag = ref<string>();

watch(
  [() => languageItems, () => locale.value],
  async ([newValLangItem]) => {
    for (const lang of newValLangItem) {
      lang.flag = await getFlag(lang.lang);

      currLocaleFlag.value = languageItems.find((lang) => lang.lang === locale.value)?.flag;
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
:root {
  --language-selector-bg-color: var(--additional-50);
  --language-selector-text-color: var(--base-text-color, var(--neutrals-950));
  --language-selector-border-color: var(--app-bar-divider-color);
  --language-selector-hover-bg-color: var(--primary-50);
  --language-selector-button-width: var(--app-bar-button-width);
}

.vc-language-selector {
  &__img {
    @apply tw-w-6 tw-h-6 tw-mr-2;

    &--button {
      @apply tw-mr-0;
    }
  }

  &__button-wrap {
    @apply tw-flex tw-justify-center;
  }
}
</style>
