import { computed, ref, Ref } from "vue";
import { TableItem } from "../types";
import { createLogger } from "../../../../../core/utilities";

const logger = createLogger("vc-table-row-reorder");

export function useTableRowReorder<T extends TableItem | string>(
  items: Ref<T[]>,
  onReorder: (args: { dragIndex: number; dropIndex: number; value: T[] }) => void,
) {
  const internalItems = computed(() => items.value);
  const draggedRow = ref<number>();
  const rowDragged = ref(false);
  const droppedRowIndex = ref<number>();
  const draggedRowIndex = ref<number>();
  const ghostRef = ref<HTMLElement | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });

  function reorderArray(value: unknown[], from: number, to: number) {
    if (value && from !== to) {
      if (to >= value.length) {
        to %= value.length;
        from %= value.length;
      }

      value.splice(to, 0, value.splice(from, 1)[0]);
    }
  }

  function onRowMouseDown(event: MouseEvent) {
    if (event.currentTarget instanceof HTMLElement) {
      const row = event.currentTarget;
      logger.debug("Row mousedown event", row);
      const rowRect = row.getBoundingClientRect();

      dragOffset.value = {
        x: event.clientX - rowRect.left,
        y: event.clientY - rowRect.top,
      };

      const ghost = row.cloneNode(true) as HTMLElement;
      ghost.style.width = `${row.offsetWidth}px`;
      ghost.style.height = `${row.offsetHeight}px`;
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "9999";
      ghost.style.opacity = "0.8";
      ghost.style.background = "var(--table-row-bg-odd)";
      ghost.style.display = "none";
      ghost.classList.add("vc-table-row__ghost-row");

      document.body.appendChild(ghost);
      ghostRef.value = ghost;

      row.draggable = true;
    }
  }

  function onRowDragStart(event: DragEvent, item: T) {
    logger.debug("Row drag start", { item });
    rowDragged.value = true;
    const index = internalItems.value.indexOf(item);
    draggedRow.value = index;
    draggedRowIndex.value = index;

    if (event.dataTransfer) {
      event.dataTransfer.setData("text", "row-reorder");
      event.dataTransfer.effectAllowed = "move";

      const emptyImg = document.createElement("div");
      emptyImg.style.display = "none";
      document.body.appendChild(emptyImg);
      event.dataTransfer.setDragImage(emptyImg, 0, 0);
      setTimeout(() => {
        document.body.removeChild(emptyImg);
      }, 0);
    }
  }

  function onRowDragOver(event: DragEvent, item: T) {
    if (!rowDragged.value || draggedRow.value === undefined) return;

    const currentIndex = internalItems.value.indexOf(item);

    if (currentIndex === draggedRow.value) return;

    const rowElement = event.currentTarget as HTMLElement;
    const tableBody = rowElement.closest(".vc-table-body");

    if (!tableBody) {
      if (ghostRef.value) {
        ghostRef.value.style.display = "none";
      }
      return;
    }

    const rowRect = rowElement.getBoundingClientRect();
    const tableRect = tableBody.getBoundingClientRect();
    const mouseY = event.clientY;

    if (ghostRef.value) {
      ghostRef.value.style.display = "flex";
      ghostRef.value.style.left = `${tableRect.left}px`;
      ghostRef.value.style.width = `${tableRect.width}px`;
      ghostRef.value.style.top = `${Math.max(tableRect.top, Math.min(tableRect.bottom - ghostRef.value.offsetHeight, mouseY - dragOffset.value.y))}px`;
    }

    const allRows = rowElement.parentElement?.querySelectorAll(".vc-table-row");
    allRows?.forEach((row) => {
      row.classList.remove("vc-table-row__drag-row-bottom", "vc-table-row__drag-row-top");
    });

    const relativeY = mouseY - rowRect.top;
    const isFirstRow = currentIndex === 0;
    const isOverUpperThird = relativeY < rowElement.offsetHeight / 3;

    if (isFirstRow && isOverUpperThird) {
      droppedRowIndex.value = 0;
      rowElement.classList.add("vc-table-row__drag-row-top");
    } else {
      if (relativeY < rowElement.offsetHeight / 2) {
        droppedRowIndex.value = currentIndex;
        rowElement.classList.add("vc-table-row__drag-row-top");
      } else {
        droppedRowIndex.value = currentIndex + 1;
        rowElement.classList.add("vc-table-row__drag-row-bottom");
      }
    }

    event.preventDefault();
  }

  function onRowDragLeave(event: DragEvent) {
    event.preventDefault();
    const rowElement = event.currentTarget as HTMLElement;
    rowElement.classList.remove("vc-table-row__drag-row-top", "vc-table-row__drag-row-bottom");
  }

  function onRowDragEnd(event: DragEvent) {
    rowDragged.value = false;
    draggedRow.value = undefined;
    draggedRowIndex.value = undefined;
    droppedRowIndex.value = undefined;
    (event.currentTarget as HTMLElement).draggable = false;

    if (ghostRef.value) {
      document.body.removeChild(ghostRef.value);
      ghostRef.value = null;
    }
  }

  function onRowDrop(event: DragEvent) {
    if (droppedRowIndex.value !== undefined && draggedRowIndex.value !== undefined) {
      const processedItems = [...internalItems.value];
      reorderArray(processedItems, draggedRowIndex.value, droppedRowIndex.value);

      onReorder({
        dragIndex: draggedRowIndex.value,
        dropIndex: droppedRowIndex.value,
        value: processedItems as T[],
      });
    }

    onRowDragLeave(event);
    onRowDragEnd(event);
    event.preventDefault();
  }

  return {
    draggedRow,
    onRowMouseDown,
    onRowDragStart,
    onRowDragOver,
    onRowDragLeave,
    onRowDragEnd,
    onRowDrop,
  };
}
