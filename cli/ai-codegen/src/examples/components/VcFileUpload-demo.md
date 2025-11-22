---
id: component-VcFileUpload-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","upload","file","form","input"]
title: "VcFileUpload Demo"
description: "File upload component"
componentRole: form-input
bladeContext: ["details"]
---

# VcFileUpload Demo

Real-world file upload examples with drag-and-drop, validation, and progress tracking.

## Basic File Upload

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel :required="true">
      {{ $t("PRODUCTS.IMAGES") }}
    </VcLabel>

    <VcFileUpload
      v-model="files"
      :multiple="true"
      :accept="'image/*'"
      @change="onFilesChange"
    />

    <VcHint>
      {{ $t("PRODUCTS.UPLOAD_HINTS.FORMATS") }}
    </VcHint>

    <!-- Uploaded files list -->
    <div v-if="files.length > 0" class="tw-space-y-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="tw-flex tw-items-center tw-justify-between tw-p-3 tw-border tw-rounded"
      >
        <div class="tw-flex tw-items-center tw-gap-3">
          <VcIcon icon="material-image" size="m" />
          <div>
            <div class="tw-font-medium">{{ file.name }}</div>
            <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
              {{ formatFileSize(file.size) }}
            </div>
          </div>
        </div>
        <VcButton
          size="s"
          text
          @click="removeFile(index)"
        >
          <VcIcon icon="material-delete" size="s" />
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcFileUpload, VcHint, VcIcon, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const files = ref<File[]>([]);

function onFilesChange(newFiles: File[]) {
  console.log("Files changed:", newFiles);
}

function removeFile(index: number) {
  files.value.splice(index, 1);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>
```

## File Upload with Validation

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel :required="true">
      {{ $t("DOCUMENTS.UPLOAD") }}
    </VcLabel>

    <VcFileUpload
      v-model="documents"
      :multiple="true"
      :accept="acceptedTypes"
      @change="validateFiles"
    />

    <VcHint v-if="!uploadError">
      <div class="tw-space-y-1">
        <div>{{ $t("DOCUMENTS.ACCEPTED_FORMATS") }}:</div>
        <ul class="tw-text-xs tw-pl-5">
          <li>PDF, Word, Excel</li>
          <li>{{ $t("DOCUMENTS.MAX_SIZE") }}: 10 MB</li>
          <li>{{ $t("DOCUMENTS.MAX_FILES") }}: 5</li>
        </ul>
      </div>
    </VcHint>

    <VcBanner
      v-if="uploadError"
      variant="danger"
      :closable="true"
      @close="uploadError = ''"
    >
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcIcon icon="material-error" />
        <span>{{ uploadError }}</span>
      </div>
    </VcBanner>

    <!-- Valid files -->
    <div v-if="validFiles.length > 0" class="tw-border tw-rounded-lg tw-p-4">
      <h4 class="tw-font-medium tw-mb-3">
        {{ $t("DOCUMENTS.READY_TO_UPLOAD") }} ({{ validFiles.length }})
      </h4>
      <div class="tw-space-y-2">
        <div
          v-for="(file, index) in validFiles"
          :key="index"
          class="tw-flex tw-items-center tw-justify-between tw-p-2 tw-bg-[var(--success-50)] tw-rounded"
        >
          <div class="tw-flex tw-items-center tw-gap-2">
            <VcStatusIcon variant="success" />
            <span class="tw-text-sm">{{ file.name }}</span>
            <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
              ({{ formatFileSize(file.size) }})
            </span>
          </div>
          <VcButton
            size="s"
            text
            @click="removeValidFile(index)"
          >
            <VcIcon icon="material-close" size="xs" />
          </VcButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcLabel,
  VcFileUpload,
  VcHint,
  VcBanner,
  VcIcon,
  VcStatusIcon,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const documents = ref<File[]>([]);
const validFiles = ref<File[]>([]);
const uploadError = ref("");

const acceptedTypes = ".pdf,.doc,.docx,.xls,.xlsx";
const maxFileSize = 10 * 1024 * 1024; // 10 MB
const maxFiles = 5;

function validateFiles(newFiles: File[]) {
  uploadError.value = "";

  // Check file count
  if (newFiles.length + validFiles.value.length > maxFiles) {
    uploadError.value = t("DOCUMENTS.ERROR.TOO_MANY_FILES", { max: maxFiles });
    documents.value = [];
    return;
  }

  // Validate each file
  for (const file of newFiles) {
    // Check file size
    if (file.size > maxFileSize) {
      uploadError.value = t("DOCUMENTS.ERROR.FILE_TOO_LARGE", {
        name: file.name,
        max: "10 MB",
      });
      documents.value = [];
      return;
    }

    // Check file type
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(extension)) {
      uploadError.value = t("DOCUMENTS.ERROR.INVALID_FORMAT", {
        name: file.name,
      });
      documents.value = [];
      return;
    }
  }

  // All files valid
  validFiles.value.push(...newFiles);
  documents.value = [];
}

function removeValidFile(index: number) {
  validFiles.value.splice(index, 1);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>
```

## File Upload with Progress

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel :required="false">
      {{ $t("PRODUCTS.IMAGES") }}
    </VcLabel>

    <VcFileUpload
      v-model="newFiles"
      :multiple="true"
      :accept="'image/*'"
      :disabled="isUploading"
      @change="startUpload"
    />

    <!-- Uploading files with progress -->
    <div v-if="uploadingFiles.length > 0" class="tw-space-y-3">
      <div
        v-for="file in uploadingFiles"
        :key="file.id"
        class="tw-border tw-rounded-lg tw-p-4"
      >
        <div class="tw-flex tw-items-center tw-gap-3 tw-mb-2">
          <VcIcon icon="material-image" size="m" />
          <div class="tw-flex-1">
            <div class="tw-font-medium">{{ file.name }}</div>
            <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
              {{ formatFileSize(file.size) }}
            </div>
          </div>
          <VcStatusIcon
            :variant="file.status === 'error' ? 'danger' : file.status === 'done' ? 'success' : 'info'"
          />
        </div>

        <!-- Progress bar -->
        <div v-if="file.status === 'uploading'" class="tw-relative tw-h-2 tw-bg-[var(--neutrals-100)] tw-rounded-full tw-overflow-hidden">
          <div
            class="tw-absolute tw-inset-y-0 tw-left-0 tw-bg-[var(--primary-500)] tw-transition-all"
            :style="{ width: `${file.progress}%` }"
          />
        </div>

        <!-- Status message -->
        <div class="tw-text-xs tw-mt-2">
          <span v-if="file.status === 'uploading'" class="tw-text-[var(--info-500)]">
            {{ $t("UPLOAD.UPLOADING") }}: {{ file.progress }}%
          </span>
          <span v-else-if="file.status === 'done'" class="tw-text-[var(--success-500)]">
            {{ $t("UPLOAD.COMPLETED") }}
          </span>
          <span v-else-if="file.status === 'error'" class="tw-text-[var(--danger-500)]">
            {{ $t("UPLOAD.ERROR") }}: {{ file.error }}
          </span>
        </div>
      </div>
    </div>

    <!-- Successfully uploaded files -->
    <div v-if="uploadedFiles.length > 0" class="tw-border tw-rounded-lg tw-p-4">
      <h4 class="tw-font-medium tw-mb-3">
        {{ $t("UPLOAD.UPLOADED_FILES") }} ({{ uploadedFiles.length }})
      </h4>
      <div class="tw-grid tw-grid-cols-4 tw-gap-3">
        <div
          v-for="file in uploadedFiles"
          :key="file.id"
          class="tw-relative tw-group"
        >
          <VcImage
            :src="file.url"
            size="m"
            aspect="1x1"
            bordered
          />
          <div
            class="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-opacity-0 group-hover:tw-opacity-100 tw-transition"
          >
            <VcButton
              size="s"
              variant="danger"
              @click="deleteUploadedFile(file.id)"
            >
              <VcIcon icon="material-delete" size="s" />
            </VcButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcLabel,
  VcFileUpload,
  VcIcon,
  VcStatusIcon,
  VcImage,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface UploadingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  url: string;
}

