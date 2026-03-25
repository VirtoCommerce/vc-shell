<template>
  <div class="vc-table-composition__footer">
    <slot />
  </div>
</template>

<style lang="scss">
.vc-table-composition__footer {
  @apply tw-flex tw-items-center tw-justify-between tw-gap-4 tw-py-4 tw-px-4 tw-flex-shrink-0;
  background-color: var(--table-footer-bg);
  border-top: 1px solid var(--table-footer-border-color);
}
</style>
