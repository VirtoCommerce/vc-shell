<template>
  <VcContainer
    no-padding
    class="vc-gridstack-dashboard"
  >
    <div
      v-if="!modulesReady"
      class="vc-gridstack-dashboard__skeleton-grid"
      role="status"
      aria-busy="true"
      :aria-label="ariaLabel"
    >
      <DashboardWidgetSkeleton
        v-for="(item, index) in skeletonItems"
        :key="`skeleton-${index}`"
        class="vc-gridstack-dashboard__skeleton-item"
        :style="skeletonItemStyle(item)"
      />
    </div>
    <div
      v-else
      ref="gridRef"
      class="grid-stack vc-gridstack-dashboard__grid"
      role="list"
      :aria-label="ariaLabel"
    >
      <div
        v-for="(widget, index) in widgets"
        :key="widget.id"
        class="grid-stack-item"
        :class="{ 'vc-gridstack-dashboard__item--grabbed': grabbedWidgetId === widget.id }"
        :gs-id="widget.id"
        :gs-x="getPosition(widget.id)?.x ?? widget.position?.x ?? 0"
        :gs-y="getPosition(widget.id)?.y ?? widget.position?.y ?? 0"
        :gs-w="sizeOf(widget).width"
        :gs-h="sizeOf(widget).height"
        :gs-min-w="2"
        :gs-min-h="2"
        role="listitem"
        tabindex="0"
        :aria-label="getWidgetAriaLabel(widget, index)"
        @keydown="onWidgetKeydown($event, widget)"
      >
        <div class="grid-stack-item-content">
          <!-- Drag handle (optional) -->
          <div
            v-if="showDragHandles"
            class="vc-gridstack-dashboard__drag-handle"
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              <circle
                cx="5"
                cy="3"
                r="1.5"
              />
              <circle
                cx="11"
                cy="3"
                r="1.5"
              />
              <circle
                cx="5"
                cy="8"
                r="1.5"
              />
              <circle
                cx="11"
                cy="8"
                r="1.5"
              />
              <circle
                cx="5"
                cy="13"
                r="1.5"
              />
              <circle
                cx="11"
                cy="13"
                r="1.5"
              />
            </svg>
          </div>

          <!-- Widget content -->
          <component
            :is="widget.component"
            v-bind="widget.props || {}"
            class="vc-gridstack-dashboard__widget-content"
          />
        </div>
      </div>
    </div>

    <!-- Screen reader announcements -->
    <div
      class="vc-gridstack-dashboard__live-region"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {{ liveAnnouncement }}
    </div>
  </VcContainer>
</template>

<script setup lang="ts">
/**
 * GridstackDashboard Component
 *
 * A flexible dashboard powered by Gridstack.js that allows widgets to be
 * dragged and arranged in a grid layout.
 *
 * Features:
 * - Drag and drop interface for arranging widgets
 * - Optional widget resizing
 * - Automatic layout persistence in localStorage
 * - Support for built-in widget positions
 * - Accessibility support
 */
import { ref, computed, onMounted, nextTick, inject, watch } from "vue";
import type {
  IDashboardWidget,
  DashboardWidgetPlacement,
  DashboardWidgetPosition,
  DashboardWidgetSize,
} from "@shell/dashboard/draggable-dashboard/types";
import { useDashboard } from "@core/composables/useDashboard";
import { useGridstack } from "@shell/dashboard/draggable-dashboard/composables/useGridstack";
import VcContainer from "@ui/components/atoms/vc-container/vc-container.vue";
import DashboardWidgetSkeleton from "@shell/dashboard/draggable-dashboard/DashboardWidgetSkeleton.vue";
import { ModulesReadyKey } from "@framework/injection-keys";
import { LAYOUT_STORAGE_KEY } from "@shell/dashboard/draggable-dashboard/composables/useGridstackAdapter";
import "gridstack/dist/gridstack.min.css";

interface SkeletonItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Default placeholders shown when there's no persisted layout yet (first visit).
// 6×6 matches the typical real widget size in vc-shell apps.
const DEFAULT_SKELETONS: SkeletonItem[] = [
  { x: 0, y: 0, w: 6, h: 6 },
  { x: 6, y: 0, w: 6, h: 6 },
  { x: 0, y: 6, w: 6, h: 6 },
  { x: 6, y: 6, w: 6, h: 6 },
];

