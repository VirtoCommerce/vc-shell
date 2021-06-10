<template>
  <div
    class="vc-button"
    :class="[
      `vc-button_${variant}`,
      { 'vc-button_disabled': disabled, 'vc-button_small': small },
    ]"
  >
    <i v-if="icon" class="vc-button__icon"></i>
    <div v-if="title" class="vc-button__title">{{ title }}</div>
  </div>
</template>

<script>
  import { defineComponent } from "@vue/composition-api";

  export default defineComponent({
    props: {
      icon: {
        type: String,
      },

      title: {
        type: String,
      },

      variant: {
        type: String,
        enum: ["primary", "secondary", "special"],
        default: "primary",
      },

      disabled: {
        type: Boolean,
      },

      small: {
        type: Boolean,
        default: false,
      },
    },
  });
</script>
