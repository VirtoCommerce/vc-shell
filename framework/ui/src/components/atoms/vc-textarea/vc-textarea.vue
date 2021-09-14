<template>
  <div class="vc-textarea">
    <!-- Textarea label -->
    <vc-label v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </vc-label>

    <!-- Textarea field -->
    <div class="vc-textarea__field-wrapper vc-flex vc-flex-align_stretch">
      <textarea
        class="vc-textarea__field vc-padding-horizontal_m vc-padding-vertical_s"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcLabel from "..//vc-label/vc-label.vue";

export default defineComponent({
  name: "VcTextarea",

  components: {
    VcLabel,
  },

  props: {
    placeholder: {
      type: String,
      default: "",
    },

    modelValue: {
      type: String,
      default: undefined,
    },

    required: {
      type: Boolean,
      default: false,
    },

    label: {
      type: String,
      default: undefined,
    },

    tooltip: {
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
  &__field-wrapper {
    border: 1px solid var(--textarea-border-color);
    border-radius: var(--textarea-border-radius);
    box-sizing: border-box;
    background-color: var(--textarea-background-color);
  }

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
