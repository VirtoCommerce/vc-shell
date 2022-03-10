<template>
  <div class="vc-hint">
    <slot></slot>
  </div>
</template>

<style lang="less">
:root {
  --hint-color: #a5a5a5;
}

.vc-hint {
  color: var(--hint-color);
  font-size: var(--font-size-xs);
}
</style>
