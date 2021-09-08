<template>
  <div class="vc-table-search">
    <vc-input
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
      :placeholder="placeholder"
      :clearable="true"
    ></vc-input>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcTableSearch",

  props: {
    placeholder: {
      type: String,
      default: "Search...",
    },

    modelValue: {
      type: String,
      default: "",
    },
  },

  emits: ["update:modelValue"],
});
</script>
