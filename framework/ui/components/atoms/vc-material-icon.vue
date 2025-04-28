<template>
  <span
    :class="[iconClass, variant ? `vc-icon_${variant}` : '']"
    :style="computedStyle"
    >{{ normalizedIcon }}</span
  >
</template>
