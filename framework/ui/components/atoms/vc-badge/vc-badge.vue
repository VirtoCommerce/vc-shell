<template>
  <!-- Inline mode: render badge element directly without wrapper -->
  <div
    v-if="inline && (typeof content !== 'undefined' || isDot)"
    ref="badge"
    class="vc-badge__badge vc-badge__badge--inline"
    :class="[
      `vc-badge__badge--${variant}`,
      {
        'vc-badge__badge--active': active,
        'vc-badge__badge--clickable': clickable,
        'vc-badge__badge--disabled': disabled,
        'vc-badge__badge--content-long': String(content).length > 1,
        'vc-badge__badge--content-very-long': String(content).length > 2,
        'vc-badge__badge--dot': isDot,
        'vc-badge__badge--inline-small': size === 's',
        'vc-badge__badge--inline-medium': size === 'm',
      },
    ]"
    @click="onClick"
  >
    <span
      v-if="!isDot"
      class="vc-badge__text"
      >{{ content }}</span
    >
  </div>

  <!-- Standard mode: wrapper with slot and positioned badge -->
  <div
    v-else
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
        v-if="typeof content !== 'undefined' || isDot"
        ref="badge"
        class="vc-badge__badge"
        :class="[
          `vc-badge__badge--${variant}`,
          {
            'vc-badge__badge--active': active,
            'vc-badge__badge--clickable': clickable,
            'vc-badge__badge--disabled': disabled,
            'vc-badge__badge--content-long': String(content).length > 1,
            'vc-badge__badge--content-very-long': String(content).length > 2,
            'vc-badge__badge--dot': isDot,
            'vc-badge__badge--custom-position': customPosition,
          },
        ]"
        :style="customPositionStyle"
        @click="onClick"
      >
        <span
          v-if="!isDot"
          class="vc-badge__text"
          >{{ content }}</span
        >
      </div>
    </div>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed } from "vue";

export interface Props {
  active?: boolean;
  disabled?: boolean;
  clickable?: boolean;
  content?: string | number;
  size?: "s" | "m";
  isDot?: boolean;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "secondary";
  customPosition?: boolean;
  top?: string;
  right?: string;
  /** When true, renders badge as inline element without absolute positioning (no slot content) */
  inline?: boolean;
}

export interface Emits {
  (event: "click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  size: "m",
  isDot: false,
  variant: "primary",
  customPosition: false,
  top: undefined,
  right: undefined,
  inline: false,
});

const emit = defineEmits<Emits>();

defineSlots<{
  /**
   * Slot for component content
   * */
  default: (props: any) => any;
}>();

function onClick(): void {
  if (props.clickable && !props.disabled) {
    emit("click");
  }
}

const customPositionStyle = computed(() => {
  if (!props.customPosition) return {};

  return {
    top: props.top,
    right: props.right,
  };
});
</script>

<style lang="scss">
:root {
  // Default variant
  --badge-background-color: var(--accent-500);
  --badge-text-color: var(--additional-50);
  --badge-border-color: var(--additional-50);

  // Hover states
  --badge-background-color-hover: var(--neutrals-200);
  --badge-text-color-hover: var(--neutrals-800);
  --badge-border-color-hover: var(--primary-300);

  // Active states
  --badge-background-color-active: var(--neutrals-200);
  --badge-text-color-active: var(--neutrals-800);
  --badge-border-color-active: var(--primary-300);

  // Disabled states
  --badge-background-color-disabled: var(--neutrals-300);
  --badge-text-color-disabled: var(--neutrals-500);
  --badge-border-color-disabled: var(--primary-200);

  // Variants
  --badge-background-color-primary: var(--primary-500);
  --badge-background-color-secondary: var(--secondary-500);
  --badge-background-color-success: var(--success-500);
  --badge-background-color-warning: var(--warning-500);
  --badge-background-color-danger: var(--danger-500);
  --badge-background-color-info: var(--info-500);

  // Sizes
  --badge-size-small: 17px;
  --badge-size-medium: 20px;

  // Positioning
  --badge-distance-top-small: -8px;
  --badge-distance-right-small: -10px;
  --badge-distance-top-medium: -8px;
  --badge-distance-right-medium: -10px;

  // Misc
  --badge-border-radius: 9999px;
  --badge-dot-size-small: 8px;
  --badge-dot-size-medium: 10px;
}

$sizes: small, medium;

@each $size in $sizes {
  .vc-badge {
    &--#{$size} {
      .vc-badge__badge {
        height: var(--badge-size-#{$size});
        min-width: var(--badge-size-#{$size});
        top: var(--badge-distance-top-#{$size});
        right: var(--badge-distance-right-#{$size});

        &.vc-badge__badge--dot {
          height: var(--badge-dot-size-#{$size});
          min-width: var(--badge-dot-size-#{$size});
          width: var(--badge-dot-size-#{$size});
        }
      }
    }
  }
}

.vc-badge__content {
  @apply tw-flex tw-relative;
}

.vc-badge__badge {
  @apply tw-absolute tw-rounded-full tw-font-semibold tw-bg-[color:var(--badge-background-color)] tw-text-[color:var(--badge-text-color)] tw-border tw-border-solid tw-border-[color:var(--badge-border-color)] tw-transition tw-duration-200 tw-shrink-0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
  line-height: 1;
}

.vc-badge__text {
  @apply tw-text-xxs tw-leading-none;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.vc-badge__badge--content-long {
  @apply tw-px-1;
}

.vc-badge__badge--content-very-long {
  @apply tw-px-1;
  max-width: 40px;
  .vc-badge__text {
    @apply tw-overflow-hidden tw-text-ellipsis;
    white-space: nowrap;
  }
}

.vc-badge__badge--dot {
  @apply tw-p-0;
}

// Variants
.vc-badge__badge--primary {
  @apply tw-bg-[color:var(--badge-background-color-primary)];
}

.vc-badge__badge--success {
  @apply tw-bg-[color:var(--badge-background-color-success)];
}

.vc-badge__badge--warning {
  @apply tw-bg-[color:var(--badge-background-color-warning)];
}

.vc-badge__badge--danger {
  @apply tw-bg-[color:var(--badge-background-color-danger)];
}

.vc-badge__badge--info {
  @apply tw-bg-[color:var(--badge-background-color-info)];
}

.vc-badge__badge--secondary {
  @apply tw-bg-[color:var(--badge-background-color-secondary)];
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

// Inline mode - relative positioning, no wrapper
.vc-badge__badge--inline {
  @apply tw-relative tw-top-0 tw-right-0;
}

.vc-badge__badge--inline-small {
  height: var(--badge-size-small);
  min-width: var(--badge-size-small);

  &.vc-badge__badge--dot {
    height: var(--badge-dot-size-small);
    min-width: var(--badge-dot-size-small);
    width: var(--badge-dot-size-small);
  }
}

.vc-badge__badge--inline-medium {
  height: var(--badge-size-medium);
  min-width: var(--badge-size-medium);

  &.vc-badge__badge--dot {
    height: var(--badge-dot-size-medium);
    min-width: var(--badge-dot-size-medium);
    width: var(--badge-dot-size-medium);
  }
}
</style>
