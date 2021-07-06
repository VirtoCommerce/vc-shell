<template>
  <i
    :class="`vc-icon vc-icon_${size} fa${
      family.toLowerCase()[0]
    } fa-${icon.toLowerCase()}`"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    icon: {
      type: String,
      default: "square-full",
    },

    family: {
      type: String,
      default: "solid",
    },

    size: {
      type: String,
      default: "m",
    },
  },
});
</script>
