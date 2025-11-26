---
id: component-VcEditor-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","editor","rich-text","form","input"]
title: "VcEditor Demo"
description: "Rich text editor component for forms"
componentRole: form-input
bladeContext: ["details"]
---

# VcEditor Demo

Real-world Markdown editor examples for rich content, product descriptions, and articles.

## Basic Editor

```vue
<template>
  <div class="tw-space-y-4">
    <VcEditor
      v-model="description"
      :label="$t('PRODUCTS.DESCRIPTION')"
      required
      :placeholder="$t('PRODUCTS.DESCRIPTION_PLACEHOLDER')"
    />

    <VcHint>
      {{ $t("PRODUCTS.MARKDOWN_HINT") }}
    </VcHint>

    <!-- Preview -->
    <div v-if="description" class="tw-border tw-rounded-lg tw-p-4">
      <h4 class="tw-font-medium tw-mb-2">{{ $t("COMMON.PREVIEW") }}</h4>
      <div class="tw-prose" v-html="renderedMarkdown" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcEditor, VcHint } from "@vc-shell/framework";
import { marked } from "marked";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const description = ref("");

const renderedMarkdown = computed(() => {
  if (!description.value) return "";
  return marked.parse(description.value);
});
</script>
```

## Editor with Image Upload

```vue
<template>
  <div class="tw-space-y-4">
    <VcEditor
      v-model="content"
      :label="$t('ARTICLES.CONTENT')"
      required
      :placeholder="$t('ARTICLES.CONTENT_PLACEHOLDER')"
      @upload="handleImageUpload"
    />

    <VcHint>
      <div class="tw-space-y-1">
        <div>{{ $t("EDITOR.FORMATTING_HINT") }}</div>
        <ul class="tw-text-xs tw-pl-5 tw-space-y-0.5">
          <li>{{ $t("EDITOR.HINT_BOLD") }}</li>
          <li>{{ $t("EDITOR.HINT_ITALIC") }}</li>
          <li>{{ $t("EDITOR.HINT_LINK") }}</li>
          <li>{{ $t("EDITOR.HINT_IMAGE") }}</li>
        </ul>
      </div>
    </VcHint>

    <!-- Uploaded images -->
    <div v-if="uploadedImages.length > 0" class="tw-border tw-rounded-lg tw-p-4">
      <h4 class="tw-font-medium tw-mb-3">{{ $t("EDITOR.UPLOADED_IMAGES") }}</h4>
      <div class="tw-grid tw-grid-cols-4 tw-gap-3">
        <div
          v-for="image in uploadedImages"
          :key="image.id"
          class="tw-relative tw-group"
        >
          <VcImage
            :src="image.url"
            size="m"
            aspect="1x1"
            bordered
          />
          <div
            class="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-opacity-0 group-hover:tw-opacity-100 tw-transition"
          >
            <VcButton
              size="s"
              @click="copyImageUrl(image.url)"
            >
              <VcIcon icon="material-content_copy" size="s" />
            </VcButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcEditor, VcHint, VcImage, VcButton, VcIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const content = ref("");

const uploadedImages = ref<Array<{ id: string; url: string }>>([]);

async function handleImageUpload(file: File) {
  console.log("Uploading image:", file.name);
  
  // Simulate upload
  const imageUrl = URL.createObjectURL(file);
  
  uploadedImages.value.push({
    id: Date.now().toString(),
    url: imageUrl,
  });

  // Return URL to insert into editor
  return imageUrl;
}

function copyImageUrl(url: string) {
  navigator.clipboard.writeText(`![Image](${url})`);
  console.log("Copied to clipboard:", url);
}
</script>
```

## Editor for Product Long Description

