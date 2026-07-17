<template>
  <div
    v-if="x >= 0"
    class="vc-scheduler__now"
    :style="{ transform: `translateX(${x}px)` }"
  >
    <span class="vc-scheduler__now-cap" />
  </div>
</template>

<script setup lang="ts">
defineProps<{ x: number }>();
</script>

<style lang="scss">
.vc-scheduler__now {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--accent-500);
  z-index: var(--z-local-above);
  pointer-events: none;
}
.vc-scheduler__now-cap {
  position: absolute;
  top: -3px;
  left: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-500);
}
</style>