function readPersistedSkeletons(): SkeletonItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const items = parsed
      .filter(
        (n: unknown): n is SkeletonItem =>
          !!n &&
          typeof n === "object" &&
          typeof (n as SkeletonItem).w === "number" &&
          typeof (n as SkeletonItem).h === "number" &&
          typeof (n as SkeletonItem).x === "number" &&
          typeof (n as SkeletonItem).y === "number",
      )
      .map((n) => ({ x: n.x, y: n.y, w: n.w, h: n.h }));
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

// Props
interface Props {
  /** Show drag handle icons on widgets */
  showDragHandles?: boolean;
  /** Enable widget resizing */
  resizable?: boolean;
  /** Aria label for the dashboard container */
  ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  showDragHandles: false,
  resizable: false,
  ariaLabel: "Dashboard widgets. Drag a widget, or focus one and press Enter to rearrange with the arrow keys.",
});

// Refs
const gridRef = ref<HTMLElement | null>(null);
const liveAnnouncement = ref("");

// Gate dashboard rendering until remote modules finish installing.
// Without this, widgets preregistered during loadRemote() can mount before
// their owning module's `defineAppModule.install` runs `mergeLocaleMessage`,
// causing missing translations. Fallback `ref(true)` keeps tests/stories and
// hosts without MF working unchanged.
const modulesReady = inject(ModulesReadyKey, ref(true));

// Skeleton placeholders shown until modules finish loading. Pulled from the last
// persisted layout (so returning users see card sizes matching their real dashboard);
// fallback to a generic 4-card grid on first visit.
const skeletonItems = computed<SkeletonItem[]>(() => {
  if (modulesReady.value) return [];
  return readPersistedSkeletons() ?? DEFAULT_SKELETONS;
});

const skeletonItemStyle = (item: SkeletonItem): Record<string, string> => ({
  gridColumn: `${item.x + 1} / span ${item.w}`,
  gridRow: `${item.y + 1} / span ${item.h}`,
});

// Dashboard service
const dashboard = useDashboard();
const widgets = computed(() => dashboard.getWidgets() as IDashboardWidget[]);

// Gridstack integration
const {
  layout,
  isInitialized,
  initGrid,
  saveLayout,
  resetToDefaults,
  restoreLayout,
  updateWidgetPosition,
  updateWidgetSize,
} = useGridstack(widgets, {
  resizable: props.resizable,
  autoSave: true,
  gridOptions: {
    draggable: {
      handle: props.showDragHandles ? ".vc-gridstack-dashboard__drag-handle" : ".grid-stack-item-content",
    },
  },
  onLayoutChange: (newLayout) => {
    // Sync with dashboard service
    for (const [widgetId, position] of newLayout) {
      dashboard.updateWidgetPosition(widgetId, position);
    }
    announceToScreenReader("Widget positions updated");
  },
});

// Helper to get widget position
const getPosition = (widgetId: string): DashboardWidgetPosition | undefined => {
  return layout.value.get(widgetId);
};

// --- Keyboard reordering (WCAG 2.5.7: dragging must have a non-drag alternative) ---
//
// Gridstack only offers pointer dragging, so the widget itself becomes the control:
// Enter/Space picks it up, arrows move it a cell at a time, Shift+arrows resize,
// Enter drops, Escape restores the position it was picked up from.
const grabbedWidgetId = ref<string | null>(null);
/**
 * The whole layout as it stood at pick-up, not just the grabbed widget.
 *
 * Restoring one widget and letting compaction undo itself does not work: a move
 * that displaced a neighbour leaves a hole, and gravity floats the widget
 * straight back into it. Escape then announced a cancel the screen did not
 * show (VCST-5804).
 */
const grabbedLayout = ref<Map<string, DashboardWidgetPlacement> | null>(null);

// Mirrors gs-min-w / gs-min-h on the item.
const MIN_WIDGET_SPAN = 2;

const positionOf = (widget: IDashboardWidget): DashboardWidgetPosition =>
  layout.value.get(widget.id) ?? widget.position ?? { x: 0, y: 0 };

// The live size, mirroring positionOf. `widget.size` is only the declared default
// and is never written back to, so reading it directly made every resize compute
// from the same baseline instead of from the current size.
const sizeOf = (widget: IDashboardWidget): DashboardWidgetSize => {
  const placement = layout.value.get(widget.id);
  return {
    width: placement?.width ?? widget.size.width,
    height: placement?.height ?? widget.size.height,
  };
};

const widgetName = (widget: IDashboardWidget): string => widget.name || widget.id;

