import { computed, ref, Ref, toValue, watch, nextTick, onBeforeUnmount } from "vue";
import Sortable from "sortablejs";
import type { AssetLike } from "@core/composables/useAssetsManager";

interface UseGalleryReorderOptions {
  disabled: Ref<boolean>;
  onSort: (sorted: AssetLike[]) => void;
  onReorderStart?: () => void;
  onReorderEnd?: () => void;
  /** Called during drag with edge proximity: -1 = near left, 1 = near right, 0 = center */
  onDragEdge?: (direction: -1 | 0 | 1) => void;
}

export function useGalleryReorder(images: Ref<AssetLike[]>, options: UseGalleryReorderOptions) {
  const galleryRef = ref<HTMLElement>();
  const isDragging = ref(false);
  const draggedId = ref<string>();

  const disableDrag = computed(() => toValue(options.disabled) || toValue(images).length <= 1);

  let sortableInstance: Sortable | null = null;
  let edgeInterval: ReturnType<typeof setInterval> | null = null;
  let mouseX = 0;

  function onPointerMove(e: PointerEvent | MouseEvent) {
    mouseX = e.clientX;
  }

  function startEdgeDetection() {
    document.addEventListener("pointermove", onPointerMove, true);
    const EDGE_THRESHOLD = 80; // px from visible edge
    const SCROLL_INTERVAL = 250; // ms between ticks

    edgeInterval = setInterval(() => {
      const container = galleryRef.value;
      if (!container || !options.onDragEdge) return;

      // Use the visible parent (swiper container or gallery dropzone), not swiper-wrapper
      const visibleParent =
        container.closest(".vc-gallery-filmstrip") || container.closest(".vc-gallery__dropzone") || container;
      const rect = visibleParent.getBoundingClientRect();

      if (mouseX < rect.left + EDGE_THRESHOLD) {
        options.onDragEdge(-1);
      } else if (mouseX > rect.right - EDGE_THRESHOLD) {
        options.onDragEdge(1);
      }
    }, SCROLL_INTERVAL);
  }

  function stopEdgeDetection() {
    document.removeEventListener("pointermove", onPointerMove, true);
    if (edgeInterval) {
      clearInterval(edgeInterval);
      edgeInterval = null;
    }
  }

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
        options.onReorderStart?.();
        startEdgeDetection();
      },
      onEnd: (evt) => {
        stopEdgeDetection();
        isDragging.value = false;
        draggedId.value = undefined;

        if (evt.oldIndex != null && evt.newIndex != null && evt.oldIndex !== evt.newIndex) {
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

        // Always call onReorderEnd — even on no-op drop — to restore Swiper state
        options.onReorderEnd?.();
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
    stopEdgeDetection();
    destroySortable();
  });

  return {
    galleryRef,
    disableDrag,
    isDragging,
    draggedId,
  };
}
