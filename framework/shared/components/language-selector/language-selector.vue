<template>
  <AppBarButtonTemplate
    :title="$t('COMPONENTS.LANGUAGE_SELECTOR.TITLE')"
    position="bottom-end"
  >
    <template #button>
      <div class="vc-language-selector__button-wrap">
        <VcImage
          :src="currLocaleFlag"
          class="vc-language-selector__img vc-language-selector__img--button"
          empty-icon="fas fa-globe"
        />
      </div>
    </template>
    <template #dropdown-content="{ opened, toggle }">
      <Sidebar
        :is-expanded="$isMobile.value ? opened : false"
        position="right"
        render="mobile"
        @close="toggle"
      >
        <template #content>
          <div
            v-if="opened"
            class="vc-language-selector__dropdown"
          >
            <div
              v-for="(lang, i) in languageItems"
              :key="i"
              class="vc-language-selector__item"
              :class="{ 'vc-language-selector__item--active': lang.lang === $i18n.locale }"
              @click="lang.hasOwnProperty('clickHandler') && lang.clickHandler(lang.lang)"
            >
              <VcImage
                :src="lang.flag"
                class="vc-language-selector__img"
              />
              {{ lang.title }}
            </div>
          </div>
        </template>
      </Sidebar>
    </template>
  </AppBarButtonTemplate>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useLanguages } from "../../../core/composables";
import { AppBarButtonTemplate } from "./../app-bar-button";
import { Sidebar } from "./../sidebar";
import { watch, ref } from "vue";

interface ILanguage {
  lang: string;
  title: string;
  clickHandler: (lang: string) => void;
  flag: string;
}

const { availableLocales, getLocaleMessage, locale } = useI18n({ useScope: "global" });
const { setLocale, getFlag } = useLanguages();

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
  &__dropdown {
    @apply tw-bg-[color:var(--language-selector-bg-color)] tw-min-w-max;
  }

  &__item {
    @apply tw-truncate tw-flex tw-items-center tw-p-3 tw-text-sm tw-text-[color:var(--language-selector-text-color)]
      tw-border-l tw-border-solid tw-border-l-[var(--language-selector-border-color)]
      tw-border-b tw-border-b-[var(--language-selector-border-color)] tw-w-full tw-cursor-pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--language-selector-hover-bg-color);
    }

    &--active {
      @apply tw-bg-[color:var(--language-selector-hover-bg-color)];
    }
  }

  &__img {
    @apply tw-w-6 tw-h-6 tw-mr-2;

    &--button {
      @apply tw-mr-0;
    }
  }

  &__button-wrap {
    @apply tw-w-[var(--language-selector-button-width)] tw-flex tw-justify-center;
  }
}
</style>
