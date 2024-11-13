<template>
  <div
    ref="badgeContainer"
    class="vc-badge"
    :class="{
      'vc-badge--small': size === 's',
      'vc-badge--medium': size === 'm',
    }"
  >
    <div class="vc-badge__content">
      <slot name="default"></slot>
      <div
        v-if="typeof content !== 'undefined'"
        ref="badge"
        class="vc-badge__badge"
        :class="{
          'vc-badge__badge--active': active,
          'vc-badge__badge--clickable': clickable,
          'vc-badge__badge--disabled': disabled,
        }"
        @click="onClick"
      >
        {{ content }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface Props {
  active?: boolean;
  disabled?: boolean;
  clickable?: boolean;
  content?: string | number;
  size?: "s" | "m";
}

export interface Emits {
  (event: "click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
});

const emit = defineEmits<Emits>();

defineSlots<{
  /**
   * Slot for component content
   * */
  default: void;
}>();

function onClick(): void {
  if (props.clickable && !props.disabled) {
    emit("click");
  }
}
</script>

<style lang="scss">
:root {
  --badge-background-color: var(--accent-500);
  --badge-background-color-hover: var(--neutrals-200);
  --badge-background-color-active: var(--neutrals-200);
  --badge-background-color-disabled: var(--neutrals-300);

  --badge-text-color: var(--additional-50);
  --badge-text-color-hover: var(--neutrals-800);
  --badge-text-color-active: var(--neutrals-800);
  --badge-text-color-disabled: var(--neutrals-500);

  --badge-border-radius: 9999px;

  --badge-border-color: var(--additional-50);
  --badge-border-color-hover: var(--primary-300);
  --badge-border-color-active: var(--primary-300);
  --badge-border-color-disabled: var(--primary-200);

  --badge-width-small: 16px;
  --badge-width-medium: 16px;

  --badge-padding-small: 0px 4px;
  --badge-padding-medium: 0 4px;

  --badge-distance-top-small: -8px;
  --badge-distance-right-small: -10px;

  --badge-distance-top-medium: -8px;
  --badge-distance-right-medium: -10px;
}

$sizes: small, medium;

@each $size in $sizes {
  .vc-badge {
    &--#{$size} {
      .vc-badge__badge {
        min-width: var(--badge-width-#{$size});
        padding: var(--badge-padding-#{$size});
        top: var(--badge-distance-top-#{$size});
        right: var(--badge-distance-right-#{$size});
        width: 100%;
        @apply tw-text-xs tw-leading-snug;
      }
    }
  }
}

.vc-badge__content {
  @apply tw-flex tw-relative;
}

.vc-badge__badge {
  @apply tw-absolute tw-inline-flex tw-justify-center tw-items-center tw-text-center tw-indent-0 tw-rounded-full tw-font-semibold tw-text-xxs tw-bg-[color:var(--badge-background-color)] tw-text-[color:var(--badge-text-color)] tw-border tw-border-solid tw-border-[color:var(--badge-border-color)] tw-transition tw-duration-200;
}

.vc-badge__badge--active {
  @apply tw-bg-[color:var(--badge-background-color-active)] tw-text-[color:var(--badge-text-color-active)] tw-border-[color:var(--badge-border-color-active)];
}

.vc-badge__badge--clickable {
  @apply tw-cursor-pointer hover:tw-bg-[color:var(--badge-background-color-hover)] hover:tw-text-[color:var(--badge-text-color-hover)] hover:tw-border-[color:var(--badge-border-color-hover)];
}

.vc-badge__badge--disabled {
  @apply tw-cursor-not-allowed tw-bg-[color:var(--badge-background-color-disabled)] tw-text-[color:var(--badge-text-color-disabled)] tw-border-[color:var(--badge-border-color-disabled)] hover:tw-bg-[color:var(--badge-background-color-disabled)] hover:tw-text-[color:var(--badge-text-color-disabled)] hover:tw-border-[color:var(--badge-border-color-disabled)];
}
</style>
