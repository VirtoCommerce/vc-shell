<template>
  <div
    class="vc-form-input vc-flex vc-flex-align_stretch"
    :class="{ 'vc-form-input_clearable': clearable }"
  >
    <input
      class="vc-form-input__field vc-flex-grow_1 vc-padding-left_m"
      :placeholder="placeholder"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div
      v-if="clearable"
      class="
        vc-form-input__clear
        vc-padding-horizontal_m
        vc-flex
        vc-flex-align_center
      "
      @click="$emit('update:modelValue', '')"
    >
      <vc-icon size="s" icon="fas fa-times"></vc-icon>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";

export default defineComponent({
  name: "VcFormInput",

  components: { VcIcon },

  props: {
    placeholder: {
      type: String,
      default: "",
    },

    modelValue: {
      type: String,
      default: "",
    },

    clearable: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: "text",
    },
  },

  emits: ["update:modelValue"],
});
</script>

<style lang="less">
:root {
  --form-input-height: 38px;
  --form-input-border-radius: 3px;
  --form-input-border-color: #d3dbe9;
  --form-input-background-color: #ffffff;
  --form-input-placeholder-color: #a5a5a5;
  --form-input-clear-color: #43b0e6;
  --form-input-clear-color-hover: #319ed4;
}

.vc-form-input {
  border: 1px solid var(--form-input-border-color);
  border-radius: var(--form-input-border-radius);
  background-color: var(--form-input-background-color);

  &__field {
    border: none;
    outline: none;
    height: var(--form-input-height);
    box-sizing: border-box;
    -webkit-placeholder-color: var(--form-input-placeholder-color);
  }

  &__clear {
    cursor: pointer;
    color: var(--form-input-clear-color);

    &:hover {
      color: var(--form-input-clear-color-hover);
    }
  }
}
</style>
