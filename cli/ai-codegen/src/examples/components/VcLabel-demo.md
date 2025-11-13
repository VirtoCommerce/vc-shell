# VcLabel Demo

Real-world label examples for form fields with required indicators, tooltips, and multilanguage support.

## Basic Form Labels

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="true">
        {{ $t("VENDOR.NAME") }}
      </VcLabel>
      <VcInput
        v-model="vendorName"
        :placeholder="$t('VENDOR.NAME_PLACEHOLDER')"
      />
    </div>

    <div>
      <VcLabel :required="false">
        {{ $t("VENDOR.DESCRIPTION") }}
      </VcLabel>
      <VcTextarea
        v-model="description"
        :placeholder="$t('VENDOR.DESCRIPTION_PLACEHOLDER')"
      />
    </div>

    <div>
      <VcLabel :required="true">
        {{ $t("VENDOR.EMAIL") }}
      </VcLabel>
      <VcInput
        v-model="email"
        type="email"
        :placeholder="$t('VENDOR.EMAIL_PLACEHOLDER')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcInput, VcTextarea } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const vendorName = ref("");
const description = ref("");
const email = ref("");
</script>
```

## Labels with Tooltips

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="true">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span>{{ $t("PRODUCTS.SKU") }}</span>
          <VcTooltip>
            <template #trigger>
              <VcIcon
                icon="material-help"
                size="s"
                class="tw-text-[var(--neutrals-400)] tw-cursor-help"
              />
            </template>
            <template #content>
              {{ $t("PRODUCTS.SKU_TOOLTIP") }}
            </template>
          </VcTooltip>
        </div>
      </VcLabel>
      <VcInput v-model="sku" placeholder="PROD-001" />
    </div>

    <div>
      <VcLabel :required="false">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span>{{ $t("PRODUCTS.WEIGHT") }}</span>
          <VcTooltip>
            <template #trigger>
              <VcIcon
                icon="material-info"
                size="s"
                class="tw-text-[var(--info-500)] tw-cursor-help"
              />
            </template>
            <template #content>
              <div class="tw-space-y-1">
                <div class="tw-font-medium">{{ $t("PRODUCTS.WEIGHT_TOOLTIP.TITLE") }}</div>
                <div class="tw-text-xs">{{ $t("PRODUCTS.WEIGHT_TOOLTIP.DESCRIPTION") }}</div>
              </div>
            </template>
          </VcTooltip>
        </div>
      </VcLabel>
      <VcInputDropdown
        v-model="weight"
        :options="weightUnits"
        placeholder="0.0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcInput, VcInputDropdown, VcIcon, VcTooltip } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const sku = ref("");
const weight = ref("");
const weightUnits = ["kg", "lb", "g", "oz"];
</script>
```

## Labels with Multilanguage Support

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="true">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span>{{ $t("PRODUCTS.NAME") }}</span>
          <VcBadge
            v-for="locale in availableLocales"
            :key="locale"
            :content="locale.toUpperCase()"
            :variant="currentLocale === locale ? 'primary' : 'secondary'"
            size="s"
            clickable
            @click="switchLocale(locale)"
          />
        </div>
      </VcLabel>
      <VcInput
        v-model="productNames[currentLocale]"
        :placeholder="$t('PRODUCTS.NAME_PLACEHOLDER')"
      />
      <VcHint v-if="currentLocale !== 'en'">
        {{ $t("PRODUCTS.TRANSLATION_HINT", { locale: currentLocale }) }}
      </VcHint>
    </div>

    <div>
      <VcLabel :required="false">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span>{{ $t("PRODUCTS.DESCRIPTION") }}</span>
          <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
            ({{ currentLocale.toUpperCase() }})
          </span>
        </div>
      </VcLabel>
      <VcEditor
        v-model="productDescriptions[currentLocale]"
        :placeholder="$t('PRODUCTS.DESCRIPTION_PLACEHOLDER')"
      />
    </div>

    <!-- Show all translations -->
    <VcCard :header="$t('PRODUCTS.ALL_TRANSLATIONS')">
      <div class="tw-space-y-2">
        <div
          v-for="locale in availableLocales"
          :key="locale"
          class="tw-flex tw-items-center tw-gap-3"
        >
          <VcBadge :content="locale.toUpperCase()" size="s" />
          <span class="tw-text-sm">{{ productNames[locale] || $t("COMMON.NOT_SET") }}</span>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  VcLabel,
  VcInput,
  VcEditor,
  VcHint,
  VcBadge,
  VcCard,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const availableLocales = ["en", "de", "fr", "es"];
const currentLocale = ref("en");

