import { computed, ref, Ref, toValue } from "vue";
import type { ICommonAsset } from "@core/types";

interface UseGalleryReorderOptions {
  disabled: Ref<boolean>;
  onSort: (sorted: ICommonAsset[]) => void;
}

export function useGalleryReorder(images: Ref<ICommonAsset[]>, options: UseGalleryReorderOptions) {
  const draggedItem = ref<ICommonAsset>();
  const draggedElement = ref<HTMLElement>();
  const dropPosition = ref<number>();
  const reorderLineRef = ref<HTMLElement>();
  const galleryRef = ref<HTMLElement>();

  const disableDrag = computed(() => toValue(options.disabled) || toValue(images).length <= 1);

  function reorderArray(value: unknown[], from: number, to: number) {
    if (value && from !== to) {
      if (to >= value.length) {
        to %= value.length;
        from %= value.length;
      }
      value.splice(to, 0, value.splice(from, 1)[0]);
    }
  }

  function updateOrder() {
    const sorted = toValue(images).map((item, index) => {
      item.sortOrder = index;
      return item;
    });
    options.onSort(sorted);
  }

  function findGalleryItem(element: HTMLElement): HTMLElement | null {
    if (element.classList.contains("vc-gallery__item")) return element;
    let parent = element.parentElement;
    while (parent && !parent.classList.contains("vc-gallery__item")) {
      parent = parent.parentElement;
    }
    return parent;
  }

  function onItemMouseDown(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement | null;
    if (!disableDrag.value && target) {
      target.draggable = true;
    }
  }

  function onItemDragStart(event: DragEvent, item: ICommonAsset) {
    if (disableDrag.value) return;
    draggedItem.value = item;
    draggedElement.value = event.target as HTMLElement;
    event.dataTransfer?.setData("text", "gallery_reorder");
  }

  function onItemDragOver(event: DragEvent) {
    // CRITICAL: preventDefault() MUST be called before any early return.
    // The browser requires it on every dragover event for the drop event to fire.
    event.preventDefault();

    const dropItem = findGalleryItem(event.target as HTMLElement);
    if (disableDrag.value || !draggedItem.value || !dropItem) return;

    const containerOffset = galleryRef.value?.getBoundingClientRect();
    const dropItemOffset = dropItem.getBoundingClientRect();

    if (draggedElement.value !== dropItem && containerOffset) {
      const elementStyle = getComputedStyle(dropItem);
      const dropItemOffsetWidth = dropItem.offsetWidth + parseFloat(elementStyle.marginLeft);
      const targetLeft = dropItemOffset.left - containerOffset.left;
      const columnCenter = dropItemOffset.left + dropItemOffsetWidth / 2;

      if (reorderLineRef.value) {
        reorderLineRef.value.style.top = dropItemOffset.top - containerOffset.top + "px";
        reorderLineRef.value.style.height = dropItem.offsetHeight + "px";

        if (event.pageX > columnCenter) {
          reorderLineRef.value.style.left = targetLeft + dropItemOffsetWidth + "px";
          dropPosition.value = 1;
        } else {
          reorderLineRef.value.style.left = targetLeft - parseFloat(elementStyle.marginLeft) + "px";
          dropPosition.value = -1;
        }

        reorderLineRef.value.style.display = "block";
      }
    }
  }

  function onItemDragLeave() {
    if (disableDrag.value || !draggedItem.value || !reorderLineRef.value) return;
    reorderLineRef.value.style.display = "none";
  }

  function onItemDrop(event: DragEvent, item: ICommonAsset) {
    event.preventDefault();
    if (!draggedItem.value) return;

    const currentImages = toValue(images);
    const dragIndex = currentImages.indexOf(draggedItem.value);
    const dropIndex = currentImages.indexOf(item);

    let allowDrop = dragIndex !== dropIndex;

    if (
      allowDrop &&
      ((dropIndex - dragIndex === 1 && dropPosition.value === -1) ||
        (dropIndex - dragIndex === -1 && dropPosition.value === 1))
    ) {
      allowDrop = false;
    }

    if (allowDrop) {
      reorderArray(currentImages, dragIndex, dropIndex);
      updateOrder();
    }

    if (reorderLineRef.value && draggedElement.value) {
      reorderLineRef.value.style.display = "none";
      draggedElement.value.draggable = false;
      draggedItem.value = undefined;
      dropPosition.value = undefined;
    }
  }

  const reorderHandlers = {
    onItemMouseDown,
    onItemDragStart,
    onItemDragOver,
    onItemDragLeave,
    onItemDrop,
  };

  return {
    reorderLineRef,
    galleryRef,
    reorderHandlers,
    disableDrag,
    reorderArray,
  };
}
