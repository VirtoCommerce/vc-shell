# VcHint Demo

Real-world hint examples for helper text, validation hints, and contextual information.

## Basic Input Helper Text

```vue
<template>
  <div class="tw-space-y-4">
    <Field v-slot="{ field, errorMessage }" name="email" :rules="emailRules">
      <VcInput
        v-bind="field"
        :label="$t('VENDOR.EMAIL')"
        :error-message="errorMessage"
        placeholder="vendor@example.com"
      />
      <VcHint v-if="!errorMessage">
        {{ $t("VENDOR.EMAIL_HINT") }}
      </VcHint>
    </Field>

    <Field v-slot="{ field, errorMessage }" name="phone" :rules="phoneRules">
      <VcInput
        v-bind="field"
        :label="$t('VENDOR.PHONE')"
        :error-message="errorMessage"
        placeholder="+1 (555) 123-4567"
      />
      <VcHint v-if="!errorMessage">
        {{ $t("VENDOR.PHONE_HINT") }}
      </VcHint>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { VcInput, VcHint } from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

function emailRules(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  if (!value.includes("@")) return t("VALIDATION.INVALID_EMAIL");
  return true;
}

function phoneRules(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  const phoneRegex = /^\+?[\d\s()-]+$/;
  if (!phoneRegex.test(value)) return t("VALIDATION.INVALID_PHONE");
  return true;
}
</script>
```

## Password Strength Hint

```vue
<template>
  <div class="tw-space-y-4">
    <Field v-slot="{ field, errorMessage, meta }" name="password">
      <VcInput
        v-bind="field"
        :label="$t('AUTH.PASSWORD')"
        :error-message="errorMessage"
        type="password"
        @input="checkPasswordStrength"
      />
      <VcHint v-if="!errorMessage && passwordStrength">
        <div class="tw-flex tw-items-center tw-gap-2">
          <span>{{ $t("AUTH.PASSWORD_STRENGTH") }}:</span>
          <VcBadge
            :content="passwordStrength.label"
            :variant="passwordStrength.variant"
            size="s"
          />
        </div>
        <ul class="tw-mt-2 tw-text-xs tw-space-y-1">
          <li :class="requirements.length ? 'tw-text-[var(--success-500)]' : 'tw-text-[var(--neutrals-500)]'">
            <VcIcon :icon="requirements.length ? 'material-check' : 'material-circle'" size="xs" />
            {{ $t("AUTH.PASSWORD_MIN_LENGTH") }}
          </li>
          <li :class="requirements.uppercase ? 'tw-text-[var(--success-500)]' : 'tw-text-[var(--neutrals-500)]'">
            <VcIcon :icon="requirements.uppercase ? 'material-check' : 'material-circle'" size="xs" />
            {{ $t("AUTH.PASSWORD_UPPERCASE") }}
          </li>
          <li :class="requirements.number ? 'tw-text-[var(--success-500)]' : 'tw-text-[var(--neutrals-500)]'">
            <VcIcon :icon="requirements.number ? 'material-check' : 'material-circle'" size="xs" />
            {{ $t("AUTH.PASSWORD_NUMBER") }}
          </li>
        </ul>
      </VcHint>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { VcInput, VcHint, VcBadge, VcIcon } from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const passwordStrength = ref<{ label: string; variant: string } | null>(null);

const requirements = reactive({
  length: false,
  uppercase: false,
  number: false,
});

function checkPasswordStrength(event: Event) {
  const value = (event.target as HTMLInputElement).value;

  requirements.length = value.length >= 8;
  requirements.uppercase = /[A-Z]/.test(value);
  requirements.number = /\d/.test(value);

  const score = [requirements.length, requirements.uppercase, requirements.number].filter(Boolean).length;

  if (score === 0) {
    passwordStrength.value = null;
  } else if (score === 1) {
    passwordStrength.value = { label: "Weak", variant: "danger" };
  } else if (score === 2) {
    passwordStrength.value = { label: "Medium", variant: "warning" };
  } else {
    passwordStrength.value = { label: "Strong", variant: "success" };
  }
}
</script>
```

