import { Ref, toValue } from "vue";
import type { AssetLike } from "@core/composables/useAssetsManager";

interface UseGalleryUploadOptions {
  onUpload: (files: FileList, startingSortOrder?: number) => void;
}

const IMAGE_EXT_RE = /\.(apng|avif|bmp|gif|heic|heif|ico|jfif|jpe?g|pjp(eg)?|png|svg|tiff?|webp)$/i;

function isImageFile(file: File): boolean {
  if (file.type) return file.type.startsWith("image/");
  return IMAGE_EXT_RE.test(file.name);
}

export function useGalleryUpload(images: Ref<AssetLike[]>, options: UseGalleryUploadOptions) {
  function onUpload(files: FileList) {
    if (!files || !files.length) return;

    const imageFiles = Array.from(files).filter(isImageFile);
    if (!imageFiles.length) return;

    const currentImages = toValue(images);
    const existingNames = currentImages.map((img) => img.name);
    const uploadedFiles: File[] = [];

    imageFiles.forEach((file) => {
      let fileName = file.name;

      if (existingNames.includes(fileName)) {
        const dotIndex = fileName.lastIndexOf(".");
        const baseName = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
        const ext = dotIndex > 0 ? fileName.slice(dotIndex) : "";
        let index = 1;

        while (existingNames.includes(fileName)) {
          fileName = `${baseName}_${index}${ext}`;
          index++;
        }
      }

      uploadedFiles.push(new File([file], fileName, { type: file.type }));
      existingNames.push(fileName);
    });

    const dt = new DataTransfer();
    uploadedFiles.forEach((f) => dt.items.add(f));

    const lastSortOrder = currentImages[currentImages.length - 1]?.sortOrder;
    options.onUpload(dt.files, lastSortOrder);
  }

  return { onUpload };
}
