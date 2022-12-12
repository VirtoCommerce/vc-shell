<template>
  <div
    class="vc-breadcrumbs-item"
    :class="{
      'vc-breadcrumbs-item_current': current,
    }"
    @click="onClick"
  >
    <VcIcon
      v-if="icon"
      class="vc-breadcrumbs-item__icon"
      :icon="icon"
      size="s"
    />
    <div class="vc-breadcrumbs-item__title">
      {{ title }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@/components";

const props = defineProps({
  current: {
    type: Boolean,
    default: false,
  },

  icon: {
    type: String,
    default: undefined,
  },

  title: {
    type: String,
    default: undefined,
  },

  clickHandler: {
    type: Function,
    default: undefined,
  },

  id: {
    type: String,
    default: undefined,
  },
});

const emit = defineEmits(["click"]);

function onClick(): void {
  if (!props.current) {
    if (props.clickHandler && typeof props.clickHandler === "function") {
      props.clickHandler(props.id);
    } else {
      emit("click");
    }
  }
}
</script>

<style lang="scss">
:root {
  --breadcrumbs-item-height: 28px;
  --breadcrumbs-item-border-color: #a1c0d4;
  --breadcrumbs-item-border-color-hover: #8fb0c6;
  --breadcrumbs-item-border-color-current: #838d9a;
  --breadcrumbs-item-color: #43b0e6;
  --breadcrumbs-item-color-current: #465769;
  --breadcrumbs-item-icon-color: #a1c0d4;
}

.vc-breadcrumbs-item {
  @apply h-[var(--breadcrumbs-item-height)]
  box-border rounded-[calc(var(--breadcrumbs-item-height)/2)]
  border border-solid
  border-[color:var(--breadcrumbs-item-border-color)]
  text-[color:var(--breadcrumbs-item-color)]
  whitespace-nowrap
  px-3 mr-2
  text-sm cursor-pointer inline-flex items-center
  hover:border
  hover:border-solid
  hover:border-[color:var(--breadcrumbs-item-border-color-hover)];

  &__icon {
    @apply mr-2 text-[color:var(--breadcrumbs-item-icon-color)];
  }

  &_disabled {
    @apply opacity-[0.4];
  }

  &_current,
  &_current:hover {
    @apply text-[color:var(--breadcrumbs-item-color-current)]
    border border-solid border-[color:var(--breadcrumbs-item-border-color-current)]
    cursor-default mr-0;
  }
}
</style>
