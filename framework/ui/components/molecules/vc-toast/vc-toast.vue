<template>
  <div
    :id="String(notificationId)"
    ref="nodeRef"
    class="vc-notification"
    :class="[`vc-notification--${position || 'top-center'}`, `vc-notification--${type || 'default'}`]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="vc-notification__type-indicator"></div>
    <div class="vc-notification__content-wrapper">
      <VcIcon
        :icon="types[type ?? 'default']?.icon"
        :style="{ color: types[type ?? 'default']?.color }"
        size="l"
        class="vc-notification__icon"
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
    <VcIcon
      icon="material-close"
      class="vc-notification__dismiss-icon"
      size="s"
      @click.stop="handleClose"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { Content, NotificationType, NotificationPosition } from "../../../../shared/components/notifications";
import { VcIcon } from "../..";
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
  default: { icon: "material-info", color: "var(--notification-info)" },
  success: { icon: "material-check_circle", color: "var(--notification-success)" },
  error: { icon: "material-error", color: "var(--notification-error)" },
  warning: { icon: "material-warning", color: "var(--notification-warning)" },
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
  --notification-border-radius: var(--multivalue-border-radius);
  --notification-border-color: var(--neutrals-200);
  --notification-dismiss-color: var(--secondary-500);
  --notification-content-color: var(--neutrals-600);

  /* Color indicators for types */
  --notification-warning: var(--warning-500);
  --notification-error: var(--danger-500);
  --notification-success: var(--success-500);
  --notification-info: var(--info-500);

  /* Effects */
  --notification-shadow-color: var(--neutrals-300);
  --notification-shadow: 2px 2px 11px rgb(from var(--notification-shadow-color) r g b / 40%);
  --notification-hover-shadow: 2px 2px 15px rgb(from var(--notification-shadow-color) r g b / 60%);

  /* Variables for animation */
  --notification-animation-duration: 300ms;
  --notification-animation-timing: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Spring animation */
  --notification-slide-distance: 30px;

  /* Sizes */
  --notification-indicator-width: 4px;
}

.vc-notification {
  @apply tw-flex tw-items-center tw-box-border tw-relative;
  @apply tw-bg-[color:var(--notification-background)] tw-border tw-border-solid tw-border-[color:var(--notification-border-color)];
  @apply tw-rounded-[var(--notification-border-radius)] tw-overflow-hidden tw-py-2 tw-px-4;
  @apply tw-max-w-[600px] tw-justify-between;
  @apply tw-shadow-[var(--notification-shadow)];
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

  /* Notification type indicator */
  &__type-indicator {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--notification-indicator-width);
    height: 100%;
    background-color: var(--notification-info);
    border-top-left-radius: var(--notification-border-radius);
    border-bottom-left-radius: var(--notification-border-radius);
  }

  /* Styles for different types */
  &--success .vc-notification__type-indicator {
    background-color: var(--notification-success);
  }

  &--error .vc-notification__type-indicator {
    background-color: var(--notification-error);
  }

  &--warning .vc-notification__type-indicator {
    background-color: var(--notification-warning);
  }

  &--default .vc-notification__type-indicator {
    background-color: var(--notification-info);
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
    @apply tw-flex tw-items-center tw-flex-row;
    padding-left: calc(var(--notification-indicator-width) + 8px);
  }

  &__icon {
    @apply tw-mr-2;
  }

  &__content {
    @apply tw-text-[color:var(--notification-content-color)] tw-whitespace-pre-line tw-overflow-auto tw-text-sm tw-leading-5;
    @apply tw-max-h-[100px];
  }

  &__dismiss-icon {
    @apply tw-cursor-pointer tw-text-[color:var(--notification-dismiss-color)] tw-ml-2;
    @apply tw-transition-all tw-duration-200 tw-ease-in-out;

    &:hover {
      @apply tw-text-[color:var(--secondary-600)];
      transform: rotate(90deg);
    }
  }

  .vc-app_mobile {
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
