<template>
  <div
    ref="badgeContainer"
    class="vc-badge"
    :class="{
      'vc-badge--small': size === 's',
      'vc-badge--medium': size === 'm',
    }"
  >
    <div class="tw-flex tw-relative">
      <slot name="default"></slot>
      <div
        ref="badge"
        class="vc-badge__badge tw-absolute tw-inline-flex tw-justify-center tw-items-center tw-text-center tw-indent-0 tw-rounded-[var(--badge-border-radius)] tw-text-[13px] tw-leading-[13px] tw-font-normal tw-bg-[color:var(--badge-background-color)] tw-text-[color:var(--badge-text-color)] tw-border tw-border-solid tw-border-[color:var(--badge-border-color)] tw-transition tw-duration-200"
        :class="{
          'tw-bg-[color:var(--badge-background-color-active)] tw-text-[color:var(--badge-text-color-active)] tw-border-[color:var(--badge-border-color-active)]':
            active,
          'tw-cursor-pointer hover:tw-bg-[color:var(--badge-background-color-active)] hover:tw-text-[color:var(--badge-text-color-hover)] hover:tw-border-[color:var(--badge-border-color-hover)]':
            clickable,
          'cursor-not-allowed tw-bg-[color:var(--badge-background-color-disabled)] tw-text-[color:var(--badge-text-color-disabled)] tw-border-[color:var(--badge-border-color-disabled)] hover:tw-bg-[color:var(--badge-background-color-disabled)] hover:tw-text-[color:var(--badge-text-color-disabled)] hover:tw-border-[color:var(--badge-border-color-disabled)]':
            disabled,
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
  --badge-background-color: #ffffff;
  --badge-background-color-hover: #fafafa;
  --badge-background-color-active: #fafafa;
  --badge-background-color-disabled: #f2f2f2;

  --badge-text-color: #455668;
  --badge-text-color-hover: #3b4959;
  --badge-text-color-active: #3b4959;
  --badge-text-color-disabled: #8296ab;

  --badge-border-radius: 9999px;

  --badge-border-color: #a1bfd4;
  --badge-border-color-hover: #8fb3cc;
  --badge-border-color-active: #8fb3cc;
  --badge-border-color-disabled: #b2cbdc;

  --badge-width-small: 18px;

  --badge-width-medium: 18px;

  --badge-padding-small: 0px 4px;
  --badge-padding-medium: 0 4px;

  --badge-distance-top-small: -10px;
  --badge-distance-right-small: -6px;

  --badge-distance-top-medium: -10px;
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
        font-size: 0.75rem;
        line-height: 1.35;
      }
    }
  }
}
</style>
