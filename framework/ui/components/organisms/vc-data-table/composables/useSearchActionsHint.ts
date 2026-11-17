import { onScopeDispose, watch, type Ref } from "vue";

/** Share of the bar row that `#search-header-actions` may take before the dev hint */
const MAX_SHARE = 0.4;

/**
 * Dev only: warns once when `#search-header-actions` takes more than 40% of the search bar row.
 * Wide content squeezes the bar; it belongs in `#header`. The layout is not changed.
 */
export function useSearchActionsHint(row: Ref<HTMLElement | undefined>, actions: Ref<HTMLElement | undefined>): void {
  if (!import.meta.env.DEV || typeof ResizeObserver === "undefined") return;

  let warned = false;
  let observer: ResizeObserver | undefined;
  const stop = () => {
    observer?.disconnect();
    observer = undefined;
  };

  const check = () => {
    const rowWidth = row.value?.getBoundingClientRect().width ?? 0;
    const actionsWidth = actions.value?.getBoundingClientRect().width ?? 0;
    if (warned || !rowWidth || actionsWidth <= rowWidth * MAX_SHARE) return;
    warned = true;
    stop();
    console.warn(
      "[VcDataTable] #search-header-actions takes more than 40% of the search bar row and squeezes the search. " +
        "Put wide content (breadcrumbs, view toggles) in #header.",
    );
  };

  watch(
    [row, actions],
    ([r, a]) => {
      stop();
      if (!r || !a || warned) return;
      observer = new ResizeObserver(check);
      observer.observe(r);
      observer.observe(a);
    },
    { immediate: true },
  );

  onScopeDispose(stop);
}
