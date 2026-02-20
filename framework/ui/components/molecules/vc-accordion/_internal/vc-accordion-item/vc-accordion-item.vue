<template>
  <div
    class="vc-accordion-item"
    :class="{
      'vc-accordion-item--expanded': isExpandedInternal,
      'vc-accordion-item--disabled': disabled,
      'vc-accordion-item--has-overflow': hasOverflow,
    }"
  >
    <button
      :id="triggerId"
      type="button"
      class="vc-accordion-item__header"
      :aria-expanded="isExpandedInternal ? 'true' : 'false'"
      :aria-controls="panelId"
      :disabled="disabled || !hasOverflow"
      @click="toggle"
    >
      <span class="vc-accordion-item__title">
        <slot name="title">
          {{ title }}
        </slot>
      </span>
      <VcIcon
        v-if="hasOverflow"
        class="vc-accordion-item__icon"
        :class="{ 'vc-accordion-item__icon--rotated': isExpandedInternal }"
        icon="lucide-chevron-down"
      />
    </button>

    <div
      :id="panelId"
      ref="contentWrapperRef"
      role="region"
      :aria-labelledby="triggerId"
      class="vc-accordion-item__content-wrapper"
      :class="{
        'vc-accordion-item__content-wrapper--faded': hasOverflow && !isExpandedInternal,
        'vc-accordion-item__content-wrapper--scrollable': isExpandedInternal && hasScrollInExpandedState,
      }"
      :style="contentWrapperStyle"
    >
      <div
        ref="contentRef"
        class="vc-accordion-item__content"
      >
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, useId } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { VcIcon } from "@ui/components/atoms/vc-icon";

export interface Props {
  title?: string;
  collapsedHeight?: number;
  maxExpandedHeight?: number;
  isExpanded?: boolean;
  disabled?: boolean;
}

export interface Emits {
  (event: "toggle", value: boolean): void;
  (event: "update:isExpanded", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  collapsedHeight: 0,
  isExpanded: false,
  disabled: false,
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "VcAccordionItem",
});

defineSlots<{
  default: (props?: any) => any;
  title: (props?: any) => any;
}>();

// Accessibility IDs
const uid = useId();
const triggerId = `vc-accordion-trigger-${uid}`;
const panelId = `vc-accordion-panel-${uid}`;

const contentRef = ref<HTMLElement>();
const contentWrapperRef = ref<HTMLElement>();
const contentHeight = ref(0);
const isExpandedInternal = ref(props.isExpanded);

const hasOverflow = computed(() => {
  return contentHeight.value > props.collapsedHeight;
});

const hasScrollInExpandedState = computed(() => {
  return props.maxExpandedHeight !== undefined && contentHeight.value > props.maxExpandedHeight;
});

const contentWrapperStyle = computed(() => {
  if (isExpandedInternal.value) {
    // If maxExpandedHeight is set and content exceeds it, limit to maxExpandedHeight
    if (props.maxExpandedHeight !== undefined && contentHeight.value > props.maxExpandedHeight) {
      return {
        maxHeight: `${props.maxExpandedHeight}px`,
      };
    }
    // Otherwise use full content height
    return {
      maxHeight: `${contentHeight.value}px`,
    };
  } else {
    return {
      maxHeight: props.collapsedHeight > 0 ? `${props.collapsedHeight}px` : "0px",
    };
  }
});

function toggle() {
  isExpandedInternal.value = !isExpandedInternal.value;
  emit("toggle", isExpandedInternal.value);
  emit("update:isExpanded", isExpandedInternal.value);
}

function updateContentHeight() {
  if (contentRef.value) {
    contentHeight.value = contentRef.value.scrollHeight;
  }
}

watch(
  () => props.isExpanded,
  (newValue) => {
    isExpandedInternal.value = newValue;
  },
);

useResizeObserver(contentRef, () => {
  updateContentHeight();
});
</script>

<style lang="scss">
:root {
  --accordion-item-border-color: var(--neutrals-200);
  --accordion-item-header-background: var(--additional-50);
  --accordion-item-header-background-hover: var(--neutrals-50);
  --accordion-item-header-color: var(--secondary-950);
  --accordion-item-content-background: var(--additional-50);
  --accordion-item-content-color: var(--secondary-950);
  --accordion-item-transition-duration: 300ms;
  --accordion-item-border-radius: 6px;
  --accordion-item-fade-height: 60px;
  --accordion-item-focus-ring-color: var(--primary-100);
}

.vc-accordion-item {
  position: relative;
  background: var(--accordion-item-header-background);
  border-radius: var(--accordion-item-border-radius);
  overflow: hidden;

  &__header {
    @apply tw-flex tw-items-center tw-justify-between tw-w-full;
    @apply tw-border-none tw-outline-none tw-select-none tw-text-left;
    padding: 12px 16px;
    background: var(--accordion-item-header-background);
    color: var(--accordion-item-header-color);
    transition: background-color var(--accordion-item-transition-duration) ease;
    border-radius: inherit;

    &:not(:disabled) {
      @apply tw-cursor-pointer;

      &:hover {
        background: var(--accordion-item-header-background-hover);
      }
    }

    &:disabled {
      @apply tw-cursor-not-allowed;
    }

    &:focus-visible {
      @apply tw-ring-[3px] tw-ring-[color:var(--accordion-item-focus-ring-color)] tw-outline-none;
    }
  }

  &__title {
    flex: 1;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
  }

  &__icon {
    margin-left: 12px;
    transition: transform var(--accordion-item-transition-duration) ease;
    flex-shrink: 0;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__content-wrapper {
    position: relative;
    overflow: hidden;
    transition: max-height var(--accordion-item-transition-duration) ease;

    &--faded::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--accordion-item-fade-height);
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, var(--accordion-item-content-background) 100%);
      pointer-events: none;
    }

    &--scrollable {
      overflow-y: auto;
      overflow-x: hidden;
    }
  }

  &__content {
    background: var(--accordion-item-content-background);
    color: var(--accordion-item-content-color);
    padding: 16px;
    font-size: 14px;
    line-height: 20px;
  }

  &--disabled {
    @apply tw-opacity-50;
  }
}
</style>
