# Form with Collapsible Sections

**Pattern:** VcBlade + VcForm + VcCard sections

**Use:** Complex forms with multiple sections

**Based on:** offers-details.vue, seller-details-edit.vue, fulfillment-center-details.vue

## Composition

```vue
<template>
  <VcBlade :modified="modified">
    <VcContainer>
      <VcForm class="tw-space-y-4">
        <!-- Main fields (no card) -->
        <Field><VcInput v-model="entity.name" /></Field>
        <Field><VcSelect v-model="entity.type" /></Field>

        <!-- Section 1: Basic Info -->
        <VcCard
          :header="$t('FORM.SECTIONS.BASIC')"
          is-collapsable
          :is-collapsed="restoreCollapsed('section_basic')"
          @state:collapsed="handleCollapsed('section_basic', $event)"
        >
          <div class="tw-p-4 tw-space-y-4">
            <Field><VcInput /></Field>
            <VcRow>
              <VcCol><Field><VcInput /></Field></VcCol>
              <VcCol><Field><VcInput /></Field></VcCol>
            </VcRow>
          </div>
        </VcCard>

        <!-- Section 2: Address -->
        <VcCard :header="$t('FORM.SECTIONS.ADDRESS')">
          <div class="tw-p-4">
            <VcRow class="tw-gap-4">
              <VcCol>
                <Field><VcSelect option-value="id" option-label="name" searchable /></Field>
              </VcCol>
              <VcCol>
                <Field><VcInput /></Field>
              </VcCol>
            </VcRow>
          </div>
        </VcCard>

        <!-- Section 3: Gallery -->
        <VcCard :header="$t('FORM.SECTIONS.GALLERY')">
          <VcLoading :active="imageUploading" />
          <div class="tw-p-2">
            <VcGallery
              :images="entity.images"
              multiple
              @upload="handleUpload"
              @remove="handleRemove"
            />
          </div>
        </VcCard>
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
// Section collapse state (persisted in localStorage)
function handleCollapsed(key: string, value: boolean) {
  localStorage?.setItem(key, `${value}`);
}

function restoreCollapsed(key: string): boolean {
  return localStorage?.getItem(key) === "true";
}

// Gallery handlers
import { useAssets } from "@vc-shell/framework";
const { upload, remove } = useAssets();

const imageUploading = ref(false);

const handleUpload = async (files: FileList) => {
  const uploaded = await upload(files, `entities/${entity.value.id}`);
  entity.value.images = [...entity.value.images, ...uploaded];
};

const handleRemove = async (file: any) {
  if (await showConfirmation("Delete image?")) {
    entity.value.images = remove([file], entity.value.images);
  }
};
</script>
```

**Components Used:**
- VcBlade, VcContainer, VcForm
- VcCard (for sections)
- VcRow, VcCol
- VcInput, VcSelect, VcGallery
- VcLoading

**Features:**
- Collapsible sections
- localStorage persistence
- Gallery upload/remove
- Multi-column layout

**Lines:** ~100

