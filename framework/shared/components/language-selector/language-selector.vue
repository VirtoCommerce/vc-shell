<template>
  <SettingsMenuItem @trigger:click="opened = !opened">
    <template #trigger>
      <div class="vc-language-selector__trigger">
        <VcImage
          v-if="currLocaleFlag"
          :src="currLocaleFlag"
          class="vc-language-selector__flag"
        />
        <VcIcon
          v-else
          icon="material-language"
          class="vc-language-selector__flag"
          size="m"
        />
        <span class="vc-language-selector__title">
          {{ $t("COMPONENTS.LANGUAGE_SELECTOR.TITLE") }}
        </span>
      </div>
    </template>

    <template #content>
      <GenericDropdown
        :opened="opened"
        :items="languageItems"
        :is-item-active="(lang) => lang.lang === currentLocale"
        @item-click="handleLanguageSelect"
      >
        <template #item="{ item: lang, click }">
          <div
            class="vc-language-selector__item"
            :class="{ 'vc-language-selector__item--active': lang.lang === currentLocale }"
            @click="click"
          >
            <VcImage
              :src="lang.flag"
              class="vc-language-selector__flag"
            />
            <span class="vc-language-selector__item-title">{{ lang.title }}</span>
          </div>
        </template>
      </GenericDropdown>
    </template>
  </SettingsMenuItem>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useLanguages } from "../../../core/composables";
import { GenericDropdown } from "../generic-dropdown";
import { watch, ref } from "vue";
import { SettingsMenuItem } from "../settings-menu-item";
import { VcImage } from "../../../ui/components";

interface ILanguage {
  lang: string;
  title: string;
  clickHandler: (lang: string) => void;
  flag: string;
}

const { availableLocales, getLocaleMessage, locale } = useI18n({ useScope: "global" });
const { setLocale, getFlag, currentLocale } = useLanguages();

const opened = ref(false);
const currLocaleFlag = ref<string>();

const languageItems: ILanguage[] = availableLocales
  .map((locale: string) => ({
    lang: locale,
    title: (getLocaleMessage(locale) as { language_name: string }).language_name,
    async clickHandler(lang: string) {
      await setLocale(lang);
    },
    flag: "",
  }))
  .filter((item) => item.title);

const handleLanguageSelect = (lang: ILanguage) => {
  if (Object.prototype.hasOwnProperty.call(lang, "clickHandler")) {
    lang.clickHandler(lang.lang);
  }
  opened.value = false;
};

// Watch both i18n locale and currentLocale from language service
watch(
  [() => languageItems, () => locale.value, () => currentLocale.value],
  async ([newValLangItem]) => {
    for (const lang of newValLangItem) {
      lang.flag = await getFlag(lang.lang);
      // Use currentLocale from language service for consistency
      if (lang.lang === currentLocale.value) {
        currLocaleFlag.value = lang.flag;
      }
    }
  },
  { immediate: true },
);
</script>

<style lang="scss">
.vc-language-selector {
  &__trigger {
    @apply tw-flex tw-items-center tw-w-full;
  }

  &__flag {
    @apply tw-w-6 tw-h-6 tw-mr-3;
  }

  &__title {
    @apply tw-flex-grow;
  }

  &__item {
    @apply tw-flex tw-items-center tw-w-full tw-px-6 tw-py-3
      tw-cursor-pointer tw-transition-colors
      hover:tw-bg-[color:var(--menu-item-bg-hover)];

    &--active {
      @apply tw-bg-[color:var(--menu-item-bg-active)];
    }
  }

  &__item-title {
    @apply tw-flex-grow;
  }
}
</style>
