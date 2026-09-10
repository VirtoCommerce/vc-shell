import { ref, Ref, watch, onBeforeUnmount } from "vue";
import Sortable from "sortablejs";
import { TableItem } from "@ui/components/organisms/vc-data-table/types";

interface UseTableRowReorderOptions<T> {
  /** When true, dragging is disabled (SortableJS `disabled` option). */
  disabled: Ref<boolean>;
  /** CSS selector for the drag handle element(s). */
  handle: string;
  /** Called after a committed reorder. Payload matches the public `@row-reorder` contract. */
  onReorder: (args: { dragIndex: number; dropIndex: number; value: T[] }) => void;
}

/**
 * Row reordering for VcDataTable via SortableJS. `forceFallback: true` covers desktop rows
 * and mobile cards alike (touch + mouse), and dragging is restricted to the `handle`
 * selector so row click, swipe and long-press survive. On drop it commits into an internal
 * `reorderedItems` copy and calls `onReorder`; the watcher resyncs and clears
 * `pendingReorder` once the parent updates `items`.
 */
export function useTableRowReorder<T extends TableItem | string>(
  listEl: Ref<HTMLElement | undefined>,
  items: Ref<T[]>,
  options: UseTableRowReorderOptions<T>,
) {
  const reorderedItems = ref<T[]>([...items.value]) as Ref<T[]>;
  const isDragging = ref(false);
  // Keeps reorderedItems visible after drop until the parent updates items.
  const pendingReorder = ref(false);

  let sortableInstance: Sortable | null = null;

  function destroySortable() {
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }
  }

  function createSortable(el: HTMLElement) {
    destroySortable();
    sortableInstance = Sortable.create(el, {
      handle: options.handle,
      animation: 200,
      forceFallback: true,
      fallbackTolerance: 3,
      // `ghostClass` styles the in-list drop placeholder (stays within the reorder
      // track). `fallbackClass` styles the floating clone that follows the pointer —
      // we hide it (see CSS) so the drag can't roam the screen; feedback is the
      // placeholder + live row shifting, matching the column reorder behaviour.
      ghostClass: "vc-data-table__row-reorder-ghost",
      fallbackClass: "vc-data-table__row-reorder-fallback",
      disabled: options.disabled.value,
      onStart: () => {
        isDragging.value = true;
        // Snapshot current order into the internal copy.
        reorderedItems.value = [...items.value];
      },
      onEnd: (evt) => {
        isDragging.value = false;
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

        // SortableJS mutates the DOM directly. Undo the move so the DOM matches the order
        // Vue last rendered; otherwise Vue's keyed patch and SortableJS desync and the rows
        // snap back (the `items` update is correct, only the DOM is wrong). vuedraggable
        // pattern.
        const parent = evt.from;
        const dragged = evt.item;
        if (parent && dragged && dragged.parentElement === parent) {
          parent.removeChild(dragged);
          parent.insertBefore(dragged, parent.children[oldIndex] ?? null);
        }

        const arr = [...items.value];
        const [moved] = arr.splice(oldIndex, 1);
        arr.splice(newIndex, 0, moved);

        reorderedItems.value = arr;
        pendingReorder.value = true;
        options.onReorder({ dragIndex: oldIndex, dropIndex: newIndex, value: [...arr] });
      },
    });
  }

  // Create/destroy when the list element appears/disappears (v-if / view switch).
  watch(
    listEl,
    (el) => {
      if (el) createSortable(el);
      else destroySortable();
    },
    { immediate: true },
  );

  // Reactively toggle the disabled option.
  watch(options.disabled, (val) => {
    if (sortableInstance) sortableInstance.option("disabled", val);
  });

  // Resync internal copy with the source when not dragging.
  watch(
    items,
    (newVal) => {
      if (!isDragging.value) {
        reorderedItems.value = [...newVal];
        pendingReorder.value = false;
      }
    },
    { deep: true },
  );

  onBeforeUnmount(destroySortable);

  return {
    isDragging,
    reorderedItems,
    pendingReorder,
  };
}
