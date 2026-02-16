<template>
  <div
    ref="containerRef"
    v-on-click-outside="reset"
    class="vc-data-table-mobile-card"
    :class="{
      'vc-data-table-mobile-card--selected': isSelected,
      'vc-data-table-mobile-card--even': index % 2 === 1,
      'vc-data-table-mobile-card--long-press': isLongPressing,
    }"
    @click="handleClick"
    @contextmenu.prevent
    @touchstart.passive="handleLongPressStart"
    @touchend="handleLongPressEnd"
    @touchcancel="handleLongPressEnd"
    @touchmove.passive="handleLongPressEnd"
  >
    <!-- Card content with swipe transform -->
    <div
      ref="cardRef"
      class="vc-data-table-mobile-card__content"
      :style="{ transform: `translateX(${translateX}px)` }"
    >
      <!-- Selection checkbox -->
      <div
        v-if="showCheckbox"
        class="vc-data-table-mobile-card__checkbox"
        @click.stop="handleSelect"
      >
        <VcCheckbox
          :model-value="isSelected"
          :disabled="!isSelectable"
          size="m"
        />
      </div>

      <!-- Card body - Universal layout -->
      <div
        class="vc-data-table-mobile-card__body"
        :class="{ 'vc-data-table-mobile-card__body--with-checkbox': showCheckbox }"
      >
        <!-- Image (left side) -->
        <div
          v-if="layout.image"
          class="vc-data-table-mobile-card__image"
        >
          <MobileCellRenderer
            :config="layout.image"
            :item="item"
            :index="index"
          />
        </div>

        <!-- Main content area -->
        <div class="vc-data-table-mobile-card__main">
          <!-- Title (full width, bold) -->
          <div
            v-if="layout.title"
            class="vc-data-table-mobile-card__title"
          >
            <MobileCellRenderer
              :config="layout.title"
              :item="item"
              :index="index"
            />
          </div>

          <!-- Fields (2-column grid with labels) -->
          <div
            v-if="layout.fields.length > 0"
            class="vc-data-table-mobile-card__fields"
          >
            <div
              v-for="field in layout.fields"
              :key="field.id"
              class="vc-data-table-mobile-card__field"
            >
              <span
                v-if="field.label"
                class="vc-data-table-mobile-card__field-label"
              >{{ field.label }}:</span>
              <span class="vc-data-table-mobile-card__field-value">
                <MobileCellRenderer
                  :config="field"
                  :item="item"
                  :index="index"
                />
              </span>
            </div>
          </div>

          <!-- Statuses (row of badges at bottom) -->
          <div
            v-if="layout.statuses.length > 0"
            class="vc-data-table-mobile-card__statuses"
          >
            <template v-for="status in layout.statuses" :key="status.id">
              <MobileCellRenderer
                :config="status"
                :item="item"
                :index="index"
              />
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Swipe actions -->
    <div
      v-if="visibleActions.length > 0"
      class="vc-data-table-mobile-card__actions"
      :style="{ width: `${actionsWidth}px` }"
      @touchstart.stop
    >
      <!-- More button (shown when 3+ actions) -->
      <button
        v-if="hasMoreActions"
        class="vc-data-table-mobile-card__action vc-data-table-mobile-card__action--more"
        @click.stop="handleMoreClick"
      >
        <VcIcon icon="material-pending" />
        <span class="vc-data-table-mobile-card__action-title">{{ moreLabel }}</span>
      </button>

      <!-- First 2 actions -->
      <button
        v-for="action in displayActions"
        :key="action.id"
        class="vc-data-table-mobile-card__action"
        :class="[
          `vc-data-table-mobile-card__action--${action.type || 'default'}`,
          { 'vc-data-table-mobile-card__action--disabled': action.disabled },
        ]"
        :disabled="action.disabled"
        @click.stop="handleActionClick(action)"
      >
        <VcIcon :icon="action.icon" size="s" />
        <span class="vc-data-table-mobile-card__action-title">{{ action.title }}</span>
      </button>
    </div>

    <!-- Action Sheet for overflow -->
    <MobileActionSheet
      :open="isActionSheetOpen"
      :title="actionSheetTitle"
      :actions="allActions"
      :cancel-label="cancelLabel"
      @close="isActionSheetOpen = false"
      @action="handleSheetAction"
    />
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * DataTableMobileCard - Individual mobile card with iOS-style swipe
 *
 * Features:
 * - Spring physics animation for natural swipe feel
 * - Shows max 2 actions + "More" button for 3+
 * - Selection via long-press (checkboxes hidden by default, shown when selection active)
 * - Alternating row colors
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import type { MobileCardLayout, MobileSwipeAction } from "../../types";
import { useTableSwipe } from "../../composables/useTableSwipe";
import MobileCellRenderer from "./MobileCellRenderer.vue";
import MobileActionSheet from "./MobileActionSheet.vue";

