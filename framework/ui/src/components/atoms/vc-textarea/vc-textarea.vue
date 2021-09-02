<template>
  <div class="vc-textarea">
    <textarea
      class="vc-textarea__field vc-padding-horizontal_m vc-padding-vertical_s"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "VcTextarea",

  props: {
    placeholder: {
      type: String,
      default: "",
    },

    modelValue: {
      type: String,
      default: undefined,
    },
  },

  emits: ["update:modelValue"],
});
</script>

<style lang="less">
:root {
  --textarea-height: 120px;
  --textarea-border-color: #d3dbe9;
  --textarea-border-radius: 3px;
  --textarea-background-color: #ffffff;
  --textarea-placeholder-color: #a5a5a5;
}

.vc-textarea {
  display: flex;
  border: 1px solid var(--textarea-border-color);
  border-radius: var(--textarea-border-radius);
  box-sizing: border-box;
  background-color: var(--textarea-background-color);

  &__field {
    width: 100%;
    resize: vertical;
    box-sizing: border-box;
    border: none;
    outline: none;
    min-height: var(--textarea-height);
    -webkit-placeholder-color: var(--textarea-placeholder-color);
  }
}
</style>
