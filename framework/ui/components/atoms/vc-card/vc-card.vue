<template>
  <div
    class="vc-card"
    :class="[{ 'vc-card_collapsable': isCollapsable }, `vc-card_${variant}`]"
  >
    <div
      class="vc-card__header"
      v-if="header"
      @click="onHeaderClick"
    >
      <VcIcon
        v-if="icon"
        class="vc-card__icon"
        :icon="icon"
        size="xl"
      ></VcIcon>
      <div class="vc-card__title">{{ header }}</div>
      <div
        v-if="$slots['actions']"
        class="vc-card__actions"
      >
        <slot name="actions"></slot>
      </div>
      <VcIcon
        v-if="isCollapsable"
        class="vc-card__collapse"
        :icon="`fas fa-chevron-${isCollapsedInternal ? 'down' : 'up'}`"
        size="s"
      ></VcIcon>
    </div>
    <transition name="fade">
      <div
        :class="[{ 'vc-flex': fill }, 'vc-card__body']"
        v-show="!isCollapsedInternal"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VcCardProps } from "./vc-card-model";
const props = withDefaults(defineProps<VcCardProps>(), {
  isCollapsable: false,
  isCollapsed: false,
  fill: false,
  variant: "default",
});
const emit = defineEmits(["header:click", "state:collapsed"]);
const isCollapsedInternal = ref(props.isCollapsed);

function onHeaderClick() {
  if (props.isCollapsable) {
    isCollapsedInternal.value = !isCollapsedInternal.value;
    emit("state:collapsed", isCollapsedInternal.value);
  }
  emit("header:click");
}
</script>

<style lang="scss">
:root {
  --card-background: #ffffff;
  --card-border-radius: 6px;
  --card-box-shadow: 1px 1px 7px rgba(126, 142, 157, 0.15);
  --card-header-background: #f4f8fb;
  --card-header-color: #83a3be;

  --card-header-background-success: #e9f7df;
  --card-header-background-danger: #ffe6e6;

  --card-header-color-success: #99c17a;
  --card-header-color-danger: #f34747;
}

$variants: success, danger;

.vc-card {
  @apply tw-bg-[color:var(--card-background)] tw-border
  tw-border-[color:#eef0f2] tw-border-solid tw-box-border
  tw-shadow-[1px_1px_7px_rgba(126,142,157,0.15)]
  tw-rounded-[var(--card-border-radius)] tw-overflow-hidden
  tw-flex-grow tw-flex tw-flex-col;

  &__header {
    @apply tw-bg-[color:var(--card-header-background)] tw-px-4 tw-py-3 tw-flex tw-items-center tw-content-between tw-w-full tw-box-border;
  }

  &_collapsable &__header {
    @apply tw-cursor-pointer;
  }

  &__title {
    @apply tw-uppercase tw-flex-grow
   tw-text-[color:var(--card-header-color)]
   tw-text-base tw-font-bold tw-uppercase;
  }

  &__icon {
    @apply tw-text-[color:var(--card-header-color)] tw-mr-3;
  }

  &__collapse {
    @apply tw-text-[color:var(--card-header-color)] tw-ml-3;
  }

  &__body {
    @apply tw-flex-grow tw-box-border;
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
