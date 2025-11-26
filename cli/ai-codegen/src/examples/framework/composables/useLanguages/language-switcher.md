---
id: useLanguages-language-switcher
type: FRAMEWORK_API
category: composable
tags: [composable, i18n, language-selector, ui]
title: "useLanguages - Language Switcher"
description: "Building language switcher UI components"
---

# useLanguages - Language Switcher

Create custom language switcher components using the `useLanguages` composable.

## Overview

- Build dropdown language selectors
- Create inline language buttons
- Display flag icons with languages
- Show active language state
- Handle language change events

## Basic Language Switcher Dropdown

```vue
<template>
  <div class="language-switcher">
    <!-- @vue-generic {{ value: string; label: string }} -->
    <VcSelect
      v-model="selectedLanguage"
      :options="languageOptions"
      @update:model-value="handleLanguageChange"
      placeholder="Select Language"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale, setLocale, getLocaleByTag } = useLanguages();
const { availableLocales } = useI18n();

const selectedLanguage = ref(currentLocale.value);

// Build options with native language names
const languageOptions = computed(() =>
  availableLocales.map((locale) => ({
    value: locale,
    label: getLocaleByTag(locale) || locale
  }))
);

function handleLanguageChange(locale: string) {
  setLocale(locale);
}

// Sync with external changes
watch(currentLocale, (newLocale) => {
  selectedLanguage.value = newLocale;
});
</script>
```

## Language Switcher with Flags

```vue
<template>
  <div class="language-switcher-with-flags">
    <VcButton
      v-for="lang in languages"
      :key="lang.code"
      :variant="lang.code === currentLocale ? 'primary' : 'outline'"
      @click="changeLanguage(lang.code)"
      class="tw-flex tw-items-center tw-gap-2"
    >
      <img
        :src="lang.flag"
        :alt="lang.name"
        class="tw-w-5 tw-h-4 tw-object-cover"
      />
      <span>{{ lang.name }}</span>
    </VcButton>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useLanguages, notification } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale, setLocale, getLocaleByTag, getFlag } = useLanguages();
const { availableLocales } = useI18n();

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages = ref<Language[]>([]);

// Load languages with flags on mount
onMounted(async () => {
  const languagePromises = availableLocales.map(async (locale) => {
    const name = getLocaleByTag(locale);
    const flag = await getFlag(locale);

    return name ? {
      code: locale,
      name,
      flag
    } : null;
  });

  const results = await Promise.all(languagePromises);
  languages.value = results.filter((lang): lang is Language => lang !== null);
});

function changeLanguage(locale: string) {
  setLocale(locale);
  const languageName = getLocaleByTag(locale);
  notification.success(`Language changed to ${languageName}`);
}
</script>

<style scoped>
.language-switcher-with-flags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
```

## Compact Flag-Only Switcher

```vue
<template>
  <div class="compact-language-switcher">
    <button
      v-for="lang in languages"
      :key="lang.code"
      :class="[
        'language-flag-button',
        { active: lang.code === currentLocale }
      ]"
      :title="lang.name"
      @click="changeLanguage(lang.code)"
    >
      <img
        :src="lang.flag"
        :alt="lang.name"
        class="flag-icon"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { currentLocale, setLocale, getLocaleByTag, getFlag } = useLanguages();

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages = ref<Language[]>([]);

// Supported languages (configure as needed)
const supportedLanguages = ["en", "fr", "es", "de", "ja"];

onMounted(async () => {
  for (const locale of supportedLanguages) {
    const name = getLocaleByTag(locale);
    const flag = await getFlag(locale);

    if (name) {
      languages.value.push({ code: locale, name, flag });
    }
  }
});

function changeLanguage(locale: string) {
  setLocale(locale);
}
</script>

<style scoped>
.compact-language-switcher {
  display: flex;
  gap: 4px;
}

.language-flag-button {
  width: 32px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px;
  transition: all 0.2s;
}

.language-flag-button:hover {
  border-color: #d1d5db;
  transform: scale(1.1);
}

.language-flag-button.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.flag-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
```

## Dropdown with Current Flag Display