```vue
<template>
  <VcForm @submit="onSubmit">
    <div class="tw-space-y-6">
      <!-- Short description -->
      <div>
        <Field v-slot="{ field, errorMessage }" name="shortDescription" :rules="shortDescriptionRules">
          <VcTextarea
            v-bind="field"
            :label="$t('PRODUCTS.SHORT_DESCRIPTION')"
            required
            :error-message="errorMessage"
            :rows="3"
            :maxlength="200"
            :placeholder="$t('PRODUCTS.SHORT_DESCRIPTION_PLACEHOLDER')"
          />
        </Field>
        <div class="tw-flex tw-justify-between tw-text-xs tw-mt-1">
          <VcHint v-if="!shortDescriptionError">
            {{ $t("PRODUCTS.SHORT_DESCRIPTION_HINT") }}
          </VcHint>
          <span
            :class="[
              shortDescription.length > 200
                ? 'tw-text-[var(--danger-500)]'
                : 'tw-text-[var(--neutrals-500)]'
            ]"
          >
            {{ shortDescription.length }}/200
          </span>
        </div>
      </div>

      <!-- Long description with editor -->
      <div>
        <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
          <span class="tw-font-medium">{{ $t("PRODUCTS.LONG_DESCRIPTION") }}</span>
          <div class="tw-flex tw-gap-2">
            <VcButton
              size="s"
              outlined
              @click="showPreview = !showPreview"
            >
              <VcIcon
                :icon="showPreview ? 'material-edit' : 'material-visibility'"
                size="s"
                class="tw-mr-1"
              />
              {{ showPreview ? $t("COMMON.EDIT") : $t("COMMON.PREVIEW") }}
            </VcButton>
          </div>
        </div>

        <VcEditor
          v-if="!showPreview"
          v-model="longDescription"
          :label="$t('PRODUCTS.LONG_DESCRIPTION')"
          :placeholder="$t('PRODUCTS.LONG_DESCRIPTION_PLACEHOLDER')"
        />

        <div
          v-else
          class="tw-border tw-rounded-lg tw-p-4 tw-min-h-[200px] tw-prose tw-max-w-none"
          v-html="renderedLongDescription"
        />
      </div>

      <!-- Save button -->
      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton outlined @click="onCancel">
          {{ $t("COMMON.CANCEL") }}
        </VcButton>
        <VcButton type="submit" variant="primary">
          {{ $t("COMMON.SAVE") }}
        </VcButton>
      </div>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  VcTextarea,
  VcEditor,
  VcHint,
  VcForm,
  VcButton,
  VcIcon,
} from "@vc-shell/framework";
import { Field } from "vee-validate";
import { marked } from "marked";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const shortDescription = ref("");
const shortDescriptionError = ref("");
const longDescription = ref("");
const showPreview = ref(false);

const renderedLongDescription = computed(() => {
  if (!longDescription.value) return t("PRODUCTS.LONG_DESCRIPTION_EMPTY");
  return marked.parse(longDescription.value);
});

function shortDescriptionRules(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  if (value.length > 200) return t("VALIDATION.MAX_LENGTH", { max: 200 });
  return true;
}

function onSubmit() {
  console.log("Saving product descriptions...");
}

function onCancel() {
  console.log("Cancelled");
}
</script>
```

## Editor for Blog Posts

```vue
<template>
  <div class="tw-space-y-6">
    <VcCard :header="$t('BLOG.CREATE_POST')">
      <div class="tw-space-y-4">
        <!-- Title -->
        <div>
          <VcInput
            v-model="post.title"
            :label="$t('BLOG.TITLE')"
            required
            :placeholder="$t('BLOG.TITLE_PLACEHOLDER')"
          />
        </div>

        <!-- Excerpt -->
        <div>
          <VcTextarea
            v-model="post.excerpt"
            :label="$t('BLOG.EXCERPT')"
            required
            :rows="3"
            :placeholder="$t('BLOG.EXCERPT_PLACEHOLDER')"
          />
          <VcHint>
            {{ $t("BLOG.EXCERPT_HINT") }}
          </VcHint>
        </div>

        <!-- Content editor -->
        <div>
          <!-- Editor toolbar -->
          <div class="tw-flex tw-gap-2 tw-mb-2 tw-p-2 tw-border tw-rounded-lg tw-bg-[var(--neutrals-50)]">
            <VcButton
              size="s"
              outlined
              @click="insertMarkdown('**', '**')"
              title="Bold"
            >
              <VcIcon icon="material-format_bold" size="s" />
            </VcButton>
            <VcButton
              size="s"
              outlined
              @click="insertMarkdown('*', '*')"
              title="Italic"
            >
              <VcIcon icon="material-format_italic" size="s" />
            </VcButton>
            <VcButton
              size="s"
              outlined
              @click="insertMarkdown('[', '](url)')"
              title="Link"
            >
              <VcIcon icon="material-link" size="s" />
            </VcButton>
            <VcButton
              size="s"
              outlined
              @click="insertMarkdown('![alt](', ')')"
              title="Image"
            >
              <VcIcon icon="material-image" size="s" />
            </VcButton>
            <VcButton
              size="s"
              outlined
              @click="insertMarkdown('```\n', '\n```')"
              title="Code"
            >
              <VcIcon icon="material-code" size="s" />
            </VcButton>
          </div>

          <VcEditor
            ref="editorRef"
            v-model="post.content"
            :label="$t('BLOG.CONTENT')"
            required
            :placeholder="$t('BLOG.CONTENT_PLACEHOLDER')"
          />
        </div>

        <!-- Tags -->
        <div>
          <VcMultivalue
            v-model="post.tags"
            :label="$t('BLOG.TAGS')"
            :placeholder="$t('BLOG.TAGS_PLACEHOLDER')"
          />
        </div>
      </div>

      <template #actions>
        <VcButton outlined @click="saveDraft">
          {{ $t("BLOG.SAVE_DRAFT") }}
        </VcButton>
        <VcButton variant="primary" @click="publish">
          {{ $t("BLOG.PUBLISH") }}
        </VcButton>
      </template>
    </VcCard>

    <!-- Live preview -->
    <VcCard :header="$t('COMMON.PREVIEW')">
      <div class="tw-prose tw-max-w-none">
        <h1>{{ post.title || $t("BLOG.UNTITLED") }}</h1>
        <p class="tw-text-lg tw-text-[var(--neutrals-600)]">
          {{ post.excerpt || $t("BLOG.NO_EXCERPT") }}
        </p>
        <div v-html="renderedContent" />
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import {
  VcCard,
  VcInput,
  VcTextarea,
  VcEditor,
  VcMultivalue,
  VcHint,
  VcButton,
  VcIcon,
} from "@vc-shell/framework";
import { marked } from "marked";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const editorRef = ref();

const post = reactive({
  title: "",
  excerpt: "",
  content: "",
  tags: [] as string[],
});

const renderedContent = computed(() => {
  if (!post.content) return `<p>${t("BLOG.NO_CONTENT")}</p>`;
  return marked.parse(post.content);
});

function insertMarkdown(before: string, after: string) {
  const editor = editorRef.value;
  if (!editor) return;

  // Get current cursor position and insert markdown
  const currentValue = post.content;
  const cursorPosition = editor.getCursorPosition?.() || currentValue.length;
  
  post.content =
    currentValue.substring(0, cursorPosition) +
    before +
    after +
    currentValue.substring(cursorPosition);
}

function saveDraft() {
  console.log("Saving draft:", post);
}

function publish() {
  console.log("Publishing post:", post);
}
</script>
```

