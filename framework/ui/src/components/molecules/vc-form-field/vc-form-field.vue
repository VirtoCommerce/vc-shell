<template>
  <div class="vc-form-field">
    <vc-label class="vc-margin-bottom_s">{{ label }}</vc-label>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";

export default defineComponent({
  name: "VcFormField",

  components: {
    VcLabel,
  },

  props: {
    label: {
      type: String,
      default: "",
    },
  },
});
</script>
