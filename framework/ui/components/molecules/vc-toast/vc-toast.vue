<template>
  <div
    :id="String(notificationId)"
    ref="toastRef"
    class="vc-notification"
    :class="[`vc-notification--${type || 'default'}`]"
    :style="{ ...stackingStyle, ...swipeStyle }"
    :data-mounted="mounted"
    :data-removed="removed"
    :data-position="position || 'top-center'"
    :data-front="isFront"
    :data-expanded="expanded ?? true"
    :data-stacked="isStacked"
    :data-hidden="isHidden"
    :data-swiping="isSwiping"
    :data-swiped-out="swipedOut"
    :role="type === 'error' ? 'alert' : 'status'"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
  >
    <div class="vc-notification__content-wrapper">
      <VcIcon
        :icon="types[type ?? 'default']?.icon"
        :style="{ color: types[type ?? 'default']?.color }"
        size="l"
        class="vc-notification__icon"
        aria-hidden="true"
      ></VcIcon>
      <div
        v-if="typeof content === 'string'"
        class="vc-notification__content"
      >
        {{ content }}
      </div>
      <div v-else>
        <component :is="content"></component>
      </div>
    </div>
    <button
      type="button"
      class="vc-notification__dismiss-button"
      aria-label="Dismiss notification"
      @click.stop="handleClose"
      @keydown.escape="handleClose"
    >
      <VcIcon
        icon="lucide-x"
        size="s"
        aria-hidden="true"
      ></VcIcon>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { Content, NotificationType, NotificationPosition } from "@shared/components/notifications";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { Ref, computed, onMounted, onBeforeUnmount, ref, toRefs, watch } from "vue";

export interface Props {
  content?: Content;
  notificationId?: number | string;
  updateId?: number | string;
  type?: NotificationType;
  timeout?: number | boolean;
  pauseOnHover?: boolean;
  limit?: number;
  position?: NotificationPosition;
  dismissing?: boolean;
  /** Index of this toast in the position stack (0 = oldest) */
  toastIndex?: number;
  /** Total number of toasts in the position stack */
  toastsCount?: number;
  /** Whether the toast group is expanded (hovered or single toast) */
  expanded?: boolean;
}

const emit = defineEmits<{
  (e: "close", id: number | string | undefined): void;
}>();

const props = defineProps<Props>();

const types: Record<NotificationType, { icon: string; color: string }> = {
  default: { icon: "lucide-info", color: "var(--notification-info)" },
  success: { icon: "lucide-check-circle", color: "var(--notification-success)" },
  error: { icon: "lucide-alert-circle", color: "var(--notification-error)" },
  warning: { icon: "lucide-alert-triangle", color: "var(--notification-warning)" },
};

const { timeout } = toRefs(props);

const toastRef = ref<HTMLElement | null>(null);
const mounted = ref(false);
const removed = ref(false);

// Stacking: is this the front (newest) toast?
const isFront = computed(
  () => props.toastIndex === undefined || props.toastsCount === undefined || props.toastIndex === props.toastsCount - 1,
);

// How many toasts are in front of this one (used for scale/opacity calculation)
const behindCount = computed(() => {
  if (props.toastIndex === undefined || props.toastsCount === undefined) return 0;
  return props.toastsCount - 1 - props.toastIndex;
});

// Whether this toast should show in stacked (collapsed) mode
const isStacked = computed(() => !isFront.value && !props.expanded);

// Toasts deeper than 2 behind are invisible (limits visual clutter)
const isHidden = computed(() => behindCount.value > 2 && !props.expanded);

// CSS variables for stacking depth + z-index ordering
const stackingStyle = computed(() => {
  const styles: Record<string, string | number> = {};

  // z-index: front toast gets highest value
  if (props.toastsCount !== undefined && props.toastIndex !== undefined && props.toastsCount > 1) {
    styles["z-index"] = props.toastsCount - behindCount.value;
  }

  if (isStacked.value) {
    styles["--toast-behind-count"] = behindCount.value;
  }

  return styles;
});

// Timer type for improved type safety
interface NotificationTimer {
  pause: () => void;
  resume: () => void;
  start: () => void;
  clear: () => void;
}

const timer = ref<NotificationTimer | null>(null);

// Transition duration must match CSS --notification-transition-duration
const TRANSITION_DURATION = 400;

/**
 * Two-phase Sonner-style exit:
 *  Phase 1 — CSS-driven opacity + transform slide (400ms)
 *  Phase 2 — JS-driven height collapse so remaining toasts reposition smoothly
 *
 * Phases are sequential because translateY(-100%) conflicts with height: 0
 * (percentage is relative to element height — collapsing height makes the
 * slide distance shrink to 0).
 */
