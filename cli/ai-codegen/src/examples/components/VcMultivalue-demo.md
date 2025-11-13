# VcMultivalue Demo

Real-world multivalue input examples for tags, keywords, and multi-select lists.

## Basic Tags Input

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel :required="false">
      {{ $t("PRODUCTS.TAGS") }}
    </VcLabel>

    <VcMultivalue
      v-model="tags"
      :placeholder="$t('PRODUCTS.TAGS_PLACEHOLDER')"
    />

    <VcHint>
      {{ $t("PRODUCTS.TAGS_HINT") }}
    </VcHint>

    <!-- Display tags -->
    <div v-if="tags.length > 0" class="tw-flex tw-flex-wrap tw-gap-2">
      <VcBadge
        v-for="(tag, index) in tags"
        :key="index"
        :content="tag"
        variant="primary"
        clickable
        @click="removeTag(index)"
      >
        <template #default>
          <span class="tw-flex tw-items-center tw-gap-1">
            {{ tag }}
            <VcIcon icon="material-close" size="xs" />
          </span>
        </template>
      </VcBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcMultivalue, VcHint, VcBadge, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const tags = ref<string[]>([]);

function removeTag(index: number) {
  tags.value.splice(index, 1);
}
</script>
```

## Email Recipients Input

```vue
<template>
  <VcForm @submit="sendEmail">
    <div class="tw-space-y-4">
      <!-- To -->
      <div>
        <VcLabel :required="true">
          {{ $t("EMAIL.TO") }}
        </VcLabel>
        <Field v-slot="{ field, errorMessage }" name="to" :rules="emailListRules">
          <VcMultivalue
            v-bind="field"
            :error-message="errorMessage"
            :placeholder="$t('EMAIL.TO_PLACEHOLDER')"
            @blur="validateEmails(field.value)"
          />
        </Field>
      </div>

      <!-- CC -->
      <div>
        <VcLabel :required="false">
          {{ $t("EMAIL.CC") }}
        </VcLabel>
        <VcMultivalue
          v-model="email.cc"
          :placeholder="$t('EMAIL.CC_PLACEHOLDER')"
        />
      </div>

      <!-- BCC -->
      <div>
        <VcLabel :required="false">
          {{ $t("EMAIL.BCC") }}
        </VcLabel>
        <VcMultivalue
          v-model="email.bcc"
          :placeholder="$t('EMAIL.BCC_PLACEHOLDER')"
        />
      </div>

      <!-- Subject -->
      <div>
        <VcLabel :required="true">
          {{ $t("EMAIL.SUBJECT") }}
        </VcLabel>
        <VcInput
          v-model="email.subject"
          :placeholder="$t('EMAIL.SUBJECT_PLACEHOLDER')"
        />
      </div>

      <!-- Body -->
      <div>
        <VcLabel :required="true">
          {{ $t("EMAIL.MESSAGE") }}
        </VcLabel>
        <VcEditor
          v-model="email.body"
          :placeholder="$t('EMAIL.MESSAGE_PLACEHOLDER')"
        />
      </div>

      <!-- Send button -->
      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton outlined @click="saveDraft">
          {{ $t("EMAIL.SAVE_DRAFT") }}
        </VcButton>
        <VcButton type="submit" variant="primary">
          <VcIcon icon="material-send" class="tw-mr-2" />
          {{ $t("EMAIL.SEND") }}
        </VcButton>
      </div>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import {
  VcLabel,
  VcMultivalue,
  VcInput,
  VcEditor,
  VcForm,
  VcButton,
  VcIcon,
} from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const email = reactive({
  to: [] as string[],
  cc: [] as string[],
  bcc: [] as string[],
  subject: "",
  body: "",
});

function emailListRules(value: string[]) {
  if (!value || value.length === 0) {
    return t("VALIDATION.REQUIRED");
  }

  // Validate each email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const email of value) {
    if (!emailRegex.test(email)) {
      return t("VALIDATION.INVALID_EMAIL_IN_LIST", { email });
    }
  }

  return true;
}

