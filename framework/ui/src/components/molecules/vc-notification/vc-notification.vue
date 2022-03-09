<template>
  <div
    class="vc-notification"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="vc-notification__content">
      <slot></slot>
    </div>
    <VcIcon
      icon="fas fa-times"
      class="vc-notification__dismiss"
      size="s"
      @click="onDismiss"
    ></VcIcon>
  </div>
</template>

<script lang="ts" setup>
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

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

<style lang="less">
:root {
  --notification-background: #ffffff;
  --notification-border: 1px solid #eef0f2;
  --notification-border-radius: 4px;
  --notification-box-shadow: 2px 2px 11px rgba(126, 142, 157, 0.4);
  --notification-dismiss-color: #83a3be;
  --notification-content-color: #8c9cab;
}

.vc-notification {
  display: flex;
  align-items: center;
  margin: var(--margin-xs) var(--margin-s) var(--margin-m) var(--margin-s);
  background: var(--notification-background);
  border: var(--notification-border);
  box-sizing: border-box;
  box-shadow: var(--notification-box-shadow);
  border-radius: var(--notification-border-radius);
  overflow: hidden;
  padding: var(--padding-s) var(--padding-l);
  max-width: 600px;
  pointer-events: all;

  .vc-app_mobile {
    max-width: 80%;
  }

  &__content {
    color: var(--notification-content-color);
  }

  &__dismiss {
    cursor: pointer;
    color: var(--notification-dismiss-color);
    margin-left: var(--margin-s);
  }
}
</style>
