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
import VcIcon from "../../../../atoms/vc-icon/vc-icon.vue";

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
});

const emit = defineEmits(["click"]);

function onClick(): void {
  if (!props.current) {
    if (props.clickHandler && typeof props.clickHandler === "function") {
      props.clickHandler();
    } else {
      emit("click");
    }
  }
}
</script>

<style lang="less">
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
  height: var(--breadcrumbs-item-height);
  box-sizing: border-box;
  border-radius: calc(var(--breadcrumbs-item-height) / 2);
  border: 1px solid var(--breadcrumbs-item-border-color);
  color: var(--breadcrumbs-item-color);
  white-space: nowrap;
  padding: 0 var(--padding-m);
  margin-right: var(--margin-s);
  font-size: var(--font-size-s);
  cursor: pointer;
  display: inline-flex;
  align-items: center;

  &:hover {
    border: 1px solid var(--breadcrumbs-item-border-color-hover);
  }

  &__icon {
    margin-right: var(--margin-s);
    color: var(--breadcrumbs-item-icon-color);
  }

  &_disabled {
    opacity: 0.4;
  }

  &_current,
  &_current:hover {
    color: var(--breadcrumbs-item-color-current);
    border: 1px solid var(--breadcrumbs-item-border-color-current);
    cursor: default;
    margin-right: 0;
  }
}
</style>
