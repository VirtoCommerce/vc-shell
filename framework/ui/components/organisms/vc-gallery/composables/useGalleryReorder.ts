import { computed, ref, Ref, toValue, watch, nextTick, onBeforeUnmount } from "vue";
import Sortable from "sortablejs";
import type { AssetLike } from "@core/composables/useAssetsManager";

interface UseGalleryReorderOptions {
  disabled: Ref<boolean>;
  onSort: (sorted: AssetLike[]) => void;
}

export function useGalleryReorder(images: Ref<AssetLike[]>, options: UseGalleryReorderOptions) {
  const galleryRef = ref<HTMLElement>();
  const isDragging = ref(false);
  const draggedId = ref<string>();

  const disableDrag = computed(() => toValue(options.disabled) || toValue(images).length <= 1);

  let sortableInstance: Sortable | null = null;

  function createSortable(el: HTMLElement) {
    destroySortable();
    sortableInstance = Sortable.create(el, {
      handle: ".vc-gallery-item__drag-handle",
      animation: 250,
      ghostClass: "vc-gallery__item--ghost",
      dragClass: "vc-gallery__item--dragging",
      forceFallback: true,
      fallbackTolerance: 3,
      disabled: disableDrag.value,
      onStart: (evt) => {
        isDragging.value = true;
        const item = images.value[evt.oldIndex!];
        draggedId.value = item?.id;
      },
      onEnd: (evt) => {
        isDragging.value = false;
        draggedId.value = undefined;

        if (evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
          // Sortable already moved the DOM — sync the array
          const arr = [...images.value];
          const [moved] = arr.splice(evt.oldIndex, 1);
          arr.splice(evt.newIndex, 0, moved);
          images.value = arr;

          nextTick(() => {
            const sorted = images.value.map((img, index) => ({
              ...img,
              sortOrder: index,
            }));
            options.onSort(sorted);
          });
        }
      },
    });
  }

  function destroySortable() {
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }
  }

  // Create/destroy sortable when element appears/disappears (v-if toggle)
  watch(galleryRef, (el) => {
    if (el) {
      createSortable(el);
    } else {
      destroySortable();
    }
  });

  // Update disabled state
  watch(disableDrag, (val) => {
    if (sortableInstance) {
      sortableInstance.option("disabled", val);
    }
  });

  onBeforeUnmount(() => {
    destroySortable();
  });

  return {
    galleryRef,
    disableDrag,
    isDragging,
    draggedId,
  };
}
