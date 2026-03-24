import { computed, ref, Ref, toValue } from "vue";
import { usePopup } from "@shell/_internal/popup/composables/usePopup";
import VcGalleryPreview from "../_internal/vc-gallery-preview/vc-gallery-preview.vue";
import type { AssetLike } from "@core/composables/useAssetsManager";

export function useGalleryPreview(images: Ref<AssetLike[]>) {
  const previewIndex = ref(0);

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
