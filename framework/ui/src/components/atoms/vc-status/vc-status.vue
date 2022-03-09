<template>
  <div
    class="vc-status"
    :class="[
      `vc-status_${variant}`,
      { 'vc-status_outline': outline },
      { 'vc-status_extended': extend },
    ]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcStatus",
});
</script>

<script lang="ts" setup>
defineProps({
  variant: {
    type: String,
    default: "info",
    enum: ["info", "warning", "danger", "success", "light-danger"],
  },

  outline: {
    type: Boolean,
    default: true,
  },

  extend: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="less">
:root {
  --status-padding: 4px 14px;
  --status-padding-extended: 12px;

  --status-font-size: var(--font-size-m);
  --status-font-weight: var(--font-weight-normal);

  --status-border-radius: 2px;
  --status-border-radius-extended: 4px;
  --status-border-width: 1px;
}

.vc-status {
  display: inline-block;
  border-radius: var(--status-border-radius);
  padding: var(--status-padding);
  font-size: var(--status-font-size);
  font-weight: var(--status-font-weight);
  white-space: nowrap;

  &_info {
    color: white;
    border: 1px solid #bdd1df;
    background-color: #bdd1df;

    &.vc-status_outline {
      color: #bdd1df;
      border: 1px solid #bdd1df;
      background-color: white;
    }
  }

  &_warning {
    color: white;
    border: 1px solid #f89406;
    background-color: #f89406;

    &.vc-status_outline {
      color: #f89406;
      border: 1px solid #f89406;
      background-color: white;
    }
  }

  &_danger {
    color: white;
    border: 1px solid #ef796f;
    background-color: #ef796f;

    &.vc-status_outline {
      color: #ef796f;
      border: 1px solid #ef796f;
      background-color: white;
    }
  }

  &_success {
    color: white;
    border: 1px solid #87b563;
    background-color: #87b563;

    &.vc-status_outline {
      color: #87b563;
      border: 1px solid #87b563;
      background-color: white;
    }
  }

  &_light-danger {
    color: #333333;
    border: 1px solid #ffefef;
    background-color: #ffefef;

    &.vc-status_outline {
      border: 1px solid #ffefef;
      background-color: white;
    }
  }

  &.vc-status_extended {
    white-space: normal;
    padding: var(--status-padding-extended);
    border-radius: var(--status-border-radius-extended);
  }
}
</style>
