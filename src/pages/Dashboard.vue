<template>
  <VcContainer
    class="dashboard tw-w-full tw-h-full tw-box-border tw-pt-6"
    no-padding
  >
    <VcRow>
      <VcCol :size="10">
        <VcRow>
          <!-- Latest orders block -->
          <VcCol
            :size="3"
            class="tw-p-2"
          >
            <component :is="modules.Orders.components.OrdersDashboardCard"></component>
          </VcCol>

          <!-- Rating & Reviews block -->
          <VcCol
            v-if="$dynamicModules?.Rating && $hasAccess(UserPermissions.ManageSellerReviews)"
            :size="4"
            class="tw-p-2"
          >
            <component :is="$dynamicModules?.Rating?.components?.RatingDashboardCard"></component>
          </VcCol>
        </VcRow>

        <VcRow>
          <!-- Latest products block -->
          <VcCol
            :size="3"
            class="tw-p-2"
          >
            <component :is="modules.Products.components.ProductsDashboardCard"></component>
          </VcCol>

          <!-- Offers block -->
          <VcCol
            :size="4"
            class="tw-p-2"
          >
            <component :is="modules.Offers.components.OffersDashboardCard"></component>
          </VcCol>
        </VcRow>
      </VcCol>
    </VcRow>
  </VcContainer>
</template>

<script lang="ts" setup>
import { notification, useErrorHandler } from "@vc-shell/framework";
import { watch } from "vue";
import { default as modules, UserPermissions } from "@vcmp-vendor-portal/modules";

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
:root {
  --dashboard-header-text-color: var(--neutrals-950);
  --dashboard-counters-title-color: var(--secondary-500);
  --dashboard-counters-value-color: var(--primary-500);
  --dashboard-review-header-color: var(--primary-500);
  --dashboard-separator-color: var(--base-border-color, var(--secondary-200));
}

.dashboard {
  &-header {
    @apply tw-text-[25px] tw-text-[color:var(--dashboard-header-text-color)] tw-mb-3 tw-pt-[22px] tw-px-2;
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
      @apply tw-text-[14px] tw-font-medium tw-text-[color:var(--dashboard-counters-title-color)] tw-text-center tw-mt-2;
    }

    &__value {
      @apply tw-text-[26px] tw-font-medium tw-text-[color:var(--dashboard-counters-value-color)] tw-text-center;
    }
  }

  &-review-header {
    @apply tw-text-[color:var(--dashboard-review-header-color)] tw-font-medium tw-text-lg tw-my-1;
  }
}

.vc-separator {
  @apply tw-h-px tw-bg-[--dashboard-separator-color];
}
</style>