```vue
<template>
  <div class="language-dropdown">
    <VcButton
      @click="isOpen = !isOpen"
      class="tw-flex tw-items-center tw-gap-2"
    >
      <img
        v-if="currentLanguage"
        :src="currentLanguage.flag"
        :alt="currentLanguage.name"
        class="tw-w-5 tw-h-4"
      />
      <span>{{ currentLanguage?.name }}</span>
      <VcIcon icon="material-arrow_drop_down" />
    </VcButton>

    <div v-if="isOpen" class="language-menu">
      <button
        v-for="lang in languages"
        :key="lang.code"
        :class="[
          'language-menu-item',
          { active: lang.code === currentLocale }
        ]"
        @click="selectLanguage(lang.code)"
      >
        <img
          :src="lang.flag"
          :alt="lang.name"
          class="tw-w-5 tw-h-4"
        />
        <span>{{ lang.name }}</span>
        <VcIcon
          v-if="lang.code === currentLocale"
          icon="material-check"
          class="tw-text-green-500"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale, setLocale, getLocaleByTag, getFlag } = useLanguages();
const { availableLocales } = useI18n();

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages = ref<Language[]>([]);
const isOpen = ref(false);

const currentLanguage = computed(() =>
  languages.value.find((lang) => lang.code === currentLocale.value)
);

onMounted(async () => {
  // Load languages
  const languagePromises = availableLocales.map(async (locale) => {
    const name = getLocaleByTag(locale);
    const flag = await getFlag(locale);
    return name ? { code: locale, name, flag } : null;
  });

  const results = await Promise.all(languagePromises);
  languages.value = results.filter((lang): lang is Language => lang !== null);

  // Close dropdown on outside click
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});

function selectLanguage(locale: string) {
  setLocale(locale);
  isOpen.value = false;
}

function handleOutsideClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest(".language-dropdown")) {
    isOpen.value = false;
  }
}
</script>

<style scoped>
.language-dropdown {
  position: relative;
}

.language-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 50;
}

.language-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
}

.language-menu-item:hover {
  background-color: #f3f4f6;
}

.language-menu-item.active {
  background-color: #eff6ff;
  font-weight: 600;
}
</style>
```

## Language Switcher in Toolbar

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";
import { IBladeToolbar } from "@vc-shell/framework";

const { currentLocale, setLocale, getLocaleByTag, getFlag } = useLanguages();
const { availableLocales } = useI18n();

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages = ref<Language[]>([]);

// Create toolbar items for language switching
const bladeToolbar = computed<IBladeToolbar[]>(() => {
  return languages.value.map((lang) => ({
    id: `lang-${lang.code}`,
    title: lang.name,
    icon: lang.flag, // Can use flag as icon
    clickHandler: () => changeLanguage(lang.code),
    isActive: lang.code === currentLocale.value
  }));
});

onMounted(async () => {
  const languagePromises = availableLocales.map(async (locale) => {
    const name = getLocaleByTag(locale);
    const flag = await getFlag(locale);
    return name ? { code: locale, name, flag } : null;
  });

  const results = await Promise.all(languagePromises);
  languages.value = results.filter((lang): lang is Language => lang !== null);
});

function changeLanguage(locale: string) {
  setLocale(locale);
}
</script>

<template>
  <VcBlade
    title="Content"
    :toolbar-items="bladeToolbar"
  >
    <!-- Blade content -->
  </VcBlade>
</template>
```

## Settings Page Language Selector

```vue
<template>
  <VcBlade title="Settings">
    <VcContainer class="tw-p-4">
      <VcCard header="Language & Region">
        <div class="tw-p-4 tw-space-y-4">
          <!-- Language selector -->
          <div>
            <label class="tw-block tw-font-semibold tw-mb-2">
              Application Language
            </label>

            <div class="tw-space-y-2">
              <div
                v-for="lang in languages"
                :key="lang.code"
                :class="[
                  'language-option',
                  { selected: lang.code === currentLocale }
                ]"
                @click="selectLanguage(lang.code)"
              >
                <img
                  :src="lang.flag"
                  :alt="lang.name"
                  class="tw-w-6 tw-h-4"
                />
                <span class="tw-flex-1">{{ lang.name }}</span>
                <VcIcon
                  v-if="lang.code === currentLocale"
                  icon="material-check_circle"
                  class="tw-text-green-500"
                />
              </div>
            </div>
          </div>

          <!-- Current locale info -->
          <div class="tw-pt-4 tw-border-t">
            <VcField
              label="Current Locale"
              :model-value="currentLocale"
            />
          </div>
        </div>
      </VcCard>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useLanguages, notification } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale, setLocale, getLocaleByTag, getFlag } = useLanguages();
const { availableLocales } = useI18n();

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages = ref<Language[]>([]);

onMounted(async () => {
  const languagePromises = availableLocales.map(async (locale) => {
    const name = getLocaleByTag(locale);
    const flag = await getFlag(locale);
    return name ? { code: locale, name, flag } : null;
  });

  const results = await Promise.all(languagePromises);
  languages.value = results.filter((lang): lang is Language => lang !== null);
});

