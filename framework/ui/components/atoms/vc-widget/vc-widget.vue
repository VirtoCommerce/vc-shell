<template>
  <VcTooltip
    :placement="$isDesktop.value ? 'bottom' : 'top'"
    :offset="{
      crossAxis: 0,
      mainAxis: -10,
    }"
    :delay="1000"
  >
    <div
      class="vc-widget"
      :class="[
        { 'vc-widget--expanded': isExpanded },
        { 'vc-widget--collapsed': !isExpanded },
        { 'vc-widget--mobile': $isMobile.value },
        { 'vc-widget--disabled': disabled },
      ]"
      @click="onClick"
    >
      <VcBadge
        :content="truncateCount"
        size="s"
      >
        <div class="vc-widget__icon-container">
          <VcIcon
            v-if="icon"
            class="vc-widget__icon"
            :icon="icon"
            size="m"
          ></VcIcon>
        </div>
      </VcBadge>
      <div class="vc-widget__content">
        <div
          v-if="title"
          class="vc-widget__title"
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
:root {
  --widget-bg-color: transparent;
  --widget-bg-hover-color: transparent;
  --widget-icon-color: var(--neutrals-700);
  --widget-icon-hover-color: var(--primary-600);
  --widget-icon-disabled-color: var(--neutrals-400);
  --widget-title-color: var(--neutrals-600);
  --widget-title-hover-color: var(--primary-600);
  --widget-title-disabled-color: var(--neutrals-400);
}

.vc-widget {
  @apply tw-relative tw-shrink-0 tw-px-2;
  @apply tw-flex tw-overflow-hidden tw-box-border tw-flex-col tw-items-center tw-justify-center tw-cursor-pointer;
  @apply tw-bg-[color:var(--widget-bg-color)];
  @apply tw-transition-colors tw-duration-200;

  &:hover {
    @apply tw-bg-[color:var(--widget-bg-hover-color)];

    .vc-widget__title {
      @apply tw-text-[color:var(--widget-title-hover-color)];
    }

    .vc-widget__icon {
      @apply tw-text-[color:var(--widget-icon-hover-color)];
    }
  }

  // &--expanded {
  //   @apply tw-w-32 tw-h-32;
  // }

  // &--collapsed {
  //   @apply tw-w-12 tw-h-12;
  // }

  &--mobile {
    @apply tw-w-28;
    @apply tw-border-none #{!important};
  }

  &__icon-container {
    @apply tw-flex tw-flex-col tw-items-center tw-justify-center;
  }

  &__icon {
    @apply tw-text-[color:var(--widget-icon-color)];
  }

  &--disabled &__icon {
    @apply tw-text-[color:var(--widget-icon-disabled-color)];
  }

  &__title {
    @apply tw-font-medium tw-text-xs tw-text-[color:var(--widget-title-color)] tw-mt-1 tw-mx-0 tw-text-center tw-line-clamp-2;
  }

  &--disabled &__title {
    @apply tw-text-[color:var(--widget-title-disabled-color)];
  }

  &__content {
    @apply tw-w-full;
  }

  &--disabled {
    @apply tw-cursor-default tw-bg-[color:var(--widget-bg-color)];

    &:hover {
      @apply tw-bg-[color:var(--widget-bg-color)];
    }
  }
}
</style>
