<template>
  <div
    class="vc-notification tw-flex tw-items-center tw-mt-1 tw-mb-3 tw-mx-2 tw-bg-[color:var(--notification-background)] tw-border tw-border-solid tw-border-[color:#eef0f2] tw-box-border tw-shadow-[2px_2px_11px_rgba(126,142,157,0.4)] tw-rounded-[var(--notification-border-radius)] tw-overflow-hidden tw-py-2 tw-px-4 tw-max-w-[600px]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="tw-text-[color:var(--notification-content-color)]">
      <slot></slot>
    </div>
    <VcIcon
      icon="fas fa-times"
      class="tw-cursor-pointer tw-text-[color:var(--notification-dismiss-color)] tw-ml-2"
      size="s"
      @click="onDismiss"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "./../../../components";

export interface Props {
  timeout?: number;
}

export interface Emits {
  (event: "dismiss"): void;
  (event: "expired"): void;
}

const props = withDefaults(defineProps<Props>(), {
  timeout: 0,
});

const emit = defineEmits<Emits>();

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

const timer = Timer(() => emit("expired"), props.timeout);
if (props.timeout) {
  timer.start();
}

function onMouseEnter() {
  timer.pause();
}

function onMouseLeave() {
  if (props.timeout) {
    timer.resume();
  }
}

function onDismiss() {
  timer.pause();
  emit("dismiss");
}
</script>

<style lang="scss">
:root {
  --notification-background: #ffffff;
  --notification-border-radius: 4px;
  --notification-box-shadow: 2px 2px 11px rgba(126, 142, 157, 0.4);
  --notification-dismiss-color: #83a3be;
  --notification-content-color: #8c9cab;
}

.vc-notification {
  pointer-events: all;

  .vc-app_mobile {
    @apply tw-max-w-[80%];
  }
}
</style>