function exitAndEmit(el: HTMLElement) {
  // Phase 1: wait for the CSS opacity transition to finish
  let phase1Done = false;

  const startPhase2 = () => {
    if (phase1Done) return;
    phase1Done = true;
    el.removeEventListener("transitionend", onPhase1End);

    // Phase 2: collapse height for smooth remaining-toast repositioning
    const currentHeight = el.offsetHeight;
    // Switch to a short collapse-only transition
    el.style.transition = "height 200ms ease, padding 200ms ease, margin 200ms ease";
    el.style.height = `${currentHeight}px`;
    void el.offsetHeight; // eslint-disable-line no-unused-expressions -- force reflow

    el.style.height = "0";
    el.style.minHeight = "0";
    el.style.paddingTop = "0";
    el.style.paddingBottom = "0";
    el.style.marginTop = "0";
    el.style.marginBottom = "0";

    let phase2Done = false;
    const finish = () => {
      if (phase2Done) return;
      phase2Done = true;
      el.removeEventListener("transitionend", onPhase2End);
      emit("close", props.notificationId);
    };
    const onPhase2End = (e: TransitionEvent) => {
      if (e.target === el && e.propertyName === "height") finish();
    };
    el.addEventListener("transitionend", onPhase2End);
    setTimeout(finish, 250); // fallback
  };

  const onPhase1End = (e: TransitionEvent) => {
    // Wait specifically for opacity to finish (400ms) — ignore box-shadow (200ms)
    if (e.target === el && e.propertyName === "opacity") {
      startPhase2();
    }
  };
  el.addEventListener("transitionend", onPhase1End);
  // Fallback if transitionend doesn't fire (e.g. reduced motion, detached element)
  setTimeout(startPhase2, TRANSITION_DURATION + 50);
}

function handleClose() {
  if (removed.value) return; // prevent double-close
  removed.value = true;
  timer.value?.clear();

  const el = toastRef.value;
  if (el) {
    exitAndEmit(el);
  } else {
    emit("close", props.notificationId);
  }
}

// Watch for programmatic dismissal via the `dismissing` flag
watch(
  () => props.dismissing,
  (val) => {
    if (val) {
      handleClose();
    }
  },
);

watch(
  timeout as Ref<number | boolean>,
  (newVal) => {
    if (newVal) {
      timer.value = Timer(() => {
        handleClose();
      }, props.timeout as number);

      timer.value.start();
    }
  },
  { immediate: true },
);

// Report front toast height to parent (toast group) for stacking constraint
const resizeObserver = ref<ResizeObserver | null>(null);

function updateFrontHeight() {
  if (isFront.value && toastRef.value && !removed.value) {
    const parent = toastRef.value.parentElement;
    if (parent) {
      parent.style.setProperty("--front-toast-height", `${toastRef.value.offsetHeight}px`);
    }
  }
}

watch(isFront, (val) => {
  if (val) updateFrontHeight();
});

onMounted(() => {
  // Double-rAF ensures the browser has painted the initial (unmounted) state
  // before we flip to mounted, triggering the CSS transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mounted.value = true;
      // Measure after mount for accurate height
      updateFrontHeight();
    });
  });

  // Track height changes (e.g. content resize) for front toast
  if (toastRef.value) {
    resizeObserver.value = new ResizeObserver(() => updateFrontHeight());
    resizeObserver.value.observe(toastRef.value);
  }
});

function Timer(callback: (...args: unknown[]) => unknown, delay: number): NotificationTimer {
  let timerId: number;
  let from: number;
  let remaining = delay;

  function pause() {
    window.clearTimeout(timerId);
    remaining -= Date.now() - from;
  }

  function resume() {
    from = Date.now();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, remaining);
  }

  function start() {
    remaining = delay;
    resume();
  }

  function clear() {
    window.clearTimeout(timerId);
  }

  return {
    pause,
    resume,
    start,
    clear,
  };
}

onBeforeUnmount(() => {
  timer.value?.clear();
  resizeObserver.value?.disconnect();
});

function onMouseEnter() {
  if (props.timeout && props.pauseOnHover !== false) {
    timer.value?.pause();
  }
}

function onMouseLeave() {
  if (props.timeout && props.pauseOnHover !== false) {
    timer.value?.resume();
  }
}

// --- Swipe-to-dismiss ---
const SWIPE_THRESHOLD = 150; // px to trigger dismiss
const SWIPE_START_THRESHOLD = 10; // px to determine swipe vs click

const swipeStartX = ref(0);
const swipeStartY = ref(0);
const swipeAmountX = ref(0);
const isSwiping = ref(false);
const swipedOut = ref(false);