const productNames = reactive<Record<string, string>>({
  en: "",
  de: "",
  fr: "",
  es: "",
});

const productDescriptions = reactive<Record<string, string>>({
  en: "",
  de: "",
  fr: "",
  es: "",
});

function switchLocale(locale: string) {
  currentLocale.value = locale;
}
</script>
```

## Labels with Counters

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="true">
        <div class="tw-flex tw-items-center tw-justify-between">
          <span>{{ $t("PRODUCTS.SHORT_DESCRIPTION") }}</span>
          <span
            :class="[
              'tw-text-xs',
              shortDescription.length > 100
                ? 'tw-text-[var(--danger-500)]'
                : 'tw-text-[var(--neutrals-500)]'
            ]"
          >
            {{ shortDescription.length }}/100
          </span>
        </div>
      </VcLabel>
      <VcTextarea
        v-model="shortDescription"
        :maxlength="100"
        :placeholder="$t('PRODUCTS.SHORT_DESCRIPTION_PLACEHOLDER')"
      />
    </div>

    <div>
      <VcLabel :required="false">
        <div class="tw-flex tw-items-center tw-justify-between">
          <span>{{ $t("PRODUCTS.META_DESCRIPTION") }}</span>
          <div class="tw-flex tw-items-center tw-gap-2">
            <VcStatusIcon
              :variant="getMetaDescriptionStatus(metaDescription.length)"
            />
            <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
              {{ metaDescription.length }}/160 {{ $t("COMMON.CHARACTERS") }}
            </span>
          </div>
        </div>
      </VcLabel>
      <VcTextarea
        v-model="metaDescription"
        :placeholder="$t('PRODUCTS.META_DESCRIPTION_PLACEHOLDER')"
        :rows="3"
      />
      <VcHint>
        <div
          :class="[
            'tw-text-xs',
            metaDescription.length < 50 && 'tw-text-[var(--warning-500)]',
            metaDescription.length > 160 && 'tw-text-[var(--danger-500)]'
          ]"
        >
          {{ getMetaDescriptionHint() }}
        </div>
      </VcHint>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcTextarea, VcHint, VcStatusIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const shortDescription = ref("");
const metaDescription = ref("");

function getMetaDescriptionStatus(length: number): string {
  if (length === 0) return "secondary";
  if (length < 50) return "warning";
  if (length > 160) return "danger";
  return "success";
}

function getMetaDescriptionHint(): string {
  const length = metaDescription.value.length;
  
  if (length === 0) {
    return t("PRODUCTS.META_DESCRIPTION_HINT.EMPTY");
  }
  if (length < 50) {
    return t("PRODUCTS.META_DESCRIPTION_HINT.TOO_SHORT");
  }
  if (length > 160) {
    return t("PRODUCTS.META_DESCRIPTION_HINT.TOO_LONG");
  }
  return t("PRODUCTS.META_DESCRIPTION_HINT.OPTIMAL");
}
</script>
```

## Labels in Complex Forms

```vue
<template>
  <VcForm @submit="onSubmit">
    <div class="tw-space-y-6">
      <!-- Basic Information Section -->
      <div class="tw-border tw-rounded-lg tw-p-4">
        <h3 class="tw-font-bold tw-mb-4">{{ $t("VENDOR.BASIC_INFO") }}</h3>
        
        <div class="tw-grid tw-grid-cols-2 tw-gap-4">
          <div>
            <VcLabel :required="true">
              {{ $t("VENDOR.COMPANY_NAME") }}
            </VcLabel>
            <Field v-slot="{ field, errorMessage }" name="companyName" :rules="requiredRule">
              <VcInput
                v-bind="field"
                :error-message="errorMessage"
                :placeholder="$t('VENDOR.COMPANY_NAME_PLACEHOLDER')"
              />
            </Field>
          </div>

          <div>
            <VcLabel :required="false">
              {{ $t("VENDOR.LEGAL_NAME") }}
            </VcLabel>
            <Field v-slot="{ field }" name="legalName">
              <VcInput
                v-bind="field"
                :placeholder="$t('VENDOR.LEGAL_NAME_PLACEHOLDER')"
              />
            </Field>
          </div>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="tw-border tw-rounded-lg tw-p-4">
        <h3 class="tw-font-bold tw-mb-4">{{ $t("VENDOR.CONTACT_INFO") }}</h3>
        
        <div class="tw-space-y-4">
          <div>
            <VcLabel :required="true">
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-email" size="s" />
                <span>{{ $t("VENDOR.EMAIL") }}</span>
              </div>
            </VcLabel>
            <Field v-slot="{ field, errorMessage }" name="email" :rules="emailRule">
              <VcInput
                v-bind="field"
                :error-message="errorMessage"
                type="email"
                :placeholder="$t('VENDOR.EMAIL_PLACEHOLDER')"
              />
            </Field>
          </div>

          <div>
            <VcLabel :required="false">
              <div class="tw-flex tw-items-center tw-gap-2">
                <VcIcon icon="material-phone" size="s" />
                <span>{{ $t("VENDOR.PHONE") }}</span>
              </div>
            </VcLabel>
            <Field v-slot="{ field }" name="phone">
              <VcInput
                v-bind="field"
                :placeholder="$t('VENDOR.PHONE_PLACEHOLDER')"
              />
            </Field>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="tw-flex tw-justify-end">
        <VcButton type="submit" variant="primary">
          {{ $t("COMMON.SAVE") }}
        </VcButton>
      </div>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { VcLabel, VcInput, VcForm, VcButton, VcIcon } from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function requiredRule(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  return true;
}

function emailRule(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  if (!value.includes("@")) return t("VALIDATION.INVALID_EMAIL");
  return true;
}

function onSubmit() {
  console.log("Form submitted");
}
</script>
```

