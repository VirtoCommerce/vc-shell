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
   * A hint is secondary text by definition, so it lands on whatever surface its
   * host uses — including tinted ones. A table row highlighted by hover or
   * selection is painted --primary-100, which costs roughly 0.8 of contrast and
   * drops -500 below AA there: 3.94:1 in light, 4.23:1 in dark. Lightening that
   * tint cannot recover it, so the ink carries the margin instead. -600 clears AA
   * on both the page and the tint in both themes (7.81 / 6.49 and 5.76 / 5.16)
   * and still reads far lighter than body text (15.13).
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
