<template>
  <div
    class="vc-banner"
    :class="[
      `vc-banner--${normalizedVariant}`,
      {
        'vc-banner--title-only': isTitleOnly,
        'vc-banner--collapsed': isCollapsed,
      },
    ]"
    :role="normalizedVariant === 'danger' || normalizedVariant === 'warning' ? 'alert' : 'region'"
    :aria-label="normalizedVariant === 'danger' ? 'Error' : normalizedVariant === 'warning' ? 'Warning' : 'Information'"
  >
    <VcIcon
      v-if="icon"
      :icon="icon"
      :size="iconSize"
      :variant="iconVariant"
      class="vc-banner__icon"
      aria-hidden="true"
    />
    <div class="vc-banner__body">
      <div
        v-if="hasTitle"
        class="vc-banner__title"
      >
        <slot name="title"></slot>
      </div>
      <div
        v-if="hasContent"
        class="vc-banner__content-wrapper"
        :style="wrapperStyle"
      >
        <div
          ref="contentRef"
          class="vc-banner__content"
        >
          <slot name="default"></slot>
        </div>
      </div>
      <div
        v-if="showTrigger"
        class="vc-banner__trigger"
      >
        <slot
          name="trigger"
          :is-expanded="isExpanded"
          :toggle="toggle"
        >
          <button
            type="button"
            class="vc-banner__trigger-button"
            :aria-expanded="isExpanded"
            @click="toggle"
          >
            {{ isExpanded ? $t("COMPONENTS.ATOMS.VC_BANNER.SHOW_LESS") : $t("COMPONENTS.ATOMS.VC_BANNER.SHOW_MORE") }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, useSlots } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useCollapsible } from "@ui/composables/useCollapsible";

export type CurrentBannerVariant = "info" | "warning" | "danger" | "success";
/**
 * @deprecated Use current variants: "info" | "warning" | "danger" | "success".
 */
export type LegacyBannerVariant = "light-danger" | "info-dark" | "primary";
export type BannerVariant = CurrentBannerVariant | LegacyBannerVariant;

export interface Props {
  /**
   * @deprecated Legacy variants ("light-danger", "info-dark", "primary") are supported for backward compatibility
   * and mapped to modern variants ("danger", "info", "info").
   */
  variant?: BannerVariant;
  icon?: string;
  iconSize?: InstanceType<typeof VcIcon>["$props"]["size"];
  iconVariant?: InstanceType<typeof VcIcon>["$props"]["variant"];
  collapsedHeight?: number;
}

defineSlots<{
  title: (props: any) => any;
  default: (props: any) => any;
  trigger: (props: { isExpanded: boolean; toggle: () => void }) => any;
}>();

const props = withDefaults(defineProps<Props>(), {
  variant: "info",
  iconSize: "l",
  collapsedHeight: 100,
});

const slots = useSlots();
const { contentRef, isExpanded, hasOverflow, wrapperStyle, toggle } = useCollapsible({
  collapsedHeight: props.collapsedHeight,
});

function normalizeVariant(variant: BannerVariant): CurrentBannerVariant {
  switch (variant) {
    case "light-danger":
      return "danger";
    case "info-dark":
    case "primary":
      return "info";
    default:
      return variant;
  }
}

const normalizedVariant = computed<CurrentBannerVariant>(() => normalizeVariant(props.variant));
const hasTitle = computed(() => Boolean(slots.title));
const hasContent = computed(() => Boolean(slots.default));
const isTitleOnly = computed(() => hasTitle.value && !hasContent.value);
const showTrigger = computed(() => hasContent.value && hasOverflow.value);
const isCollapsed = computed(() => showTrigger.value && !isExpanded.value);

if (import.meta.env?.DEV) {
  if (props.variant === "light-danger" || props.variant === "info-dark" || props.variant === "primary") {
    console.warn(
      `[VcBanner] variant "${props.variant}" is deprecated. Use "${normalizeVariant(props.variant)}" instead.`,
    );
  }
}
</script>

<style lang="scss">
@use "sass:map";

$banner-variants: (
  info: (
    bg: var(--neutrals-50),
    border: var(--info-100),
    accent: var(--info-500),
  ),
  warning: (
    bg: var(--neutrals-50),
    border: var(--warning-100),
    accent: var(--warning-500),
  ),
  danger: (
    bg: var(--neutrals-50),
    border: var(--danger-100),
    accent: var(--danger-500),
  ),
  success: (
    bg: var(--neutrals-50),
    border: var(--success-100),
    accent: var(--success-500),
  ),
);

.vc-banner {
  @apply tw-relative tw-flex tw-items-start tw-gap-3 tw-overflow-hidden tw-rounded-md tw-border tw-border-solid tw-py-3 tw-pr-3 tw-pl-4;
  --vc-banner-accent: var(--info-500);

  &::before {
    content: "";
    @apply tw-absolute tw-left-0 tw-top-0 tw-bottom-0;
    width: 3px;
    background-color: var(--vc-banner-accent);
  }

  @each $name, $colors in $banner-variants {
    &.vc-banner--#{$name} {
      --vc-banner-accent: #{map.get($colors, accent)};
      background-color: #{map.get($colors, bg)};
      border-color: #{map.get($colors, border)};
    }
  }

  &.vc-banner--title-only {
    @apply tw-items-center;

    .vc-banner__icon {
      @apply tw-mt-0;
    }
  }

  &__icon {
    @apply tw-mt-0.5 tw-shrink-0;
    color: var(--vc-banner-accent);
  }

  &__body {
    @apply tw-flex tw-flex-col tw-min-w-0 tw-flex-1;
  }

  &__title {
    @apply tw-text-sm tw-font-medium tw-leading-5;
    color: var(--neutrals-900);
  }

  &__content-wrapper {
    @apply tw-relative tw-overflow-hidden;
    transition: max-height 0.28s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: max-height;

    &::after {
      content: "";
      @apply tw-pointer-events-none tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-8;
      background: linear-gradient(to bottom, rgb(250 250 250 / 0), var(--neutrals-50));
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &__content {
    @apply tw-text-sm tw-leading-5;
    color: var(--neutrals-700);
  }

  &__title + &__content-wrapper {
    @apply tw-mt-0.5;
  }

  &.vc-banner--collapsed {
    .vc-banner__content-wrapper::after {
      opacity: 1;
    }
  }

  &__trigger {
    @apply tw-mt-1;
  }

  &__trigger-button {
    @apply tw-inline-flex tw-cursor-pointer tw-items-center tw-border-0 tw-bg-transparent tw-p-0 tw-text-sm tw-font-medium tw-leading-5;
    color: var(--vc-banner-accent);
    transition: color 0.15s ease;

    &:hover {
      @apply tw-underline;
    }

    &:focus-visible {
      outline: 2px solid var(--vc-banner-accent);
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
}
</style>