## Labels with Conditional Requirements

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="false">
        {{ $t("PRODUCTS.ENABLE_VARIANTS") }}
      </VcLabel>
      <VcSwitch v-model="hasVariants" />
    </div>

    <!-- Conditionally required fields -->
    <div v-if="hasVariants" class="tw-border tw-rounded-lg tw-p-4 tw-space-y-4">
      <div>
        <VcLabel :required="true">
          {{ $t("PRODUCTS.VARIANT_TYPE") }}
        </VcLabel>
        <VcSelect
          v-model="variantType"
          :options="variantTypes"
          :placeholder="$t('PRODUCTS.SELECT_VARIANT_TYPE')"
        />
      </div>

      <div>
        <VcLabel :required="true">
          <div class="tw-flex tw-items-center tw-gap-2">
            <span>{{ $t("PRODUCTS.VARIANT_OPTIONS") }}</span>
            <VcBadge content="Required when variants enabled" variant="warning" size="s" />
          </div>
        </VcLabel>
        <VcMultivalue
          v-model="variantOptions"
          :placeholder="$t('PRODUCTS.VARIANT_OPTIONS_PLACEHOLDER')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcLabel,
  VcSwitch,
  VcSelect,
  VcMultivalue,
  VcBadge,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const hasVariants = ref(false);
const variantType = ref("");
const variantOptions = ref<string[]>([]);

const variantTypes = ["Size", "Color", "Material", "Style"];
</script>
```

## Key Points

### Required Indicator
- Use `:required="true"` to show asterisk (*)
- Use `:required="false"` or omit for optional fields
- Required indicator automatically styled and positioned

### Label Content
- Keep labels short and descriptive (1-3 words)
- Use sentence case, not title case
- Always use i18n for labels (`$t()`)

### Enhanced Labels
- **With Icons**: Add visual context
```vue
<VcLabel>
  <div class="tw-flex tw-items-center tw-gap-2">
    <VcIcon icon="material-email" size="s" />
    <span>Email</span>
  </div>
</VcLabel>
```

- **With Tooltips**: Provide additional context
```vue
<VcLabel>
  <div class="tw-flex tw-items-center tw-gap-2">
    <span>SKU</span>
    <VcTooltip>
      <template #trigger>
        <VcIcon icon="material-help" />
      </template>
      <template #content>Stock Keeping Unit</template>
    </VcTooltip>
  </div>
</VcLabel>
```

- **With Counters**: Show character limits
```vue
<VcLabel>
  <div class="tw-flex tw-justify-between">
    <span>Description</span>
    <span class="tw-text-xs">{{ count }}/100</span>
  </div>
</VcLabel>
```

### Common Use Cases

1. **Basic Form Field**: Simple label + input
2. **With Validation**: Required indicator for validated fields
3. **Multilanguage**: Language switcher badges
4. **Character Counter**: Show remaining characters
5. **Conditional Requirements**: Dynamic required state
6. **Section Headers**: Group related fields
7. **With Help Text**: Tooltips for clarification

### Best Practices

- Always pair VcLabel with form inputs
- Place required indicator on truly required fields only
- Use tooltips sparingly for complex concepts
- Keep character counters visible and real-time
- Group related labels in sections with headers
- Use icons consistently (email=envelope, phone=phone, etc.)
- Show multilanguage context clearly
- Update required state dynamically when rules change
- Make labels clickable to focus inputs (native behavior)

