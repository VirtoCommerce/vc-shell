<template>
  <div
    :id="id"
    class="vc-hint"
    :class="{
      'vc-hint--error': error,
    }"
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
  /**
   * -600 rather than the palette's -500 "secondary text".
   *
   * A hint lands on whatever surface its host uses, including tinted ones. A hovered or
   * selected table row is painted --primary-100, which costs about 0.8 of contrast and
   * drops -500 below AA there (3.94:1 light, 4.23:1 dark). -600 clears AA on page and tint
   * in both themes (7.81 / 6.49 and 5.76 / 5.16) and still reads lighter than body text.
   */
  --hint-color: var(--neutrals-600);
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
