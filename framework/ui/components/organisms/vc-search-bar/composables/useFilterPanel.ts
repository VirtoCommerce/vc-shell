import { nextTick, ref, type Ref } from "vue";
import type { SearchBarState } from "../types";
import type { FilterPanelCloseReason } from "../components/FilterPanel.vue";

export interface UseFilterPanelOptions {
  state: Ref<SearchBarState>;
  /** Closes a pill editor before the panel opens. */
  closeEditor: () => void;
  flushSearch: () => void;
  applyState: (next: SearchBarState) => void;
}

/** The constructor panel, opened from the constructor button or the Query pill. */
export function useFilterPanel(o: UseFilterPanelOptions) {
  const panelOpen = ref(false);
  const editBtn = ref<HTMLElement | null>(null);
  // The search the panel opened with: an untouched one gives way to text typed since
  let panelSearch = "";

  function togglePanelFrom(opener: HTMLElement) {
    editBtn.value = opener;
    if (!panelOpen.value) {
      o.closeEditor();
      panelSearch = o.state.value.search;
    }
    panelOpen.value = !panelOpen.value;
  }

  function closePanel(reason: FilterPanelCloseReason = "dismiss") {
    panelOpen.value = false;
    if (reason !== "outside") nextTick(() => editBtn.value?.focus());
  }

  function applyPanel(next: SearchBarState) {
    o.flushSearch();
    o.applyState(next.search === panelSearch ? { ...next, search: o.state.value.search } : next);
    closePanel("apply");
  }

  return { panelOpen, editBtn, togglePanelFrom, closePanel, applyPanel };
}
