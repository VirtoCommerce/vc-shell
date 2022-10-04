<template>
  <div class="vc-row flex-nowrap flex items-stretch">
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
