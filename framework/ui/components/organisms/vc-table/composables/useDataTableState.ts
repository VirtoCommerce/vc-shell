import { type Ref, type ComputedRef, watch, nextTick, onBeforeUnmount } from "vue";

// =============================================================================
// Types
// =============================================================================

/** Schema for persisted table state (versioned for future migrations). */
export interface DataTablePersistedState {
  /** Schema version — bump when adding/renaming/removing fields. */
  v: 1;
  columnWidths?: Record<string, number>;
  columnOrder?: string[];
  hiddenColumnIds?: string[];
  shownColumnIds?: string[];
}

export interface UseDataTableStateOptions {
  stateKey: Ref<string | undefined>;
  stateStorage: Ref<"local" | "session"> | ComputedRef<"local" | "session">;
  columnWidths: Ref<{ id: string; width: number }[]>;
  hiddenColumnIds: Ref<Set<string>>;
  shownColumnIds?: Ref<Set<string>>;
  /** Called after state is saved (for `state-save` emit). */
  onStateSave?: (state: DataTablePersistedState) => void;
  /** Called after state is restored (for `state-restore` emit). */
  onStateRestore?: (state: DataTablePersistedState) => void;
}

export interface UseDataTableStateReturn {
  saveState: () => void;
  clearState: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const DEBOUNCE_MS = 150;
const SCHEMA_VERSION = 1;

// =============================================================================
// Composable
// =============================================================================

export function useDataTableState(options: UseDataTableStateOptions): UseDataTableStateReturn {
  const {
    stateKey,
    stateStorage,
    columnWidths,
    hiddenColumnIds,
    shownColumnIds,
    onStateSave,
    onStateRestore,
  } = options;

  let isRestoring = false;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  function getStorageKey(): string | null {
    const key = stateKey.value;
    return key ? `VC_DATATABLE_${key.toUpperCase()}` : null;
  }

  function getStorage(): Storage | null {
    try {
      return stateStorage.value === "session" ? sessionStorage : localStorage;
    } catch {
      return null;
    }
  }

  // ---------------------------------------------------------------------------
  // Read persisted state synchronously (before any watchers)
  // ---------------------------------------------------------------------------

  function readPersistedState(): DataTablePersistedState | null {
    const storageKey = getStorageKey();
    if (!storageKey) return null;

    const storage = getStorage();
    if (!storage) return null;

    let raw: string | null;
    try {
      raw = storage.getItem(storageKey);
    } catch {
      return null;
    }

    if (!raw) return null;

    try {
      const state = JSON.parse(raw) as unknown;
      if (typeof state !== "object" || state === null) return null;
      const s = state as DataTablePersistedState;
      if (s.v !== SCHEMA_VERSION) return null;
      // Minimal shape validation — discard corrupt data
      if (s.columnOrder !== undefined && !Array.isArray(s.columnOrder)) return null;
      if (s.columnWidths !== undefined && typeof s.columnWidths !== "object") return null;
      if (s.hiddenColumnIds !== undefined && !Array.isArray(s.hiddenColumnIds)) return null;
      if (s.shownColumnIds !== undefined && !Array.isArray(s.shownColumnIds)) return null;
      return s;
    } catch {
      return null;
    }
  }

  // Read persisted state eagerly — before watchers activate.
  // Column widths will be applied later via a dedicated watcher (see below).
  let pendingState = readPersistedState();

  // Pending column width/order data — applied when useTableColumns finishes
  // initializing columnWidths (i.e., when columns are registered).
  let pendingColumnRestore: { widths: Record<string, number>; order: string[] } | null =
    pendingState?.columnWidths && pendingState?.columnOrder
      ? { widths: pendingState.columnWidths, order: pendingState.columnOrder }
      : null;

  // ---------------------------------------------------------------------------
  // Build / Save / Clear
  // ---------------------------------------------------------------------------

  function buildState(): DataTablePersistedState {
    const state: DataTablePersistedState = { v: SCHEMA_VERSION };

    // Column widths + order (derive order from the array position)
    if (columnWidths.value.length > 0) {
      const widths: Record<string, number> = {};
      const order: string[] = [];
      for (const cw of columnWidths.value) {
        widths[cw.id] = cw.width;
        order.push(cw.id);
      }
      state.columnWidths = widths;
      state.columnOrder = order;
    }

    // Hidden columns — always persist (even empty array) so that restore
    // correctly overrides data-discovered columns that default to hidden.
    state.hiddenColumnIds = [...hiddenColumnIds.value];
    if (shownColumnIds) {
      state.shownColumnIds = [...shownColumnIds.value];
    }

    return state;
  }

  function saveState(): void {
    if (isRestoring) return;

    const storageKey = getStorageKey();
    if (!storageKey) return;

    const storage = getStorage();
    if (!storage) return;

    const state = buildState();

    try {
      storage.setItem(storageKey, JSON.stringify(state));
      onStateSave?.(state);
    } catch {
      // Quota exceeded or other storage error — silently ignore
    }
  }

  function clearState(): void {
    // Cancel any pending debounced save to prevent re-persisting after clear
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }

    const storageKey = getStorageKey();
    if (!storageKey) return;

    const storage = getStorage();
    if (!storage) return;

    try {
      storage.removeItem(storageKey);
    } catch {
      // Silently ignore
    }
  }

