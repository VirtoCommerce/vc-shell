<template>
  <VcContainer
    class="dashboard tw-w-full tw-h-full tw-box-border"
    no-padding
  >
    <div
      v-if="$isDesktop.value"
      class="dashboard-header"
    >
      {{ $t("SHELL.DASHBOARD.TITLE") }}
    </div>
    <dic class="tw-flex tw-flex-wrap">
      <component
        :is="card"
        v-for="(card, i) in dashboardCardComponents"
        :key="`card_${i}`"
      ></component>
    </dic>
  </VcContainer>
</template>

<script lang="ts" setup>
import { notification, useErrorHandler } from "@vc-shell/framework";
import { watch } from "vue";
import { dashboardCardComponents } from "@vcmp-vendor-portal/modules";

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
    @apply tw-text-[25px] tw-text-[#333333] tw-mb-3 tw-pt-[22px] tw-px-2;
  }

  .vc-row {
    .vc-app_mobile & {
      @apply tw-flex;
    }
  }

  &-counters {
    @apply tw-grow-0 tw-basis-[280px] #{!important};

    .vc-app_mobile & {
      @apply tw-grow tw-basis-0 #{!important};
    }

    &__title {
      @apply tw-text-[14px] tw-font-medium tw-text-[#a9bfd2]
        tw-text-center tw-mt-2;
    }

    &__value {
      @apply tw-text-[26px] tw-font-medium tw-text-[#319ed4] tw-text-center;
    }
  }

  &-review-header {
    @apply tw-text-[#319ed4] tw-font-medium tw-text-lg tw-my-1;
  }
}

.vc-separator {
  @apply tw-h-px tw-bg-[#e3e7ec];
}
</style>
