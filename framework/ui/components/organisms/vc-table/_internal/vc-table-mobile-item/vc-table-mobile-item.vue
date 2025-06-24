<template>
  <div
    ref="container"
    v-on-click-outside="reset"
    class="vc-table-mobile"
    @click="handleClick"
    @contextmenu.prevent
    @touchhold="handleHold"
  >
    <div
      ref="target"
      class="vc-table-mobile__item"
      :class="{ 'vc-table-mobile__item-selected': isSelected }"
    >
      <div
        v-if="anySelected"
        class="vc-table-mobile__checkbox-container"
      >
        <VcCheckbox
          :model-value="unref(isSelected ?? false)"
          :disabled="disabledSelection?.includes(items[index])"
          size="m"
        ></VcCheckbox>
      </div>
      <div class="vc-table-mobile__content">
        <div
          class="vc-table-mobile__slot"
          :class="{
            'vc-table-mobile__slot--left': anySelected,
          }"
          :style="{ transform: `translateX(${translateX}px)` }"
        >
          <slot></slot>
        </div>
        <!-- Item actions -->
        <div
          v-if="swipeActions && swipeActions.length"
          class="vc-table-mobile__swipe-actions"
          :style="{ width: `${actionsWidth}px` }"
          @touchstart.stop
        >
          <!-- More button for additional actions after first 2 -->
          <template v-if="swipeActions.length > 2">
            <button
              class="vc-table-mobile__action vc-table-mobile__action_more-left"
              @click.stop="() => (isActionsPopupVisible = true)"
            >
              <VcIcon icon="material-pending" />
              <div class="vc-table-mobile__action-title">
                {{ $t("COMPONENTS.ORGANISMS.VC_TABLE.MORE") }}
              </div>
            </button>
          </template>

          <!-- First 2 actions -->
          <button
            v-for="(action, idx) in swipeActions.slice(0, 2)"
            :key="`swipeAction-${idx}`"
            class="vc-table-mobile__action"
            :class="`vc-table-mobile__item-action_${action.type}`"
            @click.stop="() => action.clickHandler(items[index] as T, index)"
          >
            <VcIcon
              :icon="action.icon"
              size="s"
            />
            <div class="vc-table-mobile__action-title">
              {{ action.title }}
            </div>
          </button>

          <!-- Actions popup -->
          <VcPopup
            v-if="isActionsPopupVisible"
            :title="t('COMPONENTS.ORGANISMS.VC_TABLE.ALL_ACTIONS')"
            @close="isActionsPopupVisible = false"
          >
            <template #content>
              <div class="vc-table-mobile__actions-popup-content">
                <div
                  v-for="(itemAction, i) in itemActions"
                  :key="i"
                  class="vc-table-mobile__actions-popup-action"
                  @click="
                    itemAction.clickHandler(items[index] as T, index);
                    isActionsPopupVisible = false;
                  "
                >
                  <VcIcon
                    :icon="itemAction.icon"
                    size="s"
                  ></VcIcon>
                  <div class="vc-table-mobile__actions-popup-action-title">
                    {{ itemAction.title }}
                  </div>
                </div>
              </div>
            </template>
          </VcPopup>
        </div>
      </div>
    </div>
    <div class="vc-table-mobile__spacer"></div>
  </div>
</template>

<script lang="ts" setup generic="T extends TableItem | string">
import { Ref, computed, ref, watch, unref, onMounted, onBeforeUnmount } from "vue";
import { IActionBuilderResult } from "../../../../../../core/types";
import { useI18n } from "vue-i18n";
import { useSwipe } from "@vueuse/core";
import { vOnClickOutside } from "@vueuse/components";
import { useTableSwipe } from "../../composables/useTableSwipe";
import { VcPopup } from "../../../../../../ui/components";

export interface Emits {
  (event: "click"): void;
  (event: "select"): void;
}
export interface TableItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x: string]: any;
  actions?: IActionBuilderResult[];
}

const props = defineProps<{
  items: T[];
  actionBuilder?: (item: T) => IActionBuilderResult<T>[] | undefined;
  index: number;
  selection?: T[];
  disabledSelection?: (TableItem | string)[];
  isSelected?: boolean;
}>();

