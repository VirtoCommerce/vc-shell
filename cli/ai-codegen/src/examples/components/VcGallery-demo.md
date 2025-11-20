---
id: component-VcGallery-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: [component]
title: "VcGallery Demo"
description: "VcGallery Demo component example"
---

# VcGallery Demo

Real-world gallery examples for product images, media management, and visual content organization.

## Basic Image Gallery

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel>
      {{ $t("PRODUCTS.IMAGE_GALLERY") }}
    </VcLabel>

    <VcGallery
      v-model="images"
      :editable="false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcGallery } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const images = ref([
  { id: "1", url: "https://placehold.co/800x600/FF5722/FFFFFF/png?text=Image+1", alt: "Product view 1" },
  { id: "2", url: "https://placehold.co/800x600/4CAF50/FFFFFF/png?text=Image+2", alt: "Product view 2" },
  { id: "3", url: "https://placehold.co/800x600/2196F3/FFFFFF/png?text=Image+3", alt: "Product view 3" },
  { id: "4", url: "https://placehold.co/800x600/9C27B0/FFFFFF/png?text=Image+4", alt: "Product view 4" },
]);
</script>
```

## Editable Gallery with Upload

```vue
<template>
  <VcForm @submit="onSubmit">
    <div class="tw-space-y-4">
      <VcLabel :required="true">
        {{ $t("PRODUCTS.IMAGES") }}
      </VcLabel>

      <VcGallery
        v-model="productImages"
        :editable="true"
        :max-items="10"
        @upload="handleUpload"
        @delete="handleDelete"
        @reorder="handleReorder"
      />

      <VcHint>
        {{ $t("PRODUCTS.GALLERY_HINT") }}
      </VcHint>

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
import { ref } from "vue";
import {
  VcLabel,
  VcGallery,
  VcHint,
  VcForm,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
}

const productImages = ref<GalleryImage[]>([
  { id: "1", url: "https://placehold.co/800x600/FF5722/FFFFFF/png?text=Image+1" },
  { id: "2", url: "https://placehold.co/800x600/4CAF50/FFFFFF/png?text=Image+2" },
]);

async function handleUpload(file: File) {
  console.log("Uploading:", file.name);
  
  // Simulate upload
  const imageUrl = URL.createObjectURL(file);
  
  productImages.value.push({
    id: Date.now().toString(),
    url: imageUrl,
  });
}

function handleDelete(image: GalleryImage) {
  const index = productImages.value.findIndex(img => img.id === image.id);
  if (index !== -1) {
    productImages.value.splice(index, 1);
  }
}

function handleReorder(images: GalleryImage[]) {
  productImages.value = images;
  console.log("Images reordered");
}

function onSubmit() {
  console.log("Saving images:", productImages.value);
}

function onCancel() {
  console.log("Cancelled");
}
</script>
```

## Gallery with Main Image Selection

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard :header="$t('PRODUCTS.PRODUCT_IMAGES')">
      <div class="tw-space-y-4">
        <VcGallery
          v-model="galleryImages"
          :editable="true"
          :main-image-id="mainImageId"
          @set-main="setMainImage"
          @upload="handleImageUpload"
          @delete="deleteImage"
        />

        <div v-if="mainImage" class="tw-p-4 tw-bg-[var(--info-50)] tw-rounded-lg">
          <div class="tw-flex tw-items-start tw-gap-4">
            <VcImage
              :src="mainImage.url"
              size="m"
              aspect="1x1"
              bordered
            />
            <div class="tw-flex-1">
              <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
                <VcBadge content="MAIN" variant="primary" size="s" />
                <span class="tw-font-medium">{{ $t("PRODUCTS.MAIN_IMAGE") }}</span>
              </div>
              <p class="tw-text-sm tw-text-[var(--neutrals-600)]">
                {{ $t("PRODUCTS.MAIN_IMAGE_DESC") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  VcCard,
  VcGallery,
  VcImage,
  VcBadge,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Image {
  id: string;
  url: string;
  alt?: string;
}

const galleryImages = ref<Image[]>([
  { id: "1", url: "https://placehold.co/800x600/FF5722/FFFFFF/png?text=Main" },
  { id: "2", url: "https://placehold.co/800x600/4CAF50/FFFFFF/png?text=Image+2" },
  { id: "3", url: "https://placehold.co/800x600/2196F3/FFFFFF/png?text=Image+3" },
]);

const mainImageId = ref("1");

const mainImage = computed(() => 
  galleryImages.value.find(img => img.id === mainImageId.value)
);

function setMainImage(image: Image) {
  mainImageId.value = image.id;
  console.log("Main image set:", image.id);
}

async function handleImageUpload(file: File) {
  const newImage: Image = {
    id: Date.now().toString(),
    url: URL.createObjectURL(file),
  };
  
  galleryImages.value.push(newImage);
  
  // Set as main if it's the first image
  if (galleryImages.value.length === 1) {
    mainImageId.value = newImage.id;
  }
}

function deleteImage(image: Image) {
  const index = galleryImages.value.findIndex(img => img.id === image.id);
  if (index !== -1) {
    galleryImages.value.splice(index, 1);
    
    // Set new main image if current main was deleted
    if (mainImageId.value === image.id && galleryImages.value.length > 0) {
      mainImageId.value = galleryImages.value[0].id;
    }
  }
}
</script>
```