const props = withDefaults(
  defineProps<{
    /** Row data item */
    item: T;
    /** Row index */
    index: number;
    /** Card layout configuration */
    layout: MobileCardLayout;
    /** Whether row is selected */
    isSelected: boolean;
    /** Whether row is selectable */
    isSelectable: boolean;
    /** Swipe actions */
    actions?: MobileSwipeAction<T>[];
    /** Selection mode */
    selectionMode?: "single" | "multiple";
    /** Whether any items are currently selected (shows checkboxes) */
    anySelected?: boolean;
    /** Data key field for item identification */
    dataKey?: string;
    /** "More" button label */
    moreLabel?: string;
    /** Action sheet title */
    actionSheetTitle?: string;
    /** Cancel button label */
    cancelLabel?: string;
  }>(),
  {
    actions: () => [],
    selectionMode: undefined,
    anySelected: false,
    dataKey: "id",
    moreLabel: "More",
    actionSheetTitle: "Actions",
    cancelLabel: "Cancel",
  }
);

const emit = defineEmits<{
  /** Row was clicked */
  click: [item: T, index: number];
  /** Row selection changed */
  select: [item: T, index: number];
  /** Action was triggered */
  action: [action: MobileSwipeAction<T>, item: T, index: number];
}>();

// Refs
const containerRef = ref<HTMLElement | null>(null);
const cardRef = ref<HTMLElement | null>(null);

// Long press state for selection activation
const isLongPressing = ref(false);
const longPressTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null);

// Long press handler - activates selection mode
function handleLongPressStart() {
  if (!props.selectionMode || translateX.value !== 0 || isAnimating.value) return;

  isLongPressing.value = true;
  longPressTimeoutId.value = setTimeout(() => {
    if (isLongPressing.value) {
      emit("select", props.item, props.index);
    }
    isLongPressing.value = false;
  }, 500);
}

function handleLongPressEnd() {
  if (longPressTimeoutId.value) {
    clearTimeout(longPressTimeoutId.value);
    longPressTimeoutId.value = null;
  }
  isLongPressing.value = false;
}

// Swipe state
const translateX = ref(0);
const actionsWidth = ref(0);
const isAnimating = ref(false);
const isActionSheetOpen = ref(false);
const animationId = ref<number | null>(null);

// Touch tracking
const startX = ref(0);
const startY = ref(0);
const startTranslateX = ref(0);
const velocity = ref(0);
const lastTime = ref(0);
const lastX = ref(0);
// Direction lock: once determined, the gesture is either "horizontal" (swipe) or "vertical" (scroll).
// null = undetermined, "horizontal" = swipe (we handle), "vertical" = scroll (browser handles).
const directionLock = ref<"horizontal" | "vertical" | null>(null);
const DIRECTION_LOCK_THRESHOLD = 8; // px — minimum movement to decide direction

// Spring animation constants
const SPRING_STIFFNESS = 0.08;
const SPRING_DAMPING = 0.7;
const SPRING_MASS = 1;

