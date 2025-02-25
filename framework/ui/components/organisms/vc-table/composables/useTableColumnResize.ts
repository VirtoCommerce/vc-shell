import { ref, Ref } from "vue";
import { TableColPartial } from "../types";
import * as _ from "lodash-es";

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
    const containerLeft = getOffset(headerRef.value as HTMLElement).left;
    resizeColumnElement.value = item;
    columnResizing.value = true;
    lastResize.value = e.pageX - containerLeft + (headerRef.value as HTMLDivElement).scrollLeft;

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
    if (columnResizing.value && resizer.value && headerRef.value) {
      const containerLeft = getOffset(headerRef.value).left;
      resizer.value.style.top = "0px";
      const leftOffset = event.pageX - containerLeft + headerRef.value.scrollLeft;
      resizer.value.style.left =
        Math.min(leftOffset, headerRef.value.offsetWidth - resizer.value.offsetWidth - 70) + "px";
      resizer.value.style.display = "block";
    }
  }

  function onColumnResizeEnd() {
    if (!resizer.value || !headerRef.value || !resizeColumnElement.value || lastResize.value === undefined) return;

    const delta = resizer.value.offsetLeft - lastResize.value;
    const columnElement = headerRef.value.querySelector(`#${resizeColumnElement.value.id}`);

    if (columnElement) {
      const columnWidth = (columnElement as HTMLElement).offsetWidth;
      const newColumnWidth = columnWidth + delta;
      const minWidth = 15;

      if (columnWidth + delta > parseInt(minWidth.toString(), 10)) {
        nextColumn.value = internalColumns.value[internalColumns.value.indexOf(resizeColumnElement.value) + 1];

        if (nextColumn.value) {
          const nextColElement = headerRef.value.querySelector(`#${nextColumn.value.id}`);

          if (nextColElement) {
            const nextColumnWidth = (nextColElement as HTMLElement).offsetWidth - delta;

            if (newColumnWidth > minWidth && nextColumnWidth > minWidth) {
              resizeTableCells(newColumnWidth, nextColumnWidth);
            }
          }
        } else {
          if (newColumnWidth > minWidth) {
            resizeColumnElement.value.width = newColumnWidth + "px";
          }
        }
      }

      resizer.value.style.display = "none";
      unbindColumnResizeEvents();
      onStateChange();
    }
  }

  function resizeTableCells(newColumnWidth: number, nextColumnWidth: number) {
    if (!headerRef.value || !resizeColumnElement.value) return;

    const colIndex = internalColumns.value.findIndex((col) => col.id === resizeColumnElement.value?.id);
    const widths: number[] = [];
    const tableHeaders = headerRef.value.querySelectorAll(".vc-table-header__cell") as NodeListOf<HTMLElement>;

    tableHeaders.forEach((header) => widths.push(header.offsetWidth));

    internalColumns.value.forEach((col, index) => {
      col.width = widths[index] + "px";
    });

    widths.forEach((width, index) => {
      const colWidth =
        index === colIndex ? newColumnWidth : nextColumnWidth && index === colIndex + 1 ? nextColumnWidth : width;

      internalColumns.value[index].width = colWidth + "px";
    });
  }

  return {
    resizer,
    columnResizing,
    handleMouseDown,
    unbindColumnResizeEvents,
  };
}