const pickUpWidget = (widget: IDashboardWidget): void => {
  grabbedWidgetId.value = widget.id;
  // Built from positionOf/sizeOf rather than copied off `layout`: a widget that
  // has not been resized yet carries no size in the map, and a snapshot missing
  // it would restore the position while leaving the new size in place.
  grabbedLayout.value = new Map(
    widgets.value.map((candidate) => [candidate.id, { ...positionOf(candidate), ...sizeOf(candidate) }]),
  );
  announceToScreenReader(
    `${widgetName(widget)} picked up. Use arrow keys to move, Shift and arrow keys to resize, Enter to drop, Escape to cancel.`,
  );
};

const dropWidget = (widget: IDashboardWidget): void => {
  grabbedWidgetId.value = null;
  grabbedLayout.value = null;
  saveLayout();
  const { x, y } = positionOf(widget);
  announceToScreenReader(`${widgetName(widget)} dropped at column ${x + 1}, row ${y + 1}.`);
};

const cancelWidgetMove = (widget: IDashboardWidget): void => {
  if (grabbedLayout.value) {
    restoreLayout(grabbedLayout.value);
  }

  grabbedWidgetId.value = null;
  grabbedLayout.value = null;
  announceToScreenReader(`Move cancelled. ${widgetName(widget)} returned to its original position and size.`);
};

const moveWidgetBy = (widget: IDashboardWidget, dx: number, dy: number): void => {
  const current = positionOf(widget);
  const next = { x: current.x + dx, y: current.y + dy };
  // Gridstack clamps silently; refusing the move keeps the announcement honest.
  if (next.x < 0 || next.y < 0) return;

  updateWidgetPosition(widget.id, next);
  // Announce where the widget actually landed, not where it was asked to go —
  // Gridstack compacts rows, so the two differ.
  // Announce where the widget actually landed, not where it was asked to go —
  // Gridstack compacts rows, so the two differ.
  const landed = positionOf(widget);
  announceToScreenReader(`${widgetName(widget)} moved to column ${landed.x + 1}, row ${landed.y + 1}.`);
};

const resizeWidgetBy = (widget: IDashboardWidget, dw: number, dh: number): void => {
  const current = sizeOf(widget);
  // Only the requested axis changes; sending both would drag the untouched one
  // back to its baseline.
  const width = dw ? Math.max(MIN_WIDGET_SPAN, current.width + dw) : current.width;
  const height = dh ? Math.max(MIN_WIDGET_SPAN, current.height + dh) : current.height;
  if (width === current.width && height === current.height) return;

  updateWidgetSize(widget.id, { width, height });
  const applied = sizeOf(widget);
  announceToScreenReader(`${widgetName(widget)} resized to ${applied.width} by ${applied.height} cells.`);
};

const onWidgetKeydown = (event: KeyboardEvent, widget: IDashboardWidget): void => {
  if (event.target !== event.currentTarget) return;

  const isGrabbed = grabbedWidgetId.value === widget.id;

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    if (isGrabbed) dropWidget(widget);
    else {
      // Starting another move cancels the unfinished one so its origin is not lost.
      const grabbedWidget = widgets.value.find((candidate) => candidate.id === grabbedWidgetId.value);
      if (grabbedWidget) cancelWidgetMove(grabbedWidget);
      pickUpWidget(widget);
    }
    return;
  }

  if (event.key === "Escape" && isGrabbed) {
    event.preventDefault();
    cancelWidgetMove(widget);
    return;
  }

  const dx = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
  const dy = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
  if ((dx === 0 && dy === 0) || !isGrabbed) return;

  event.preventDefault();
  if (event.shiftKey) {
    if (props.resizable) resizeWidgetBy(widget, dx, dy);
  } else {
    moveWidgetBy(widget, dx, dy);
  }
};

// Accessibility helpers
const getWidgetAriaLabel = (widget: IDashboardWidget, index: number): string => {
  const name = widget.name || widget.id;
  const state =
    grabbedWidgetId.value === widget.id
      ? "Picked up. Arrow keys move, Enter drops, Escape cancels."
      : "Press Enter to pick up and rearrange with the arrow keys.";
  return `${name}, widget ${index + 1} of ${widgets.value.length}. ${state}`;
};

const announceToScreenReader = (message: string): void => {
  liveAnnouncement.value = message;
  setTimeout(() => {
    liveAnnouncement.value = "";
  }, 1000);
};

const tryInitGrid = async (): Promise<void> => {
  await nextTick();
  if (gridRef.value && !isInitialized.value) {
    initGrid(gridRef.value);
  }
};

onMounted(tryInitGrid);