## Gallery with Image Details

```vue
<template>
  <div class="tw-grid tw-grid-cols-2 tw-gap-6">
    <!-- Gallery -->
    <div>
      <VcGallery
        v-model="images"
        :editable="true"
        @select="selectImage"
      />
    </div>

    <!-- Image details -->
    <VcCard v-if="selectedImage" :header="$t('PRODUCTS.IMAGE_DETAILS')">
      <div class="tw-space-y-4">
        <!-- Preview -->
        <VcImage
          :src="selectedImage.url"
          size="xl"
          aspect="4x3"
          bordered
        />

        <!-- Alt text -->
        <div>
          <VcLabel :required="false">
            {{ $t("PRODUCTS.ALT_TEXT") }}
          </VcLabel>
          <VcInput
            v-model="selectedImage.alt"
            :placeholder="$t('PRODUCTS.ALT_TEXT_PLACEHOLDER')"
          />
          <VcHint>
            {{ $t("PRODUCTS.ALT_TEXT_HINT") }}
          </VcHint>
        </div>

        <!-- Caption -->
        <div>
          <VcLabel :required="false">
            {{ $t("PRODUCTS.CAPTION") }}
          </VcLabel>
          <VcTextarea
            v-model="selectedImage.caption"
            :rows="3"
            :placeholder="$t('PRODUCTS.CAPTION_PLACEHOLDER')"
          />
        </div>

        <!-- Image info -->
        <div class="tw-grid tw-grid-cols-2 tw-gap-3 tw-text-sm">
          <div class="tw-p-3 tw-bg-[var(--neutrals-50)] tw-rounded">
            <div class="tw-text-[var(--neutrals-500)] tw-mb-1">
              {{ $t("PRODUCTS.FILE_SIZE") }}
            </div>
            <div class="tw-font-medium">{{ selectedImage.size || "N/A" }}</div>
          </div>
          <div class="tw-p-3 tw-bg-[var(--neutrals-50)] tw-rounded">
            <div class="tw-text-[var(--neutrals-500)] tw-mb-1">
              {{ $t("PRODUCTS.DIMENSIONS") }}
            </div>
            <div class="tw-font-medium">{{ selectedImage.dimensions || "N/A" }}</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="tw-flex tw-gap-2">
          <VcButton outlined class="tw-flex-1" @click="downloadImage">
            <VcIcon icon="material-download" size="s" class="tw-mr-2" />
            {{ $t("COMMON.DOWNLOAD") }}
          </VcButton>
          <VcButton variant="danger" class="tw-flex-1" @click="deleteSelectedImage">
            <VcIcon icon="material-delete" size="s" class="tw-mr-2" />
            {{ $t("COMMON.DELETE") }}
          </VcButton>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcCard,
  VcGallery,
  VcImage,
  VcLabel,
  VcInput,
  VcTextarea,
  VcHint,
  VcButton,
  VcIcon,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface ImageDetails {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  size?: string;
  dimensions?: string;
}

const images = ref<ImageDetails[]>([
  {
    id: "1",
    url: "https://placehold.co/800x600/FF5722/FFFFFF/png?text=Image+1",
    alt: "Product front view",
    caption: "High-quality product image",
    size: "245 KB",
    dimensions: "800x600",
  },
  {
    id: "2",
    url: "https://placehold.co/800x600/4CAF50/FFFFFF/png?text=Image+2",
    size: "312 KB",
    dimensions: "800x600",
  },
]);

const selectedImage = ref<ImageDetails | null>(images.value[0]);

function selectImage(image: ImageDetails) {
  selectedImage.value = image;
}

function downloadImage() {
  if (!selectedImage.value) return;
  console.log("Download image:", selectedImage.value.id);
}

function deleteSelectedImage() {
  if (!selectedImage.value) return;
  
  const index = images.value.findIndex(img => img.id === selectedImage.value!.id);
  if (index !== -1) {
    images.value.splice(index, 1);
    selectedImage.value = images.value[0] || null;
  }
}
</script>
```

