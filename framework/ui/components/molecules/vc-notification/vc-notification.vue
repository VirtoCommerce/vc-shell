<template>
  <div
    ref="nodeRef"
    class="vc-notification tw-flex tw-items-center tw-mt-1 tw-mb-3 tw-mx-2 tw-bg-[color:var(--notification-background)] tw-border tw-border-solid tw-border-[color:#eef0f2] tw-box-border tw-shadow-[2px_2px_11px_rgba(126,142,157,0.4)] tw-rounded-[var(--notification-border-radius)] tw-overflow-hidden tw-py-2 tw-px-4 tw-max-w-[600px] tw-justify-between"
    :id="String(notificationId)"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <VcIcon
      :icon="types[type]?.icon"
      :style="{ color: types[type]?.color }"
      size="l"
      class="tw-mr-2"
    ></VcIcon>
    <div class="tw-text-[color:var(--notification-content-color)]">
      {{ content }}
    </div>
    <VcIcon
      icon="fas fa-times"
      class="tw-cursor-pointer tw-text-[color:var(--notification-dismiss-color)] tw-ml-2"
      size="s"
      @click.stop="closeNotification"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { NotificationType } from "./../../../../shared/components/notifications";
import { VcIcon } from "./../../";
import { onMounted, ref, toRefs, watchEffect } from "vue";

export interface Props {
  content?: string;
  notificationId?: number | string;
  updateId?: number | string;
  type?: NotificationType;
  timeout?: number | boolean;
  pauseOnHover?: boolean;
  closeNotification?: () => void;
  limit?: number;
}

const props = defineProps<Props>();

const types = {
  default: { icon: "fas fa-info-circle", color: "var(--notification-info)" },
  success: { icon: "fas fa-check-circle", color: "var(--notification-success)" },
  error: { icon: "fas fa-exclamation-circle", color: "var(--notification-error)" },
  warning: { icon: "fas fa-exclamation-triangle", color: "var(--notification-warning)" },
};
const { timeout } = toRefs(props);

const timer = ref();

watchEffect(() => {
  if (timeout) {
    timer.value = Timer(() => {
      props.closeNotification();
    }, props.timeout as number);
  }
});

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
  --notification-background: #ffffff;
  --notification-border-radius: 4px;
  --notification-box-shadow: 2px 2px 11px rgba(126, 142, 157, 0.4);
  --notification-dismiss-color: #83a3be;
  --notification-content-color: #8c9cab;

  --notification-warning: #f89406;
  --notification-error: #ef796f;
  --notification-success: #87b563;
  --notification-info: #bdd1df;
}

.vc-notification {
  pointer-events: all;

  .vc-app_mobile {
    @apply tw-max-w-[80%];
  }
}
</style>
