---
id: useLanguages-localized-content
type: FRAMEWORK_API
category: composable
tags: [composable, i18n, translations, localized-data]
title: "useLanguages - Localized Content"
description: "Working with localized content and translations"
---

# useLanguages - Localized Content

Working with localized content, translations, and multilingual data in VC-Shell applications.

## Overview

- Integrate with Vue I18n for translations
- Load localized data based on current locale
- Handle multilingual form fields
- Display localized content
- React to language changes

## Basic Translations with Vue I18n

```vue
<template>
  <VcBlade :title="t('OFFERS.TITLE')">
    <div class="tw-p-4">
      <h2>{{ t('OFFERS.SUBTITLE') }}</h2>
      <p>{{ t('OFFERS.DESCRIPTION') }}</p>

      <VcButton @click="onCreate">
        {{ t('OFFERS.ACTIONS.CREATE') }}
      </VcButton>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLanguages } from "@vc-shell/framework";

const { t } = useI18n();
const { currentLocale } = useLanguages();

// Translations automatically update when locale changes
// No manual handling needed!
</script>
```

## Load Localized Data on Language Change

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useApiClient } from "@vc-shell/framework";
import { OffersClient } from "../api_client/offers.client";

const { currentLocale } = useLanguages();
const { getApiClient } = useApiClient(OffersClient);

const offers = ref([]);
const loading = ref(false);

// Load offers with localized data
async function loadOffers() {
  loading.value = true;
  try {
    const client = await getApiClient();
    const result = await client.searchOffers(
      new SearchOffersQuery({
        take: 20,
        skip: 0,
        locale: currentLocale.value // Pass current locale to API
      })
    );
    offers.value = result.results;
  } finally {
    loading.value = false;
  }
}

// Reload when language changes
watch(currentLocale, () => {
  loadOffers();
});

onMounted(() => {
  loadOffers();
});
</script>

<template>
  <VcBlade title="Offers" v-loading="loading">
    <!-- @vue-generic {IOffer} -->
    <VcTable :items="offers" :columns="columns" />
  </VcBlade>
</template>
```

## Multilingual Form Fields

```vue
<template>
  <VcBlade title="Edit Offer">
    <VcForm @submit="onSave">
      <div class="tw-space-y-4">
        <!-- Language selector for content -->
        <div class="tw-flex tw-gap-2 tw-mb-4">
          <VcButton
            v-for="lang in contentLanguages"
            :key="lang"
            :variant="currentContentLanguage === lang ? 'primary' : 'outline'"
            @click="currentContentLanguage = lang"
          >
            {{ getLocaleByTag(lang) }}
          </VcButton>
        </div>

        <!-- Localized fields -->
        <Field
          v-slot="{ field, errors }"
          :name="`name_${currentContentLanguage}`"
          rules="required"
        >
          <VcInput
            v-bind="field"
            v-model="offer.localizedData[currentContentLanguage].name"
            :label="t('OFFERS.FIELDS.NAME')"
            :error="!!errors.length"
            :error-message="errors[0]"
          />
        </Field>

        <Field
          v-slot="{ field }"
          :name="`description_${currentContentLanguage}`"
        >
          <VcTextarea
            v-bind="field"
            v-model="offer.localizedData[currentContentLanguage].description"
            :label="t('OFFERS.FIELDS.DESCRIPTION')"
            rows="4"
          />
        </Field>

        <!-- Non-localized fields -->
        <Field
          v-slot="{ field, errors }"
          name="price"
          rules="required|numeric"
        >
          <VcInput
            v-bind="field"
            v-model="offer.price"
            :label="t('OFFERS.FIELDS.PRICE')"
            type="number"
            :error="!!errors.length"
            :error-message="errors[0]"
          />
        </Field>
      </div>

      <template #actions>
        <VcButton type="submit" :loading="loading">
          {{ t('COMMON.SAVE') }}
        </VcButton>
      </template>
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useLanguages } from "@vc-shell/framework";
import { Field } from "vee-validate";

const { t } = useI18n();
const { getLocaleByTag } = useLanguages();

// Content languages (different from UI language)
const contentLanguages = ["en", "fr", "es", "de"];
const currentContentLanguage = ref("en");

const offer = ref({
  price: 0,
  localizedData: {
    en: { name: "", description: "" },
    fr: { name: "", description: "" },
    es: { name: "", description: "" },
    de: { name: "", description: "" }
  }
});

const loading = ref(false);

