import { Ref, toValue } from "vue";
import type { ICommonAsset } from "@core/types";

interface UseGalleryUploadOptions {
  onUpload: (files: FileList, startingSortOrder?: number) => void;
}

export function useGalleryUpload(images: Ref<ICommonAsset[]>, options: UseGalleryUploadOptions) {
  function onUpload(files: FileList) {
    if (!files || !files.length) return;

    const currentImages = toValue(images);
    const existingNames = currentImages.map((img) => img.name);
    const uploadedFiles: File[] = [];

    Array.from(files).forEach((file) => {
      let fileName = file.name;

      if (existingNames.includes(fileName)) {
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        const ext = fileName.split(".").pop();
        let index = 1;

        while (existingNames.includes(fileName)) {
          fileName = `${baseName}_${index}.${ext}`;
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
