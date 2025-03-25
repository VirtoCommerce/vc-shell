import { ref, Ref } from "vue";
import { TableItem, TableColPartial } from "../vc-table.vue";

export function useTableColumnReorder<T extends TableItem | string>(
  internalColumns: Ref<TableColPartial[]>,
  onStateChange: () => void,
  headerRef: Ref<HTMLElement | undefined>,
) {
  const draggedColumn = ref<TableColPartial | null>(null);
  const draggedElement = ref<HTMLElement>();
  const dropPosition = ref<number | null>(null);
  const reorderRef = ref<HTMLElement>();
  const ghostRef = ref<HTMLElement | null>(null);
  const dragOffset = ref({ x: 0, y: 0 });

  function findParentHeader(element: HTMLElement) {
    if (element.classList.contains("vc-table-columns-header__cell")) {
      return element;
    } else {
      let parent = element.parentElement;

      while (parent && !parent.classList.contains("vc-table-columns-header__cell")) {
        parent = parent.parentElement;
        if (!parent) break;
      }

      return parent;
    }
  }

  function getOffset(element: HTMLElement | null | undefined) {
    if (!element || !element.getClientRects().length) {
      return { top: 0, left: 0 };
    }

    const rect = element.getBoundingClientRect();
    const win = element.ownerDocument.defaultView;
    return {
      top: rect.top + ((win && win.scrollY) ?? 0),
      left: rect.left + ((win && win.scrollX) ?? 0),
    };
  }

  function onColumnHeaderMouseDown(event: MouseEvent) {
    if (event.currentTarget instanceof HTMLElement) {
      const header = event.currentTarget;
      const headerRect = header.getBoundingClientRect();

      dragOffset.value = {
        x: event.clientX - headerRect.left,
        y: event.clientY - headerRect.top,
      };

      const ghost = header.cloneNode(true) as HTMLElement;
      ghost.style.width = `${header.offsetWidth}px`;
      ghost.style.height = `${header.offsetHeight}px`;
      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "9999";
      ghost.style.opacity = "0.8";
      ghost.style.background = "var(--table-header-bg)";
      ghost.style.display = "none";
      ghost.classList.add("vc-table-columns-header__ghost-header");

      document.body.appendChild(ghost);
      ghostRef.value = ghost;

      header.draggable = true;
    }
  }

  function onColumnHeaderDragStart(event: DragEvent, item: TableColPartial) {
    draggedColumn.value = item;
    draggedElement.value = event.target as HTMLElement;

    document.addEventListener("dragend", onDragEnd, { once: true });

    if (event.dataTransfer) {
      event.dataTransfer.setData("text", "reorder");
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

  function onColumnHeaderDragOver(event: DragEvent) {
    const dropHeader = findParentHeader(event.target as HTMLElement);
    const headerRow = (event.target as HTMLElement).closest(".vc-table-columns-header__row");

    if (headerRow) {
      const headerRowRect = headerRow.getBoundingClientRect();
      if (event.clientX < headerRowRect.left || event.clientX > headerRowRect.right) {
        if (reorderRef.value) {
          reorderRef.value.style.display = "none";
        }
        if (ghostRef.value) {
          ghostRef.value.style.display = "none";
        }
        return;
      }
    }

    if (!headerRow || !dropHeader || !headerRef.value || !reorderRef.value || !draggedColumn.value) {
      if (reorderRef.value) {
        reorderRef.value.style.display = "none";
      }
      if (ghostRef.value) {
        ghostRef.value.style.display = "none";
      }
      return;
    }

    const headerRect = headerRow.getBoundingClientRect();

    if (event.clientY < headerRect.top || event.clientY > headerRect.bottom) {
      if (reorderRef.value) {
        reorderRef.value.style.display = "none";
      }
      if (ghostRef.value) {
        ghostRef.value.style.display = "none";
      }
      return;
    }

    event.preventDefault();

    if (ghostRef.value) {
      ghostRef.value.style.display = "flex";
      ghostRef.value.style.left = `${event.clientX - dragOffset.value.x}px`;
      ghostRef.value.style.top = `${Math.max(headerRect.top, Math.min(headerRect.bottom - ghostRef.value.offsetHeight, event.clientY - dragOffset.value.y))}px`;
    }

    const containerOffset = getOffset(headerRef.value);
    const dropHeaderOffset = getOffset(dropHeader);

    if (draggedElement.value !== dropHeader) {
      const targetLeft = dropHeaderOffset.left - containerOffset.left;
      const columnCenter = dropHeaderOffset.left + dropHeader.offsetWidth / 2;

      reorderRef.value.style.top = dropHeaderOffset.top - getOffset(headerRef.value).top + "px";

      if (event.pageX > columnCenter) {
        reorderRef.value.style.left = targetLeft + dropHeader.offsetWidth - 5 + "px";
        dropPosition.value = 1;
      } else {
        reorderRef.value.style.left = targetLeft - 5 + "px";
        dropPosition.value = -1;
      }

      reorderRef.value.style.display = "block";
    }
  }

  function onColumnHeaderDragLeave(event: DragEvent) {
    event.preventDefault();

    if (reorderRef.value) {
      reorderRef.value.style.display = "none";
    }
  }

  function reorderArray(value: unknown[], from: number, to: number) {
    if (value && from !== to) {
      if (to >= value.length) {
        to %= value.length;
        from %= value.length;
      }

      value.splice(to, 0, value.splice(from, 1)[0]);
    }
  }

  function onColumnHeaderDrop(event: DragEvent, item: TableColPartial) {
    event.preventDefault();

    const headerRow = (event.target as HTMLElement).closest(".vc-table-columns-header__row");
    if (headerRow) {
      const headerRowRect = headerRow.getBoundingClientRect();
      const isWithinBounds =
        event.clientX >= headerRowRect.left &&
        event.clientX <= headerRowRect.right &&
        event.clientY >= headerRowRect.top &&
        event.clientY <= headerRowRect.bottom;

      if (!isWithinBounds) {
        cleanupDrag();
        return;
      }
    }

    if (!draggedColumn.value) {
      cleanupDrag();
      return;
    }

    const dragIndex = internalColumns.value.indexOf(draggedColumn.value);
    const dropIndex = internalColumns.value.indexOf(item);

    let allowDrop = dragIndex !== dropIndex;

    if (
      allowDrop &&
      ((dropIndex - dragIndex === 1 && dropPosition.value === -1) ||
        (dropIndex - dragIndex === -1 && dropPosition.value === 1))
    ) {
      allowDrop = false;
    }

    if (allowDrop) {
      reorderArray(internalColumns.value, dragIndex, dropIndex);
      onStateChange();
    }

    cleanupDrag();
  }

  function onDragEnd() {
    cleanupDrag();
  }

  function cleanupDrag() {
    if (ghostRef.value) {
      document.body.removeChild(ghostRef.value);
      ghostRef.value = null;
    }

    if (reorderRef.value) {
      reorderRef.value.style.display = "none";
    }
    if (draggedElement.value) {
      draggedElement.value.draggable = false;
    }
    draggedColumn.value = null;
    dropPosition.value = null;
  }

  return {
    draggedColumn,
    draggedElement,
    dropPosition,
    reorderRef,
    headerRef,
    onColumnHeaderMouseDown,
    onColumnHeaderDragStart,
    onColumnHeaderDragOver,
    onColumnHeaderDragLeave,
    onColumnHeaderDrop,
  };
}
