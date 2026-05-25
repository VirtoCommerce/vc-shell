<template>
  <VcBlade
    :title="$t('ORDERS.PAGES.DETAILS.TITLE')"
    :loading="loading"
  >
    <VcForm class="tw-space-y-4">
      <VcInput
        v-model="item.number"
        :label="$t('ORDERS.PAGES.DETAILS.FIELDS.NUMBER')"
      />
      <VcInput
        v-model="item.status"
        :label="$t('ORDERS.PAGES.DETAILS.FIELDS.STATUS')"
      />
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useBlade } from "@vc-shell/framework";
import { VcBlade, VcForm, VcInput } from "@vc-shell/framework/ui";
import { useOrderDetails } from "../composables";

defineBlade({ name: "OrderDetails" });

const { param } = useBlade();
const { item, loading, load } = useOrderDetails();

onMounted(() => {
  if (param.value) load(String(param.value));
});
</script>
