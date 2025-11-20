---
id: composition-details-gallery-patterns
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, details, details]
title: "Gallery Patterns"
description: "Gallery Patterns composition for details blades"
---

# Gallery Patterns

Adds VcGallery integration for image/file management.

## Description
Provides:
- VcGallery component setup
- Image upload/delete handlers
- Multiple file type support
- Image validation

## Usage
Combine with form-basic pattern. Adds file/image management capability.

## Code

```typescript
import { ref } from "vue";
import { VcGallery, useAssets } from "@vc-shell/framework";

// Assets state
const images = ref<Array<{ url: string; name: string; type: string }>>([]);
const documents = ref<Array<{ url: string; name: string; type: string }>>([]);

// Assets handler
const imagesHandler = useAssets({
  multiple: true,
  sortable: true,
  onUpload: async (files: File[]) => {
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

      if (!isImage) {
        console.warn(`${file.name} is not an image`);
      }
      if (!isValidSize) {
        console.warn(`${file.name} exceeds 5MB limit`);
      }

      return isImage && isValidSize;
    });

    for (const file of validFiles) {
      try {
        const uploadedUrl = await uploadFile(file);
        images.value.push({
          url: uploadedUrl,
          name: file.name,
          type: file.type,
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    onModified();
  },
  onRemove: async (file: { url: string }) => {
    try {
      await deleteFile(file.url);
      images.value = images.value.filter(img => img.url !== file.url);
      onModified();
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  },
  onSort: (sortedFiles: Array<{ url: string }>) => {
    images.value = sortedFiles as typeof images.value;
    onModified();
  },
});

const documentsHandler = useAssets({
  multiple: true,
  onUpload: async (files: File[]) => {
    const validFiles = files.filter(file => {
      const allowedTypes = ["application/pdf", "application/msword", "text/plain"];
      const isValidType = allowedTypes.includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB max

      if (!isValidType) {
        console.warn(`${file.name} is not a supported document type`);
      }
      if (!isValidSize) {
        console.warn(`${file.name} exceeds 10MB limit`);
      }

      return isValidType && isValidSize;
    });

    for (const file of validFiles) {
      try {
        const uploadedUrl = await uploadFile(file);
        documents.value.push({
          url: uploadedUrl,
          name: file.name,
          type: file.type,
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    onModified();
  },
  onRemove: async (file: { url: string }) => {
    try {
      await deleteFile(file.url);
      documents.value = documents.value.filter(doc => doc.url !== file.url);
      onModified();
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  },
});
```

```vue
<VcCard :header="$t('IMAGES')">
  <VcGallery
    :images="images"
    multiple
    sortable
    @upload="imagesHandler.upload"
    @sort="imagesHandler.edit"
    @remove="imagesHandler.remove"
  />
</VcCard>

<VcCard :header="$t('DOCUMENTS')">
  <VcGallery
    :images="documents"
    multiple
    variant="file"
    @upload="documentsHandler.upload"
    @remove="documentsHandler.remove"
  />
</VcCard>
```