const emit = defineEmits<Emits>();
const { t } = useI18n({ useScope: "global" });

const isActionsPopupVisible = ref(false);
const itemActions: Ref<IActionBuilderResult<T>[] | undefined> = ref([]);
const target = ref<HTMLElement | null>(null);
const container = ref<HTMLElement | null>(null);
const anySelected = computed(() => props.selection && props.selection.length > 0);

// The iOS-like swipe system
const translateX = ref(0);
const actionsWidth = ref(0);
const isAnimating = ref(false);
const swipeThreshold = 40; // The threshold for the swipe activation
const animationId = ref<number | null>(null);

// The constants of the animation
const SPRING_STIFFNESS = 0.08; // The stiffness of the spring
const SPRING_DAMPING = 0.7; // The damping of the spring
const SPRING_MASS = 1; // The mass of the object

const { activeSwipeId, setActiveSwipe } = useTableSwipe();

// We calculate the maximum width of the actions
const totalActionsWidth = computed(() => {
  const actionsCount = swipeActions.value?.length ?? 0;
  const maxVisible = Math.min(actionsCount, actionsCount > 2 ? 3 : 2);
  return maxVisible * 70;
});

const swipeActions = computed(() => (props.selection?.length === 0 && itemActions.value) || undefined);

// The handler for touch events for the iOS-like swipe
const startX = ref(0);
const startTranslateX = ref(0);
const velocity = ref(0);
const lastTime = ref(0);
const lastX = ref(0);
const rafId: number | null = null;

// The spring animation for the iOS-like effect
function springAnimation(targetValue: number, duration = 300) {
  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value);
  }

  const startValue = translateX.value;
  const startTime = performance.now();

  // The variables for the spring animation
  let springVelocity = velocity.value;
  let currentValue = startValue;

  isAnimating.value = true;

  function animate(time: number) {
    const elapsed = time - startTime;

    if (elapsed < duration) {
      // We calculate the spring force
      const springForce = (targetValue - currentValue) * SPRING_STIFFNESS;
      // We calculate the damping force
      const dampingForce = springVelocity * SPRING_DAMPING;
      // We calculate the acceleration
      const acceleration = (springForce - dampingForce) / SPRING_MASS;

      // We update the speed and position
      springVelocity += acceleration;
      currentValue += springVelocity;

      // We apply the new value
      translateX.value = currentValue;
      actionsWidth.value = Math.abs(translateX.value);

      animationId.value = requestAnimationFrame(animate);
    } else {
      // The final value
      translateX.value = targetValue;
      actionsWidth.value = Math.abs(targetValue);
      isAnimating.value = false;
      animationId.value = null;
    }
  }

  animationId.value = requestAnimationFrame(animate);
}

// We configure the touch handlers
onMounted(() => {
  if (target.value) {
    target.value.addEventListener("touchstart", handleTouchStart, { passive: true });
    target.value.addEventListener("touchmove", handleTouchMove, { passive: false });
    target.value.addEventListener("touchend", handleTouchEnd, { passive: true });
  }
});

onBeforeUnmount(() => {
  if (target.value) {
    target.value.removeEventListener("touchstart", handleTouchStart);
    target.value.removeEventListener("touchmove", handleTouchMove);
    target.value.removeEventListener("touchend", handleTouchEnd);
  }

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value);
  }
});

function handleTouchStart(e: TouchEvent) {
  if (isAnimating.value) return;

  getActions();
  const item = props.items[props.index];
  if (typeof item === "string") return;

  const touch = e.touches[0];
  startX.value = touch.clientX;
  startTranslateX.value = translateX.value;
  velocity.value = 0;
  lastTime.value = Date.now();
  lastX.value = touch.clientX;

  setActiveSwipe(item.id);
}

