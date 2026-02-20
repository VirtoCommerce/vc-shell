<template>
  <div
    class="vc-hint"
    :class="{
      'vc-hint--error': error,
    }"
    :id="id"
    :role="error ? 'alert' : undefined"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  /** Optional id for linking with aria-describedby on inputs */
  id?: string;
  /** Shows hint in error state */
  error?: boolean;
}

defineProps<Props>();
</script>

<style lang="scss">
:root {
  --hint-color: var(--neutrals-500);
  --hint-error-color: var(--danger-500);
  --hint-font-size: 12px;
  --hint-line-height: 1.4;
}

.vc-hint {
  color: var(--hint-color);
  font-size: var(--hint-font-size);
  line-height: var(--hint-line-height);

  &--error {
    color: var(--hint-error-color);
  }
}
</style>