function validateEmails(emails: string[]) {
  console.log("Validating emails:", emails);
}

function sendEmail() {
  console.log("Sending email:", email);
}

function saveDraft() {
  console.log("Saving draft:", email);
}
</script>
```

## Product Variations/Options

```vue
<template>
  <div class="tw-space-y-6">
    <VcCard :header="$t('PRODUCTS.VARIATIONS')">
      <div class="tw-space-y-4">
        <!-- Size options -->
        <div>
          <VcLabel :required="true">
            {{ $t("PRODUCTS.SIZES") }}
          </VcLabel>
          <VcMultivalue
            v-model="variations.sizes"
            :placeholder="$t('PRODUCTS.SIZES_PLACEHOLDER')"
          />
          <VcHint>
            {{ $t("PRODUCTS.SIZES_HINT") }}
          </VcHint>
        </div>

        <!-- Color options -->
        <div>
          <VcLabel :required="true">
            {{ $t("PRODUCTS.COLORS") }}
          </VcLabel>
          <VcMultivalue
            v-model="variations.colors"
            :placeholder="$t('PRODUCTS.COLORS_PLACEHOLDER')"
          />
        </div>

        <!-- Material options -->
        <div>
          <VcLabel :required="false">
            {{ $t("PRODUCTS.MATERIALS") }}
          </VcLabel>
          <VcMultivalue
            v-model="variations.materials"
            :placeholder="$t('PRODUCTS.MATERIALS_PLACEHOLDER')"
          />
        </div>
      </div>
    </VcCard>

    <!-- Generated combinations -->
    <VcCard
      v-if="variationCount > 0"
      :header="$t('PRODUCTS.VARIATION_COMBINATIONS')"
    >
      <div class="tw-space-y-2">
        <div class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-[var(--info-50)] tw-rounded">
          <span class="tw-font-medium">
            {{ $t("PRODUCTS.TOTAL_COMBINATIONS") }}:
          </span>
          <VcBadge :content="variationCount.toString()" variant="info" />
        </div>

        <div class="tw-text-sm tw-text-[var(--neutrals-600)]">
          {{ $t("PRODUCTS.VARIATION_EXAMPLES") }}:
        </div>

        <ul class="tw-space-y-1">
          <li
            v-for="(combo, index) in sampleCombinations"
            :key="index"
            class="tw-flex tw-gap-2 tw-text-sm"
          >
            <VcBadge
              v-for="(value, key) in combo"
              :key="key"
              :content="`${key}: ${value}`"
              variant="secondary"
              size="s"
            />
          </li>
        </ul>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import { VcCard, VcLabel, VcMultivalue, VcHint, VcBadge } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const variations = reactive({
  sizes: [] as string[],
  colors: [] as string[],
  materials: [] as string[],
});

const variationCount = computed(() => {
  let count = 1;
  if (variations.sizes.length) count *= variations.sizes.length;
  if (variations.colors.length) count *= variations.colors.length;
  if (variations.materials.length) count *= variations.materials.length;
  return count > 1 ? count : 0;
});

