<template>
  <div
    class="vc-card"
    :class="[{ 'vc-card_collapsable': isCollapsable }, `vc-card_${variant}`]"
  >
    <div
      v-if="header"
      class="vc-card__header"
      @click="onHeaderClick"
    >
      <slot name="header">
        <div class="vc-card__header-content">
          <VcIcon
            v-if="icon"
            class="vc-card__icon"
            :icon="icon"
            size="xl"
          ></VcIcon>
          <div class="vc-card__title">{{ header }}</div>
        </div>
      </slot>
      <div
        v-if="$slots['actions']"
        class="vc-card__actions"
      >
        <slot name="actions"></slot>
      </div>
      <VcIcon
        v-if="isCollapsable"
        class="vc-card__collapse"
        :icon="`material-keyboard_arrow_${isCollapsedInternal ? 'down' : 'up'}`"
        size="s"
      ></VcIcon>
    </div>
    <transition name="fade">
      <div
        v-show="!isCollapsedInternal"
        :class="[{ 'tw-flex': fill }, 'vc-card__body']"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { VcIcon } from "./../vc-icon";
import { ref, watch } from "vue";

export interface Props {
  header?: string;
  icon?: string;
  isCollapsable?: boolean;
  isCollapsed?: boolean;
  /**
   * Card content will fill the available space
   */
  fill?: boolean;
  variant?: "default" | "success" | "danger";
}

export interface Emits {
  (event: "header:click"): void;
  (event: "state:collapsed", isCollapsedState: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
});

const emit = defineEmits<Emits>();

defineSlots<{
  default: (props?: any) => any;
  actions: (props?: any) => any;
  header: (props?: any) => any;
}>();

const isCollapsedInternal = ref();

function onHeaderClick() {
  if (props.isCollapsable) {
    isCollapsedInternal.value = !isCollapsedInternal.value;
    emit("state:collapsed", isCollapsedInternal.value);
  }
  emit("header:click");
}

watch(
  () => props.isCollapsed,
  (value) => {
    isCollapsedInternal.value = value;
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
:root {
  --card-background: var(--additional-50);
  --card-border-radius: 6px;
  --card-header-background: var(--secondary-50);
  --card-header-color: var(--secondary-950);

  --card-header-background-success: var(--success-100);
  --card-header-background-danger: var(--danger-100);

  --card-header-color-success: var(--success-600);
  --card-header-color-danger: var(--danger-600);

  --card-header-padding-hor: 24px;
  --card-header-padding-vert: 17px;

  --card-border-color: var(--neutrals-200);
}

$variants: success, danger;

.vc-card {
  @apply tw-bg-[color:var(--card-background)] tw-border
  tw-border-[color:var(--card-border-color)] tw-border-solid tw-box-border
  tw-rounded-[var(--card-border-radius)] tw-overflow-hidden
  tw-flex-grow tw-flex tw-flex-col;

  &__header {
    @apply tw-border-b tw-border-[color:var(--card-border-color)] tw-border-solid tw-bg-[color:var(--card-header-background)] tw-px-[var(--card-header-padding-hor)] tw-py-[var(--card-header-padding-vert)] tw-flex tw-items-center tw-justify-between tw-w-full tw-box-border;
  }

  &__header-content {
    @apply tw-flex tw-items-center;
  }

  &_collapsable &__header {
    @apply tw-cursor-pointer;
  }

  &__title {
    @apply tw-normal-case tw-flex-grow
   tw-text-[color:var(--card-header-color)]
   tw-text-sm tw-font-bold;
  }

  &__icon {
    @apply tw-text-[color:var(--card-header-color)] tw-mr-3;
  }

  &__collapse {
    @apply tw-text-[color:var(--card-header-color)] tw-ml-3;
  }

  &__body {
    @apply tw-flex-grow tw-box-border tw-flex-col;
  }

  @each $variant in $variants {
    &_#{$variant} {
      .vc-card__header {
        @apply tw-bg-[color:var(--card-header-background-#{$variant})];
      }
      .vc-card__title {
        @apply tw-text-[color:var(--card-header-color-#{$variant})];
      }
    }
  }
}
</style>
