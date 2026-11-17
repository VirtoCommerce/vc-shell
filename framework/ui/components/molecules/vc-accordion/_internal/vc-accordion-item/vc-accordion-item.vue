<template>
  <div
    class="vc-accordion-item"
    :class="{
      'vc-accordion-item--expanded': isExpandedInternal,
      'vc-accordion-item--disabled': disabled,
      'vc-accordion-item--has-overflow': hasOverflow,
    }"
  >
    <DefineHeader>
      <button
        :id="triggerId"
        type="button"
        class="vc-accordion-item__header"
        :aria-expanded="isExpandedInternal ? 'true' : 'false'"
        :aria-controls="panelId"
        :disabled="disabled || !expandable"
        @click="toggle"
      >
        <VcIcon
          v-if="expandable && iconPosition === 'start'"
          class="vc-accordion-item__icon vc-accordion-item__icon--start"
          :class="{ 'vc-accordion-item__icon--rotated': isExpandedInternal }"
          icon="lucide-chevron-down"
        />
        <span class="vc-accordion-item__title">
          <slot name="title">
            {{ title }}
          </slot>
        </span>
        <VcIcon
          v-if="expandable && iconPosition !== 'start'"
          class="vc-accordion-item__icon"
          :class="{ 'vc-accordion-item__icon--rotated': isExpandedInternal }"
          icon="lucide-chevron-down"
        />
      </button>
    </DefineHeader>

    <!-- actions sit next to the header button, never inside it -->
    <div
      v-if="$slots.actions"
      class="vc-accordion-item__head"
    >
      <ReuseHeader />
      <div class="vc-accordion-item__actions">
        <slot name="actions" />
      </div>
    </div>
    <ReuseHeader v-else />

    <div
      :id="panelId"
      ref="wrapperRef"
      role="region"
      :aria-labelledby="triggerId"
      class="vc-accordion-item__content-wrapper"
      :class="{
        'vc-accordion-item__content-wrapper--faded': hasOverflow && !isExpandedInternal,
        'vc-accordion-item__content-wrapper--scrollable': isExpandedInternal && hasScrollInExpandedState,
      }"
      :style="contentWrapperStyle"
      :inert="(lazy && !isExpandedInternal) || undefined"
      @transitionend="onTransitionEnd"
    >
      <div
        ref="contentRef"
        class="vc-accordion-item__content"
      >
        <slot v-if="contentMounted"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, useId } from "vue";
import { createReusableTemplate } from "@vueuse/core";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useCollapsible } from "@ui/composables/useCollapsible";

export interface Props {
  title?: string;
  collapsedHeight?: number;
  maxExpandedHeight?: number;
  isExpanded?: boolean;
  disabled?: boolean;
  /**
   * Mount the content only while the item is open: it mounts on open and unmounts once the close animation
   * ends. The item counts as expandable while its content is not there to measure, and the closed panel is inert.
   */
  lazy?: boolean;
  /** Chevron after the title (`end`) or before it (`start`, pointing to the text while closed, down while open) */
  iconPosition?: "start" | "end";
}

export interface Emits {
  (event: "toggle", value: boolean): void;
  (event: "update:isExpanded", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  collapsedHeight: 0,
  isExpanded: false,
  disabled: false,
  lazy: false,
  iconPosition: "end",
});

const emit = defineEmits<Emits>();

defineOptions({
  name: "VcAccordionItem",
});

defineSlots<{
  default: (props?: any) => any;
  title: (props?: any) => any;
  /** Controls next to the header button (outside it), e.g. a remove button */
  actions: (props?: any) => any;
}>();

const [DefineHeader, ReuseHeader] = createReusableTemplate();

// Accessibility IDs
const uid = useId();
const triggerId = `vc-accordion-trigger-${uid}`;
const panelId = `vc-accordion-panel-${uid}`;

const {
  contentRef,
  isExpanded: isExpandedInternal,
  hasOverflow,
  hasScroll: hasScrollInExpandedState,
  wrapperStyle: contentWrapperStyle,
} = useCollapsible({
  collapsedHeight: props.collapsedHeight,
  maxExpandedHeight: props.maxExpandedHeight,
  expanded: props.isExpanded,
});

// A lazy item has nothing to measure while closed, so it can always open
const expandable = computed(() => props.lazy || hasOverflow.value);

