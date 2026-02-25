<template>
  <div
    :id="String(notificationId)"
    ref="nodeRef"
    class="vc-notification"
    :class="[`vc-notification--${position || 'top-center'}`, `vc-notification--${type || 'default'}`]"
    :role="type === 'error' ? 'alert' : 'status'"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
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
import { VcIcon } from "@ui/components";
import { Ref, onMounted, onBeforeUnmount, ref, toRefs, watch } from "vue";

export interface Props {
  content?: Content;
  notificationId?: number | string;
  updateId?: number | string;
  type?: NotificationType;
  timeout?: number | boolean;
  pauseOnHover?: boolean;
  limit?: number;
  position?: NotificationPosition;
}

// Define events that the component can emit
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

// Timer type for improved type safety
interface NotificationTimer {
  pause: () => void;
  resume: () => void;
  start: () => void;
  clear: () => void;
}

const timer = ref<NotificationTimer | null>(null);

// Function to close the notification
function handleClose() {
  emit("close", props.notificationId);
}

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

onMounted(() => {
  if (props.timeout) {
    timer.value?.start();
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
});

function onMouseEnter() {
  if (props.timeout) {
    timer.value?.pause();
  }
}

function onMouseLeave() {
  if (props.timeout) {
    timer.value?.resume();
  }
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

  /* Variables for animation */
  --notification-animation-duration: 300ms;
  --notification-animation-timing: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --notification-slide-distance: 30px;

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

  /* Base animation properties */
  animation-duration: var(--notification-animation-duration);
  animation-timing-function: var(--notification-animation-timing);
  animation-fill-mode: both;
  transition:
    opacity var(--notification-animation-duration) var(--notification-animation-timing),
    transform var(--notification-animation-duration) var(--notification-animation-timing),
    box-shadow 0.2s ease;

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

  /* Animations for different positions */
  &--top-center {
    animation-name: notificationSlideInTopCenter;
  }

  &--top-right {
    animation-name: notificationSlideInTopRight;
  }

  &--top-left {
    animation-name: notificationSlideInTopLeft;
  }

  &--bottom-center {
    animation-name: notificationSlideInBottomCenter;
  }

  &--bottom-right {
    animation-name: notificationSlideInBottomRight;
  }

  &--bottom-left {
    animation-name: notificationSlideInBottomLeft;
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
}

/* Keyframes for different directions */

/* Top Center: top to bottom */
@keyframes notificationSlideInTopCenter {
  from {
    opacity: 0;
    transform: translateY(calc(-1 * var(--notification-slide-distance)));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Top Right: right to left and top to bottom */
@keyframes notificationSlideInTopRight {
  from {
    opacity: 0;
    transform: translate(var(--notification-slide-distance), calc(-1 * var(--notification-slide-distance)));
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
}

/* Top Left: left to right and top to bottom */
@keyframes notificationSlideInTopLeft {
  from {
    opacity: 0;
    transform: translate(calc(-1 * var(--notification-slide-distance)), calc(-1 * var(--notification-slide-distance)));
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
}

/* Bottom Center: bottom to top */
@keyframes notificationSlideInBottomCenter {
  from {
    opacity: 0;
    transform: translateY(var(--notification-slide-distance));
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Bottom Right: right to left and bottom to top */
@keyframes notificationSlideInBottomRight {
  from {
    opacity: 0;
    transform: translate(var(--notification-slide-distance), var(--notification-slide-distance));
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
}

/* Bottom Left: left to right and bottom to top */
@keyframes notificationSlideInBottomLeft {
  from {
    opacity: 0;
    transform: translate(calc(-1 * var(--notification-slide-distance)), var(--notification-slide-distance));
  }
  to {
    opacity: 1;
    transform: translate(0, 0);
  }
}
</style>