function selectLanguage(locale: string) {
  if (locale === currentLocale.value) return;

  setLocale(locale);
  const languageName = getLocaleByTag(locale);
  notification.success(`Language changed to ${languageName}`);
}
</script>

<style scoped>
.language-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.language-option:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.language-option.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
</style>
```

## Mobile-Friendly Language Selector

```vue
<template>
  <div class="mobile-language-selector">
    <!-- Current language display -->
    <VcButton
      @click="showModal = true"
      class="tw-w-full tw-flex tw-items-center tw-justify-between"
    >
      <div class="tw-flex tw-items-center tw-gap-2">
        <img
          v-if="currentLanguage"
          :src="currentLanguage.flag"
          :alt="currentLanguage.name"
          class="tw-w-6 tw-h-4"
        />
        <span>{{ currentLanguage?.name }}</span>
      </div>
      <VcIcon icon="material-language" />
    </VcButton>

    <!-- Modal for language selection -->
    <VcModal v-model="showModal" title="Select Language">
      <div class="tw-space-y-2 tw-p-4">
        <button
          v-for="lang in languages"
          :key="lang.code"
          :class="[
            'mobile-language-item',
            { active: lang.code === currentLocale }
          ]"
          @click="selectLanguage(lang.code)"
        >
          <img
            :src="lang.flag"
            :alt="lang.name"
            class="tw-w-8 tw-h-6"
          />
          <span class="tw-text-lg">{{ lang.name }}</span>
          <VcIcon
            v-if="lang.code === currentLocale"
            icon="material-check"
            class="tw-text-green-500 tw-ml-auto"
          />
        </button>
      </div>
    </VcModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale, setLocale, getLocaleByTag, getFlag } = useLanguages();
const { availableLocales } = useI18n();

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages = ref<Language[]>([]);
const showModal = ref(false);

const currentLanguage = computed(() =>
  languages.value.find((lang) => lang.code === currentLocale.value)
);

onMounted(async () => {
  const languagePromises = availableLocales.map(async (locale) => {
    const name = getLocaleByTag(locale);
    const flag = await getFlag(locale);
    return name ? { code: locale, name, flag } : null;
  });

  const results = await Promise.all(languagePromises);
  languages.value = results.filter((lang): lang is Language => lang !== null);
});

function selectLanguage(locale: string) {
  setLocale(locale);
  showModal.value = false;
}
</script>

<style scoped>
.mobile-language-item {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 8px;
}

.mobile-language-item:hover {
  background-color: #f3f4f6;
}

.mobile-language-item.active {
  background-color: #eff6ff;
  font-weight: 600;
}
</style>
```

## Using Built-in LanguageSelector Component

```vue
<template>
  <VcBlade title="Settings">
    <VcContainer class="tw-p-4">
      <!-- Use VC-Shell's built-in LanguageSelector -->
      <LanguageSelector />

      <!-- Other settings -->
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { LanguageSelector } from "@vc-shell/framework";

// The LanguageSelector component uses useLanguages internally
// No additional setup needed
</script>
```

## Important Notes

### ✅ DO

- Load flag icons asynchronously with `getFlag()`
- Use native language names from `getLocaleByTag()`
- Show current language as active/selected
- Provide visual feedback on language change
- Handle async flag loading with loading states

### ❌ DON'T

- Don't hardcode language names (use `getLocaleByTag()`)
- Don't forget to handle flag loading errors
- Don't block UI while loading flags
- Don't forget to close dropdowns after selection

## Accessibility

```vue
<template>
  <div class="accessible-language-switcher">
    <label for="language-select" class="sr-only">
      Select Language
    </label>

    <select
      id="language-select"
      v-model="selectedLanguage"
      @change="handleChange"
      class="language-select"
      aria-label="Language selection"
    >
      <option
        v-for="lang in languages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { currentLocale, setLocale } = useLanguages();

const selectedLanguage = ref(currentLocale.value);

function handleChange() {
  setLocale(selectedLanguage.value);
}

watch(currentLocale, (newLocale) => {
  selectedLanguage.value = newLocale;
});
</script>
```

## See Also

- [basic-usage.md](./basic-usage.md) - Basic useLanguages usage
- [localized-content.md](./localized-content.md) - Working with localized content
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/) - Internationalization guide

**Reference:** [Official VC-Shell Documentation - useLanguages](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useLanguages/)
