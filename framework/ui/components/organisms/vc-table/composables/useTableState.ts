/* eslint-disable @typescript-eslint/no-explicit-any */
import { ref, Ref, computed, toValue, toRefs, MaybeRef, nextTick } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { cloneDeep, pick, unionBy } from "lodash-es";
import { TableColPartial } from "../types";
import { ITableColumns } from "../../../../../core/types";

export interface UseTableStateOptions {
  stateKey: Ref<string, string>;
  columnSelector: Ref<
    "auto" | "defined" | MaybeRef<ITableColumns[]> | (() => ITableColumns[]),
    "auto" | "defined" | MaybeRef<ITableColumns[]> | (() => ITableColumns[])
  >;
  expanded: Ref<boolean, boolean>;
  headerRef?: Ref<HTMLElement | undefined>;
}

export function useTableState(options: UseTableStateOptions) {
  const { stateKey, columnSelector, expanded, headerRef } = toRefs(options);

  const state = useLocalStorage<TableColPartial[]>(`VC_TABLE_STATE_${stateKey.value.toUpperCase()}`, []);
  const internalColumns = ref<TableColPartial[]>([]) as Ref<TableColPartial[]>;
  const allColumns = ref<TableColPartial[]>([]) as Ref<TableColPartial[]>;
  const columnsInit = ref(true);

  const internalColumnsSorted = computed(() => {
    // alphabetical order
    return internalColumns.value /* @ts-expect-error  - toSorted is not parsed correctly by ts */
      .toSorted((a, b) => {
        if (a && b && a.title && b.title) {
          return toValue(a.title).localeCompare(toValue(b.title));
        }
        return 0;
      });
  });

  const filteredCols = computed<TableColPartial[]>(() => {
    return internalColumns.value.filter((x) => {
      if (x.visible === false) {
        return false;
      }
      if (!expanded?.value) {
        return x.alwaysVisible;
      }
      return true;
    });
  });

  function saveState() {
    console.debug("[@vc-shell/framework#vc-table.vue] - Save state");
    const colsClone = cloneDeep(internalColumns.value);
    state.value = colsClone.map((col) => pick(col, "id", "visible", "width", "predefined", "title"));
  }

  function mergeColumns(storedCol: TableColPartial, predefinedCol: TableColPartial | undefined) {
    if (predefinedCol) {
      if (predefinedCol.predefined && !storedCol.predefined) {
        return { 
          ...predefinedCol, 
          predefined: true,
          width: storedCol.width || predefinedCol.width,
          visible: storedCol.visible !== undefined ? storedCol.visible : predefinedCol.visible
        };
      } else {
        return {
          ...predefinedCol,
          visible: storedCol.visible,
          width: storedCol.width || predefinedCol.width,
          title: predefinedCol.title || storedCol.title || "",
        };
      }
    } else {
      return { ...storedCol, predefined: false };
    }
  }

  function resetRemovedColumns(
    storedState: TableColPartial[],
    predefinedMap: Map<string | undefined, TableColPartial>,
    mergedColumns: TableColPartial[],
  ) {
    storedState.forEach((storedCol) => {
      if (storedCol.predefined && !predefinedMap.has(storedCol.id)) {
        const existingColumnIndex = mergedColumns.findIndex((col) => col.id === storedCol.id);
        if (existingColumnIndex !== -1) {
          mergedColumns[existingColumnIndex] = {
            ...mergedColumns[existingColumnIndex],
            visible: false,
            width: undefined,
            predefined: false,
          };
        }
      }
    });
  }

  function setTitles(mergedColumns: TableColPartial[]) {
    mergedColumns.forEach((col) => {
      if (!col.title) {
        const originalColumn = allColumns.value.find((c) => c.id === col.id);
        if (originalColumn) {
          col.title = originalColumn.title;
        }
      }
    });
  }

  function restoreState(predefinedColumns: TableColPartial[] = []) {
    const storedState = state.value;

    if (!storedState?.length) {
      internalColumns.value = allColumns.value;
      return;
    }

    const predefinedMap = new Map(predefinedColumns.map((col) => [col.id, col]));

    const validStoredState = storedState.filter((col) => {
      if (col.predefined) {
        return predefinedMap.has(col.id);
      }
      return true;
    });

    const mergedColumns: TableColPartial[] = validStoredState.map((storedCol) => {
      const predefinedCol = predefinedMap.get(storedCol.id);
      return mergeColumns(storedCol, predefinedCol);
    });

    // add predefined columns that are not in stored state
    predefinedColumns.forEach((predefinedCol) => {
      if (!mergedColumns.find((col) => col.id === predefinedCol.id)) {
        mergedColumns.push({ ...predefinedCol, visible: true, predefined: true });
      }
    });

    // add other columns to mergedColumns from allColumns array without duplicates
    allColumns.value.forEach((col) => {
      if (!mergedColumns.find((c) => c.id === col.id)) {
        mergedColumns.push(col);
      }
    });

    resetRemovedColumns(validStoredState, predefinedMap, mergedColumns);
    setTitles(mergedColumns);

    allColumns.value = [...mergedColumns];
    internalColumns.value = allColumns.value;

    saveState();
  }

  function toggleColumn(item: ITableColumns) {
    // Find the original column to preserve its title
    const originalColumn = allColumns.value.find((col) => col.id === item.id);

    // if item is not in internalColumns, add it
    if (!internalColumns.value.find((x) => x.id === item.id)) {
      const newCol = {
        ...item,
        title: item.title || originalColumn?.title || "",
        width: item.width || originalColumn?.width,
      };
      
      // Don't set any width for new columns - they'll take available space
      // The flexbox will handle the distribution
      if (!newCol.width) {
        // Keep it undefined to use flexbox
        newCol.width = undefined;
      }
      
      internalColumns.value.push(newCol);
      
      // When adding a new column, check if we need to adjust widths to prevent overflow
      const visibleColumns = internalColumns.value.filter(col => col.visible !== false);
      const hasFixedWidths = visibleColumns.some(col => col.width);
      
      if (hasFixedWidths) {
        // Calculate total fixed width
        let totalFixedWidth = 0;
        visibleColumns.forEach(col => {
          if (col.width && typeof col.width === 'string') {
            const width = parseInt(col.width);
            if (!isNaN(width)) {
              totalFixedWidth += width;
            }
          }
        });
        
        // If total fixed width is too large, remove fixed widths to allow flex distribution
        if (totalFixedWidth > 800) { // Assuming a reasonable container width
          internalColumns.value = internalColumns.value.map(col => ({
            ...col,
            width: undefined // Let flexbox handle it
          }));
        }
      }
    }

    if (item) {
      internalColumns.value = internalColumns.value.map((x) => {
        if (x.id === item.id) {
          const updatedCol = {
            ...item,
            title: item.title || originalColumn?.title || x.title || "",
            width: item.width || originalColumn?.width || x.width,
          };
          
          return updatedCol;
        }
        return x;
      });
    }

    saveState();
  }

  function processColumns(columns: ITableColumns[], predefined: boolean, defaultVisible: boolean) {
    return columns.map((item) => ({
      ...item,
      predefined,
      visible: typeof item.visible !== "undefined" ? item.visible : defaultVisible,
    }));
  }

  function initializeColumns(newColumns: ITableColumns[], items: any[] = []) {
    let predefinedCols: ITableColumns[] = [];
    let otherCols: ITableColumns[] = [];

    // Process predefined columns
    if (newColumns && newColumns.length) {
      predefinedCols = processColumns(newColumns, true, true);
    }

    if (columnSelector.value === "auto") {
      // Generate columns automatically from items
      if (items && items.length) {
        const itemKeys = Object.keys(items[0]);
        otherCols = itemKeys.map((key) => ({
          id: key,
          title: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
          visible: false,
          predefined: false,
        }));
      }

      // Combine columns and restore state
      allColumns.value = unionBy(predefinedCols, otherCols, "id");
      restoreState(predefinedCols);
    } else if (columnSelector.value === "defined") {
      allColumns.value = predefinedCols;
      restoreState(predefinedCols);
    } else {
      // Get columns from columnSelector
      const getDefinedColumns = (): ITableColumns[] => {
        if (typeof columnSelector.value === "function") {
          return columnSelector.value();
        }
        return toValue(columnSelector.value as Ref<ITableColumns[]>);
      };

      const definedCols = processColumns(getDefinedColumns(), false, false);

      // Combine columns and restore state
      allColumns.value = unionBy(predefinedCols, definedCols, "id");
      restoreState(allColumns.value);
    }

    columnsInit.value = false;
  }

  return {
    internalColumns,
    allColumns,
    columnsInit,
    internalColumnsSorted,
    filteredCols,
    saveState,
    restoreState,
    toggleColumn,
    initializeColumns,
  };
}
