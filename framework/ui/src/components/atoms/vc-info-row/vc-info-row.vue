<template>
  <div class="vc-info-row">
    <vc-row>
      <vc-col>
        <vc-label class="vc-margin-bottom_s vc-info-row__label">
          <span>{{ label }}</span>
          <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
        </vc-label>
      </vc-col>
      <vc-col size="2">
        <p class="vc-info-row__value">{{ value }}</p>
      </vc-col>
    </vc-row>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcLabel from "../vc-label/vc-label.vue";
import VcRow from "../vc-row/vc-row.vue";
import VcCol from "../vc-col/vc-col.vue";

export default defineComponent({
  name: "vc-info-row",
  components: {
    VcLabel,
    VcRow,
    VcCol,
  },
  props: {
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
  },
});
</script>

<style lang="less" scoped>
.vc-info-row {
  margin-bottom: 11px;

  &__value {
    margin: 0;
  }
}
</style>
