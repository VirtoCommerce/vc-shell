<template>
  <VcContainer class="dashboard tw-w-full tw-h-full tw-box-border">
    <div class="dashboard-header" v-if="$isDesktop.value">
      {{ $t("SHELL.DASHBOARD.TITLE") }}
    </div>
  </VcContainer>
</template>

<script lang="ts" setup>
</script>

<style lang="scss">
.dashboard {
  --card-header-background: transparent;

  &-header {
    @apply tw-text-[25px] tw-text-[#333333] tw-my-3 tw-px-2;
  }
}
</style>
