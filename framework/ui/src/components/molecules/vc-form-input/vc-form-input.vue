<template>
  <div
    class="vc-form-input vc-flex vc-flex-align_stretch"
    :class="{ 'vc-form-input_clearable': clearable }"
  >
    <input
      v-model="internalValue"
      class="vc-form-input__field vc-flex-grow_1 vc-padding-left_m"
      :placeholder="placeholder"
      :type="type"
    />
    <div
      v-if="clearable"
      class="
        vc-form-input__clear
        vc-padding-horizontal_m
        vc-flex
        vc-flex-align_center
      "
      @click="internalValue = ''"
    >
      <vc-icon icon="times"></vc-icon>
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

    value: {
      type: String,
      default: "",
    },

    clearable: {
      type: Boolean,
      default: false,
    },

    type: {
      type: String,
      default: "text,",
    },
  },

  setup(props) {
    return {
      internalValue: props.value,
    };
  },
});
</script>

<style lang="less">
.vc-form-input {
  border: 1px solid #eaedf3;
  height: 36px;
  box-sizing: border-box;
  background-color: #ffffff;

  &__field {
    border: none;
    outline: none;
    -webkit-placeholder-color: #b8b8b8;
  }

  &__clear {
    cursor: pointer;
    color: #43b0e6;

    &:hover {
      color: #319ed4;
    }
  }
}
</style>
