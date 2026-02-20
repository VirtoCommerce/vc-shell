import { Breadcrumbs } from "@ui/types";
import { ComputedRef, computed, shallowRef } from "vue";
import { createLogger } from "@core/utilities";

const logger = createLogger("use-breadcrumbs");

export interface IUseBreadcrumbs {
  breadcrumbs: ComputedRef<Breadcrumbs[]>;
  push: (breadcrumb: Breadcrumbs) => void;
  remove: (ids: string[]) => void;
}

export function useBreadcrumbs(): IUseBreadcrumbs {
  const items = shallowRef<Breadcrumbs[]>([]);

  /**
   * Trim the trail: keep everything up to and including the item with `id`.
   * Called when a breadcrumb's clickHandler returns true (or void).
   */
  function trimAfter(id: string): void {
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      items.value = items.value.slice(0, index + 1);
    }
  }

  function push(breadcrumb: Breadcrumbs): void {
    // Wrap the clickHandler to auto-trim the trail on successful click
    const wrapped: Breadcrumbs = {
      ...breadcrumb,
      clickHandler: breadcrumb.clickHandler
        ? async (id: string) => {
            try {
              const result = await breadcrumb.clickHandler!(id);
              // Trim trail unless handler explicitly returned false
              if (result !== false) {
                trimAfter(id);
              }
            } catch (e) {
              logger.error("Breadcrumb click handler failed:", e);
            }
          }
        : undefined,
    };

    // Dedup by id: if a breadcrumb with this id already exists, update in place
    const existingIndex = items.value.findIndex((item) => item.id === wrapped.id);
    if (existingIndex !== -1) {
      const updated = [...items.value];
      updated[existingIndex] = wrapped;
      items.value = updated;
    } else {
      items.value = [...items.value, wrapped];
    }
  }

  function remove(ids: string[]): void {
    items.value = items.value.filter((item) => !ids.includes(item.id));
  }

  return {
    breadcrumbs: computed(() => items.value),
    push,
    remove,
  };
}
