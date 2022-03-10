<template>
  <div class="vc-info-row">
    <VcRow>
      <VcCol>
        <VcLabel>
          <span>{{ label }}</span>
          <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
        </VcLabel>
      </VcCol>
      <VcCol size="2">
        <p class="vc-info-row__value" v-if="type === 'default'">{{ value }}</p>
        <VcLink v-else-if="type === 'email'">{{ value }}</VcLink>
      </VcCol>
    </VcRow>
  </div>
</template>

<script lang="ts" setup>
import VcLabel from "../vc-label/vc-label.vue";
import VcRow from "../vc-row/vc-row.vue";
import VcCol from "../vc-col/vc-col.vue";

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

<style lang="less" scoped>
.vc-info-row {
  margin-bottom: 11px;

  &:last-of-type {
    margin-bottom: 0;
  }

  &__value {
    margin: 0;
  }
}
</style>
