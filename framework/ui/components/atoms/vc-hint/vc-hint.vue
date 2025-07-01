<template>
  <div class="vc-hint">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
:root {
  --hint-color: var(--neutrals-500);
  --hint-font-size: 12px;
}

.vc-hint {
  color: var(--hint-color);
  font-size: var(--hint-font-size);
}
</style>
