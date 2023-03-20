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
    <div
      v-if="title"
      class="vc-widget__title"
    >
      {{ title }}
    </div>
    <div
      v-if="value !== undefined"
      class="vc-widget__value"
    >
      {{ value }}
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  icon?: string;
  title?: string;
  value?: string | number;
  disabled?: boolean;
}

export interface Emits {
  (event: "click"): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

function onClick() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style lang="scss">
.vc-widget {
  @apply tw-flex tw-w-[100px] tw-overflow-hidden tw-p-5
    tw-box-border tw-flex-col tw-items-center
    tw-justify-center tw-border-b tw-border-solid
    tw-border-b-[#eaedf3] tw-cursor-pointer tw-bg-white
    hover:tw-bg-[#eff7fc];

  &_disabled {
    @apply tw-cursor-default hover:tw-bg-white;
  }

  &__icon {
    @apply tw-text-[#a9bfd2];
  }

  &_disabled &__icon {
    @apply tw-text-[#d2d4d7];
  }

  &__title {
    @apply tw-font-medium tw-text-sm tw-text-[#333333] tw-mt-3 tw-mb-1 tw-mx-0;
  }

  &_disabled &__title {
    @apply tw-text-[#d2d4d7];
  }

  &__value {
    @apply tw-font-medium tw-text-[22px] tw-text-[#43b0e6];
  }

  &_disabled &__value {
    @apply tw-text-[#d2d4d7];
  }
}
</style>
