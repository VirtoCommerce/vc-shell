<template>
  <div role="rowgroup" class="vc-table-composition__header">
    <slot />
  </div>
</template>

<style lang="scss">
.vc-table-composition__header {
  @apply tw-flex tw-flex-col tw-flex-shrink-0 tw-border-y tw-border-solid tw-relative;
  border-color: var(--table-header-border-color);
  background-color: var(--table-header-bg);
}
</style>
