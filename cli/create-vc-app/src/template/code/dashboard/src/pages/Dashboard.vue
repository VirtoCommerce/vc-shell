<template>
  <VcContainer class="dashboard tw-w-full tw-h-full tw-box-border">
    <div
      v-if="$isDesktop.value"
      class="dashboard-header"
    >
      {{ $t("SHELL.DASHBOARD.TITLE") }}
    </div>
  </VcContainer>
</template>

<script lang="ts" setup>
import { notification, useErrorHandler } from "@vc-shell/framework";
import { watch } from "vue";

const { error, reset } = useErrorHandler(true);

watch(error, (newVal) => {
  if (newVal) {
    notification.error(newVal, {
      timeout: 5000,
      onOpen() {
        reset();
      },
    });
  }
});
</script>

<style lang="scss">
.dashboard {
  --card-header-background: transparent;

  &-header {
    @apply tw-text-[25px] tw-text-[#333333] tw-my-3 tw-px-2;
  }
}
</style>
