<template>
  <div class="vc-row vc-flex vc-flex-align_stretch">
    <slot></slot>
  </div>
</template>

<style lang="less">
.vc-row {
  flex-wrap: nowrap;

  .vc-app_mobile & {
    display: block;
  }
}
</style>
