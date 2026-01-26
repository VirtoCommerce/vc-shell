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
    @click="onClick"
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
import { VcIcon } from "./../vc-icon";
import { useWidgets } from "../../../../core/composables";
import { createLogger } from "../../../../core/utilities";

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
  if (!props.disabled) {
    // Use the actualWidgetId from attrs
    if (actualWidgetId.value && instance?.parent?.exposed) {
      widgetService.setActiveWidget({
        exposed: instance.parent.exposed,
        widgetId: actualWidgetId.value,
      });
    } else if (!actualWidgetId.value) {
      logger.warn("widgetId is missing from attrs. Widget activation might not work as expected.");
    }
    emit("click");
  }
}

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
  @apply tw-relative tw-shrink-0 tw-px-2 tw-w-max;
  @apply tw-flex tw-overflow-visible tw-box-border tw-flex-col tw-items-center tw-justify-center tw-cursor-pointer;
  @apply tw-bg-[color:var(--widget-bg-color)];
  @apply tw-transition-colors tw-duration-200;

  &--horizontal {
    @apply tw-flex-row tw-gap-2;

    .vc-widget__content {
      @apply tw-ml-1;
    }

    .vc-widget__title {
      @apply tw-mt-0 tw-text-left tw-whitespace-nowrap;
    }
  }

  &:hover {
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
    @apply tw-text-[color:var(--widget-icon-color)];
  }

  &__content {
    @apply tw-w-full;
  }

  &__title {
    @apply tw-font-medium tw-text-xs tw-text-[color:var(--widget-title-color)] tw-mt-1 tw-mx-0 tw-text-center tw-line-clamp-2;
  }

  &--disabled {
    @apply tw-cursor-default tw-bg-[color:var(--widget-bg-color)];

    .vc-widget__icon {
      @apply tw-text-[color:var(--widget-icon-disabled-color)];
    }

    .vc-widget__title {
      @apply tw-text-[color:var(--widget-title-disabled-color)];
    }

    &:hover {
      @apply tw-bg-[color:var(--widget-bg-color)];

      .vc-widget__icon {
        @apply tw-text-[color:var(--widget-icon-disabled-color)];
      }

      .vc-widget__title {
        @apply tw-text-[color:var(--widget-title-disabled-color)];
      }
    }
  }
}
</style>
