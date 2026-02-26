import { computed, ref, Ref, toValue } from "vue";
import { usePopup } from "@shared/components/popup-handler/composables/usePopup";
import VcGalleryPreview from "../_internal/vc-gallery-preview/vc-gallery-preview.vue";
import type { ICommonAsset } from "@core/types";

export function useGalleryPreview(images: Ref<ICommonAsset[]>) {
  const previewIndex = ref(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { open } = usePopup(
    computed(() => ({
      component: VcGalleryPreview,
      props: {
        images: toValue(images),
        index: previewIndex.value,
      },
    })) as any,
  );

  function openPreview(index: number) {
    previewIndex.value = index;
    open();
  }

  return { openPreview };
}
