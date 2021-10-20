<template>
  <div class="vc-col" :style="{ flexGrow: size }">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    size: {
      type: String,
      default: "1",
    },
  },
});
</script>

<style lang="less">
:root {
  --col-margin: var(--margin-s);
}

.vc-col {
  display: flex;
  flex-direction: column;
  margin: var(--col-margin);
  overflow: hidden;
  min-width: 0;
  flex-basis: 0;

  .vc-app_mobile & {
    flex-grow: 1 !important;
  }
}
</style>
