import type { IWidgetDragChange } from "./useWidgetSortable";

const isWidget = (el: Element, dragged: HTMLElement): el is HTMLElement =>
  el !== dragged &&
  el instanceof HTMLElement &&
  el.dataset.widgetSlot !== undefined &&
  !el.classList.contains("sortable-fallback");

/**
 * While a hidden widget is dragged over a full strip, the last strip widget steps out to the place
 * the dragged one left, so the strip never shows more widgets than it holds. Dragging back undoes it.
 * Only the DOM changes here: `restore` puts the node back before the drop is reverted,
 * and the layout makes the same move from the reported drop.
 */
export function createStripDisplacement(max: number) {
  let displaced: { el: HTMLElement; strip: HTMLElement; next: Node | null } | undefined;

  function restore() {
    if (!displaced) return;
    const { el, strip, next } = displaced;
    strip.insertBefore(el, next?.parentNode === strip ? next : null);
    displaced = undefined;
  }

  function onChange({ item, from, to, oldIndex }: IWidgetDragChange) {
    if (from.dataset.widgetList !== "overflow") return;
    if (to === from) return restore();
    if (displaced) return;
    const widgets = Array.from(to.children).filter((el) => isWidget(el, item));
    if (widgets.length < max) return;
    const el = widgets[widgets.length - 1];
    displaced = { el, strip: to, next: el.nextSibling === item ? item.nextSibling : el.nextSibling };
    from.insertBefore(el, from.children[oldIndex] ?? null);
  }

  return { onChange, restore };
}
