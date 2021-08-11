<template>
  <div class="vc-tooltip">
    <slot></slot>
  </div>
</template>

<style lang="less">
:root {
  --tooltip-color: #a5a5a5;
}

.vc-tooltip {
  color: var(--tooltip-color);
  font-size: var(--font-size-xs);
}
</style>