const sampleCombinations = computed(() => {
  const samples = [];
  const maxSamples = 5;

  for (let i = 0; i < Math.min(variationCount.value, maxSamples); i++) {
    const combo: Record<string, string> = {};
    
    if (variations.sizes.length) {
      combo.Size = variations.sizes[i % variations.sizes.length];
    }
    if (variations.colors.length) {
      combo.Color = variations.colors[i % variations.colors.length];
    }
    if (variations.materials.length) {
      combo.Material = variations.materials[i % variations.materials.length];
    }
    
    samples.push(combo);
  }

  return samples;
});
</script>
```

## Keywords and SEO Metadata

```vue
<template>
  <div class="tw-space-y-6">
    <VcCard :header="$t('SEO.METADATA')">
      <div class="tw-space-y-4">
        <!-- Meta Keywords -->
        <div>
          <VcLabel :required="false">
            {{ $t("SEO.META_KEYWORDS") }}
          </VcLabel>
          <VcMultivalue
            v-model="seo.keywords"
            :placeholder="$t('SEO.KEYWORDS_PLACEHOLDER')"
          />
          <VcHint>
            <div class="tw-flex tw-items-center tw-justify-between">
              <span>{{ $t("SEO.KEYWORDS_HINT") }}</span>
              <span class="tw-text-xs">
                {{ seo.keywords.length }}/10 {{ $t("SEO.KEYWORDS") }}
              </span>
            </div>
          </VcHint>
        </div>

        <!-- Focus Keywords -->
        <div>
          <VcLabel :required="false">
            {{ $t("SEO.FOCUS_KEYWORDS") }}
          </VcLabel>
          <VcMultivalue
            v-model="seo.focusKeywords"
            :placeholder="$t('SEO.FOCUS_KEYWORDS_PLACEHOLDER')"
          />
          <VcHint>
            {{ $t("SEO.FOCUS_KEYWORDS_HINT") }}
          </VcHint>
        </div>

        <!-- Alt Tags -->
        <div>
          <VcLabel :required="false">
            {{ $t("SEO.IMAGE_ALT_TAGS") }}
          </VcLabel>
          <VcMultivalue
            v-model="seo.altTags"
            :placeholder="$t('SEO.ALT_TAGS_PLACEHOLDER')"
          />
        </div>
      </div>
    </VcCard>

    <!-- Keyword Analysis -->
    <VcCard :header="$t('SEO.KEYWORD_ANALYSIS')">
      <div class="tw-space-y-3">
        <div
          v-for="keyword in seo.keywords"
          :key="keyword"
          class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded"
        >
          <span class="tw-font-medium">{{ keyword }}</span>
          <div class="tw-flex tw-items-center tw-gap-2">
            <VcBadge :content="`${getKeywordScore(keyword)}%`" :variant="getKeywordVariant(keyword)" size="s" />
            <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
              {{ $t("SEO.RELEVANCE") }}
            </span>
          </div>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { VcCard, VcLabel, VcMultivalue, VcHint, VcBadge } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const seo = reactive({
  keywords: [] as string[],
  focusKeywords: [] as string[],
  altTags: [] as string[],
});

function getKeywordScore(keyword: string): number {
  // Mock keyword relevance score
  return Math.floor(Math.random() * 40) + 60; // 60-100
}