// Swipe context from provider
const { activeSwipeId, setActiveSwipe } = useTableSwipe();

// Computed values
const itemId = computed(() => props.item[props.dataKey] ?? `item-${props.index}`);

// Show checkbox only when selection mode is active AND there are selected items
// This allows long-press to activate selection mode without permanent checkboxes
const showCheckbox = computed(() => {
  return props.anySelected && props.selectionMode !== undefined;
});

const visibleActions = computed(() => {
  // Don't show swipe actions when items are selected
  if (props.anySelected) return [];
  return props.actions ?? [];
});

const hasMoreActions = computed(() => visibleActions.value.length > 2);

const displayActions = computed(() => {
  return visibleActions.value.slice(0, 2);
});

const allActions = computed((): MobileSwipeAction<T>[] => {
  return props.actions ?? [];
});

const totalActionsWidth = computed(() => {
  const count = visibleActions.value.length;
  // Show max 3 slots: 2 actions + More, or just 2 if <= 2 actions
  const maxVisible = Math.min(count, count > 2 ? 3 : 2);
  return maxVisible * 70;
});

// Spring animation
function springAnimation(targetValue: number, duration = 300) {
  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value);
  }

  const startValue = translateX.value;
  const startTime = performance.now();
  let springVelocity = velocity.value;
  let currentValue = startValue;

  isAnimating.value = true;

  function animate(time: number) {
    const elapsed = time - startTime;

    if (elapsed < duration) {
      const springForce = (targetValue - currentValue) * SPRING_STIFFNESS;
      const dampingForce = springVelocity * SPRING_DAMPING;
      const acceleration = (springForce - dampingForce) / SPRING_MASS;

      springVelocity += acceleration;
      currentValue += springVelocity;

      translateX.value = currentValue;
      actionsWidth.value = Math.abs(translateX.value);

      animationId.value = requestAnimationFrame(animate);
    } else {
      translateX.value = targetValue;
      actionsWidth.value = Math.abs(targetValue);
      isAnimating.value = false;
      animationId.value = null;
    }
  }

  animationId.value = requestAnimationFrame(animate);
}

// Touch handlers
function handleTouchStart(e: TouchEvent) {
  if (isAnimating.value || visibleActions.value.length === 0) return;

  const touch = e.touches[0];
  startX.value = touch.clientX;
  startY.value = touch.clientY;
  startTranslateX.value = translateX.value;
  velocity.value = 0;
  lastTime.value = Date.now();
  lastX.value = touch.clientX;
  directionLock.value = null;

  setActiveSwipe(String(itemId.value));
}

function handleTouchMove(e: TouchEvent) {
  if (isAnimating.value || visibleActions.value.length === 0) return;
  if (activeSwipeId.value !== String(itemId.value)) return;

  const touch = e.touches[0];
  const currentX = touch.clientX;
  const deltaX = currentX - startX.value;
  const deltaY = touch.clientY - startY.value;

  // Determine direction lock on first significant movement
  if (directionLock.value === null) {
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    if (absDeltaX >= DIRECTION_LOCK_THRESHOLD || absDeltaY >= DIRECTION_LOCK_THRESHOLD) {
      directionLock.value = absDeltaX > absDeltaY ? "horizontal" : "vertical";
    } else {
      return; // Not enough movement to decide yet
    }
  }

  // Vertical gesture → let browser handle scroll, don't interfere
  if (directionLock.value === "vertical") {
    return;
  }

  // Horizontal gesture → handle swipe, prevent scroll
  e.preventDefault();

  // Calculate velocity for inertia
  const now = Date.now();
  const dt = now - lastTime.value;
  if (dt > 0) {
    velocity.value = (currentX - lastX.value) / dt;
  }
  lastTime.value = now;
  lastX.value = currentX;

  // Calculate new position
  let newTranslateX = startTranslateX.value + deltaX;

  // Spring resistance for overscroll
  if (newTranslateX < -totalActionsWidth.value) {
    const overscroll = newTranslateX + totalActionsWidth.value;
    newTranslateX = -totalActionsWidth.value + overscroll * 0.3;
  }

  // Don't allow swipe past initial position
  if (newTranslateX > 0) {
    newTranslateX = 0;
  }

  translateX.value = newTranslateX;
  actionsWidth.value = Math.abs(newTranslateX);
}