async function onSave() {
  loading.value = true;
  try {
    // Save offer with all localized data
    await saveOffer(offer.value);
  } finally {
    loading.value = false;
  }
}
</script>
```

## Display Localized Content

```vue
<template>
  <VcBlade title="Offer Details">
    <div class="tw-p-4">
      <!-- Show content in current UI language -->
      <VcCard :header="localizedOffer.name">
        <div class="tw-p-4 tw-space-y-4">
          <VcField
            :label="t('OFFERS.FIELDS.NAME')"
            :model-value="localizedOffer.name"
          />

          <VcField
            :label="t('OFFERS.FIELDS.DESCRIPTION')"
            :model-value="localizedOffer.description"
          />

          <VcField
            :label="t('OFFERS.FIELDS.PRICE')"
            :model-value="formatPrice(offer.price)"
          />
        </div>
      </VcCard>

      <!-- Show all available translations -->
      <VcCard header="Available Translations" class="tw-mt-4">
        <div class="tw-p-4">
          <div
            v-for="(data, locale) in offer.localizedData"
            :key="locale"
            class="tw-mb-4"
          >
            <h4 class="tw-font-semibold tw-mb-2">
              {{ getLocaleByTag(locale) }} ({{ locale }})
            </h4>
            <div class="tw-pl-4 tw-border-l-2 tw-space-y-1">
              <p><strong>Name:</strong> {{ data.name || '—' }}</p>
              <p><strong>Description:</strong> {{ data.description || '—' }}</p>
            </div>
          </div>
        </div>
      </VcCard>
    </div>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLanguages } from "@vc-shell/framework";

const { t } = useI18n();
const { currentLocale, getLocaleByTag } = useLanguages();

const offer = ref({
  id: "offer-123",
  price: 299.99,
  localizedData: {
    en: { name: "Special Offer", description: "Limited time offer" },
    fr: { name: "Offre Spéciale", description: "Offre à durée limitée" },
    es: { name: "Oferta Especial", description: "Oferta por tiempo limitado" },
    de: { name: "Sonderangebot", description: "Zeitlich begrenztes Angebot" }
  }
});

// Get localized content for current UI language
const localizedOffer = computed(() => {
  const locale = currentLocale.value;
  return offer.value.localizedData[locale] || offer.value.localizedData.en;
});

function formatPrice(price: number): string {
  return new Intl.NumberFormat(currentLocale.value, {
    style: "currency",
    currency: "USD"
  }).format(price);
}
</script>
```

## Localized Validation Messages

```vue
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useLanguages } from "@vc-shell/framework";
import { Field } from "vee-validate";

const { t } = useI18n();
const { currentLocale } = useLanguages();

// Vee-Validate automatically uses current locale from useLanguages
// No manual configuration needed!

// Custom validation messages per locale are in locales files:
// en.json: { "validations": { "required": "This field is required" } }
// fr.json: { "validations": { "required": "Ce champ est obligatoire" } }
</script>

<template>
  <VcForm @submit="onSubmit">
    <Field
      v-slot="{ field, errors }"
      name="email"
      rules="required|email"
    >
      <VcInput
        v-bind="field"
        :label="t('COMMON.EMAIL')"
        :error="!!errors.length"
        :error-message="errors[0]"
      />
    </Field>
  </VcForm>
</template>
```

## Locale-Based Data Formatting

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { currentLocale } = useLanguages();

const order = ref({
  date: "2025-01-21T10:30:00Z",
  total: 1234.56,
  quantity: 1000
});

// Format date based on locale
const formattedDate = computed(() => {
  const date = new Date(order.value.date);
  return new Intl.DateTimeFormat(currentLocale.value, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
});

// Format number based on locale
const formattedQuantity = computed(() => {
  return new Intl.NumberFormat(currentLocale.value).format(order.value.quantity);
});

// Format currency based on locale
const formattedTotal = computed(() => {
  return new Intl.NumberFormat(currentLocale.value, {
    style: "currency",
    currency: "USD"
  }).format(order.value.total);
});
</script>

<template>
  <div class="order-details">
    <VcField label="Date" :model-value="formattedDate" />
    <VcField label="Quantity" :model-value="formattedQuantity" />
    <VcField label="Total" :model-value="formattedTotal" />
  </div>
</template>
```

## Translation Module Structure

```typescript
// src/modules/offers/locales/en.json
{
  "OFFERS": {
    "TITLE": "Offers",
    "SUBTITLE": "Manage your offers",
    "DESCRIPTION": "View and edit all your offers",
    "FIELDS": {
      "NAME": "Offer Name",
      "DESCRIPTION": "Description",
      "PRICE": "Price",
      "CATEGORY": "Category",
      "STATUS": "Status"
    },
    "ACTIONS": {
      "CREATE": "Create Offer",
      "EDIT": "Edit Offer",
      "DELETE": "Delete Offer",
      "SAVE": "Save Changes"
    },
    "MESSAGES": {
      "CREATED": "Offer created successfully",
      "UPDATED": "Offer updated successfully",
      "DELETED": "Offer deleted successfully",
      "LOAD_FAILED": "Failed to load offer"
    }
  }
}
```

