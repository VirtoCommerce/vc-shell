<template>
  <div class="vc-select">
    <!-- Select label -->
    <div v-if="label" class="vc-font-weight_bold vc-margin-bottom_s">
      {{ label }}
      <span v-if="required" class="vc-select__required">*</span>
    </div>

    <!-- Select field -->
    <div class="vc-select__field-wrapper vc-flex vc-flex-align_stretch">
      <select
        class="vc-select__field vc-padding-horizontal_m"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        required
      >
        <option value="" disabled selected hidden>{{ placeholder }}</option>
        <option v-for="(item, i) in options" :key="i" :value="item.value">
          {{ item.title }}
        </option>
      </select>

      <!-- Select chevron -->
      <div
        class="
          vc-select__chevron
          vc-padding-horizontal_m
          vc-flex
          vc-flex-align_center
        "
      >
        <vc-icon size="s" icon="fas fa-chevron-down"></vc-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcSelect",

  props: {
    modelValue: {
      type: String,
      default: undefined,
    },

    placeholder: {
      type: String,
      default: "Select...",
    },

    options: {
      type: Array,
      default: () => [],
    },

    required: {
      type: Boolean,
      default: false,
    },

    label: {
      type: String,
      default: undefined,
    },
  },

  emits: ["update:modelValue"],
});
</script>

<style lang="less">
:root {
  --select-height: 38px;
  --select-border-radius: 3px;
  --select-border-color: #d3dbe9;
  --select-background-color: #ffffff;
  --select-placeholder-color: #a5a5a5;
  --select-chevron-color: #43b0e6;
  --select-chevron-color-hover: #319ed4;
  --select-required-color: #f14e4e;
}

.vc-select {
  &__required {
    color: var(--input-required-color);
  }

  &__field-wrapper {
    position: relative;
    border: 1px solid var(--select-border-color);
    border-radius: var(--select-border-radius);
    background-color: var(--select-background-color);
  }

  &__field {
    width: 100%;
    appearance: none;
    border: none;
    outline: none;
    height: var(--select-height);
    box-sizing: border-box;

    &:invalid {
      color: var(--select-placeholder-color);
    }
  }

  &__chevron {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    cursor: pointer;
    color: var(--select-chevron-color);

    &:hover {
      color: var(--select-chevron-color-hover);
    }
  }
}
</style>
