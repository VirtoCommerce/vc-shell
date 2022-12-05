<template>
  <div
    class="vc-notification flex items-center mt-1 mb-3 mx-2 bg-[color:var(--notification-background)] border border-solid border-[color:#eef0f2] box-border shadow-[2px_2px_11px_rgba(126,142,157,0.4)] rounded-[var(--notification-border-radius)] overflow-hidden py-2 px-4 max-w-[600px]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="text-[color:var(--notification-content-color)]">
      <slot></slot>
    </div>
    <VcIcon
      icon="fas fa-times"
      class="cursor-pointer text-[color:var(--notification-dismiss-color)] ml-2"
      size="s"
      @click="onDismiss"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@components";

const props = defineProps({
  variant: {
    type: String,
    default: "info",
  },

  timeout: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["dismiss", "expired"]);

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
    @apply max-w-[80%];
  }
}
</style>