  // ---------------------------------------------------------------------------
  // Column restore helper
  // ---------------------------------------------------------------------------

  function applyColumnRestore(
    currentWidths: { id: string; width: number }[],
    pending: { widths: Record<string, number>; order: string[] },
  ): void {
    isRestoring = true;

    const { widths, order } = pending;

    // Build restored array from persisted order
    const restored: { id: string; width: number }[] = [];
    for (const id of order) {
      const persistedWidth = widths[id];
      const currentCol = currentWidths.find((c) => c.id === id);
      if (persistedWidth != null) {
        restored.push({ id, width: persistedWidth });
      } else if (currentCol) {
        restored.push({ id, width: currentCol.width });
      }
    }

    // Merge: keep current columns that aren't in the saved state
    // (new columns added to the template since last save)
    const restoredIds = new Set(restored.map((c) => c.id));
    for (const cw of currentWidths) {
      if (!restoredIds.has(cw.id)) {
        restored.push(cw);
      }
    }

    columnWidths.value = restored;

    void nextTick(() => {
      isRestoring = false;
    });
  }

  // ---------------------------------------------------------------------------
  // Column widths + order restore
  //
  // useTableColumns has `watch(visibleColumns, ..., { immediate: true })` that
  // sets columnWidths from column props during setup. Since VcDataTable extracts
  // columns from slots synchronously, columnWidths is already populated by the
  // time this composable runs.
  //
  // Strategy:
  //   - If columnWidths already has entries → apply persisted order synchronously
  //   - If columnWidths is still empty (inject/provide fallback) → use a watcher
  // ---------------------------------------------------------------------------

  if (pendingColumnRestore) {
    if (columnWidths.value.length > 0) {
      // Columns are already available (slot-based extraction) — apply immediately
      applyColumnRestore(columnWidths.value, pendingColumnRestore);
      pendingColumnRestore = null;
    } else {
      // Columns not yet registered (inject/provide path) — wait via watcher
      const stopColumnWatch = watch(
        columnWidths,
        (currentWidths) => {
          if (!pendingColumnRestore) return;
          if (currentWidths.length === 0) return;

          applyColumnRestore(currentWidths, pendingColumnRestore!);
          pendingColumnRestore = null;

          void nextTick(() => {
            isRestoring = false;
            stopColumnWatch();
          });
        },
        { deep: true },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Non-column state restore (hidden/shown column IDs)
  //
  // Apply synchronously to avoid race with VcDataTable's data-discovered
  // columns watcher (which may run immediately and add auto-hidden IDs).
  // ---------------------------------------------------------------------------

  if (pendingState) {
    const state = pendingState;
    pendingState = null;

    isRestoring = true;

    // Hidden columns
    if (state.hiddenColumnIds) {
      hiddenColumnIds.value = new Set(state.hiddenColumnIds);
    }
    if (shownColumnIds && state.shownColumnIds) {
      shownColumnIds.value = new Set(state.shownColumnIds);
    }

    onStateRestore?.(state);

    void nextTick(() => {
      isRestoring = false;
    });
  }

  // ---------------------------------------------------------------------------
  // Debounced auto-save watcher
  // ---------------------------------------------------------------------------

  function debouncedSave(): void {
    if (isRestoring) return;
    if (!stateKey.value) return;
    // Don't save while columns haven't been restored yet
    if (pendingColumnRestore) return;

    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = undefined;
      saveState();
    }, DEBOUNCE_MS);
  }

  // Watch only column-related persisted sources
  const watchedSources = shownColumnIds
    ? [columnWidths, hiddenColumnIds, shownColumnIds]
    : [columnWidths, hiddenColumnIds];
  watch(watchedSources, debouncedSave, { deep: true });

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  // Flush pending debounced save on unmount
  onBeforeUnmount(() => {
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
      // Flush the save synchronously
      if (stateKey.value) {
        saveState();
      }
    }
  });

  return {
    saveState,
    clearState,
  };
}
