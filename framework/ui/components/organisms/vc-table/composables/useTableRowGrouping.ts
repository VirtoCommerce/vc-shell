import { ref, computed, watch, type Ref, type ComputedRef } from "vue";
import * as _ from "lodash-es";

export interface RowGroupingOptions<T> {
  /**
   * Items to group
   */
  items: Ref<T[]> | ComputedRef<T[]>;
  /**
   * Field(s) to group rows by
   */
  groupRowsBy: Ref<string | string[] | undefined>;
  /**
   * How to display groups: 'subheader' shows a header row for each group
   */
  rowGroupMode?: Ref<"subheader" | "rowspan">;
  /**
   * Whether groups can be expanded/collapsed
   */
  expandableRowGroups?: Ref<boolean | undefined>;
  /**
   * Initial/controlled expanded group keys
   */
  expandedRowGroups?: Ref<string[] | undefined>;
  /**
   * Callback when expanded groups change
   */
  onExpandedRowGroupsChange?: (groups: string[]) => void;
  /**
   * Callback when a group is expanded
   */
  onRowGroupExpand?: (event: { data: string; originalEvent: Event }) => void;
  /**
   * Callback when a group is collapsed
   */
  onRowGroupCollapse?: (event: { data: string; originalEvent: Event }) => void;
}

export interface GroupedData<T> {
  /**
   * Group key (value of the grouping field)
   */
  key: string;
  /**
   * Items in this group
   */
  items: T[];
  /**
   * First item in the group (for slot context)
   */
  firstItem: T;
  /**
   * Number of items in the group
   */
  count: number;
}

export interface UseTableRowGroupingReturn<T> {
  /**
   * Grouped items as a Map (groupKey -> items)
   */
  groupedItems: ComputedRef<Map<string, T[]> | null>;
  /**
   * Grouped data as array for easier template iteration
   */
  groupedData: ComputedRef<GroupedData<T>[]>;
  /**
   * Whether row grouping is enabled
   */
  isGroupingEnabled: ComputedRef<boolean>;
  /**
   * Internal expanded groups state
   */
  internalExpandedRowGroups: Ref<string[]>;
  /**
   * Check if a group is expanded
   */
  isGroupExpanded: (groupKey: string) => boolean;
  /**
   * Toggle group expansion
   */
  toggleGroupExpansion: (groupKey: string, event: Event) => void;
  /**
   * Expand a specific group
   */
  expandGroup: (groupKey: string) => void;
  /**
   * Collapse a specific group
   */
  collapseGroup: (groupKey: string) => void;
  /**
   * Expand all groups
   */
  expandAllGroups: () => void;
  /**
   * Collapse all groups
   */
  collapseAllGroups: () => void;
  /**
   * Get visible items (respecting collapsed groups)
   */
  visibleItems: ComputedRef<T[]>;
  /**
   * Get the group key for an item
   */
  getItemGroupKey: (item: T) => string;
}

/**
 * Composable for managing row grouping in tables
 *
 * @example
 * ```ts
 * const { groupedData, isGroupExpanded, toggleGroupExpansion } = useTableRowGrouping({
 *   items: computed(() => props.items),
 *   groupRowsBy: computed(() => props.groupRowsBy),
 *   expandableRowGroups: computed(() => props.expandableRowGroups),
 *   expandedRowGroups: computed(() => props.expandedRowGroups),
 *   onExpandedRowGroupsChange: (groups) => emit('update:expandedRowGroups', groups),
 *   onRowGroupExpand: (event) => emit('rowgroup-expand', event),
 *   onRowGroupCollapse: (event) => emit('rowgroup-collapse', event),
 * });
 * ```
 */
