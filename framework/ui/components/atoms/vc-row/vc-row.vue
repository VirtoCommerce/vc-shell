<template>
  <div class="vc-row tw-flex-nowrap tw-flex tw-items-stretch">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.vc-row {
  .vc-app_mobile & {
    display: block;
  }
}
</style>
