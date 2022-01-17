<template>
  <vc-popup @close="$emit('close')" variant="small" :title="title">
    <div class="vc-padding_l">
      <slot name="description">Are you sure you want to proceed?</slot>
    </div>
    <vc-row>
      <vc-col>
        <vc-button @click="$emit('close')">No</vc-button>
      </vc-col>
      <vc-col>
        <vc-button>Yes</vc-button>
      </vc-col>
    </vc-row>
  </vc-popup>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "import-confirmation-popup",
  props: {
    title: {
      type: String,
      default: "",
    },
  },
});
</script>

<style lang="less" scoped></style>
