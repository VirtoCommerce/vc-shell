<template>
  <div
    class="vc-banner"
    :class="[`vc-banner_${variant}`]"
    :role="variant === 'danger' || variant === 'warning' ? 'alert' : 'region'"
    :aria-label="variant === 'danger' ? 'Error' : variant === 'warning' ? 'Warning' : 'Information'"
  >
    <div class="vc-banner__container">
      <VcIcon
        v-if="icon"
        :icon="icon"
        :size="iconSize"
        :variant="iconVariant"
        class="vc-banner__icon"
        aria-hidden="true"
      />
      <div class="vc-banner__wrapper">
        <div class="vc-banner__title">
          <slot name="title"></slot>
        </div>
        <div
          ref="contentRef"
          class="vc-banner__content"
          :class="[
            {
              'vc-banner__content--collapsed': !isExpanded,
              'vc-banner__content--expanded': isExpanded,
            },
          ]"
        >
          <slot name="default"></slot>
        </div>
        <div v-if="hasOverflow">
          <slot
            name="trigger"
            :is-expanded="isExpanded"
            :toggle="toggle"
          >
            <VcButton
              class="tw-self-end tw-mt-1"
              text
              size="sm"
              :aria-expanded="isExpanded"
              @click="toggle"
            >
              {{ isExpanded ? $t("COMPONENTS.ATOMS.VC_BANNER.SHOW_LESS") : $t("COMPONENTS.ATOMS.VC_BANNER.SHOW_MORE") }}
            </VcButton>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { VcIcon } from "..";

// TODO: Add to docs

type StatusVariant = "info" | "warning" | "danger" | "success" | "light-danger" | "info-dark" | "primary";

export interface Props {
  variant?: StatusVariant;
  icon?: string;
  iconSize?: InstanceType<typeof VcIcon>["$props"]["size"];
  iconVariant?: InstanceType<typeof VcIcon>["$props"]["variant"];
}

defineSlots<{
  title: (props: any) => any;
  default: (props: any) => any;
  trigger: (props: any) => any;
}>();

const props = withDefaults(defineProps<Props>(), {
  variant: "info",
  iconSize: "xxl",
});

/** Maximum height in pixels before content is collapsed */
const COLLAPSED_MAX_HEIGHT = 100;

const contentRef = ref<HTMLDivElement>();
const isExpanded = ref(false);
const hasOverflow = ref(false);

const toggle = () => {
  isExpanded.value = !isExpanded.value;
};

const checkOverflow = () => {
  if (contentRef.value) {
    hasOverflow.value = contentRef.value.scrollHeight > COLLAPSED_MAX_HEIGHT;
  }
};

onMounted(() => {
  checkOverflow();
});
</script>

<style lang="scss">
:root {
  --banner-text-color: var(--neutrals-700);
  --banner-border-radius: 6px;
  --banner-padding: 12px;
}
$variants: info, warning, danger, success, light-danger, info-dark, primary;

.vc-banner {
  @apply tw-whitespace-normal tw-justify-start tw-max-w-full tw-border-none;
  border-radius: var(--banner-border-radius);
  padding: var(--banner-padding);

  @each $variant in $variants {
    &.vc-banner_#{$variant} {
      background-color: var(--status-#{$variant}-bg-color);
      color: var(--status-#{$variant}-color);
      border-left: 3px solid var(--status-#{$variant}-main-color);

      .vc-banner__content {
        color: var(--status-#{$variant}-color);
      }
    }
  }

  &__wrapper {
    @apply tw-flex tw-flex-col tw-text-start tw-min-w-0;
  }

  &__container {
    @apply tw-flex tw-flex-row tw-items-start;
  }

  &__title {
    @apply tw-font-semibold tw-text-sm;
  }

  &__content {
    @apply tw-overflow-hidden tw-text-[color:var(--banner-text-color)] tw-font-normal tw-text-sm tw-leading-relaxed;
    transition: max-height 200ms ease-out;

    &--collapsed {
      max-height: 100px;
      @apply tw-line-clamp-4;
    }

    &--expanded {
      max-height: 2000px;
    }
  }

  &__icon {
    @apply tw-mr-3 tw-shrink-0;
  }
}
</style>
