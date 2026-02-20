<template>
  <div
    class="vc-widget"
    :data-widget-id="actualWidgetId"
    :data-widget-name="title"
    :class="[
      { 'vc-widget--expanded': isExpanded },
      { 'vc-widget--collapsed': !isExpanded },
      { 'vc-widget--disabled': disabled },
      { 'vc-widget--horizontal': horizontal },
    ]"
    role="button"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled || undefined"
    :aria-label="title || undefined"
    @click="onClick"
    @keydown.enter.prevent="onClick"
    @keydown.space.prevent="onClick"
  >
    <VcBadge
      :content="truncateCount"
      custom-position
      top="-6px"
      size="s"
    >
      <div class="vc-widget__icon-container">
        <VcIcon
          v-if="icon"
          class="vc-widget__icon"
          :icon="icon"
          size="m"
          aria-hidden="true"
        ></VcIcon>
      </div>
    </VcBadge>
    <div
      v-if="title"
      class="vc-widget__content"
    >
      <div class="vc-widget__title">
        {{ title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, useAttrs } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useWidgets } from "@core/composables";
import { createLogger } from "@core/utilities";
import { formatBadgeCount } from "@shared/utilities/formatBadgeCount";

const logger = createLogger("vc-widget");

export interface Props {
  icon?: string;
  title?: string;
  value?: string | number;
  disabled?: boolean;
  isExpanded?: boolean;
  horizontal?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: "click"): void;
}>();

const instance = getCurrentInstance();
const attrs = useAttrs();
const widgetService = useWidgets();

// Get widgetId from attributes passed by the parent container
const actualWidgetId = computed(() => (attrs.widgetId || attrs["widget-id"]) as string | undefined);

function onClick() {
  if (props.disabled) return;

  if (actualWidgetId.value) {
    // Pass exposed if available (legacy path), omit if not (trigger path)
    widgetService.setActiveWidget({
      widgetId: actualWidgetId.value,
      exposed: instance?.parent?.exposed ?? null,
    });
  } else {
    logger.warn("widgetId is missing from attrs. Widget activation might not work as expected.");
  }

  emit("click");
}

const truncateCount = computed(() => formatBadgeCount(props.value));
</script>

<style lang="scss">
:root {
  --widget-bg-color: transparent;
  --widget-bg-hover-color: var(--neutrals-50);
  --widget-icon-color: var(--neutrals-700);
  --widget-icon-hover-color: var(--primary-600);
  --widget-icon-disabled-color: var(--neutrals-400);
  --widget-title-color: var(--neutrals-600);
  --widget-title-hover-color: var(--primary-600);
  --widget-title-disabled-color: var(--neutrals-400);
  --widget-border-radius: 8px;
  --widget-focus-ring-color: var(--primary-300);
}

.vc-widget {
  @apply tw-relative tw-shrink-0 tw-px-2 tw-py-1.5 tw-w-max;
  @apply tw-flex tw-overflow-visible tw-box-border tw-flex-col tw-items-center tw-justify-center tw-cursor-pointer;
  @apply tw-bg-[color:var(--widget-bg-color)];
  @apply tw-transition-all tw-duration-150;
  @apply tw-rounded-[var(--widget-border-radius)];

  &:focus-visible {
    @apply tw-outline-none tw-ring-2 tw-ring-offset-1 tw-ring-[color:var(--widget-focus-ring-color)];
  }

  &--horizontal {
    @apply tw-flex-row tw-gap-2;

    .vc-widget__content {
      @apply tw-ml-1;
    }

    .vc-widget__title {
      @apply tw-mt-0 tw-text-left tw-whitespace-nowrap;
    }
  }

  &:hover:not(.vc-widget--disabled) {
    @apply tw-bg-[color:var(--widget-bg-hover-color)];

    .vc-widget__title {
      @apply tw-text-[color:var(--widget-title-hover-color)];
    }

    .vc-widget__icon {
      @apply tw-text-[color:var(--widget-icon-hover-color)];
    }
  }

  &__icon-container {
    @apply tw-flex tw-flex-col tw-items-center tw-justify-center;
  }

  &__icon {
    @apply tw-text-[color:var(--widget-icon-color)] tw-transition-colors tw-duration-150;
  }

  &__content {
    @apply tw-w-full;
  }

  &__title {
    @apply tw-font-medium tw-text-xs tw-text-[color:var(--widget-title-color)] tw-mt-1 tw-mx-0 tw-text-center tw-line-clamp-2
      tw-transition-colors tw-duration-150;
  }

  &--disabled {
    @apply tw-cursor-default tw-opacity-50;

    .vc-widget__icon {
      @apply tw-text-[color:var(--widget-icon-disabled-color)];
    }

    .vc-widget__title {
      @apply tw-text-[color:var(--widget-title-disabled-color)];
    }
  }
}
</style>
