<template>
  <div
    :id="String(notificationId)"
    ref="toastRef"
    class="vc-notification"
    :class="[`vc-notification--${type || 'default'}`]"
    :data-mounted="mounted"
    :data-removed="removed"
    :data-y-position="yPosition"
    :data-front="isFront"
    :data-expanded="expanded ?? true"
    :data-visible="isVisible"
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
import type { Content, NotificationType, NotificationPosition } from "@core/notifications/toast-types";
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
  /** Sonner-style index: 0 = front (newest), higher = older */
  toastIndex?: number;
  /** Total number of toasts in the position stack */
  toastsCount?: number;
  /** Whether the toast group is expanded (hovered or single toast) */
  expanded?: boolean;
  /** Max visible toasts in collapsed stack */
  visibleToasts?: number;
  /** Callback to report measured height to container */
  onReportHeight?: (id: string | number, height: number) => void;
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

// Sonner: remove from DOM while CSS exit transition is still running
const TIME_BEFORE_UNMOUNT = 200;

// Position
const yPosition = computed(() => {
  const pos = props.position || "top-center";
  return pos.startsWith("top") ? "top" : "bottom";
});

// Stacking (sonner-style: index 0 = front)
const isFront = computed(() => (props.toastIndex ?? 0) === 0);
const isVisible = computed(() => (props.toastIndex ?? 0) < (props.visibleToasts ?? 3));

// Timer
interface NotificationTimer {
  pause: () => void;
  resume: () => void;
  start: () => void;
  clear: () => void;
}

const timer = ref<NotificationTimer | null>(null);

function handleClose() {
  if (removed.value) return;
  removed.value = true;
  timer.value?.clear();

  // Pure CSS exit — data-removed="true" triggers CSS transition.
  // After TIME_BEFORE_UNMOUNT, emit close to remove from reactive list.
  setTimeout(() => {
    emit("close", props.notificationId);
  }, TIME_BEFORE_UNMOUNT);
}

// Watch for programmatic dismissal
watch(
  () => props.dismissing,
  (val) => {
    if (val) handleClose();
  },
);

watch(
  timeout as Ref<number | boolean>,
  (newVal) => {
    if (newVal) {
      timer.value = Timer(() => handleClose(), props.timeout as number);
      timer.value.start();
    }
  },
  { immediate: true },
);

// Report height to container
const resizeObserver = ref<ResizeObserver | null>(null);

function reportHeight() {
  if (toastRef.value && props.notificationId !== undefined && !removed.value) {
    const el = toastRef.value;
    const originalHeight = el.style.height;
    el.style.height = "auto";
    const height = el.getBoundingClientRect().height;
    el.style.height = originalHeight;
    props.onReportHeight?.(props.notificationId, height);
  }
}