const swipeStyle = computed(() => {
  if (swipeAmountX.value === 0 && !swipedOut.value) return {};
  const opacity = swipedOut.value ? 0 : Math.max(0, 1 - (Math.abs(swipeAmountX.value) / SWIPE_THRESHOLD) * 0.5);
  return {
    transform: `translateX(${swipeAmountX.value}px)`,
    opacity: String(opacity),
  };
});

function onPointerDown(e: PointerEvent) {
  if (removed.value || swipedOut.value) return;
  // Don't start swipe on dismiss button
  if ((e.target as HTMLElement)?.closest(".vc-notification__dismiss-button")) return;

  swipeStartX.value = e.clientX;
  swipeStartY.value = e.clientY;
  isSwiping.value = false;

  const el = toastRef.value;
  if (el) {
    el.setPointerCapture(e.pointerId);
  }
}

function onPointerMove(e: PointerEvent) {
  if (removed.value || swipedOut.value) return;
  if (swipeStartX.value === 0 && swipeStartY.value === 0) return;

  const deltaX = e.clientX - swipeStartX.value;
  const deltaY = e.clientY - swipeStartY.value;

  // Determine if horizontal swipe (not vertical scroll)
  if (!isSwiping.value) {
    if (Math.abs(deltaX) > SWIPE_START_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.value = true;
      // Disable CSS transition for responsive tracking
      if (toastRef.value) {
        toastRef.value.style.transition = "none";
      }
      // Pause timer during swipe
      timer.value?.pause();
    } else if (Math.abs(deltaY) > SWIPE_START_THRESHOLD) {
      // Vertical scroll — abort swipe tracking
      swipeStartX.value = 0;
      swipeStartY.value = 0;
      return;
    } else {
      return;
    }
  }

  swipeAmountX.value = deltaX;
}

function onPointerUp(e: PointerEvent) {
  const el = toastRef.value;
  if (el) {
    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
    // Restore CSS transitions
    el.style.transition = "";
  }

  if (!isSwiping.value) {
    swipeAmountX.value = 0;
    swipeStartX.value = 0;
    swipeStartY.value = 0;
    return;
  }

  if (Math.abs(swipeAmountX.value) >= SWIPE_THRESHOLD) {
    // Fling off-screen
    removed.value = true; // prevent other close paths (timer, dismissing watcher)
    timer.value?.clear();
    swipedOut.value = true;
    const direction = swipeAmountX.value > 0 ? 1 : -1;
    swipeAmountX.value = direction * window.innerWidth;

    // Remove after swipe fling completes (200ms transition + buffer)
    setTimeout(() => emit("close", props.notificationId), 250);
  } else {
    // Spring back
    swipeAmountX.value = 0;
    // Resume timer if not dismissed
    timer.value?.resume();
  }

  isSwiping.value = false;
  swipeStartX.value = 0;
  swipeStartY.value = 0;
}
</script>

<style lang="scss">
:root {
  /* Main colors and styles */
  --notification-background: var(--additional-50);
  --notification-border-radius: 6px;
  --notification-border-color: var(--neutrals-200);
  --notification-dismiss-color: var(--neutrals-400);
  --notification-dismiss-hover-color: var(--neutrals-600);
  --notification-content-color: var(--neutrals-800);

  /* Color indicators for types */
  --notification-warning: var(--warning-500);
  --notification-error: var(--danger-500);
  --notification-success: var(--success-500);
  --notification-info: var(--info-500);

  /* Effects */
  --notification-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  --notification-hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

  /* Transition timing (Sonner-style) */
  --notification-transition-duration: 400ms;
  --notification-transition-timing: cubic-bezier(0.21, 1.02, 0.73, 1);

  /* Focus */
  --notification-focus-ring-color: var(--primary-100);

  /* Left accent border */
  --notification-accent-width: 3px;
}

