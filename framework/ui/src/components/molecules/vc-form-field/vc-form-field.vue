<template>
  <div class="vc-form-field">
    <vc-form-label class="vc-margin-bottom_s">{{ label }}</vc-form-label>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "VcFormField",

  props: {
    label: {
      type: String,
      default: "",
    },
  },
});
</script>
