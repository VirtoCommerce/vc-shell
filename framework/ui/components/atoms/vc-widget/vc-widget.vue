<template>
  <VcTooltip
    :placement="$isDesktop.value ? 'bottom' : 'top'"
    :offset="{
      crossAxis: 0,
      mainAxis: -10,
    }"
  >
    <div
      class="vc-widget tw-relative tw-shrink-0 tw-py-4 tw-px-2"
      :class="{
        'tw-w-[120px]': isExpanded,
        'vc-widget_disabled': disabled,
        'tw-w-[50px]': !isExpanded,
        'tw-w-[100px]': $isMobile.value,
      }"
      @click="onClick"
    >
      <VcBadge
        :content="truncateCount"
        :size="isExpanded ? 'm' : 's'"
      >
        <div class="tw-flex tw-flex-col tw-items-center tw-justify-center">
          <VcIcon
            v-if="icon"
            class="vc-widget__icon"
            :icon="icon"
            :size="isExpanded ? 'xxl' : 'l'"
          ></VcIcon>
        </div>
      </VcBadge>
      <div class="tw-w-full">
        <div
          v-if="title && isExpanded"
          class="vc-widget__title tw-line-clamp-2"
        >
          {{ title }}
        </div>
      </div>
    </div>
    <template
      v-if="$isDesktop.value"
      #tooltip
    >
      {{ title }}
    </template>
  </VcTooltip>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { VcIcon } from "./../vc-icon";
export interface Props {
  icon?: string;
  title?: string;
  value?: string | number;
  disabled?: boolean;
  isExpanded?: boolean;
}

export interface Emits {
  (event: "click"): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const truncateCount = computed(() => {
  if (
    (typeof props.value === "string" && parseInt(props.value) > 99) ||
    (typeof props.value === "number" && props.value > 99)
  ) {
    return "99+";
  } else {
    return props.value;
  }
});

function onClick() {
  if (!props.disabled) {
    emit("click");
  }
}
</script>

<style lang="scss">
.vc-widget {
  @apply tw-flex  tw-overflow-hidden
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
    @apply tw-font-medium tw-text-sm tw-text-[#333333] tw-mt-2 tw-mx-0 tw-text-center;
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