.vc-notification {
  @apply tw-flex tw-items-center tw-box-border tw-relative;
  @apply tw-border tw-border-solid tw-overflow-hidden tw-py-3 tw-px-4;
  @apply tw-max-w-[600px] tw-justify-between;
  background-color: var(--notification-background);
  border-color: var(--notification-border-color);
  border-radius: var(--notification-border-radius);
  box-shadow: var(--notification-shadow);
  border-left: var(--notification-accent-width) solid var(--notification-info);
  pointer-events: all;

  /* Sonner-style: start invisible, transitions driven by data attributes */
  opacity: 0;
  will-change: transform, opacity;
  transition:
    opacity var(--notification-transition-duration) var(--notification-transition-timing),
    transform var(--notification-transition-duration) var(--notification-transition-timing),
    height var(--notification-transition-duration) var(--notification-transition-timing),
    padding var(--notification-transition-duration) var(--notification-transition-timing),
    margin var(--notification-transition-duration) var(--notification-transition-timing),
    border-width var(--notification-transition-duration) var(--notification-transition-timing),
    box-shadow 200ms ease;

  /* Initial off-screen positions (unmounted state) */
  &[data-position="top-center"] {
    transform: translateY(-100%);
  }
  &[data-position="top-right"] {
    transform: translateX(calc(100% + 1em));
  }
  &[data-position="top-left"] {
    transform: translateX(calc(-100% - 1em));
  }
  &[data-position="bottom-center"] {
    transform: translateY(100%);
  }
  &[data-position="bottom-right"] {
    transform: translateX(calc(100% + 1em));
  }
  &[data-position="bottom-left"] {
    transform: translateX(calc(-100% - 1em));
  }

  /* Mounted: slide into view */
  &[data-mounted="true"] {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }

  /* Removed: slide back out (overrides mounted) */
  &[data-removed="true"] {
    opacity: 0;

    &[data-position="top-center"] {
      transform: translateY(-100%);
    }
    &[data-position="top-right"] {
      transform: translateX(calc(100% + 1em));
    }
    &[data-position="top-left"] {
      transform: translateX(calc(-100% - 1em));
    }
    &[data-position="bottom-center"] {
      transform: translateY(100%);
    }
    &[data-position="bottom-right"] {
      transform: translateX(calc(100% + 1em));
    }
    &[data-position="bottom-left"] {
      transform: translateX(calc(-100% - 1em));
    }
  }

  /* Hover effect */
  &:hover {
    box-shadow: var(--notification-hover-shadow);
  }

  /* Type-specific left accent border */
  &--success {
    border-left-color: var(--notification-success);
  }

  &--error {
    border-left-color: var(--notification-error);
  }

  &--warning {
    border-left-color: var(--notification-warning);
  }

  &--default {
    border-left-color: var(--notification-info);
  }

  &__content-wrapper {
    @apply tw-flex tw-items-center tw-flex-row tw-gap-2;
  }

  &__icon {
    @apply tw-shrink-0;
  }

  &__content {
    @apply tw-whitespace-pre-line tw-overflow-auto tw-text-sm tw-leading-5;
    @apply tw-max-h-[100px];
    color: var(--notification-content-color);
  }

  &__dismiss-button {
    @apply tw-cursor-pointer tw-ml-2
      tw-border-none tw-bg-transparent tw-outline-none tw-p-1 tw-rounded tw-flex tw-items-center tw-justify-center;
    @apply tw-transition-colors tw-duration-150;
    color: var(--notification-dismiss-color);

    &:hover {
      color: var(--notification-dismiss-hover-color);
    }

    &:focus-visible {
      @apply tw-ring-[3px] tw-outline-none;
      ring-color: var(--notification-focus-ring-color);
    }
  }

  .vc-app--mobile {
    @apply tw-max-w-[90%];
  }

  /* Stacking: Sonner deck-of-cards — back toasts are absolute, constrained height, peek offset */
  &[data-stacked="true"][data-mounted="true"] {
    position: absolute;
    left: 0;
    right: 0;
    height: var(--front-toast-height, auto);
    overflow: hidden;
    opacity: calc(1 - var(--toast-behind-count, 0) * 0.12);
    pointer-events: none;

    /* Top positions: peek below front toast */
    &[data-position^="top"] {
      top: 0;
      transform: translateY(calc(var(--toast-behind-count, 0) * 14px))
                 scale(calc(1 - var(--toast-behind-count, 0) * 0.05));
      transform-origin: top center;
    }

    /* Bottom positions: peek above front toast */
    &[data-position^="bottom"] {
      bottom: 0;
      transform: translateY(calc(var(--toast-behind-count, 0) * -14px))
                 scale(calc(1 - var(--toast-behind-count, 0) * 0.05));
      transform-origin: bottom center;
    }
  }

  /* Toasts deeper than 2 behind are invisible */
  &[data-hidden="true"] {
    opacity: 0 !important;
    pointer-events: none;
  }

  /* Front/expanded: normal flow, full interactivity */
  &[data-front="true"][data-mounted="true"],
  &[data-stacked="false"][data-mounted="true"] {
    pointer-events: all;
  }

  /* Swipe-to-dismiss */
  touch-action: pan-y; /* Allow vertical scroll, capture horizontal */
  cursor: grab;

  &[data-swiping="true"] {
    cursor: grabbing;
    user-select: none;
  }

  &[data-swiped-out="true"] {
    transition: transform 200ms ease-out, opacity 200ms ease-out,
      height var(--notification-transition-duration) var(--notification-transition-timing),
      padding var(--notification-transition-duration) var(--notification-transition-timing),
      margin var(--notification-transition-duration) var(--notification-transition-timing) !important;
    pointer-events: none;
  }

  /* Reduced motion: instant transitions */
  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0.01ms !important;
  }
}
</style>
