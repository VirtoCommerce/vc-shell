<template>
  <div
    class="vc-bubble"
    :class="[`vc-bubble_${variant}`, { 'vc-bubble_outline': outline }]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcBubble",

  props: {
    variant: {
      type: String,
      default: "info",
      enum: ["info", "warning", "danger", "success"],
    },

    outline: {
      type: Boolean,
      default: true,
    },
  },
});
</script>

<style lang="less">
:root {
  --bubble-padding: 4px 14px;

  --bubble-font-size: var(--font-size-m);
  --bubble-font-weight: var(--font-weight-normal);

  --bubble-border-radius: 2px;
  --bubble-border-width: 1px;
}

.vc-bubble {
  display: inline-block;
  border-radius: var(--bubble-border-radius);
  padding: var(--bubble-padding);
  font-size: var(--bubble-font-size);
  font-weight: var(--bubble-font-weight);
  white-space: nowrap;

  &_info {
    color: white;
    border: 1px solid #bdd1df;
    background-color: #bdd1df;

    &.vc-bubble_outline {
      color: #bdd1df;
      border: 1px solid #bdd1df;
      background-color: white;
    }
  }

  &_warning {
    color: white;
    border: 1px solid #f89406;
    background-color: #f89406;

    &.vc-bubble_outline {
      color: #f89406;
      border: 1px solid #f89406;
      background-color: white;
    }
  }

  &_danger {
    color: white;
    border: 1px solid #ef796f;
    background-color: #ef796f;

    &.vc-bubble_outline {
      color: #ef796f;
      border: 1px solid #ef796f;
      background-color: white;
    }
  }

  &_success {
    color: white;
    border: 1px solid #87b563;
    background-color: #87b563;

    &.vc-bubble_outline {
      color: #87b563;
      border: 1px solid #87b563;
      background-color: white;
    }
  }
}
</style>