const newFiles = ref<File[]>([]);
const uploadingFiles = ref<UploadingFile[]>([]);
const uploadedFiles = ref<UploadedFile[]>([]);
const isUploading = ref(false);

async function startUpload(files: File[]) {
  isUploading.value = true;

  for (const file of files) {
    const uploadingFile: UploadingFile = {
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      progress: 0,
      status: "uploading",
    };

    uploadingFiles.value.push(uploadingFile);

    try {
      // Simulate upload with progress
      await uploadFile(file, (progress) => {
        uploadingFile.progress = progress;
      });

      uploadingFile.status = "done";

      // Add to uploaded files
      uploadedFiles.value.push({
        id: uploadingFile.id,
        name: file.name,
        url: URL.createObjectURL(file),
      });

      // Remove from uploading after delay
      setTimeout(() => {
        const index = uploadingFiles.value.findIndex(f => f.id === uploadingFile.id);
        if (index !== -1) {
          uploadingFiles.value.splice(index, 1);
        }
      }, 2000);
    } catch (error: any) {
      uploadingFile.status = "error";
      uploadingFile.error = error.message;
    }
  }

  isUploading.value = false;
  newFiles.value = [];
}

async function uploadFile(file: File, onProgress: (progress: number) => void): Promise<void> {
  // Simulate chunked upload
  for (let progress = 0; progress <= 100; progress += 10) {
    await new Promise(resolve => setTimeout(resolve, 200));
    onProgress(progress);
  }
}