function handleTouchMove(e: TouchEvent) {
  if (isAnimating.value) return;

  const item = props.items[props.index];
  if (typeof item === "string" || activeSwipeId.value !== item.id) return;

  const touch = e.touches[0];
  const currentX = touch.clientX;
  const deltaX = currentX - startX.value;

  // We calculate the speed for inertia
  const now = Date.now();
  const dt = now - lastTime.value;
  if (dt > 0) {
    velocity.value = (currentX - lastX.value) / dt;
  }
  lastTime.value = now;
  lastX.value = currentX;

  // The new position with the initial position
  let newTranslateX = startTranslateX.value + deltaX;

  // The limitation with the spring effect (we can go in the negative direction only to the width of the actions)
  if (newTranslateX < -totalActionsWidth.value) {
    // The spring effect - the further we pull, the harder it is
    const overscroll = newTranslateX + totalActionsWidth.value;
    newTranslateX = -totalActionsWidth.value + overscroll * 0.3;
  }

  // We do not allow the swipe to the right beyond the initial position
  if (newTranslateX > 0) {
    newTranslateX = 0;
  }

  translateX.value = newTranslateX;
  actionsWidth.value = Math.abs(newTranslateX);

  // We prevent the page scrolling if the swipe is horizontal
  if (Math.abs(deltaX) > 10) {
    e.preventDefault();
  }
}

function handleTouchEnd() {
  if (isAnimating.value) return;

  const item = props.items[props.index];
  if (typeof item === "string" || activeSwipeId.value !== item.id) return;

  // We use the speed to determine whether we should open or close the swipe
  const absVelocity = Math.abs(velocity.value);
  const direction = velocity.value < 0 ? -1 : 1;

  // If the speed is high enough, we use it to determine the direction
  if (absVelocity > 0.5) {
    if (direction < 0 && swipeActions.value && swipeActions.value.length) {
      // Swipe to the left with a high speed - open fully
      springAnimation(-totalActionsWidth.value);
    } else {
      // Swipe to the right with a high speed - close
      springAnimation(0);
    }
  } else {
    // Otherwise, we use the position to determine
    const threshold = totalActionsWidth.value * 0.4; // 40% threshold

    if (Math.abs(translateX.value) > threshold && swipeActions.value && swipeActions.value.length) {
      // Enough to open
      springAnimation(-totalActionsWidth.value);
    } else {
      // Not enough - close
      springAnimation(0);
    }
  }
}

// We track the change of the active swipe
watch(
  activeSwipeId,
  (newVal) => {
    const item = props.items[props.index];
    if (typeof item !== "string" && (!newVal || newVal !== item.id) && translateX.value !== 0) {
      // Close the swipe if other is activated
      springAnimation(0);
    }
  },
  { immediate: true },
);

// We reset the swipe state
function reset() {
  if (isAnimating.value) return;

  // We start the animation to return to the initial position
  springAnimation(0);

  const item = props.items[props.index];
  if (typeof item !== "string" && activeSwipeId.value === item.id) {
    setActiveSwipe(null);
  }
}

function getActions() {
  if (!(itemActions.value && itemActions.value.length)) {
    if (props.actionBuilder && typeof props.actionBuilder === "function") {
      itemActions.value = props.actionBuilder(props.items[props.index]);
    }
  }
}

function handleHold() {
  emit("select");
}

function handleClick() {
  if (anySelected.value) {
    emit("select");
    return;
  }
  emit("click");
}
</script>

<style lang="scss">
:root {
  --table-mobile-background-color: var(--additional-50);
  --table-mobile-action-bg: var(--secondary-400);
  --table-mobile-border-color: var(--secondary-200);
  --table-mobile-action-text-color: var(--additional-50);
  --table-mobile-action-popup-overlay: var(--neutrals-100);
  --table-mobile-action-popup-bg: var(--additional-50);
  --table-mobile-action-popup-shadow-color: var(--secondary-200);
  --table-mobile-action-popup-shadow: 1px 1px 22px var(--table-mobile-action-popup-shadow-color);
  --table-mobile-action-popup-border-color: var(--neutrals-200);
  --table-mobile-action-popup-title-color: var(--neutrals-700);
  --table-mobile-action-popup-icon-color: var(--secondary-600);
  --table-mobile-action-popup-action-text-color: var(--primary-500);
  --table-mobile-action-success: var(--success-400);
  --table-mobile-action-danger: var(--danger-500);
  --table-mobile-action-selected: var(--primary-100);
  --table-mobile-action-more: var(--neutrals-400);
}

