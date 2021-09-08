<template>
  <div class="vc-font-weight_bold">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcLabel",
});
</script>