function getKeywordVariant(keyword: string): string {
  const score = getKeywordScore(keyword);
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "danger";
}
</script>
```

## Allowed Domains/IPs

```vue
<template>
  <VcCard :header="$t('SECURITY.ACCESS_CONTROL')">
    <div class="tw-space-y-4">
      <!-- Allowed IPs -->
      <div>
        <VcLabel :required="false">
          {{ $t("SECURITY.ALLOWED_IPS") }}
        </VcLabel>
        <VcMultivalue
          v-model="security.allowedIPs"
          :placeholder="$t('SECURITY.IP_PLACEHOLDER')"
          @blur="validateIPs"
        />
        <VcHint v-if="!ipError">
          {{ $t("SECURITY.IP_HINT") }}
        </VcHint>
        <VcBanner
          v-if="ipError"
          variant="danger"
          :closable="true"
          @close="ipError = ''"
        >
          {{ ipError }}
        </VcBanner>
      </div>

      <!-- Allowed Domains -->
      <div>
        <VcLabel :required="false">
          {{ $t("SECURITY.ALLOWED_DOMAINS") }}
        </VcLabel>
        <VcMultivalue
          v-model="security.allowedDomains"
          :placeholder="$t('SECURITY.DOMAIN_PLACEHOLDER')"
        />
        <VcHint>
          {{ $t("SECURITY.DOMAIN_HINT") }}
        </VcHint>
      </div>

      <!-- Blocked IPs -->
      <div>
        <VcLabel :required="false">
          {{ $t("SECURITY.BLOCKED_IPS") }}
        </VcLabel>
        <VcMultivalue
          v-model="security.blockedIPs"
          :placeholder="$t('SECURITY.BLOCKED_IP_PLACEHOLDER')"
        />
      </div>

      <!-- Summary -->
      <div class="tw-grid tw-grid-cols-3 tw-gap-4 tw-pt-4">
        <div class="tw-p-3 tw-bg-[var(--success-50)] tw-rounded tw-text-center">
          <div class="tw-text-2xl tw-font-bold tw-text-[var(--success-700)]">
            {{ security.allowedIPs.length }}
          </div>
          <div class="tw-text-xs tw-text-[var(--neutrals-600)]">
            {{ $t("SECURITY.ALLOWED_IPS") }}
          </div>
        </div>

        <div class="tw-p-3 tw-bg-[var(--info-50)] tw-rounded tw-text-center">
          <div class="tw-text-2xl tw-font-bold tw-text-[var(--info-700)]">
            {{ security.allowedDomains.length }}
          </div>
          <div class="tw-text-xs tw-text-[var(--neutrals-600)]">
            {{ $t("SECURITY.ALLOWED_DOMAINS") }}
          </div>
        </div>

        <div class="tw-p-3 tw-bg-[var(--danger-50)] tw-rounded tw-text-center">
          <div class="tw-text-2xl tw-font-bold tw-text-[var(--danger-700)]">
            {{ security.blockedIPs.length }}
          </div>
          <div class="tw-text-xs tw-text-[var(--neutrals-600)]">
            {{ $t("SECURITY.BLOCKED_IPS") }}
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <VcButton outlined @click="reset">
        {{ $t("COMMON.RESET") }}
      </VcButton>
      <VcButton variant="primary" @click="save">
        {{ $t("COMMON.SAVE") }}
      </VcButton>
    </template>
  </VcCard>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  VcCard,
  VcLabel,
  VcMultivalue,
  VcHint,
  VcBanner,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const security = reactive({
  allowedIPs: [] as string[],
  allowedDomains: [] as string[],
  blockedIPs: [] as string[],
});

const ipError = ref("");

function validateIPs() {
  ipError.value = "";

  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;

  for (const ip of security.allowedIPs) {
    if (!ipRegex.test(ip)) {
      ipError.value = t("VALIDATION.INVALID_IP", { ip });
      return;
    }

    // Validate each octet
    const octets = ip.split(".");
    for (const octet of octets) {
      const num = parseInt(octet);
      if (num < 0 || num > 255) {
        ipError.value = t("VALIDATION.INVALID_IP_RANGE", { ip });
        return;
      }
    }
  }
}

function save() {
  console.log("Security settings saved:", security);
}

function reset() {
  security.allowedIPs = [];
  security.allowedDomains = [];
  security.blockedIPs = [];
  ipError.value = "";
}
</script>
```

## Key Points

### V-Model Binding
- `v-model` binds to a string array (`string[]`)
- Each entered value becomes an array element
- Press Enter or comma to add a new value

### Common Use Cases

1. **Tags**: Product tags, categories
```vue
<VcMultivalue
  v-model="tags"
  :placeholder="$t('PRODUCTS.TAGS_PLACEHOLDER')"
/>
```

2. **Emails**: Recipient lists
```vue
<VcMultivalue
  v-model="recipients"
  :placeholder="$t('EMAIL.RECIPIENTS')"
/>
```

3. **Keywords**: SEO keywords
```vue
<VcMultivalue
  v-model="keywords"
  :placeholder="$t('SEO.KEYWORDS')"
/>
```

4. **Variations**: Product options
```vue
<VcMultivalue
  v-model="sizes"
  :placeholder="$t('PRODUCTS.SIZES')"
/>
```

5. **Access Control**: IPs, domains
```vue
<VcMultivalue
  v-model="allowedIPs"
  :placeholder="$t('SECURITY.IP_ADDRESS')"
/>
```

### Best Practices

- Validate input format (emails, IPs, etc.)
- Show current count (e.g., "5/10 keywords")
- Allow removal by clicking badges
- Provide hints about format requirements
- Use for unlimited list inputs
- Display values as badges for visual clarity
- Validate duplicates
- Show examples in placeholder
- Support both Enter and comma as separators
- Consider max limits for certain use cases

