import { nextTick, type Ref } from "vue";
import { useWidgetSortable, type IWidgetMove, type WidgetListName } from "./useWidgetSortable";
import type { useWidgetLayout } from "./useWidgetLayout";

type Layout = ReturnType<typeof useWidgetLayout>;

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function isRtl(el: HTMLElement) {
  const dir = el.closest("[dir]")?.getAttribute("dir") || document.documentElement.dir;
  return dir === "rtl";
}

export interface IUseWidgetEditReorderOptions {
  layout: Pick<
    Layout,
    "strip" | "overflow" | "editing" | "canAddToStrip" | "reorder" | "moveToStrip" | "moveToOverflow"
  >;
  stripEl: Ref<HTMLElement | undefined>;
  overflowEl: Ref<HTMLElement | undefined>;
  /** Direction the strip list is laid out in */
  stripAxis: "horizontal" | "vertical";
  /** Sortable drag handle, whole item when omitted */
  handle?: string;
  /** Element to focus inside a moved item, so keyboard reorder can continue */
  focusSelector?: string;
  /** The minus/plus control inside an item, focused again after it moves between lists */
  controlSelector: string;
}

/** Drag and keyboard reorder shared by the desktop and mobile widget containers. */
export function useWidgetEditReorder(opts: IUseWidgetEditReorderOptions) {
  const { layout, stripEl, overflowEl } = opts;
  const focusSelector = opts.focusSelector ?? `.vc-widget-item ${FOCUSABLE}`;

  function onMove({ fromList, toList, from, to, id }: IWidgetMove) {
    if (fromList === toList) layout.reorder(fromList, from, to);
    else if (toList === "strip") layout.moveToStrip(id, to);
    else layout.moveToOverflow(id, to);
  }

  const sortableOpts = {
    group: "blade-widgets",
    enabled: layout.editing,
    handle: opts.handle,
    onMove,
    canPut: (toList: WidgetListName) => toList !== "strip" || layout.canAddToStrip.value,
  };
  useWidgetSortable(stripEl, sortableOpts);
  useWidgetSortable(overflowEl, sortableOpts);

  function itemOf(event: KeyboardEvent) {
    const item = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-widget-id]");
    return item?.dataset.widgetId ?? undefined;
  }

  const idsOf = (list: WidgetListName) =>
    (list === "strip" ? layout.strip.value : layout.overflow.value).map((w) => w.id);
  const itemsOf = (list: WidgetListName) =>
    Array.from((list === "strip" ? stripEl.value : overflowEl.value)?.children ?? []) as HTMLElement[];
  const findItem = (list: WidgetListName, id: string) => itemsOf(list).find((c) => c.dataset.widgetId === id);

  async function move(list: WidgetListName, id: string, delta: number) {
    const from = idsOf(list).indexOf(id);
    if (from < 0) return;
    layout.reorder(list, from, from + delta);
    await nextTick();
    findItem(list, id)?.querySelector<HTMLElement>(focusSelector)?.focus();
  }

  const enabledControl = (item: HTMLElement | undefined) => {
    const control = item?.querySelector<HTMLButtonElement>(opts.controlSelector);
    return control && !control.disabled ? control : undefined;
  };

  // Minus/plus removes the pressed button from its list; focus follows the widget, else its old neighbour
  async function moveAcross(id: string, to: WidgetListName) {
    const from: WidgetListName = to === "strip" ? "overflow" : "strip";
    const fromIndex = idsOf(from).indexOf(id);
    if (to === "strip") layout.moveToStrip(id);
    else layout.moveToOverflow(id);
    await nextTick();
    const left = itemsOf(from);
    const target =
      enabledControl(findItem(to, id)) ??
      enabledControl(left[Math.min(fromIndex, left.length - 1)]) ??
      enabledControl(left[fromIndex - 1]);
    target?.focus();
  }

  function onStripKeydown(event: KeyboardEvent) {
    if (!layout.editing.value) return;
    const horizontal = opts.stripAxis === "horizontal";
    const keys = horizontal ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"];
    if (!keys.includes(event.key)) return;
    const id = itemOf(event);
    if (!id) return;
    event.preventDefault();
    if (!horizontal) event.stopPropagation();
    const forward = horizontal
      ? (event.key === "ArrowRight") !== isRtl(event.currentTarget as HTMLElement)
      : event.key === "ArrowDown";
    move("strip", id, forward ? 1 : -1);
  }

  function onOverflowKeydown(event: KeyboardEvent) {
    if (!layout.editing.value || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
    const id = itemOf(event);
    if (!id) return;
    event.preventDefault();
    event.stopPropagation();
    move("overflow", id, event.key === "ArrowDown" ? 1 : -1);
  }

  return {
    onStripKeydown,
    onOverflowKeydown,
    moveToStrip: (id: string) => moveAcross(id, "strip"),
    moveToOverflow: (id: string) => moveAcross(id, "overflow"),
  };
}
