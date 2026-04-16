import { type Ref, type ComputedRef, watch, nextTick, onBeforeUnmount } from "vue";
import type { ColumnState, ColumnSpec, PersistedStateV2 } from "../types";
import { normalizeWeights } from "./useColumnWidthEngine";

/** Legacy v1 persisted state shape (for migration) */
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
  columnState: Ref<ColumnState>;
  hiddenColumnIds: Ref<Set<string>>;
  shownColumnIds?: Ref<Set<string>>;
  getAvailableWidth?: () => number;
  /** Called after state is saved (for `state-save` emit). */
  onStateSave?: (state: PersistedStateV2) => void;
  /** Called after state is restored (for `state-restore` emit). */
  onStateRestore?: (state: PersistedStateV2) => void;
}

export interface UseDataTableStateReturn {
  saveState: () => void;
  clearState: () => void;
  resetState: () => void;
}

const DEBOUNCE_MS = 150;
const SCHEMA_VERSION = 2;

function migrateV1toV2(state: DataTablePersistedState): PersistedStateV2 | null {
  if (state.v !== 1 || !state.columnWidths) return null;
  const entries = Object.entries(state.columnWidths as Record<string, number>);
  const pxValues = entries.filter(([, w]) => (w as number) > 0);
  const totalPx = pxValues.reduce((s, [, w]) => s + (w as number), 0);

  if (totalPx <= 0) return null; // corrupted — discard

  const weights: Record<string, number> = {};
  for (const [id, px] of entries) {
    weights[id] = (px as number) > 0 ? (px as number) / totalPx : 0;
  }

  return {
    v: 2,
    order: state.columnOrder ?? Object.keys(state.columnWidths),
    weights,
    hiddenColumnIds: state.hiddenColumnIds,
    shownColumnIds: state.shownColumnIds,
  };
}

export function useDataTableState(options: UseDataTableStateOptions): UseDataTableStateReturn {
  const {
    stateKey,
    stateStorage,
    columnState,
    hiddenColumnIds,
    shownColumnIds,
    getAvailableWidth,
    onStateSave,
    onStateRestore,
  } = options;

  // Counter instead of boolean: multiple restore paths run concurrently during
  // setup and each schedules its own nextTick to decrement. A boolean would let
  // the first nextTick unblock saves while the second restore is still in flight.
  let restoringCount = 0;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

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

  function readPersistedState(): PersistedStateV2 | null {
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
      const s = state as { v?: number };

      // v2 — direct use
      if (s.v === SCHEMA_VERSION) {
        const v2 = state as PersistedStateV2;
        // Minimal shape validation
        if (!Array.isArray(v2.order)) return null;
        if (typeof v2.weights !== "object" || v2.weights === null) return null;
        if (v2.hiddenColumnIds !== undefined && !Array.isArray(v2.hiddenColumnIds)) return null;
        if (v2.shownColumnIds !== undefined && !Array.isArray(v2.shownColumnIds)) return null;
        return v2;
      }

      // v1 — migrate
      if (s.v === 1) {
        return migrateV1toV2(state as DataTablePersistedState);
      }

      return null;
    } catch {
      return null;
    }
  }

  // Read persisted state eagerly — before watchers activate.
  let pendingState = readPersistedState();

  // Pending column weight/order data — applied when useTableColumns finishes
  // initializing columnState (i.e., when columns are registered).
  let pendingColumnRestore: { weights: Record<string, number>; order: string[] } | null =
    pendingState?.weights && pendingState?.order ? { weights: pendingState.weights, order: pendingState.order } : null;

  function buildState(): PersistedStateV2 {
    const state: PersistedStateV2 = {
      v: 2,
      order: columnState.value.order,
      weights: Object.fromEntries(Object.entries(columnState.value.specs).map(([id, s]) => [id, s.weight])),
    };
    state.hiddenColumnIds = [...hiddenColumnIds.value];
    if (shownColumnIds) {
      state.shownColumnIds = [...shownColumnIds.value];
    }
    return state;
  }

  function saveState(): void {
    if (restoringCount > 0) return;

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

  function resetState(): void {
    // Cancel pending saves
    if (debounceTimer != null) {
      clearTimeout(debounceTimer);
      debounceTimer = undefined;
    }

    // Clear persisted state
    clearState();

    // Reset runtime state
    restoringCount++;
    columnState.value = { order: [], specs: {} };
    hiddenColumnIds.value = new Set();
    if (shownColumnIds) {
      shownColumnIds.value = new Set();
    }

    void nextTick(() => {
      restoringCount--;
    });
  }

  function applyColumnRestore(
    currentState: ColumnState,
    pending: { weights: Record<string, number>; order: string[] },
  ): void {
    restoringCount++;

    const { weights, order } = pending;
    const newOrder: string[] = [];
    const newSpecs: Record<string, ColumnSpec> = {};

    // Rebuild from persisted order
    for (const id of order) {
      if (weights[id] !== undefined) {
        newOrder.push(id);
        newSpecs[id] = {
          weight: weights[id],
          minPx: currentState.specs[id]?.minPx ?? 40,
          maxPx: currentState.specs[id]?.maxPx ?? Infinity,
        };
      }
    }

    // Append new columns not in saved state
    for (const id of currentState.order) {
      if (!newSpecs[id]) {
        newOrder.push(id);
        newSpecs[id] = currentState.specs[id] ?? { weight: 0, minPx: 40, maxPx: Infinity };
      }
    }

    // Don't normalize here — weights were saved already normalized for visible
    // columns. Normalizing across ALL columns (including hidden) would dilute
    // visible weights. The engine only sees visible columns and handles their
    // proportions correctly.
    columnState.value = { order: newOrder, specs: newSpecs };

    void nextTick(() => {
      restoringCount--;
    });
  }

  // Column state is typically available by now (slot-based extraction is sync).
  // If not yet (inject/provide path), a watcher picks them up.
  if (pendingColumnRestore) {
    if (columnState.value.order.length > 0) {
      // Columns are already available (slot-based extraction) — apply immediately
      applyColumnRestore(columnState.value, pendingColumnRestore);
      pendingColumnRestore = null;
    } else {
      // Columns not yet registered (inject/provide path) — wait via watcher
      const stopColumnWatch = watch(
        columnState,
        (currentState) => {
          if (!pendingColumnRestore) return;
          if (currentState.order.length === 0) return;

          applyColumnRestore(currentState, pendingColumnRestore!);
          pendingColumnRestore = null;

          void nextTick(() => {
            restoringCount--;
            stopColumnWatch();
          });
        },
        { deep: true },
      );
    }
  }

  // Hidden/shown column IDs — apply sync to avoid race with data-discovered columns watcher
  if (pendingState) {
    const state = pendingState;
    pendingState = null;

    restoringCount++;

    // Hidden columns
    if (state.hiddenColumnIds) {
      hiddenColumnIds.value = new Set(state.hiddenColumnIds);
    }
    if (shownColumnIds && state.shownColumnIds) {
      shownColumnIds.value = new Set(state.shownColumnIds);
    }

    onStateRestore?.(state);

    void nextTick(() => {
      restoringCount--;
    });
  }

  function debouncedSave(): void {
    if (restoringCount > 0) return;
    if (!stateKey.value) return;
    // Don't save while columns haven't been restored yet
    if (pendingColumnRestore) return;
    // Don't save when container has no width yet
    if (getAvailableWidth && getAvailableWidth() <= 0) return;

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
    ? [columnState, hiddenColumnIds, shownColumnIds]
    : [columnState, hiddenColumnIds];
  watch(watchedSources, debouncedSave, { deep: true });

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
    resetState,
  };
}