export function useTableRowGrouping<T extends Record<string, unknown>>(
  options: RowGroupingOptions<T>,
): UseTableRowGroupingReturn<T> {
  const {
    items,
    groupRowsBy,
    rowGroupMode = ref("subheader"),
    expandableRowGroups = ref(false),
    expandedRowGroups,
    onExpandedRowGroupsChange,
    onRowGroupExpand,
    onRowGroupCollapse,
  } = options;

  // Internal expanded groups state
  const internalExpandedRowGroups = ref<string[]>([]);

  // Sync with props when controlled
  watch(
    () => expandedRowGroups?.value,
    (newVal) => {
      if (newVal !== undefined) {
        internalExpandedRowGroups.value = [...newVal];
      }
    },
    { immediate: true },
  );

  // Check if grouping is enabled
  const isGroupingEnabled = computed(() => {
    return !!groupRowsBy.value;
  });

  // Get the primary grouping field
  const primaryGroupField = computed(() => {
    if (!groupRowsBy.value) return null;
    return Array.isArray(groupRowsBy.value) ? groupRowsBy.value[0] : groupRowsBy.value;
  });

  // Get the group key for an item
  const getItemGroupKey = (item: T): string => {
    if (!primaryGroupField.value) return "";
    const value = _.get(item, primaryGroupField.value);
    return String(value ?? "undefined");
  };

  // Compute grouped items as a Map
  const groupedItems = computed<Map<string, T[]> | null>(() => {
    if (!isGroupingEnabled.value || !primaryGroupField.value) {
      return null;
    }

    const groups = new Map<string, T[]>();

    for (const item of items.value) {
      const key = getItemGroupKey(item);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    return groups;
  });

  // Compute grouped data as array for easier iteration
  const groupedData = computed<GroupedData<T>[]>(() => {
    if (!groupedItems.value) {
      return [];
    }

    const result: GroupedData<T>[] = [];

    groupedItems.value.forEach((groupItems, key) => {
      result.push({
        key,
        items: groupItems,
        firstItem: groupItems[0],
        count: groupItems.length,
      });
    });

    return result;
  });

  // Check if a group is expanded
  const isGroupExpanded = (groupKey: string): boolean => {
    // If not expandable, all groups are always expanded
    if (!expandableRowGroups?.value) {
      return true;
    }
    return internalExpandedRowGroups.value.includes(groupKey);
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupKey: string, event: Event): void => {
    if (!expandableRowGroups?.value) {
      return;
    }

    const isExpanded = isGroupExpanded(groupKey);

    if (isExpanded) {
      // Collapse
      internalExpandedRowGroups.value = internalExpandedRowGroups.value.filter((k) => k !== groupKey);
      onRowGroupCollapse?.({ data: groupKey, originalEvent: event });
    } else {
      // Expand
      internalExpandedRowGroups.value = [...internalExpandedRowGroups.value, groupKey];
      onRowGroupExpand?.({ data: groupKey, originalEvent: event });
    }

    onExpandedRowGroupsChange?.(internalExpandedRowGroups.value);
  };

  // Expand a specific group
  const expandGroup = (groupKey: string): void => {
    if (!expandableRowGroups?.value || isGroupExpanded(groupKey)) {
      return;
    }
    internalExpandedRowGroups.value = [...internalExpandedRowGroups.value, groupKey];
    onExpandedRowGroupsChange?.(internalExpandedRowGroups.value);
  };

  // Collapse a specific group
  const collapseGroup = (groupKey: string): void => {
    if (!expandableRowGroups?.value || !isGroupExpanded(groupKey)) {
      return;
    }
    internalExpandedRowGroups.value = internalExpandedRowGroups.value.filter((k) => k !== groupKey);
    onExpandedRowGroupsChange?.(internalExpandedRowGroups.value);
  };

  // Expand all groups
  const expandAllGroups = (): void => {
    if (!expandableRowGroups?.value || !groupedItems.value) {
      return;
    }
    const keys: string[] = [];
    groupedItems.value.forEach((_, key) => keys.push(key));
    internalExpandedRowGroups.value = keys;
    onExpandedRowGroupsChange?.(internalExpandedRowGroups.value);
  };

  // Collapse all groups
  const collapseAllGroups = (): void => {
    if (!expandableRowGroups?.value) {
      return;
    }
    internalExpandedRowGroups.value = [];
    onExpandedRowGroupsChange?.(internalExpandedRowGroups.value);
  };

  // Get visible items (respecting collapsed groups)
  const visibleItems = computed<T[]>(() => {
    if (!isGroupingEnabled.value) {
      return items.value;
    }

    // If not expandable, all items are visible
    if (!expandableRowGroups?.value) {
      return items.value;
    }

    // Filter items to only include those from expanded groups
    return items.value.filter((item) => {
      const groupKey = getItemGroupKey(item);
      return isGroupExpanded(groupKey);
    });
  });

  return {
    groupedItems,
    groupedData,
    isGroupingEnabled,
    internalExpandedRowGroups,
    isGroupExpanded,
    toggleGroupExpansion,
    expandGroup,
    collapseGroup,
    expandAllGroups,
    collapseAllGroups,
    visibleItems,
    getItemGroupKey,
  };
}