function deleteUploadedFile(id: string) {
  const index = uploadedFiles.value.findIndex(f => f.id === id);
  if (index !== -1) {
    uploadedFiles.value.splice(index, 1);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>
```

## Drag and Drop Zone

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel :required="true">
      {{ $t("PRODUCTS.PRODUCT_IMAGES") }}
    </VcLabel>

    <div
      class="tw-border-2 tw-border-dashed tw-rounded-lg tw-p-8 tw-text-center tw-transition"
      :class="[
        isDragging
          ? 'tw-border-[var(--primary-500)] tw-bg-[var(--primary-50)]'
          : 'tw-border-[var(--neutrals-300)] hover:tw-border-[var(--primary-400)]'
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
      
      <div class="tw-mb-4">
        <div class="tw-font-medium tw-mb-1">
          {{ $t("UPLOAD.DROP_FILES_HERE") }}
        </div>
        <div class="tw-text-sm tw-text-[var(--neutrals-500)]">
          {{ $t("UPLOAD.OR") }}
        </div>
      </div>

      <VcFileUpload
        v-model="images"
        :multiple="true"
        :accept="'image/*'"
        @change="onFilesAdded"
      >
        <template #trigger>
          <VcButton variant="primary">
            <VcIcon icon="material-add" class="tw-mr-2" />
            {{ $t("UPLOAD.SELECT_FILES") }}
          </VcButton>
        </template>
      </VcFileUpload>

      <div class="tw-text-xs tw-text-[var(--neutrals-500)] tw-mt-4">
        {{ $t("UPLOAD.ACCEPTED_FORMATS") }}: PNG, JPG, WebP ({{ $t("UPLOAD.MAX") }} 5 MB)
      </div>
    </div>

    <!-- Image grid -->
    <div v-if="imagePreiews.length > 0" class="tw-grid tw-grid-cols-4 tw-gap-4">
      <div
        v-for="(preview, index) in imagePreiews"
        :key="index"
        class="tw-relative tw-group"
      >
        <VcImage
          :src="preview.url"
          size="l"
          aspect="1x1"
          bordered
        />
        
        <div
          class="tw-absolute tw-inset-0 tw-bg-black tw-bg-opacity-50 tw-flex tw-items-center tw-justify-center tw-gap-2 tw-opacity-0 group-hover:tw-opacity-100 tw-transition"
        >
          <VcButton
            size="s"
            @click="setMainImage(index)"
          >
            <VcIcon icon="material-star" size="s" />
          </VcButton>
          <VcButton
            size="s"
            variant="danger"
            @click="removeImage(index)"
          >
            <VcIcon icon="material-delete" size="s" />
          </VcButton>
        </div>

        <VcBadge
          v-if="index === mainImageIndex"
          content="MAIN"
          variant="primary"
          size="s"
          :custom-position="true"
          top="8px"
          right="8px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcLabel,
  VcFileUpload,
  VcIcon,
  VcButton,
  VcImage,
  VcBadge,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const images = ref<File[]>([]);
const imagePreiews = ref<Array<{ url: string; name: string }>>([]);
const isDragging = ref(false);
const mainImageIndex = ref(0);

function onDrop(event: DragEvent) {
  isDragging.value = false;
  
  const files = Array.from(event.dataTransfer?.files || []);
  const imageFiles = files.filter(file => file.type.startsWith("image/"));
  
  if (imageFiles.length > 0) {
    onFilesAdded(imageFiles);
  }
}

function onFilesAdded(files: File[]) {
  for (const file of files) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      imagePreiews.value.push({
        url: e.target?.result as string,
        name: file.name,
      });
    };
    
    reader.readAsDataURL(file);
  }
  
  images.value = [];
}

function removeImage(index: number) {
  imagePreiews.value.splice(index, 1);
  
  if (mainImageIndex.value === index) {
    mainImageIndex.value = 0;
  } else if (mainImageIndex.value > index) {
    mainImageIndex.value--;
  }
}

function setMainImage(index: number) {
  mainImageIndex.value = index;
}
</script>
```

## Key Points

### Props
- `v-model` - File[] array binding
- `multiple` - Allow multiple file selection
- `accept` - Accepted file types (MIME types or extensions)
- `disabled` - Disable upload
- `@change` - Event fired when files are selected

### File Validation
```typescript
// Check file size
if (file.size > maxSize) {
  throw new Error("File too large");
}

// Check file type
const validTypes = ["image/png", "image/jpeg"];
if (!validTypes.includes(file.type)) {
  throw new Error("Invalid file type");
}
```

### Common Use Cases

1. **Image Upload**: Product images with preview
```vue
<VcFileUpload
  v-model="images"
  :multiple="true"
  accept="image/*"
/>
```

2. **Document Upload**: PDFs, Word, Excel
```vue
<VcFileUpload
  v-model="documents"
  accept=".pdf,.doc,.docx,.xls,.xlsx"
/>
```

3. **Avatar Upload**: Single image
```vue
<VcFileUpload
  v-model="avatar"
  :multiple="false"
  accept="image/*"
/>
```

### Best Practices

- Always validate file size and type
- Show file size in human-readable format
- Provide clear upload instructions
- Display upload progress for large files
- Allow removing uploaded files
- Show preview for images
- Use drag-and-drop for better UX
- Set appropriate `accept` attribute
- Handle upload errors gracefully
- Show max file size/count limits
- Disable upload during processing
- Provide visual feedback (loading, success, error states)

