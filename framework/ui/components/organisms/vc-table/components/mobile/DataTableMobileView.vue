<template>
  <PullToRefresh
    :enabled="pullToRefresh"
    :refreshing="loading"
    :pull-text="pullToRefreshText?.pull"
    :release-text="pullToRefreshText?.release"
    :refreshing-text="pullToRefreshText?.refreshing"
    @refresh="emit('refresh')"
  >
    <div class="vc-data-table-mobile-view">
      <!-- Empty state -->
      <div
        v-if="!loading && items.length === 0"
        class="vc-data-table-mobile-view__empty"
      >
        <slot name="empty">
          <div class="vc-data-table-mobile-view__empty-content">
            <VcIcon
              :icon="empty?.icon || 'material-inbox'"
              class="vc-data-table-mobile-view__empty-icon"
            />
            <p class="vc-data-table-mobile-view__empty-text">
              {{ empty?.text || emptyText }}
            </p>
            <VcButton
              v-if="empty?.action"
              variant="primary"
              @click="empty?.clickHandler"
            >
              {{ empty.action }}
            </VcButton>
          </div>
        </slot>
      </div>

      <!-- Cards list -->
      <div
        v-if="items.length > 0"
        class="vc-data-table-mobile-view__list"
      >
        <DataTableMobileCard
          v-for="(item, index) in items"
          :key="getItemKey(item, index)"
          :item="item"
          :index="index"
          :layout="mobileLayout"
          :is-selected="isItemSelected(item)"
          :is-selectable="isItemSelectable(item)"
          :actions="getItemActions(item)"
          :selection-mode="selectionMode"
          :any-selected="hasSelection"
          :data-key="dataKey"
          :more-label="moreLabel"
          :action-sheet-title="actionSheetTitle"
          :cancel-label="cancelLabel"
          @click="handleRowClick"
          @select="handleRowSelect"
          @action="handleAction"
        />
      </div>
    </div>
  </PullToRefresh>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * DataTableMobileView - Mobile view container for VcDataTable
 *
 * Manages the list of mobile cards with:
 * - Swipe context provider
 * - Loading and empty states
 * - Selection management
 * - Action handling
 */
import { computed, unref } from "vue";
import type { MobileCardLayout, MobileSwipeAction, TableEmptyAction, ColumnInstance, TableAction, PullToRefreshTextConfig } from "../../types";
import { useMobileCardLayout } from "../../composables/useMobileCardLayout";
import { provideTableSwipe } from "../../composables/useTableSwipe";
import DataTableMobileCard from "./DataTableMobileCard.vue";
import PullToRefresh from "./PullToRefresh.vue";

const props = withDefaults(
  defineProps<{
    /** Data items to display */
    items: T[];
    /** Column instances from VcColumn */
    columns: ColumnInstance[];
    /** Currently selected items */
    selection?: T[];
    /** Selection mode */
    selectionMode?: "single" | "multiple";
    /** Function to check if row is selectable */
    isRowSelectable?: (data: T) => boolean;
    /** Function to generate row actions */
    rowActions?: (item: T) => TableAction[];
    /** Loading state */
    loading?: boolean;
    /** Data key field for item identification */
    dataKey?: string;
    /** Empty state configuration */
    empty?: TableEmptyAction;
    /** Empty text (fallback) */
    emptyText?: string;
    /** "More" button label */
    moreLabel?: string;
    /** Action sheet title */
    actionSheetTitle?: string;
    /** Cancel button label */
    cancelLabel?: string;
    /** Enable pull-to-refresh */
    pullToRefresh?: boolean;
    /** Custom text for pull-to-refresh states */
    pullToRefreshText?: PullToRefreshTextConfig;
  }>(),
  {
    selection: () => [],
    selectionMode: undefined,
    isRowSelectable: () => true,
    rowActions: undefined,
    loading: false,
    dataKey: "id",
    empty: undefined,
    emptyText: "No data available",
    moreLabel: "More",
    actionSheetTitle: "Actions",
    cancelLabel: "Cancel",
    pullToRefresh: false,
    pullToRefreshText: undefined,
  }
);

const emit = defineEmits<{
  /** Row was clicked */
  click: [item: T, index: number];
  /** Row selection changed */
  select: [item: T, index: number];
  /** Action was triggered */
  action: [action: MobileSwipeAction<T>, item: T, index: number];
  /** Pull-to-refresh triggered */
  refresh: [];
}>();

// Provide swipe context for cards
provideTableSwipe();

// Compute mobile layout from columns
const columnsRef = computed(() => props.columns);
const { mobileLayout, hasMobileColumns } = useMobileCardLayout({ columns: columnsRef });

// Selection helpers
const hasSelection = computed(() => (props.selection?.length ?? 0) > 0);

function isItemSelected(item: T): boolean {
  if (!props.selection) return false;
  const itemKey = item[props.dataKey];
  return props.selection.some((s) => s[props.dataKey] === itemKey);
}

function isItemSelectable(item: T): boolean {
  if (!props.isRowSelectable) return true;
  return props.isRowSelectable(item);
}

// Generate item key
function getItemKey(item: T, index: number): string {
  return String(item[props.dataKey] ?? `item-${index}`);
}

// Convert TableAction to MobileSwipeAction
function getItemActions(item: T): MobileSwipeAction<T>[] {
  if (!props.rowActions) return [];

  const actions = props.rowActions(item);
  if (!actions) return [];

  return actions.map((action) => ({
    id: action.id || String(unref(action.title)),
    title: String(unref(action.title)),
    icon: action.icon || "material-more_horiz",
    type: mapActionType(action.variant),
    disabled: action.disabled,
    clickHandler: (actionItem: T, index: number) => {
      action.clickHandler?.(actionItem, index);
    },
  }));
}

function mapActionType(variant?: string): "danger" | "success" | "warning" | "default" {
  switch (variant) {
    case "danger":
      return "danger";
    case "success":
      return "success";
    case "warning":
      return "warning";
    default:
      return "default";
  }
}

// Event handlers
function handleRowClick(item: T, index: number) {
  emit("click", item, index);
}

function handleRowSelect(item: T, index: number) {
  emit("select", item, index);
}

function handleAction(action: MobileSwipeAction<T>, item: T, index: number) {
  emit("action", action, item, index);
}

// Expose layout status for parent component
defineExpose({
  hasMobileColumns,
  mobileLayout,
});
</script>

<style lang="scss">
:root {
  --mobile-view-bg: var(--additional-50);
  --mobile-view-empty-text: var(--neutrals-500);
  --mobile-view-empty-icon: var(--neutrals-300);
}

.vc-data-table-mobile-view {
  @apply tw-relative tw-min-h-[200px] tw-bg-[var(--mobile-view-bg)];

  &__empty {
    @apply tw-flex tw-items-center tw-justify-center tw-min-h-[200px] tw-p-8;
  }

  &__empty-content {
    @apply tw-flex tw-flex-col tw-items-center tw-gap-4 tw-text-center;
  }

  &__empty-icon {
    @apply tw-text-6xl tw-text-[var(--mobile-view-empty-icon)];
  }

  &__empty-text {
    @apply tw-text-[var(--mobile-view-empty-text)] tw-m-0;
  }

  &__list {
    @apply tw-flex tw-flex-col;
  }
}
</style>
