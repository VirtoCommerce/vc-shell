<template>
  <VcTooltip
    v-if="shortcut"
    placement="bottom"
  >
    <button
      class="vc-blade-toolbar-base-button"
      :class="buttonClass"
      :data-test-id="id ?? 'vc-blade-toolbar-button'"
      :aria-keyshortcuts="ariaKeyshortcuts"
      :aria-disabled="isInert || undefined"
      v-bind="$attrs"
      @click="handleClick"
    >
      <div
        class="vc-blade-toolbar-base-button__content"
        :style="{ flexDirection: contentDirection }"
      >
        <VcIcon
          class="vc-blade-toolbar-base-button__icon"
          :class="iconClassName"
          :icon="resolvedIcon"
          :size="size"
        />
        <span
          class="vc-blade-toolbar-base-button__title"
          :class="titleClassName"
        >
          {{ resolvedTitle }}
        </span>
      </div>
    </button>
    <template #tooltip>
      <ShortcutKbd
        :parts="shortcutFormat.parts"
        :separated="!isMac"
      />
    </template>
  </VcTooltip>

  <button
    v-else
    class="vc-blade-toolbar-base-button"
    :class="buttonClass"
    :data-test-id="id ?? 'vc-blade-toolbar-button'"
    :aria-disabled="isInert || undefined"
    v-bind="$attrs"
    @click="handleClick"
  >
    <div
      class="vc-blade-toolbar-base-button__content"
      :style="{ flexDirection: contentDirection }"
    >
      <VcIcon
        class="vc-blade-toolbar-base-button__icon"
        :class="iconClassName"
        :icon="resolvedIcon"
        :size="size"
      />
      <span
        class="vc-blade-toolbar-base-button__title"
        :class="titleClassName"
      >
        {{ resolvedTitle }}
      </span>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { computed, isRef, ref, toValue } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcTooltip } from "@ui/components/atoms/vc-tooltip";
import ShortcutKbd from "@ui/components/organisms/vc-blade/_internal/toolbar/ShortcutKbd.vue";
import { resolveReactiveBoolean } from "@ui/components/organisms/vc-blade/utils";
import { useKeyboardShortcuts, formatShortcut } from "@core/composables/useKeyboardShortcuts";
import type { Props } from "@ui/components/organisms/vc-blade/_internal/toolbar/toolbar-button-props";

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: "m",
  separator: undefined,
  contentDirection: "column",
});

defineOptions({
  inheritAttrs: false,
});

const { isMac } = useKeyboardShortcuts();

const isWaiting = ref(false);
const isDisabled = computed(() => resolveReactiveBoolean(props.disabled));

/**
 * Not actionable — either the host disabled it, or its own click is still running.
 *
 * Announced with `aria-disabled` rather than the native attribute, so the control
 * stays focusable: this is a toolbar, where a keyboard user should still be able to
 * reach a button and be told it is unavailable, instead of having it vanish from the
 * tab order. `handleClick` already refuses, so nothing happens if it is pressed.
 * The state used to live only in a CSS class, which said nothing to assistive tech
 * (VCST-5861).
 */
const isInert = computed(() => isDisabled.value || isWaiting.value);

const buttonClass = computed(() => ({
  "vc-blade-toolbar-base-button--disabled": isInert.value,
  "vc-blade-toolbar-base-button--with-separator-left": props.separator === "left",
  "vc-blade-toolbar-base-button--with-separator-right": props.separator === "right",
  "vc-blade-toolbar-base-button--with-separator-both": props.separator === "both",
}));

const shortcutFormat = computed(() =>
  props.shortcut ? formatShortcut(props.shortcut, isMac) : { parts: [], aria: "" },
);
const ariaKeyshortcuts = computed(() => (props.shortcut ? shortcutFormat.value.aria : undefined));

const resolvedTitle = computed(() => {
  if (isRef(props.title)) {
    return toValue(props.title);
  }

  return props.title;
});

const resolvedIcon = computed(() => {
  if (typeof props.icon === "function") {
    return props.icon();
  }

  return props.icon;
});

async function handleClick(): Promise<void> {
  if (isDisabled.value || isWaiting.value || !props.onClick) return;

  isWaiting.value = true;
  try {
    await props.onClick();
  } finally {
    isWaiting.value = false;
  }
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-base-button-separator-color: var(--neutrals-200);
  --blade-toolbar-base-button-title-color: var(--neutrals-600);
  --blade-toolbar-base-button-hover-color: var(--primary-600);
  --blade-toolbar-base-button-disabled-color: var(--neutrals-400);
  --blade-toolbar-base-button-icon-color: var(--neutrals-700);
}

.vc-blade-toolbar-base-button {
  @apply tw-px-3 tw-bg-transparent tw-border-0 tw-cursor-pointer tw-shrink-0;

  &__content {
    @apply tw-inline-flex tw-items-center tw-gap-1;
  }

  &__icon {
    @apply tw-text-[var(--blade-toolbar-base-button-icon-color)];
    @apply tw-flex #{!important};
  }

  &__title {
    @apply tw-text-xs tw-text-[var(--blade-toolbar-base-button-title-color)] tw-text-nowrap;
  }

  &--with-separator-left {
    @apply tw-border-l tw-border-solid tw-border-[var(--blade-toolbar-base-button-separator-color)];
  }

  &--with-separator-right {
    @apply tw-border-r tw-border-solid tw-border-[var(--blade-toolbar-base-button-separator-color)];
  }

  &--with-separator-both {
    @apply tw-border-l tw-border-r tw-border-solid tw-border-[var(--blade-toolbar-base-button-separator-color)];
  }

  &:hover:not(&--disabled) {
    .vc-blade-toolbar-base-button__icon,
    .vc-blade-toolbar-base-button__title {
      @apply tw-text-[var(--blade-toolbar-base-button-hover-color)];
    }
  }

  &--disabled {
    @apply tw-cursor-default;

    .vc-blade-toolbar-base-button__icon,
    .vc-blade-toolbar-base-button__title {
      @apply tw-text-[var(--blade-toolbar-base-button-disabled-color)];
    }
  }
}
</style>
