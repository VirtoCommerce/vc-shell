import { computed, ref, Ref, toValue } from "vue";
import type { AssetLike } from "@core/composables/useAssetsManager";

interface UseGalleryReorderOptions {
  disabled: Ref<boolean>;
  onSort: (sorted: AssetLike[]) => void;
}

// Transparent 1x1 GIF hides the browser's default drag ghost
const TRANSPARENT_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const SWAP_THROTTLE_MS = 50;

export function useGalleryReorder(images: Ref<AssetLike[]>, options: UseGalleryReorderOptions) {
  const galleryRef = ref<HTMLElement>();
  const isDragging = ref(false);
  const draggedId = ref<string>();

  const disableDrag = computed(() => toValue(options.disabled) || toValue(images).length <= 1);

  let draggedIndex = -1;
  let lastSwapTime = 0;
  let snapshotBeforeDrag: AssetLike[] = [];
  let dropCommitted = false;

  function findGalleryItem(element: HTMLElement): HTMLElement | null {
    if (element.classList.contains("vc-gallery__item")) return element;
    let parent = element.parentElement;
    while (parent && !parent.classList.contains("vc-gallery__item")) {
      parent = parent.parentElement;
    }
    return parent;
  }

  function getItemIndex(itemEl: HTMLElement): number {
    const grid = galleryRef.value;
    if (!grid) return -1;
    const items = Array.from(grid.children).filter((el) => el.classList.contains("vc-gallery__item"));
    return items.indexOf(itemEl);
  }

  function onItemMouseDown(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;

    if (disableDrag.value || event.button !== 0) {
      target.draggable = false;
      return;
    }

    const source = event.target;
    const sourceElement = source instanceof Element ? source : null;
    const fromDragHandle = !!sourceElement?.closest(".vc-gallery-item__drag-handle");
    const fromInteractiveControl = !!sourceElement?.closest("button, a, input, textarea, select, [role='button']");

    // Enable drag only from explicit handle to avoid hijacking action button clicks.
    target.draggable = fromDragHandle && !fromInteractiveControl;
  }

  function onItemMouseUp(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement | null;
    if (!target || isDragging.value) return;
    target.draggable = false;
  }

  function onItemDragStart(event: DragEvent, item: AssetLike) {
    if (disableDrag.value) return;

    // Hide default browser ghost
    const img = new Image();
    img.src = TRANSPARENT_GIF;
    event.dataTransfer?.setDragImage(img, 0, 0);
    event.dataTransfer?.setData("text", "gallery_reorder");

    draggedId.value = item.id;
    draggedIndex = images.value.findIndex((i) => i.id === item.id);
    snapshotBeforeDrag = [...images.value];
    dropCommitted = false;
    isDragging.value = true;
  }

  function onItemDragOver(event: DragEvent) {
    // CRITICAL: Must call before any early return or drop never fires
    event.preventDefault();

    if (disableDrag.value || !isDragging.value || draggedIndex < 0) return;

    const now = Date.now();
    if (now - lastSwapTime < SWAP_THROTTLE_MS) return;

    const dropItem = findGalleryItem(event.target as HTMLElement);
    if (!dropItem) return;

    const dropIndex = getItemIndex(dropItem);
    if (dropIndex < 0 || dropIndex === draggedIndex) return;

    // 2D dominant-axis threshold — works for both same-row and cross-row swaps
    const rect = dropItem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const movingForward = dropIndex > draggedIndex;

    // Normalise distances so X and Y are comparable regardless of cell aspect ratio
    const dx = Math.abs(event.clientX - centerX) / rect.width;
    const dy = Math.abs(event.clientY - centerY) / rect.height;

    if (dx >= dy) {
      // Horizontal dominant — use X threshold
      if (movingForward && event.clientX < centerX) return;
      if (!movingForward && event.clientX > centerX) return;
    } else {
      // Vertical dominant — use Y threshold
      if (movingForward && event.clientY < centerY) return;
      if (!movingForward && event.clientY > centerY) return;
    }

    // Live-swap: reorder array so TransitionGroup FLIP-animates items
    const arr = [...images.value];
    const [moved] = arr.splice(draggedIndex, 1);
    arr.splice(dropIndex, 0, moved);
    images.value = arr;

    draggedIndex = dropIndex;
    lastSwapTime = now;
  }

  function onItemDragLeave() {
    // No-op — live-swap provides visual feedback instead of a line indicator
  }

  function onItemDrop(event: DragEvent) {
    event.preventDefault();
    if (!isDragging.value) return;

    dropCommitted = true;

    // Commit: assign sortOrder and emit
    const sorted = images.value.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));
    options.onSort(sorted);
    cleanup(event);
  }

  function onItemDragEnd(event: DragEvent) {
    if (isDragging.value && !dropCommitted) {
      // Drop cancelled or dropped outside — restore original order
      images.value = [...snapshotBeforeDrag];
    }
    cleanup(event);
  }

  function cleanup(event?: DragEvent) {
    // Reset draggable on the source element
    const target = event?.target as HTMLElement | null;
    if (target) target.draggable = false;

    isDragging.value = false;
    draggedId.value = undefined;
    draggedIndex = -1;
    snapshotBeforeDrag = [];
    dropCommitted = false;
    lastSwapTime = 0;
  }

  const reorderHandlers = {
    onItemMouseDown,
    onItemMouseUp,
    onItemDragStart,
    onItemDragOver,
    onItemDragLeave,
    onItemDrop,
    onItemDragEnd,
  };

  return {
    galleryRef,
    reorderHandlers,
    disableDrag,
    isDragging,
    draggedId,
  };
}
