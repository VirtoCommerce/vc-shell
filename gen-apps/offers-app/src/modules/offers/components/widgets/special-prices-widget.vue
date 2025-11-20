<template>
  <VcWidget
    :title="$t('OFFERS.WIDGETS.SPECIAL_PRICES.TITLE')"
    :value="priceCount"
    :icon="'fas fa-tags'"
    :horizontal="false"
    :disabled="disabled"
    @click="openSpecialPricesList"
  >
    <template #default>
      <div class="tw-text-center tw-p-4">
        <div class="tw-text-3xl tw-font-bold tw-text-blue-600">
          {{ priceCount }}
        </div>
        <div class="tw-text-sm tw-text-gray-500 tw-mt-1">
          {{ $t('OFFERS.WIDGETS.SPECIAL_PRICES.DESCRIPTION') }}
        </div>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, markRaw } from "vue";
import { useBladeNavigation } from "@vc-shell/framework";

// Import the special prices list blade (to be created separately)
// import SpecialPricesList from "../../pages/special-prices-list.vue";

export interface Props {
  offerId: string;
  priceCount: number;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const { openBlade } = useBladeNavigation();

const hasSpecialPrices = computed(() => props.priceCount > 0);

function openSpecialPricesList() {
  if (props.disabled) return;

  // TODO: Implement special prices list blade
  console.log("Opening special prices list for offer:", props.offerId);

  // Uncomment when special-prices-list blade is created:
  // openBlade({
  //   blade: markRaw(SpecialPricesList),
  //   param: props.offerId,
  // });
}
</script>