// When modules finish loading, the v-if mounts gridRef — initialize gridstack then.
watch(modulesReady, (ready) => {
  if (ready) tryInitGrid();
});

// Public methods
const rearrangeWidgets = (): void => {
  resetToDefaults();
};

const recalculateLayout = (): void => {
  // Gridstack handles this automatically
};

const useBuiltInPositions = (): boolean => {
  resetToDefaults();
  return true;
};

// Expose public methods
defineExpose({
  rearrangeWidgets,
  recalculateLayout,
  saveLayout,
  useBuiltInPositions,
});
</script>

<style lang="scss">
@import "gridstack/dist/gridstack.min.css";

:root {
  --gridstack-dashboard-background: var(--additional-50);
  --gridstack-widget-background: var(--additional-50);
  --gridstack-widget-border-radius: 8px;
  --gridstack-widget-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  --gridstack-widget-shadow-dragging: 0 8px 24px rgba(0, 0, 0, 0.15);
  --gridstack-placeholder-background: rgba(59, 130, 246, 0.1);
  --gridstack-placeholder-border: rgba(59, 130, 246, 0.5);
  --gridstack-drag-handle-color: var(--neutrals-400);
  --gridstack-drag-handle-color-hover: var(--neutrals-600);
  --gridstack-widget-focus-ring-color: var(--primary-500);
}

.vc-gridstack-dashboard {
  background-color: var(--gridstack-dashboard-background);
  min-height: 100%;

  &__grid {
    padding: 24px 18px;
    min-height: calc(80px * 8 + 24px * 2); // 8 rows minimum
  }

  // Widgets are focusable so they can be rearranged from the keyboard.
  .grid-stack-item:focus-visible {
    @apply tw-outline-none tw-ring-[3px] tw-ring-[color:var(--gridstack-widget-focus-ring-color)];
    border-radius: var(--gridstack-widget-border-radius);
  }

  // Picked up for a keyboard move: the pointer equivalent of "being dragged".
  &__item--grabbed {
    z-index: var(--z-local-above);

    .grid-stack-item-content {
      box-shadow: var(--gridstack-widget-shadow-dragging);
      outline: 2px dashed var(--gridstack-placeholder-border);
      outline-offset: 2px;
    }
  }

  // Skeleton grid mirrors gridstack's 12-column geometry. Row height and gap are
  // tuned so a 6×6 placeholder visually matches a real 6×6 widget rendered by
  // gridstack (which collapses margins differently than a plain CSS grid).
  &__skeleton-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 55px;
    gap: 20px;
    padding: 24px 18px;
    min-height: calc(55px * 8 + 24px * 2);
  }

  &__skeleton-item {
    min-width: 0;
    min-height: 0;
  }

  // Widget item styling
  .grid-stack-item {
    &-content {
      background: var(--gridstack-widget-background);
      border-radius: var(--gridstack-widget-border-radius);
      box-shadow: var(--gridstack-widget-shadow);
      overflow: hidden;
      // Note: Don't set height: 100% - Gridstack uses position: absolute with inset for margins
      transition: box-shadow 0.2s ease;
    }

    // Dragging state
    &.ui-draggable-dragging {
      .grid-stack-item-content {
        box-shadow: var(--gridstack-widget-shadow-dragging);
      }
    }

    // Resizing state
    &.ui-resizable-resizing {
      .grid-stack-item-content {
        box-shadow: var(--gridstack-widget-shadow-dragging);
      }
    }
  }

  // Placeholder styling
  .grid-stack-placeholder {
    > .placeholder-content {
      background: var(--gridstack-placeholder-background);
      border: 2px dashed var(--gridstack-placeholder-border);
      border-radius: var(--gridstack-widget-border-radius);
    }
  }

  // Drag handle
  &__drag-handle {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: var(--z-local-sticky);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gridstack-drag-handle-color);
    cursor: grab;
    border-radius: 4px;
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover {
      color: var(--gridstack-drag-handle-color-hover);
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:active {
      cursor: grabbing;
    }
  }

  // Widget content
  &__widget-content {
    width: 100%;
    height: 100%;
  }

  // Screen reader only
  &__live-region {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

// Respect reduced motion preference
@media (prefers-reduced-motion: reduce) {
  .vc-gridstack-dashboard {
    .grid-stack-item {
      transition: none !important;

      &-content {
        transition: none !important;
      }
    }
  }

  .grid-stack {
    &.grid-stack-animate {
      .grid-stack-item {
        transition: none !important;
      }
    }
  }
}
</style>
