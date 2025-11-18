<template>
  <VcWidget
    :title="$t('OFFERS.WIDGETS.SPECIAL_PRICES.TITLE')"
    :count="priceCount"
    icon="fas fa-dollar-sign"
    variant="info"
    @click="$emit('click')"
  >
    <template #subtitle>
      {{ $t('OFFERS.WIDGETS.SPECIAL_PRICES.SUBTITLE', { count: priceCount }) }}
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Props {
  offerId: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "click"): void;
}>();

const priceCount = ref(0);

onMounted(async () => {
  // Simulate loading special prices count
  await new Promise(resolve => setTimeout(resolve, 300));
  priceCount.value = Math.floor(Math.random() * 10) + 1; // Mock count
});
</script>