function handleTouchEnd() {
  const wasVertical = directionLock.value === "vertical" || directionLock.value === null;
  directionLock.value = null;

  if (wasVertical) return; // Was a scroll gesture, not a swipe
  if (isAnimating.value || visibleActions.value.length === 0) return;
  if (activeSwipeId.value !== String(itemId.value)) return;

  const absVelocity = Math.abs(velocity.value);
  const direction = velocity.value < 0 ? -1 : 1;

  // Use velocity to determine open/close
  if (absVelocity > 0.5) {
    if (direction < 0) {
      springAnimation(-totalActionsWidth.value);
    } else {
      springAnimation(0);
    }
  } else {
    // Use position threshold (40%)
    const threshold = totalActionsWidth.value * 0.4;
    if (Math.abs(translateX.value) > threshold) {
      springAnimation(-totalActionsWidth.value);
    } else {
      springAnimation(0);
    }
  }
}

// Watch for other swipes
watch(
  activeSwipeId,
  (newVal) => {
    if ((!newVal || newVal !== String(itemId.value)) && translateX.value !== 0) {
      springAnimation(0);
    }
  },
  { immediate: true }
);

// Reset swipe state
function reset() {
  if (isAnimating.value) return;
  springAnimation(0);

  if (activeSwipeId.value === String(itemId.value)) {
    setActiveSwipe(null);
  }
}

// Event handlers
function handleClick() {
  if (translateX.value !== 0) {
    reset();
    return;
  }

  if (props.anySelected) {
    emit("select", props.item, props.index);
    return;
  }

  emit("click", props.item, props.index);
}

function handleSelect() {
  emit("select", props.item, props.index);
}

function handleActionClick(action: MobileSwipeAction<T>) {
  if (action.disabled) return;
  reset();
  emit("action", action, props.item, props.index);
}

function handleMoreClick() {
  reset();
  isActionSheetOpen.value = true;
}

function handleSheetAction(action: MobileSwipeAction<T>) {
  emit("action", action, props.item, props.index);
}

// Lifecycle
onMounted(() => {
  if (cardRef.value) {
    cardRef.value.addEventListener("touchstart", handleTouchStart, { passive: true });
    cardRef.value.addEventListener("touchmove", handleTouchMove, { passive: false });
    cardRef.value.addEventListener("touchend", handleTouchEnd, { passive: true });
  }
});

onBeforeUnmount(() => {
  if (cardRef.value) {
    cardRef.value.removeEventListener("touchstart", handleTouchStart);
    cardRef.value.removeEventListener("touchmove", handleTouchMove);
    cardRef.value.removeEventListener("touchend", handleTouchEnd);
  }

  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value);
  }

  // Clean up long press timeout
  if (longPressTimeoutId.value) {
    clearTimeout(longPressTimeoutId.value);
  }
});
</script>

<style lang="scss">
:root {
  --mobile-card-bg: var(--additional-50);
  --mobile-card-bg-even: var(--neutrals-50);
  --mobile-card-bg-selected: var(--primary-100);
  --mobile-card-border: var(--neutrals-200);
  --mobile-card-text: var(--neutrals-800);
  --mobile-card-text-secondary: var(--neutrals-500);
  --mobile-card-action-bg: var(--secondary-400);
  --mobile-card-action-text: var(--additional-50);
  --mobile-card-action-danger: var(--danger-500);
  --mobile-card-action-success: var(--success-400);
  --mobile-card-action-warning: var(--warning-500);
  --mobile-card-action-more: var(--neutrals-400);
}

