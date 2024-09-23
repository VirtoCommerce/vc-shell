<template>
  <div
    :id="String(notificationId)"
    ref="nodeRef"
    class="vc-notification"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
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
      icon="fas fa-times"
      class="vc-notification__dismiss-icon"
      size="s"
      @click.stop="closeNotification"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { Content, NotificationType } from "./../../../../shared/components/notifications";
import { VcIcon } from "./../../";
import { Ref, onMounted, ref, toRefs, watch } from "vue";

export interface Props {
  content?: Content;
  notificationId?: number | string;
  updateId?: number | string;
  type?: NotificationType;
  timeout?: number | boolean;
  pauseOnHover?: boolean;
  closeNotification?: () => void;
  limit?: number;
}

const props = defineProps<Props>();

const types: Record<NotificationType, { icon: string; color: string }> = {
  default: { icon: "fas fa-info-circle", color: "var(--notification-info)" },
  success: { icon: "fas fa-check-circle", color: "var(--notification-success)" },
  error: { icon: "fas fa-exclamation-circle", color: "var(--notification-error)" },
  warning: { icon: "fas fa-exclamation-triangle", color: "var(--notification-warning)" },
};
const { timeout } = toRefs(props);

const timer = ref();

watch(
  timeout as Ref<number | boolean>,
  (newVal) => {
    if (newVal) {
      timer.value = Timer(() => {
        props.closeNotification?.();
      }, props.timeout as number);

      timer.value.start();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (props.timeout) {
    timer.value.start();
  }
});

function Timer(callback: (...args: unknown[]) => unknown, delay: number) {
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

  return {
    pause,
    resume,
    start,
  };
}

function onMouseEnter() {
  if (props.timeout) {
    timer.value.pause();
  }
}

function onMouseLeave() {
  if (props.timeout) {
    timer.value.resume();
  }
}
</script>

<style lang="scss">
:root {
  --notification-background: var(--additional-50);
  --notification-border-radius: var(--multivalue-border-radius);
  --notification-border-color: var(--base-border-color, var(--neutrals-200));
  --notification-dismiss-color: var(--secondary-500);
  --notification-content-color: var(--neutrals-600);

  --notification-warning: var(--warning-500);
  --notification-error: var(--danger-500);
  --notification-success: var(--success-500);
  --notification-info: var(--info-500);

  --notification-shadow-color: var(--neutrals-300);
  --notification-shadow: 2px 2px 11px rgb(from var(--notification-shadow-color) r g b / 40%);
}

.vc-notification {
  @apply tw-flex tw-items-center tw-box-border;
  @apply tw-bg-[color:var(--notification-background)] tw-border tw-border-solid tw-border-[color:var(--notification-border-color)];
  @apply tw-rounded-[var(--notification-border-radius)] tw-overflow-hidden tw-py-2 tw-px-4;
  @apply tw-max-w-[600px] tw-justify-between;
  @apply tw-shadow-[var(--notification-shadow)];
  pointer-events: all;

  &__content-wrapper {
    @apply tw-flex tw-items-center tw-flex-row;
  }

  &__icon {
    @apply tw-mr-2;
  }

  &__content {
    @apply tw-text-[color:var(--notification-content-color)] tw-whitespace-pre-line tw-overflow-auto;
    @apply tw-max-h-[100px];
  }

  &__dismiss-icon {
    @apply tw-cursor-pointer tw-text-[color:var(--notification-dismiss-color)] tw-ml-2;
  }

  .vc-app_mobile {
    @apply tw-max-w-[80%];
  }
}
</style>
