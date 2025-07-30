import { ref, Ref } from "vue";
import { TableColPartial } from "../types";

export function useTableColumnResize(
  internalColumns: Ref<TableColPartial[]>,
  onStateChange: () => void,
  headerRef: Ref<HTMLElement | undefined>,
) {
  const resizeColumnElement = ref<TableColPartial>();
  const nextColumn = ref<TableColPartial>();
  const lastResize = ref<number>();
  const columnResizing = ref(false);
  const resizer = ref<HTMLElement>();

  let columnResizeListener: ((event: MouseEvent) => void) | null = null;
  let columnResizeEndListener: ((event: MouseEvent) => void) | null = null;

  function getOffset(element: HTMLElement) {
    if (!element.getClientRects().length) {
      return { top: 0, left: 0 };
    }

    const rect = element.getBoundingClientRect();
    const win = element.ownerDocument.defaultView;
    return {
      top: rect.top + ((win && win.scrollY) ?? 0),
      left: rect.left + ((win && win.scrollX) ?? 0),
    };
  }

  function handleMouseDown(e: MouseEvent, item: TableColPartial) {
    // Prevent any default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (!item.id) {
      console.warn("Column has no id, cannot resize:", item);
      return;
    }

    const containerLeft = getOffset(headerRef.value as HTMLElement).left;
    resizeColumnElement.value = item;
    columnResizing.value = true;
    lastResize.value = e.pageX - containerLeft + (headerRef.value as HTMLDivElement).scrollLeft;

    // Prevent body scroll during resize
    document.body.style.overflow = "hidden";
    document.body.style.userSelect = "none";


    // If resizing any column and there are flexible columns, fix all column widths
    if (headerRef.value) {
      const hasFlexibleColumns = internalColumns.value.some((col) => col.visible !== false && !col.width);

      if (hasFlexibleColumns) {
        // Fix current widths for all visible columns
        internalColumns.value.forEach((col) => {
          if (col.visible !== false && col.id && !col.width) {
            const columnElement = headerRef.value!.querySelector(`#${CSS.escape(col.id)}`) as HTMLElement;
            if (columnElement) {
              col.width = columnElement.offsetWidth + "px";
            }
          }
        });
      }
    }

    bindColumnResizeEvents();
  }

  function bindColumnResizeEvents() {
    if (!columnResizeListener) {
      columnResizeListener = (event: MouseEvent) => {
        if (columnResizing.value) {
          onColumnResize(event);
        }
      };
      document.addEventListener("mousemove", columnResizeListener);
    }
    if (!columnResizeEndListener) {
      columnResizeEndListener = () => {
        if (columnResizing.value) {
          columnResizing.value = false;
          onColumnResizeEnd();
        }
        // Restore body scroll in case resize was cancelled
        document.body.style.overflow = "";
        document.body.style.userSelect = "";
      };
      document.addEventListener("mouseup", columnResizeEndListener);
    }
  }

  function unbindColumnResizeEvents() {
    if (columnResizeListener) {
      document.removeEventListener("mousemove", columnResizeListener);
      columnResizeListener = null;
    }
    if (columnResizeEndListener) {
      document.removeEventListener("mouseup", columnResizeEndListener);
      columnResizeEndListener = null;
    }
  }

  function onColumnResize(event: MouseEvent) {
    if (columnResizing.value && resizer.value && headerRef.value && resizeColumnElement.value) {
      const containerLeft = getOffset(headerRef.value).left;
      resizer.value.style.top = "0px";

      // Calculate the left offset based on mouse position
      let leftOffset = event.pageX - containerLeft + headerRef.value.scrollLeft;

      // Check if this is the last visible column
      const currentColIndex = internalColumns.value.findIndex((col) => col.id === resizeColumnElement.value!.id);
      let isLastColumn = true;
      if (currentColIndex !== -1) {
        for (let i = currentColIndex + 1; i < internalColumns.value.length; i++) {
          if (internalColumns.value[i].visible !== false) {
            isLastColumn = false;
            break;
          }
        }
      }

      // For the last column, limit the resizer position to prevent it from going beyond the table
      if (isLastColumn) {
        const maxLeft = headerRef.value.offsetWidth - resizer.value.offsetWidth - 1;
        leftOffset = Math.min(leftOffset, maxLeft);
      }

      // Ensure resizer doesn't go beyond the right edge of the table
      resizer.value.style.left = Math.min(leftOffset, headerRef.value.offsetWidth - resizer.value.offsetWidth) + "px";
      resizer.value.style.display = "block";
    }
  }

  function onColumnResizeEnd() {
    if (!resizer.value || !headerRef.value || !resizeColumnElement.value || lastResize.value === undefined) return;

    // Calculate delta but limit it to prevent overflow
    let delta = resizer.value.offsetLeft - lastResize.value;

    // Check if this is the last visible column
    const currentColIndex = internalColumns.value.findIndex((col) => col.id === resizeColumnElement.value!.id);
    let isLastColumn = true;
    if (currentColIndex !== -1) {
      for (let i = currentColIndex + 1; i < internalColumns.value.length; i++) {
        if (internalColumns.value[i].visible !== false) {
          isLastColumn = false;
          break;
        }
      }
    }

    // For the last column, limit delta to prevent overflow
    if (isLastColumn && delta > 0) {
      const columnElement = headerRef.value.querySelector(`#${CSS.escape(resizeColumnElement.value?.id ?? "")}`);
      if (columnElement) {
        const currentWidth = (columnElement as HTMLElement).offsetWidth;
        const containerWidth = headerRef.value.offsetWidth;
        let totalWidthOtherColumns = 0;

        // Calculate total width of other visible columns
        internalColumns.value.forEach((col, index) => {
          if (index !== currentColIndex && col.visible !== false && col.id) {
            const colEl = headerRef.value!.querySelector(`#${CSS.escape(col.id)}`) as HTMLElement;
            if (colEl) {
              totalWidthOtherColumns += colEl.offsetWidth;
            }
          }
        });

        // Maximum delta that won't cause overflow
        const maxDelta = containerWidth - totalWidthOtherColumns - currentWidth - 1;
        delta = Math.min(delta, maxDelta);
      }
    }
    // Escape special characters in ID for querySelector
    const escapedId = CSS.escape(resizeColumnElement.value?.id ?? "");
    const columnElement = headerRef.value.querySelector(`#${escapedId}`);

    if (columnElement) {
      const columnWidth = (columnElement as HTMLElement).offsetWidth;
      const newColumnWidth = columnWidth + delta;
      const minWidth = 15;

      if (columnWidth + delta > parseInt(minWidth.toString(), 10)) {
        const currentColIndex = internalColumns.value.findIndex((col) => col.id === resizeColumnElement.value?.id);

        // Find next visible column
        let nextVisibleColumn = undefined;
        if (currentColIndex !== -1) {
          for (let i = currentColIndex + 1; i < internalColumns.value.length; i++) {
            if (internalColumns.value[i].visible !== false) {
              nextVisibleColumn = internalColumns.value[i];
              break;
            }
          }
        }

        nextColumn.value = nextVisibleColumn;

        // Simply resize the current column without affecting others
        if (newColumnWidth > minWidth) {
          const colIndex = internalColumns.value.findIndex((col) => col.id === resizeColumnElement.value?.id);

          if (colIndex !== -1 && internalColumns.value[colIndex]) {
            // For the last column, check max width to prevent overflow
            if (!nextColumn.value && headerRef.value) {
              const tableWidth = headerRef.value.offsetWidth;
              let totalWidthBeforeLastColumn = 0;

              // Sum up widths of all columns before the last one
              internalColumns.value.forEach((col, index) => {
                if (index < colIndex && col.visible !== false && col.id) {
                  const colElement = headerRef.value!.querySelector(`#${CSS.escape(col.id)}`) as HTMLElement;
                  if (colElement) {
                    totalWidthBeforeLastColumn += colElement.offsetWidth;
                  }
                }
              });

              // Calculate the maximum allowed width for the last column
              const maxAllowedWidth = tableWidth - totalWidthBeforeLastColumn - 1;
              const finalWidth = Math.min(newColumnWidth, maxAllowedWidth);

              if (finalWidth > minWidth) {
                internalColumns.value[colIndex].width = finalWidth + "px";
              }
            } else {
              // For non-last columns, just set the new width
              internalColumns.value[colIndex].width = newColumnWidth + "px";
            }
          }
        }
      }

      resizer.value.style.display = "none";
      unbindColumnResizeEvents();

      // Restore body scroll after resize
      document.body.style.overflow = "";
      document.body.style.userSelect = "";

      onStateChange();
    }
  }

  return {
    resizer,
    columnResizing,
    handleMouseDown,
    unbindColumnResizeEvents,
  };
}
