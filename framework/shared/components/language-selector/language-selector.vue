<template>
  <AppBarButtonTemplate
    :title="$t('COMPONENTS.LANGUAGE_SELECTOR.TITLE')"
    icon="fas fa-globe"
    position="bottom-end"
  >
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
              @click="lang.hasOwnProperty('clickHandler') && lang.clickHandler(lang.lang)"
            >
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

const { availableLocales, getLocaleMessage } = useI18n({ useScope: "global" });
const { setLocale } = useLanguages();

const languageItems = availableLocales
  .map((locale: string) => ({
    lang: locale,
    title: (getLocaleMessage(locale) as { language_name: string }).language_name,
    clickHandler(lang: string) {
      setLocale(lang);
    },
  }))
  .filter((item) => item.title);
</script>

<style lang="scss">
:root {
  --language-selector-bg-color: var(--additional-50);
  --language-selector-text-color: var(--base-text-color, var(--neutrals-950));
  --language-selector-border-color: var(--app-bar-divider-color);
  --language-selector-hover-bg-color: var(--primary-50);
}

.vc-language-selector {
  &__dropdown {
    @apply tw-bg-[color:var(--language-selector-bg-color)] tw-w-full;
  }

  &__item {
    @apply tw-p-3 tw-text-sm tw-text-[color:var(--language-selector-text-color)]
      tw-border-l tw-border-solid tw-border-l-[var(--language-selector-border-color)]
      tw-border-b tw-border-b-[var(--language-selector-border-color)] tw-w-full tw-cursor-pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--language-selector-hover-bg-color);
    }
  }
}
</style>
