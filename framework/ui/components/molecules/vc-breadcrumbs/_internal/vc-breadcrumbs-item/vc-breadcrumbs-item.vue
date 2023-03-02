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
import { VcIcon } from "./../../../../../components";

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
  @apply tw-h-[var(--breadcrumbs-item-height)]
  tw-box-border tw-rounded-[calc(var(--breadcrumbs-item-height)/2)]
  tw-border tw-border-solid
  tw-border-[color:var(--breadcrumbs-item-border-color)]
  tw-text-[color:var(--breadcrumbs-item-color)]
  tw-whitespace-nowrap
  tw-px-3 tw-mr-2
  tw-text-sm tw-cursor-pointer tw-inline-flex tw-items-center
  hover:tw-border
  hover:tw-border-solid
  hover:tw-border-[color:var(--breadcrumbs-item-border-color-hover)];

  &__icon {
    @apply tw-mr-2 tw-text-[color:var(--breadcrumbs-item-icon-color)];
  }

  &_disabled {
    @apply tw-opacity-[0.4];
  }

  &_current,
  &_current:hover {
    @apply tw-text-[color:var(--breadcrumbs-item-color-current)]
    tw-border tw-border-solid tw-border-[color:var(--breadcrumbs-item-border-color-current)]
    tw-cursor-default tw-mr-0;
  }
}
</style>
