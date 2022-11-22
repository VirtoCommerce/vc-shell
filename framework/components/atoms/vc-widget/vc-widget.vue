<template>
  <div
    class="vc-widget"
    :class="{ 'vc-widget_disabled': disabled }"
    @click="onClick"
  >
    <VcIcon
      v-if="icon"
      class="vc-widget__icon"
      :icon="icon"
      size="xxl"
    ></VcIcon>
    <div v-if="title" class="vc-widget__title">{{ title }}</div>
    <div v-if="value !== undefined" class="vc-widget__value">{{ value }}</div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String,
    default: undefined,
  },

  title: {
    type: String,
    default: undefined,
  },

  value: {
    type: [String, Number],
    default: undefined,
  },

  disabled: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["click"]);

function onClick() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style lang="scss">
.vc-widget {
  @apply flex w-[100px] overflow-hidden p-5
    box-border flex-col items-center
    justify-center border-b border-solid
    border-b-[#eaedf3] cursor-pointer bg-white
    hover:bg-[#eff7fc];

  &_disabled {
    @apply cursor-default hover:bg-white;
  }

  &__icon {
    @apply text-[#a9bfd2];
  }

  &_disabled &__icon {
    @apply text-[#d2d4d7];
  }

  &__title {
    @apply font-medium text-sm text-[#333333] mt-3 mb-1 mx-0;
  }

  &_disabled &__title {
    @apply text-[#d2d4d7];
  }

  &__value {
    @apply font-medium text-[22px] text-[#43b0e6];
  }

  &_disabled &__value {
    @apply text-[#d2d4d7];
  }
}
</style>
