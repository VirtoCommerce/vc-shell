<template>
  <div
    class="vc-input vc-flex vc-flex-align_stretch"
    :class="{ 'vc-input_clearable': clearable }"
  >
    <input
      v-model="internalValue"
      class="vc-input__field vc-flex-grow_1 vc-padding-left_m"
      :placeholder="placeholder"
    />
    <div
      v-if="clearable"
      class="
        vc-input__clear
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
import VcIcon from "../vc-icon/vc-icon.vue";

export default defineComponent({
  components: { VcIcon },

  props: {
    placeholder: {
      type: String,
    },

    value: {
      type: String,
    },

    clearable: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    return {
      internalValue: props.value,
    };
  },
});
</script>