```typescript
// src/modules/offers/locales/fr.json
{
  "OFFERS": {
    "TITLE": "Offres",
    "SUBTITLE": "Gérer vos offres",
    "DESCRIPTION": "Voir et modifier toutes vos offres",
    "FIELDS": {
      "NAME": "Nom de l'offre",
      "DESCRIPTION": "Description",
      "PRICE": "Prix",
      "CATEGORY": "Catégorie",
      "STATUS": "Statut"
    },
    "ACTIONS": {
      "CREATE": "Créer une offre",
      "EDIT": "Modifier l'offre",
      "DELETE": "Supprimer l'offre",
      "SAVE": "Enregistrer les modifications"
    },
    "MESSAGES": {
      "CREATED": "Offre créée avec succès",
      "UPDATED": "Offre mise à jour avec succès",
      "DELETED": "Offre supprimée avec succès",
      "LOAD_FAILED": "Échec du chargement de l'offre"
    }
  }
}
```

```typescript
// src/modules/offers/locales/index.ts
import en from "./en.json";
import fr from "./fr.json";
import es from "./es.json";

export default { en, fr, es };
```

## Localized Table Columns

```vue
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useLanguages } from "@vc-shell/framework";

const { t } = useI18n();
const { currentLocale } = useLanguages();

// Column definitions update automatically with language
const columns = computed(() => [
  {
    id: "name",
    title: t("OFFERS.FIELDS.NAME"),
    width: "200px"
  },
  {
    id: "description",
    title: t("OFFERS.FIELDS.DESCRIPTION"),
    width: "300px"
  },
  {
    id: "price",
    title: t("OFFERS.FIELDS.PRICE"),
    width: "120px",
    type: "number"
  },
  {
    id: "status",
    title: t("OFFERS.FIELDS.STATUS"),
    width: "120px"
  }
]);
</script>

<template>
  <VcTable :items="offers" :columns="columns" />
</template>
```

## Fallback Language Handling

```typescript
import { computed } from "vue";
import { useLanguages } from "@vc-shell/framework";

const { currentLocale } = useLanguages();

interface LocalizedContent {
  [locale: string]: {
    name: string;
    description: string;
  };
}

const offer = ref<{ localizedData: LocalizedContent }>({
  localizedData: {
    en: { name: "Offer", description: "Description" },
    fr: { name: "Offre", description: "Description" }
    // German translation not available
  }
});

// Get localized content with fallback chain
const localizedOffer = computed(() => {
  const locale = currentLocale.value;

  // Try current locale
  if (offer.value.localizedData[locale]) {
    return offer.value.localizedData[locale];
  }

  // Try base language (e.g., "en" from "en-US")
  const baseLocale = locale.split("-")[0];
  if (offer.value.localizedData[baseLocale]) {
    return offer.value.localizedData[baseLocale];
  }

  // Fallback to English
  if (offer.value.localizedData.en) {
    return offer.value.localizedData.en;
  }

  // Last resort: first available translation
  const firstLocale = Object.keys(offer.value.localizedData)[0];
  return offer.value.localizedData[firstLocale];
});
```

## Dynamic Import of Locale Files

```typescript
import { watch } from "vue";
import { useLanguages } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { currentLocale } = useLanguages();
const { mergeLocaleMessage } = useI18n();

// Dynamically load translation files
watch(currentLocale, async (newLocale) => {
  try {
    const messages = await import(`../locales/${newLocale}.json`);
    mergeLocaleMessage(newLocale, messages.default);
  } catch (error) {
    console.warn(`Failed to load translations for ${newLocale}:`, error);
  }
});
```

## Important Notes

### ✅ DO

- Use `t()` from vue-i18n for all UI text
- Pass current locale to API calls for localized data
- Reload data when language changes (if needed)
- Use `Intl` API for formatting dates, numbers, currencies
- Provide fallback translations (English recommended)
- Structure translations hierarchically (MODULES.SECTION.KEY)

### ❌ DON'T

- Don't hardcode any user-facing text
- Don't forget to reload localized data on language change
- Don't mix UI language with content language
- Don't assume locale format (always use useLanguages utilities)
- Don't forget to handle missing translations

## Translation Keys Best Practices

```typescript
// ✅ GOOD: Hierarchical and descriptive
"OFFERS.FIELDS.NAME"
"OFFERS.ACTIONS.CREATE"
"OFFERS.MESSAGES.CREATED"

// ❌ BAD: Flat and unclear
"offerName"
"create"
"success"
```

## See Also

- [basic-usage.md](./basic-usage.md) - Basic useLanguages usage
- [language-switcher.md](./language-switcher.md) - Language switcher components
- [Vue I18n Documentation](https://vue-i18n.intlify.dev/) - Internationalization guide

**Reference:** [Official VC-Shell Documentation - useLanguages](https://docs.virtocommerce.org/platform/developer-guide/custom-apps-development/vc-shell/Essentials/composables/useLanguages/)
