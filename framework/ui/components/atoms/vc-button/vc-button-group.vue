<template>
  <div
    :class="groupClass"
    role="group"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { computed, provide, toRef } from "vue";
import { ButtonGroupKey, type ButtonSize } from "./types";

export interface Props {
  orientation?: "horizontal" | "vertical";
  size?: ButtonSize;
  attached?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  orientation: "horizontal",
  attached: false,
});

provide(ButtonGroupKey, {
  size: toRef(props, "size") as { value: ButtonSize | undefined },
  attached: toRef(props, "attached"),
});

const groupClass = computed(() => [
  "vc-button-group",
  {
    "vc-button-group_horizontal": props.orientation === "horizontal",
    "vc-button-group_vertical": props.orientation === "vertical",
    "vc-button-group_attached": props.attached,
  },
]);
</script>

<style lang="scss">
.vc-button-group {
  @apply tw-inline-flex tw-gap-2;

  &_vertical {
    @apply tw-flex-col;
  }

  // Attached mode — buttons touch, shared borders, connected radii
  // Selectors use `> *` to handle both direct .vc-button children
  // and wrapped buttons (e.g. inside VcTooltip or other wrappers).
  &_attached {
    @apply tw-gap-0;

    // Horizontal attached
    &.vc-button-group_horizontal {
      // All buttons inside lose rounding
      .vc-button {
        @apply tw-rounded-none;
      }

      // First slot: left rounding
      > *:first-child .vc-button,
      > .vc-button:first-child {
        @apply tw-rounded-l-[var(--button-border-radius)];
      }

      // Last slot: right rounding
      > *:last-child .vc-button,
      > .vc-button:last-child {
        @apply tw-rounded-r-[var(--button-border-radius)];
      }

      // Avoid double borders — negative margin on the flex child (wrapper or direct button)
      > *:not(:first-child) {
        @apply tw--ml-px;
      }
    }

    // Vertical attached
    &.vc-button-group_vertical {
      .vc-button {
        @apply tw-rounded-none;
      }

      > *:first-child .vc-button,
      > .vc-button:first-child {
        @apply tw-rounded-t-[var(--button-border-radius)];
      }

      > *:last-child .vc-button,
      > .vc-button:last-child {
        @apply tw-rounded-b-[var(--button-border-radius)];
      }

      > *:not(:first-child) {
        @apply tw--mt-px;
      }
    }
  }
}
</style>