.vc-table-mobile {
  @apply tw-select-none tw-block tw-overflow-visible;
  touch-action: pan-y; // Allow only vertical scrolling

  &__item {
    @apply tw-w-full tw-h-full tw-flex-shrink-0 tw-bg-[--table-mobile-background-color] tw-flex tw-flex-row;
    will-change: transform;

    &.vc-table-mobile__item-selected {
      @apply tw-bg-[--table-mobile-action-selected] #{!important};
    }
  }

  &__checkbox-container {
    @apply tw-absolute tw-px-2 tw-pt-[10px] tw-flex tw-items-start tw-justify-center;
  }

  &__content {
    @apply tw-flex-auto tw-flex tw-flex-col tw-relative tw-w-full;
    overflow: hidden;
  }

  &__swipe-actions {
    @apply tw-flex-shrink-0 tw-flex tw-flex-row [justify-content:stretch] tw-bg-[--table-mobile-action-bg] tw-absolute tw-top-0 tw-bottom-0 tw-right-0;
    will-change: width;
  }

  &__action {
    @apply tw-flex tw-grow tw-basis-[1] tw-flex-col tw-justify-center tw-items-center tw-text-[color:var(--table-mobile-action-text-color)] tw-w-[70px];
    position: relative;
    background: none;
    border: none;
    outline: none;
    padding: 0;
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;

    &:active {
      opacity: 0.8;
      transform: scale(0.95);
    }
  }

  &__action-title {
    @apply tw-mt-1 tw-text-xs tw-text-center;
  }

  &__item-action_success {
    @apply tw-bg-[--table-mobile-action-success];
  }

  &__item-action_danger {
    @apply tw-bg-[--table-mobile-action-danger];
  }

  &__item-selected {
    @apply tw-bg-[--table-mobile-action-selected] #{!important};
  }

  &__slot {
    @apply tw-flex tw-flex-col tw-grow;
    will-change: transform;

    &--left {
      @apply tw-translate-x-[34px] #{!important};
    }
  }

  &__action_more {
    @apply tw-text-[--table-mobile-action-text-color];
  }

  &__action_more-left {
    @apply tw-text-[--table-mobile-action-text-color] tw-bg-[--table-mobile-action-more];
  }

  &__actions-popup-overlay {
    @apply tw-absolute tw-left-0 tw-top-0 tw-right-0 tw-bottom-0 tw-bg-[--table-mobile-action-popup-overlay] tw-flex tw-items-center tw-justify-center tw-z-[99];
  }

  &__actions-popup {
    @apply tw-bg-[--table-mobile-action-popup-bg] tw-rounded-[6px] tw-overflow-hidden tw-p-5 tw-max-w-[80%] tw-w-[350px] tw-border tw-border-solid tw-border-[--table-mobile-action-popup-border-color] tw-box-border [box-shadow:var(--table-mobile-action-popup-shadow)];
  }

  &__actions-popup-header {
    @apply tw-flex tw-w-full tw-items-center;
  }

  &__actions-popup-title {
    @apply tw-grow tw-text-[color:var(--table-mobile-action-popup-title-color)] tw-text-[19px] tw-font-semibold tw-tracking-[-0.01em];
  }

  &__actions-popup-close {
    @apply tw-text-[color:var(--table-mobile-action-popup-icon-color)];
  }

  &__actions-popup-content {
    @apply tw-flex tw-flex-wrap tw-justify-between;
  }

  &__actions-popup-action {
    @apply tw-flex tw-grow tw-shrink-0 tw-flex-col tw-items-center tw-text-[color:var(--table-mobile-action-popup-action-text-color)] tw-my-2 tw-box-border tw-p-1 tw-max-w-[80px];
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;

    &:active {
      opacity: 0.8;
      transform: scale(0.95);
    }
  }

  &__actions-popup-action-title {
    @apply tw-text-sm tw-mt-2 tw-text-center;
  }

  &__spacer {
    @apply tw-flex tw-justify-between tw-flex-auto;
  }
}
</style>
