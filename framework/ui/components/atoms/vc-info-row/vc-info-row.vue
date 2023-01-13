<template>
  <div class="tw-mb-[11px] last-of-type:tw-mb-0">
    <VcRow>
      <VcCol>
        <VcLabel>
          <span>{{ label }}</span>
          <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
        </VcLabel>
      </VcCol>
      <VcCol size="2">
        <p class="tw-m-0" v-if="type === 'default'">{{ value }}</p>
        <VcLink v-else-if="type === 'email'">{{ value }}</VcLink>
      </VcCol>
    </VcRow>
  </div>
</template>

<script lang="ts" setup>
import { VcLabel, VcRow, VcCol } from "@/ui/components";

defineProps({
  label: {
    type: String,
    default: "",
  },

  value: {
    type: String,
    default: "",
  },

  tooltip: {
    type: String,
    default: "",
  },

  type: {
    type: String,
    default: "default",
  },
});
</script>
