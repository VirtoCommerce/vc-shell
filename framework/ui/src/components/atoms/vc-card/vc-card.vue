<template>
  <div
    class="vc-card"
    :class="[{ 'vc-card_collapsable': isCollapsable }, `vc-card_${variant}`]"
  >
    <div class="vc-card__header" v-if="header" @click="onHeaderClick">
      <VcIcon v-if="icon" class="vc-card__icon" :icon="icon" size="xl"></VcIcon>
      <div class="vc-card__title">{{ header }}</div>
      <div v-if="$slots['actions']" class="vc-card__actions">
        <slot name="actions"></slot>
      </div>
      <VcIcon
        v-if="isCollapsable"
        class="vc-card__collapse"
        :icon="`fas fa-chevron-${isCollapsedInternal ? 'up' : 'down'}`"
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
const props = defineProps({
  header: {
    type: String,
    default: undefined,
  },

  icon: {
    type: String,
    default: undefined,
  },

  isCollapsable: {
    type: Boolean,
    default: false,
  },

  isCollapsed: {
    type: Boolean,
    default: false,
  },

  fill: {
    type: Boolean,
    default: false,
  },

  variant: {
    type: String,
    enum: ["default", "success", "danger"],
    default: "default",
  },
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
  --card-header-font-size: var(--font-size-m);
  --card-header-font-weight: var(--font-weight-bold);

  --card-header-background-success: #e9f7df;
  --card-header-background-danger: #ffe6e6;

  --card-header-color-success: #99c17a;
  --card-header-color-danger: #f34747;
}

$variants: success, danger;

.vc-card {
  @apply bg-[color:var(--card-background)] border
  border-[color:#eef0f2] border-solid box-border
  shadow-[1px_1px_7px_rgba(126,142,157,0.15)]
  rounded-[var(--card-border-radius)] overflow-hidden
  flex-grow flex flex-col;

  &__header {
    @apply bg-[color:var(--card-header-background)] px-l py-m flex items-center content-between w-full box-border;
  }

  &_collapsable &__header {
    @apply cursor-pointer;
  }

  &__title {
    @apply uppercase flex-grow
    text-[color:var(--card-header-color)]
    text-m font-bold uppercase;
  }

  &__icon {
    @apply text-[color:var(--card-header-color)] ml-m;
  }

  &__collapse {
    @apply text-[color:var(--card-header-color)] ml-m;
  }

  &__body {
    @apply flex-grow box-border;
  }

  @each $variant in $variants {
    &_#{$variant} {
      .vc-card__header {
        @apply bg-[color:var(--card-header-background-#{$variant})];
      }
      .vc-card__title {
        @apply text-[color:var(--card-header-color-#{$variant})];
      }
    }
  }
}
</style>
