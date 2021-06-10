<template>
  <div
    class="vc-input vc-flex vc-flex-align_stretch"
    :class="{ 'vc-input_clearable': clearable }"
  >
    <input
      class="vc-input__field vc-flex-grow_1 vc-padding-left_m"
      :placeholder="placeholder"
      v-model="internalValue"
    />
    <div
      class="
        vc-input__clear
        vc-padding-horizontal_m
        vc-flex
        vc-flex-align_center
      "
      v-if="clearable"
      @click="internalValue = ''"
    >
      <vc-icon icon="times"></vc-icon>
    </div>
  </div>
</template>

<script>
  export default {
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

    data() {
      return {
        internalValue: this.value,
      };
    },
  };
</script>
