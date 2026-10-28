import { onBeforeUnmount, watch, type Ref } from "vue";
import Sortable from "sortablejs";

export type WidgetListName = "strip" | "overflow";

export interface IWidgetMove {
  fromList: WidgetListName;
  toList: WidgetListName;
  from: number;
  to: number;
  id: string;
}

export interface IUseWidgetSortableOptions {
  group: string;
  enabled: Readonly<Ref<boolean>>;
  handle?: string;
  onMove: (e: IWidgetMove) => void;
  /** Return false to refuse a drop from another list (e.g. a full strip). */
  canPut?: (toList: WidgetListName) => boolean;
}

const listName = (el: HTMLElement): WidgetListName => (el.dataset.widgetList === "overflow" ? "overflow" : "strip");

/**
 * SortableJS over a widget list (`data-widget-list`, items carry `data-widget-id`).
 * Sortable moves the DOM node itself; it is put back before the move is reported
 * so Vue's keyed patch still matches what it last rendered.
 */
export function useWidgetSortable(el: Ref<HTMLElement | undefined>, opts: IUseWidgetSortableOptions) {
  let instance: Sortable | null = null;

  function create(target: HTMLElement) {
    destroy();
    instance = Sortable.create(target, {
      group: {
        name: opts.group,
        put: () => opts.canPut?.(listName(target)) ?? true,
      },
      handle: opts.handle,
      animation: 150,
      forceFallback: true,
      fallbackTolerance: 3,
      disabled: !opts.enabled.value,
      onEnd: (evt) => {
        const item = evt.item;
        const id = item.dataset.widgetId;
        const { oldIndex, newIndex } = evt;
        if (oldIndex == null || newIndex == null) return;
        if (item.parentNode) item.parentNode.removeChild(item);
        evt.from.insertBefore(item, evt.from.children[oldIndex] ?? null);
        if (!id) return;
        const fromList = listName(evt.from);
        const toList = listName(evt.to);
        if (fromList === toList && oldIndex === newIndex) return;
        opts.onMove({ fromList, toList, from: oldIndex, to: newIndex, id });
      },
    });
  }

  function destroy() {
    instance?.destroy();
    instance = null;
  }

  watch(el, (target) => (target ? create(target) : destroy()), { immediate: true, flush: "post" });
  watch(opts.enabled, (value) => instance?.option("disabled", !value));
  onBeforeUnmount(destroy);
}