## Gallery with Drag & Drop Upload

```vue
<template>
  <div class="tw-space-y-4">
    <VcCard :header="$t('PRODUCTS.IMAGE_GALLERY')">
      <div class="tw-space-y-4">
        <!-- Drag & drop zone -->
        <div
          v-if="images.length === 0"
          class="tw-border-2 tw-border-dashed tw-rounded-lg tw-p-12 tw-text-center"
          :class="[
            isDragging
              ? 'tw-border-[var(--primary-500)] tw-bg-[var(--primary-50)]'
              : 'tw-border-[var(--neutrals-300)]'
          ]"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <VcIcon
            icon="material-cloud_upload"
            size="xxl"
            class="tw-text-[var(--neutrals-400)] tw-mb-4"
          />
          <div class="tw-font-medium tw-mb-2">
            {{ $t("UPLOAD.DROP_IMAGES") }}
          </div>
          <div class="tw-text-sm tw-text-[var(--neutrals-500)] tw-mb-4">
            {{ $t("UPLOAD.OR_CLICK_TO_BROWSE") }}
          </div>
          <VcButton variant="primary" @click="triggerFileInput">
            <VcIcon icon="material-add_photo_alternate" class="tw-mr-2" />
            {{ $t("UPLOAD.SELECT_IMAGES") }}
          </VcButton>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/*"
            class="tw-hidden"
            @change="onFileSelect"
          />
        </div>

        <!-- Gallery with images -->
        <VcGallery
          v-else
          v-model="images"
          :editable="true"
          @upload="handleUpload"
          @delete="handleDelete"
          @reorder="handleReorder"
        />

        <!-- Upload progress -->
        <div v-if="uploading" class="tw-space-y-2">
          <div class="tw-flex tw-items-center tw-justify-between tw-text-sm">
            <span>{{ $t("UPLOAD.UPLOADING") }}</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="tw-h-2 tw-bg-[var(--neutrals-100)] tw-rounded-full tw-overflow-hidden">
            <div
              class="tw-h-full tw-bg-[var(--primary-500)] tw-transition-all"
              :style="{ width: `${uploadProgress}%` }"
            />
          </div>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcCard,
  VcGallery,
  VcIcon,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Image {
  id: string;
  url: string;
}

const fileInputRef = ref<HTMLInputElement>();
const images = ref<Image[]>([]);
const isDragging = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);

function triggerFileInput() {
  fileInputRef.value?.click();
}

function onFileSelect(event: Event) {
  const files = Array.from((event.target as HTMLInputElement).files || []);
  uploadFiles(files);
}

function onDrop(event: DragEvent) {
  isDragging.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  uploadFiles(files.filter(file => file.type.startsWith("image/")));
}

async function uploadFiles(files: File[]) {
  uploading.value = true;
  uploadProgress.value = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 50));
      uploadProgress.value = Math.round(((i + progress / 100) / files.length) * 100);
    }

    images.value.push({
      id: Date.now().toString() + i,
      url: URL.createObjectURL(file),
    });
  }

  uploading.value = false;
  uploadProgress.value = 0;
}

async function handleUpload(file: File) {
  await uploadFiles([file]);
}

function handleDelete(image: Image) {
  const index = images.value.findIndex(img => img.id === image.id);
  if (index !== -1) {
    images.value.splice(index, 1);
  }
}

function handleReorder(reorderedImages: Image[]) {
  images.value = reorderedImages;
}
</script>
```

## Gallery with Lightbox

