<template>
  <span class="vc-shortcut-kbd">
    <template
      v-for="(part, index) in parts"
      :key="index"
    >
      <span
        v-if="separated && index > 0"
        class="vc-shortcut-kbd__plus"
        >+</span
      >
      <kbd class="vc-shortcut-kbd__key">{{ part }}</kbd>
    </template>
  </span>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    parts: string[];
    /** Show a `+` between chips (Windows/Linux). macOS glyphs sit flush. */
    separated?: boolean;
  }>(),
  { separated: false },
);
</script>

<style lang="scss">
.vc-shortcut-kbd {
  @apply tw-inline-flex tw-items-center tw-gap-1;

  &__plus {
    @apply tw-text-[10px] tw-text-[color:var(--neutrals-300)];
  }

  &__key {
    @apply tw-inline-flex tw-items-center tw-justify-center;
    @apply tw-min-w-[20px] tw-h-[18px] tw-px-1;
    @apply tw-rounded-sm tw-leading-none;
    @apply tw-text-[10px] tw-font-medium;
    @apply tw-text-[color:var(--neutrals-500)];
    @apply tw-bg-[color:var(--neutrals-100)];
    @apply tw-border tw-border-solid tw-border-[color:var(--neutrals-200)];
    box-shadow: 0 1px 0 var(--neutrals-200);
  }
}
</style>
