<template>
  <div class="vc-label">
    <span class="vc-label__text"><slot></slot></span>
    <span v-if="required" class="vc-label__required vc-margin-left_xs">*</span>
    <span
      v-if="$slots['tooltip']"
      class="vc-label__tooltip-container vc-margin-left_xs"
    >
      <vc-icon
        class="vc-label__tooltip-icon"
        :icon="tooltipIcon"
        size="s"
        @mouseenter="tooltipVisible = true"
        @mouseleave="tooltipVisible = false"
      ></vc-icon>
      <span class="vc-label__tooltip-content" v-if="tooltipVisible">
        <slot name="tooltip"></slot>
      </span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import VcIcon from "../vc-icon/vc-icon.vue";

export default defineComponent({
  name: "VcLabel",

  components: {
    VcIcon,
  },

  props: {
    required: {
      type: Boolean,
      default: false,
    },

    tooltipIcon: {
      type: String,
      default: "fas fa-info-circle",
    },
  },

  setup() {
    const tooltipVisible = ref(false);

    return {
      tooltipVisible,
    };
  },
});
</script>

<style lang="less">
:root {
  --label-font-weight: var(--font-weight-bold);
  --label-required-color: #f14e4e;
  --label-tooltip-color: #d3e0ee;
}

.vc-label {
  display: flex;
  flex-wrap: nowrap;
  font-weight: var(--label-font-weight);

  &__required {
    color: var(--label-required-color);
  }

  &__tooltip {
    &-icon {
      color: var(--label-tooltip-color);
    }

    &-container {
      flex-grow: 1;
    }

    &-content {
      position: absolute;
      z-index: 10;
      background-color: #ffffff;
      border: 1px solid #eef0f2;
      box-shadow: 1px 1px 8px rgba(126, 142, 157, 0.25);
      border-radius: 3px;
      color: #8e9daa;
      font-weight: var(--font-weight-normal);
      padding: var(--padding-xs) var(--padding-s);
      margin-left: var(--margin-l);
    }
  }
}
</style>