## File Upload Hints

```vue
<template>
  <div class="tw-space-y-4">
    <div>
      <VcLabel :required="true">
        {{ $t("PRODUCTS.IMAGES") }}
      </VcLabel>
      <VcFileUpload
        v-model="files"
        :multiple="true"
        :accept="acceptedTypes"
        @change="onFilesChange"
      />
      <VcHint>
        <div class="tw-space-y-1">
          <div class="tw-flex tw-items-center tw-gap-2">
            <VcIcon icon="material-info" size="s" />
            <span>{{ $t("PRODUCTS.UPLOAD_HINTS.FORMATS") }}</span>
          </div>
          <ul class="tw-pl-6 tw-text-xs tw-space-y-0.5">
            <li>{{ $t("PRODUCTS.UPLOAD_HINTS.MAX_SIZE") }}: 5 MB</li>
            <li>{{ $t("PRODUCTS.UPLOAD_HINTS.MAX_COUNT") }}: 10 {{ $t("COMMON.FILES") }}</li>
            <li>{{ $t("PRODUCTS.UPLOAD_HINTS.DIMENSIONS") }}: 1000x1000 px</li>
          </ul>
        </div>
      </VcHint>
      <VcHint v-if="uploadError" class="tw-text-[var(--danger-500)]">
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcIcon icon="material-error" size="s" />
          <span>{{ uploadError }}</span>
        </div>
      </VcHint>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcFileUpload, VcHint, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const files = ref<File[]>([]);
const acceptedTypes = "image/png,image/jpeg,image/webp";
const uploadError = ref("");

function onFilesChange(newFiles: File[]) {
  uploadError.value = "";

  // Validate file size
  const maxSize = 5 * 1024 * 1024; // 5 MB
  const invalidFiles = newFiles.filter(file => file.size > maxSize);

  if (invalidFiles.length > 0) {
    uploadError.value = t("PRODUCTS.UPLOAD_HINTS.SIZE_ERROR", { 
      count: invalidFiles.length 
    });
    return;
  }

  // Validate count
  if (newFiles.length > 10) {
    uploadError.value = t("PRODUCTS.UPLOAD_HINTS.COUNT_ERROR");
    return;
  }

  files.value = newFiles;
}
</script>
```

## Dynamic Hint Based on Input Value

```vue
<template>
  <div class="tw-space-y-4">
    <Field v-slot="{ field, errorMessage }" name="url">
      <VcInput
        v-bind="field"
        :label="$t('PRODUCTS.WEBSITE')"
        :error-message="errorMessage"
        placeholder="https://example.com"
        @input="onUrlInput"
      />
      <VcHint v-if="!errorMessage && urlHint">
        <div class="tw-flex tw-items-start tw-gap-2">
          <VcIcon 
            :icon="urlHint.icon" 
            :class="urlHint.class"
            size="s" 
          />
          <span>{{ urlHint.message }}</span>
        </div>
      </VcHint>
    </Field>

    <Field v-slot="{ field, errorMessage }" name="slug">
      <VcInput
        v-bind="field"
        :label="$t('PRODUCTS.SLUG')"
        :error-message="errorMessage"
        placeholder="product-name"
        @input="onSlugInput"
      />
      <VcHint v-if="!errorMessage">
        <div class="tw-space-y-1">
          <div>{{ $t("PRODUCTS.SLUG_HINT") }}</div>
          <div v-if="slugPreview" class="tw-text-xs tw-font-mono tw-bg-[var(--neutrals-100)] tw-p-2 tw-rounded">
            {{ slugPreview }}
          </div>
        </div>
      </VcHint>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcInput, VcHint, VcIcon } from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const urlValue = ref("");
const slugValue = ref("");

const urlHint = computed(() => {
  if (!urlValue.value) return null;

  const isSecure = urlValue.value.startsWith("https://");
  
  if (isSecure) {
    return {
      icon: "material-check_circle",
      class: "tw-text-[var(--success-500)]",
      message: t("PRODUCTS.URL_SECURE"),
    };
  } else {
    return {
      icon: "material-warning",
      class: "tw-text-[var(--warning-500)]",
      message: t("PRODUCTS.URL_NOT_SECURE"),
    };
  }
});

const slugPreview = computed(() => {
  if (!slugValue.value) return "";
  return `https://mystore.com/products/${slugValue.value}`;
});

