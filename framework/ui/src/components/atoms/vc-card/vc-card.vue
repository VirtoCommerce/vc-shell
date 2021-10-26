<template>
  <div class="vc-card vc-flex vc-flex-grow_1 vc-flex-column">
    <div class="vc-card__header" v-if="header">
      <div class="vc-card__title">{{ header }}</div>
      <div v-if="$slots['actions']" class="vc-card__actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="vc-card__body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    header: {
      type: String,
      default: undefined,
    },
  },
});
</script>

<style lang="less">
:root {
  --card-background: #ffffff;
  --card-border: 1px solid #eef0f2;
  --card-border-radius: 6px;
  --card-box-shadow: 1px 1px 7px rgba(126, 142, 157, 0.15);
  --card-header-background: #f4f8fb;
  --card-header-color: #83a3be;
  --card-header-font-size: var(--font-size-m);
  --card-header-font-weight: var(--font-weight-bold);
  --card-header-padding: var(--padding-m) var(--padding-l);
}

.vc-card {
  background: var(--card-background);
  border: var(--card-border);
  box-sizing: border-box;
  box-shadow: var(--card-box-shadow);
  border-radius: var(--card-border-radius);

  &__header {
    background: var(--card-header-background);
    padding: var(--card-header-padding);
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
  }

  &__title {
    text-transform: uppercase;
    color: var(--card-header-color);
    font-size: var(--card-header-font-size);
    font-weight: var(--card-header-font-weight);
  }

  &__body {
    display: flex;
    flex-grow: 1;
    box-sizing: border-box;
  }
}
</style>