const wrapperRef = ref<HTMLElement>();
const contentMounted = ref(!props.lazy || isExpandedInternal.value);

watch(isExpandedInternal, (open) => {
  if (!props.lazy) return;
  if (open) {
    contentMounted.value = true;
    return;
  }
  // without a close animation there is no transitionend to wait for
  const el = wrapperRef.value;
  if (!el || !parseFloat(getComputedStyle(el).transitionDuration)) contentMounted.value = false;
});

function onTransitionEnd(e: TransitionEvent) {
  if (props.lazy && e.target === e.currentTarget && !isExpandedInternal.value) contentMounted.value = false;
}

function toggle() {
  isExpandedInternal.value = !isExpandedInternal.value;
  emit("toggle", isExpandedInternal.value);
  emit("update:isExpanded", isExpandedInternal.value);
}

watch(
  () => props.isExpanded,
  (newValue) => {
    isExpandedInternal.value = newValue;
  },
);
</script>

<style lang="scss">
:root {
  // Border & shape
  --accordion-item-border-color: var(--neutrals-200);
  --accordion-item-border-radius: 6px;

  // Header
  --accordion-item-header-padding: 12px 16px;
  --accordion-item-header-background: var(--additional-50);
  --accordion-item-header-background-hover: var(--neutrals-50);
  --accordion-item-header-color: var(--secondary-950);
  --accordion-item-header-font-size: 14px;
  --accordion-item-header-font-weight: 500;
  --accordion-item-header-line-height: 20px;
  --accordion-item-header-text-transform: none;
  --accordion-item-header-gap: 0;

  // Icon
  --accordion-item-icon-margin-left: 12px;
  --accordion-item-icon-size: 20px;
  --accordion-item-icon-color: currentColor;

  // Content
  --accordion-item-content-padding: 16px;
  --accordion-item-content-background: var(--additional-50);
  --accordion-item-content-color: var(--secondary-950);
  --accordion-item-content-font-size: 14px;
  --accordion-item-content-line-height: 20px;

  // Animation
  --accordion-item-transition-duration: 300ms;

  // Fade overlay
  --accordion-item-fade-height: 60px;

  // Focus
  --accordion-item-focus-ring-color: var(--primary-100);
}

.vc-accordion-item {
  position: relative;
  background: var(--accordion-item-header-background);
  border-radius: var(--accordion-item-border-radius);
  overflow: hidden;

  &__header {
    @apply tw-flex tw-items-center tw-justify-between tw-w-full;
    @apply tw-border-none tw-outline-none tw-select-none tw-text-start;
    padding: var(--accordion-item-header-padding);
    gap: var(--accordion-item-header-gap);
    background: var(--accordion-item-header-background);
    color: var(--accordion-item-header-color);
    font-size: var(--accordion-item-header-font-size);
    font-weight: var(--accordion-item-header-font-weight);
    line-height: var(--accordion-item-header-line-height);
    text-transform: var(--accordion-item-header-text-transform);
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
    font-weight: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  &__icon {
    margin-inline-start: var(--accordion-item-icon-margin-left);
    color: var(--accordion-item-icon-color);
    transition: transform var(--accordion-item-transition-duration) ease;
    flex-shrink: 0;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  // a chevron before the title: it points to the text while closed and down while open
  &__icon--start {
    margin-inline: 0 var(--accordion-item-icon-margin-left);
    transform: rotate(-90deg);

    [dir="rtl"] & {
      transform: rotate(90deg);
    }

    &.vc-accordion-item__icon--rotated {
      transform: none;
    }
  }

  &__head {
    @apply tw-flex tw-items-center;

    > .vc-accordion-item__header {
      @apply tw-flex-1 tw-min-w-0;
    }
  }

  &__actions {
    @apply tw-flex tw-items-center tw-shrink-0;
  }

  &__content-wrapper {
    position: relative;
    overflow: hidden;
    transition: max-height var(--accordion-item-transition-duration) ease;

    &--faded::after {
      content: "";
      position: absolute;
      bottom: 0;
      inset-inline-start: 0;
      inset-inline-end: 0;
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
    padding: var(--accordion-item-content-padding);
    font-size: var(--accordion-item-content-font-size);
    line-height: var(--accordion-item-content-line-height);
  }

  &--disabled {
    @apply tw-opacity-50;
  }
}
</style>