function onUrlInput(event: Event) {
  urlValue.value = (event.target as HTMLInputElement).value;
}

function onSlugInput(event: Event) {
  slugValue.value = (event.target as HTMLInputElement).value;
}
</script>
```

## Hint with External Link

```vue
<template>
  <div class="tw-space-y-4">
    <Field v-slot="{ field, errorMessage }" name="apiKey">
      <VcInput
        v-bind="field"
        :label="$t('SETTINGS.API_KEY')"
        :error-message="errorMessage"
        type="password"
      />
      <VcHint>
        <div class="tw-flex tw-items-center tw-gap-2">
          <span>{{ $t("SETTINGS.API_KEY_HINT") }}</span>
          <VcLink
            :href="docsUrl"
            target="_blank"
          >
            {{ $t("COMMON.LEARN_MORE") }}
            <VcIcon icon="material-open_in_new" size="xs" class="tw-ml-1" />
          </VcLink>
        </div>
      </VcHint>
    </Field>

    <Field v-slot="{ field, errorMessage }" name="webhook">
      <VcInput
        v-bind="field"
        :label="$t('SETTINGS.WEBHOOK_URL')"
        :error-message="errorMessage"
        placeholder="https://api.example.com/webhook"
      />
      <VcHint>
        <div class="tw-space-y-2">
          <div>{{ $t("SETTINGS.WEBHOOK_HINT") }}</div>
          <div class="tw-flex tw-gap-2">
            <VcButton
              size="s"
              outlined
              @click="testWebhook"
            >
              <VcIcon icon="material-send" size="s" />
              {{ $t("SETTINGS.TEST_WEBHOOK") }}
            </VcButton>
            <VcLink
              :href="webhookDocsUrl"
              target="_blank"
            >
              {{ $t("COMMON.VIEW_DOCS") }}
            </VcLink>
          </div>
        </div>
      </VcHint>
    </Field>
  </div>
</template>

<script setup lang="ts">
import { VcInput, VcHint, VcLink, VcIcon, VcButton } from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const docsUrl = "https://docs.example.com/api-keys";
const webhookDocsUrl = "https://docs.example.com/webhooks";

function testWebhook() {
  console.log("Testing webhook...");
  // Send test request
}
</script>
```

## Key Points

### Usage Patterns

1. **Helper Text**: Provide contextual information below inputs
```vue
<VcInput :label="$t('FIELD.LABEL')" />
<VcHint>{{ $t("FIELD.HINT") }}</VcHint>
```

2. **Conditional Display**: Show hints only when no errors
```vue
<VcHint v-if="!errorMessage">
  Helper text here
</VcHint>
```

3. **With Icons**: Add visual context with icons
```vue
<VcHint>
  <div class="tw-flex tw-items-center tw-gap-2">
    <VcIcon icon="material-info" size="s" />
    <span>Important information</span>
  </div>
</VcHint>
```

4. **Error Hints**: Use for validation feedback
```vue
<VcHint class="tw-text-[var(--danger-500)]">
  <VcIcon icon="material-error" />
  {{ errorMessage }}
</VcHint>
```

### Common Use Cases

- **Form field help**: Explain expected input format
- **Password requirements**: Show password strength rules
- **File upload**: Display allowed formats and size limits
- **API configuration**: Link to documentation
- **Dynamic feedback**: Show preview or validation status
- **Formatting examples**: Display expected format patterns

### Best Practices

- Keep hints concise (1-2 sentences)
- Hide hints when error messages are shown
- Use icons for visual categorization
- Provide actionable information
- Link to documentation for complex topics
- Show dynamic hints that respond to user input
- Use color classes sparingly (only for errors/warnings)
- Place hints immediately below related inputs
- Group related hints with proper spacing