```vue
<template>
  <div class="tw-space-y-4">
    <VcGallery
      v-model="galleryImages"
      :editable="false"
      @select="openLightbox"
    />

    <!-- Lightbox modal -->
    <div
      v-if="lightboxOpen"
      class="tw-fixed tw-inset-0 tw-bg-black tw-bg-opacity-90 tw-z-50 tw-flex tw-items-center tw-justify-center"
      @click="closeLightbox"
    >
      <div class="tw-relative tw-max-w-6xl tw-max-h-screen tw-p-4">
        <!-- Close button -->
        <VcButton
          class="tw-absolute tw-top-4 tw-right-4 tw-z-10"
          variant="danger"
          @click.stop="closeLightbox"
        >
          <VcIcon icon="material-close" />
        </VcButton>

        <!-- Previous button -->
        <VcButton
          v-if="currentImageIndex > 0"
          class="tw-absolute tw-left-4 tw-top-1/2 tw--translate-y-1/2"
          @click.stop="previousImage"
        >
          <VcIcon icon="material-arrow_back" />
        </VcButton>

        <!-- Next button -->
        <VcButton
          v-if="currentImageIndex < galleryImages.length - 1"
          class="tw-absolute tw-right-4 tw-top-1/2 tw--translate-y-1/2"
          @click.stop="nextImage"
        >
          <VcIcon icon="material-arrow_forward" />
        </VcButton>

        <!-- Current image -->
        <VcImage
          v-if="currentImage"
          :src="currentImage.url"
          size="xl"
          class="tw-max-h-[80vh]"
          @click.stop
        />

        <!-- Image counter -->
        <div class="tw-absolute tw-bottom-4 tw-left-1/2 tw--translate-x-1/2 tw-bg-black tw-bg-opacity-50 tw-text-white tw-px-4 tw-py-2 tw-rounded">
          {{ currentImageIndex + 1 }} / {{ galleryImages.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcGallery, VcImage, VcButton, VcIcon } from "@vc-shell/framework";

interface Image {
  id: string;
  url: string;
}

const galleryImages = ref<Image[]>([
  { id: "1", url: "https://placehold.co/1200x900/FF5722/FFFFFF/png?text=Image+1" },
  { id: "2", url: "https://placehold.co/1200x900/4CAF50/FFFFFF/png?text=Image+2" },
  { id: "3", url: "https://placehold.co/1200x900/2196F3/FFFFFF/png?text=Image+3" },
  { id: "4", url: "https://placehold.co/1200x900/9C27B0/FFFFFF/png?text=Image+4" },
]);

const lightboxOpen = ref(false);
const currentImageIndex = ref(0);

const currentImage = computed(() => galleryImages.value[currentImageIndex.value]);

function openLightbox(image: Image) {
  currentImageIndex.value = galleryImages.value.findIndex(img => img.id === image.id);
  lightboxOpen.value = true;
}

function closeLightbox() {
  lightboxOpen.value = false;
}

function previousImage() {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
}

function nextImage() {
  if (currentImageIndex.value < galleryImages.value.length - 1) {
    currentImageIndex.value++;
  }
}
</script>
```

## Key Points

### Props
- `v-model` - Array of image objects (required)
- `editable` - Enable edit mode (upload, delete, reorder)
- `max-items` - Maximum number of images
- `main-image-id` - ID of the main/featured image

### Events
- `@upload` - Emitted when user uploads a file
- `@delete` - Emitted when user deletes an image
- `@reorder` - Emitted when user reorders images
- `@select` - Emitted when user clicks an image
- `@set-main` - Emitted when user sets main image

### Image Object Structure
```typescript
{
  id: string;         // Unique identifier
  url: string;        // Image URL
  alt?: string;       // Alt text for accessibility
  caption?: string;   // Image caption
  size?: string;      // File size
  dimensions?: string; // Image dimensions
}
```

### Common Use Cases

1. **Product Images**: Display-only gallery
```vue
<VcGallery
  v-model="productImages"
  :editable="false"
/>
```

2. **Editable Gallery**: With upload/delete/reorder
```vue
<VcGallery
  v-model="images"
  :editable="true"
  @upload="handleUpload"
/>
```

3. **With Main Image**: Feature one image
```vue
<VcGallery
  v-model="images"
  :main-image-id="mainId"
  @set-main="setMain"
/>
```

### Best Practices

- Always provide unique IDs for images
- Set max-items to prevent excessive uploads
- Validate file size and format before upload
- Show upload progress for user feedback
- Support drag-and-drop for better UX
- Allow image reordering (drag-and-drop)
- Implement lightbox for full-size view
- Add alt text for accessibility
- Show image dimensions and file size
- Provide delete confirmation
- Optimize images before upload
- Support bulk operations (delete multiple)
- Cache thumbnails for performance
- Show loading state during upload