## Editor with Character Counter

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-items-center tw-justify-between">
      <span class="tw-font-medium">{{ $t("ARTICLES.SUMMARY") }}</span>
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcStatusIcon :variant="getSummaryStatus()" />
        <span
          :class="[
            'tw-text-xs',
            getCharacterCountColor()
          ]"
        >
          {{ characterCount }}/{{ maxCharacters }} {{ $t("COMMON.CHARACTERS") }}
        </span>
      </div>
    </div>

    <VcEditor
      v-model="summary"
      :label="$t('ARTICLES.SUMMARY')"
      required
      :placeholder="$t('ARTICLES.SUMMARY_PLACEHOLDER')"
    />

    <VcHint
      :class="[
        characterCount > maxCharacters && 'tw-text-[var(--danger-500)]'
      ]"
    >
      {{ getSummaryHint() }}
    </VcHint>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcEditor, VcHint, VcStatusIcon } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const summary = ref("");
const maxCharacters = 500;
const minCharacters = 100;

const characterCount = computed(() => summary.value.length);

function getSummaryStatus(): string {
  if (characterCount.value === 0) return "secondary";
  if (characterCount.value < minCharacters) return "warning";
  if (characterCount.value > maxCharacters) return "danger";
  return "success";
}

function getCharacterCountColor(): string {
  if (characterCount.value > maxCharacters) return "tw-text-[var(--danger-500)]";
  if (characterCount.value < minCharacters) return "tw-text-[var(--warning-500)]";
  return "tw-text-[var(--success-500)]";
}

function getSummaryHint(): string {
  if (characterCount.value === 0) {
    return t("ARTICLES.SUMMARY_HINT.EMPTY");
  }
  if (characterCount.value < minCharacters) {
    return t("ARTICLES.SUMMARY_HINT.TOO_SHORT", { 
      remaining: minCharacters - characterCount.value 
    });
  }
  if (characterCount.value > maxCharacters) {
    return t("ARTICLES.SUMMARY_HINT.TOO_LONG", { 
      excess: characterCount.value - maxCharacters 
    });
  }
  return t("ARTICLES.SUMMARY_HINT.OPTIMAL");
}
</script>
```

## Key Points

### Features
- **Markdown Support**: Full Markdown syntax (bold, italic, links, images, code blocks)
- **Image Upload**: Drag-and-drop or paste images
- **Preview**: Real-time or toggle preview mode
- **Toolbar**: Quick access to formatting options

### Props
- `v-model` - Binds to the Markdown content
- `placeholder` - Placeholder text
- `@upload` - Event handler for image uploads

### Common Use Cases

1. **Product Descriptions**: Rich text for product details
```vue
<VcEditor
  v-model="product.description"
  :placeholder="$t('PRODUCTS.DESCRIPTION_PLACEHOLDER')"
/>
```

2. **Blog Posts**: Long-form content with images
```vue
<VcEditor
  v-model="post.content"
  @upload="handleImageUpload"
/>
```

3. **Articles**: Rich content with preview
```vue
<VcEditor v-model="article.content" />
<div v-html="marked.parse(article.content)" />
```

### Best Practices

- Use `marked` or similar library for rendering Markdown to HTML
- Sanitize HTML output to prevent XSS attacks
- Provide character counters for length limits
- Add preview mode for long content
- Handle image uploads with progress indicators
- Show formatting hints for Markdown syntax
- Use validation for required content
- Add auto-save for draft content
- Support keyboard shortcuts (Ctrl+B for bold, etc.)
- Store uploaded images and return URLs
- Provide toolbar for common formatting actions
- Show real-time preview in a separate card/section

