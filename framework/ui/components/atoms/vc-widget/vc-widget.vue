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
        'tw-w-[120px] tw-h-[120px]': isExpanded,
        'vc-widget_disabled': disabled,
        'tw-w-[50px] tw-h-[50px]': !isExpanded,
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
:root {
  --widget-bg-color: var(--additional-50);
  --widget-border-color: var(--secondary-200);
  --widget-bg-hover-color: var(--primary-50);
  --widget-icon-color: var(--secondary-500);
  --widget-icon-disabled-color: var(--neutrals-300);
  --widget-title-color: var(--neutrals-900);
  --widget-title-disabled-color: var(--neutrals-300);
  --widget-value-color: var(--primary-400);
  --widget-value-disabled-color: var(--neutrals-300);
}

.vc-widget {
  @apply tw-flex tw-overflow-hidden tw-box-border tw-flex-col tw-items-center tw-justify-center tw-border-b tw-border-solid tw-cursor-pointer;

  @apply tw-bg-[color:var(--widget-bg-color)] tw-border-b-[color:var(--widget-border-color)];

  &:hover {
    @apply tw-bg-[color:var(--widget-bg-hover-color)];
  }

  &_disabled {
    @apply tw-cursor-default tw-bg-[color:var(--widget-bg-color)];

    &:hover {
      @apply tw-bg-[color:var(--widget-bg-color)];
    }
  }

  &__icon {
    @apply tw-text-[color:var(--widget-icon-color)];
  }

  &_disabled &__icon {
    @apply tw-text-[color:var(--widget-icon-disabled-color)];
  }

  &__title {
    @apply tw-font-medium tw-text-sm tw-text-[color:var(--widget-title-color)] tw-mt-2 tw-mx-0 tw-text-center;
  }

  &_disabled &__title {
    @apply tw-text-[color:var(--widget-title-disabled-color)];
  }

  &__value {
    @apply tw-font-medium tw-text-[22px] tw-text-[color:var(--widget-value-color)];
  }

  &_disabled &__value {
    @apply tw-text-[color:var(--widget-value-disabled-color)];
  }
}
</style>