onMounted(() => {
  // Double-rAF ensures browser paints initial (unmounted) state before transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      mounted.value = true;
      reportHeight();
    });
  });

  if (toastRef.value) {
    resizeObserver.value = new ResizeObserver(() => reportHeight());
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

  return { pause, resume, start, clear };
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
const SWIPE_THRESHOLD = 45;

const swipeStartX = ref(0);
const swipeStartY = ref(0);
const isSwiping = ref(false);
const swipedOut = ref(false);
const dragStartTime = ref(0);

function onPointerDown(e: PointerEvent) {
  if (removed.value || swipedOut.value) return;
  if ((e.target as HTMLElement)?.closest(".vc-notification__dismiss-button")) return;

  swipeStartX.value = e.clientX;
  swipeStartY.value = e.clientY;
  dragStartTime.value = Date.now();
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

  if (!isSwiping.value) {
    if (Math.abs(deltaX) > 1 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.value = true;
      timer.value?.pause();
    } else if (Math.abs(deltaY) > 1) {
      swipeStartX.value = 0;
      swipeStartY.value = 0;
      return;
    } else {
      return;
    }
  }

  toastRef.value?.style.setProperty("--swipe-amount-x", `${deltaX}px`);
}

function onPointerUp(e: PointerEvent) {
  const el = toastRef.value;
  if (el) {
    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  }

  if (!isSwiping.value) {
    toastRef.value?.style.setProperty("--swipe-amount-x", "0px");
    swipeStartX.value = 0;
    swipeStartY.value = 0;
    return;
  }

  const swipeAmountX = parseFloat(
    toastRef.value?.style.getPropertyValue("--swipe-amount-x")?.replace("px", "") || "0",
  );
  const timeTaken = Date.now() - dragStartTime.value;
  const velocity = Math.abs(swipeAmountX) / timeTaken;

  if (Math.abs(swipeAmountX) >= SWIPE_THRESHOLD || velocity > 0.11) {
    removed.value = true;
    timer.value?.clear();
    swipedOut.value = true;
    const direction = swipeAmountX > 0 ? 1 : -1;
    toastRef.value?.style.setProperty("--swipe-amount-x", `${direction * window.innerWidth}px`);
    setTimeout(() => emit("close", props.notificationId), TIME_BEFORE_UNMOUNT);
  } else {
    toastRef.value?.style.setProperty("--swipe-amount-x", "0px");
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

  /* Focus */
  --notification-focus-ring-color: var(--primary-100);

  /* Left accent border */
  --notification-accent-width: 3px;
}

.vc-notification {
  @apply tw-flex tw-items-center tw-box-border;
  @apply tw-border tw-border-solid tw-overflow-hidden tw-py-3 tw-px-4;
  @apply tw-justify-between;
  width: var(--width, 356px);
  max-width: 600px;
  background-color: var(--notification-background);
  border-color: var(--notification-border-color);
  border-radius: var(--notification-border-radius);
  box-shadow: var(--notification-shadow);
  border-left: var(--notification-accent-width) solid var(--notification-info);

  /* Sonner: absolute positioning, transform via --y variable */
  position: absolute;
  z-index: var(--z-index);
  opacity: 0;
  transform: var(--y);
  will-change: transform, opacity;
  touch-action: none;
  overflow-wrap: anywhere;
  pointer-events: all;

  /* Compute lift-amount from inherited --lift and --gap */
  --lift-amount: calc(var(--lift, 1) * var(--gap, 14px));

  /* Sonner transition: standard ease (NOT bouncy) */
  transition: transform 400ms, opacity 400ms, box-shadow 200ms;

  /* Position anchor + initial off-screen --y */
  &[data-y-position="top"] {
    top: 0;
    --y: translateY(-100%);
    --lift: 1;
  }

  &[data-y-position="bottom"] {
    bottom: 0;
    --y: translateY(100%);
    --lift: -1;
  }

  /* Mounted: enter animation */
  &[data-mounted="true"] {
    --y: translateY(0);
    opacity: 1;
  }

  /* Collapsed stacking: back toasts */
  &[data-expanded="false"][data-front="false"] {
    --y: translateY(calc(var(--lift-amount) * var(--toasts-before)))
         scale(calc(-1 * var(--toasts-before) * 0.05 + 1));
    height: var(--front-toast-height);
  }

  /* Hide content of collapsed back toasts */
  &[data-expanded="false"][data-front="false"] > * {
    opacity: 0;
  }

  /* Content opacity transition */
  > * {
    transition: opacity 400ms;
  }

  /* Expanded: each toast at computed offset */
  &[data-mounted="true"][data-expanded="true"] {
    --y: translateY(calc(var(--lift, 1) * var(--offset)));
    height: var(--initial-height);
  }

  /* Not visible: beyond visible limit */
  &[data-visible="false"] {
    opacity: 0;
    pointer-events: none;
  }

  /* --- Exit animations (sonner-style, context-dependent) --- */

  /* Front toast exit: slide away from viewport */
  &[data-removed="true"][data-front="true"][data-swiped-out="false"] {
    --y: translateY(calc(var(--lift, 1) * -100%));
    opacity: 0;
  }

  /* Back toast exit (expanded): slide away from current offset */
  &[data-removed="true"][data-front="false"][data-swiped-out="false"][data-expanded="true"] {
    --y: translateY(calc(var(--lift, 1) * var(--offset) + var(--lift, 1) * -100%));
    opacity: 0;
  }

  /* Back toast exit (collapsed): sink away */
  &[data-removed="true"][data-front="false"][data-swiped-out="false"][data-expanded="false"] {
    --y: translateY(40%);
    opacity: 0;
    transition: transform 500ms, opacity 200ms;
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

  /* Expanded hover gap pseudo — extends hit area between toasts */
  &[data-expanded="true"]::after {
    content: '';
    position: absolute;
    left: 0;
    height: calc(var(--gap, 14px) + 1px);
    bottom: 100%;
    width: 100%;
  }

  /* Swipe-to-dismiss */
  &[data-swiping="true"] {
    transform: var(--y) translateX(var(--swipe-amount-x, 0px));
    transition: none;
    cursor: grabbing;
    user-select: none;
  }

  &[data-swiped-out="true"] {
    pointer-events: none;
  }

  /* Swiping pseudo — extends hit area to prevent accidental mouse-leave */
  &[data-swiping="true"]::before {
    content: '';
    position: absolute;
    left: -100%;
    right: -100%;
    height: 100%;
    z-index: -1;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    transition: none !important;
    animation: none !important;
  }
}
</style>