.vc-data-table-mobile-card {
  @apply tw-relative tw-overflow-hidden tw-select-none tw-mx-3 tw-mb-2 tw-rounded-lg;
  touch-action: pan-y;

  &:first-child {
    @apply tw-mt-3;
  }

  &--selected {
    @apply tw-ring-2 tw-ring-[var(--mobile-card-bg-selected)] #{!important};
  }

  // Visual feedback during long press
  &--long-press &__content {
    @apply tw-scale-[0.98] tw-shadow-lg;
    transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
  }

  &__content {
    @apply tw-relative tw-bg-[var(--mobile-card-bg)] tw-rounded-lg tw-border tw-border-[var(--mobile-card-border)] tw-shadow-sm;
    will-change: transform;
  }

  &--selected &__content {
    @apply tw-bg-[var(--mobile-card-bg-selected)];
  }

  &__checkbox {
    @apply tw-absolute tw-left-0 tw-top-0 tw-bottom-0 tw-flex tw-items-center tw-px-3 tw-z-10;
  }

  &__body {
    @apply tw-flex tw-items-stretch tw-p-4 tw-gap-3 tw-min-h-[72px];

    &--with-checkbox {
      @apply tw-pl-12; // Space for checkbox
    }
  }

  &__image {
    @apply tw-flex tw-items-center tw-justify-center tw-flex-shrink-0 tw-w-12 tw-h-12;

    // Image styling
    :deep(img) {
      @apply tw-w-full tw-h-full tw-object-cover tw-rounded;
    }
  }

  &__main {
    @apply tw-flex tw-flex-col tw-flex-1 tw-justify-center tw-gap-2 tw-min-w-0;
  }

  // Title - primary identifier (full width, bold)
  &__title {
    @apply tw-font-semibold tw-text-base tw-text-[var(--mobile-card-text)] tw-truncate;
  }

  // Fields - 2-column grid with labels
  &__fields {
    @apply tw-grid tw-grid-cols-2 tw-gap-x-4 tw-gap-y-1 tw-text-sm;
  }

  &__field {
    @apply tw-flex tw-flex-wrap tw-items-baseline tw-gap-1 tw-min-w-0;
  }

  &__field-label {
    @apply tw-text-[var(--mobile-card-text-secondary)] tw-flex-shrink-0;
  }

  &__field-value {
    @apply tw-font-medium tw-text-[var(--mobile-card-text)] tw-truncate;
  }

  // Statuses - row of badges at bottom
  &__statuses {
    @apply tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-mt-1;
  }

  // Swipe actions
  &__actions {
    @apply tw-absolute tw-top-0 tw-bottom-0 tw-right-0 tw-flex tw-flex-row tw-rounded-r-lg tw-overflow-hidden;
    will-change: width;
  }

  &__action {
    @apply tw-flex tw-flex-col tw-justify-center tw-items-center tw-w-[70px]
           tw-text-[var(--mobile-card-action-text)] tw-bg-[var(--mobile-card-action-bg)]
           tw-border-none tw-outline-none tw-p-0 tw-transition-all tw-duration-150;

    // Round corners on last action button
    &:last-child {
      @apply tw-rounded-r-lg;
    }

    &:active {
      @apply tw-opacity-80 tw-scale-95;
    }

    &--default {
      @apply tw-bg-[var(--mobile-card-action-bg)];
    }

    &--danger {
      @apply tw-bg-[var(--mobile-card-action-danger)];
    }

    &--success {
      @apply tw-bg-[var(--mobile-card-action-success)];
    }

    &--warning {
      @apply tw-bg-[var(--mobile-card-action-warning)];
    }

    &--more {
      @apply tw-bg-[var(--mobile-card-action-more)];
    }

    &--disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed tw-pointer-events-none;
    }
  }

  &__action-title {
    @apply tw-mt-1 tw-text-xs tw-text-center;
  }
}
</style>
