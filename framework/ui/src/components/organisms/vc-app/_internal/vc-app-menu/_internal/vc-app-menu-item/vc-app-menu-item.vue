<template>
  <div
    class="vc-app-menu-item"
    :class="{ 'vc-app-menu-item_active': isActive }"
    @click="$emit('click')"
  >
    <div
      class="vc-app-menu-item__handler"
      :class="{ 'vc-app-menu-item__handler_enabled': !sticky }"
    >
      <vc-icon icon="fas fa-ellipsis-v" size="m" />
    </div>
    <div v-if="icon" class="vc-app-menu-item__icon">
      <vc-icon :icon="icon" size="m" />
    </div>
    <div class="vc-app-menu-item__title" :title="title">{{ title }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VcIcon from "../../../../../../atoms/vc-icon/vc-icon.vue";

export default defineComponent({
  name: "VcAppMenuItem",

  components: { VcIcon },

  props: {
    sticky: {
      type: Boolean,
      default: true,
    },

    isVisible: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    component: {
      type: HTMLElement,
      default: undefined,
    },

    componentOptions: {
      type: Object,
      default: () => ({}),
    },

    clickHandler: {
      type: Function,
      default: undefined,
    },

    icon: {
      type: String,
      default: "",
    },

    title: {
      type: String,
      default: "",
    },
  },

  emits: ["click"],
});
</script>

<style lang="less">
:root {
  --app-menu-item-height: 48px;
  --app-menu-item-icon-width: 20px;
  --app-menu-item-icon-color: #319ed4;
  --app-menu-item-icon-color-active: #34414f;
  --app-menu-item-handler-width: 20px;
  --app-menu-item-background-color: var(--app-menu-background-color);
  --app-menu-item-background-color-hover: #f5f6f9;
  --app-menu-item-border-bottom: none;
  --app-menu-item-title-font-weight: var(--font-weight-medium);
  --app-menu-item-title-font-weight-active: var(--font-weight-bold);
  --app-menu-item-title-font-size: var(--font-size-l);
  --app-menu-item-title-padding: 0 var(--padding-m);
  --app-menu-item-title-color: #465769;
  --app-menu-item-title-color-active: #161d25;
  --app-menu-item-handler-color: #bdd1df;
}

.vc-app-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--app-menu-item-height);
  background-color: var(--app-menu-item-background-color);
  border-bottom: var(--app-menu-item-border-bottom);
  flex-wrap: nowrap;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;

  &_active {
    background-color: var(--app-menu-item-background-color-hover);

    &:before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      width: 3px;
      height: 100%;
      background-color: #43b0e6;
    }
  }

  &__handler {
    width: var(--app-menu-item-handler-width);
    color: var(--app-menu-item-handler-color);
    text-align: center;
    visibility: hidden;
    flex-shrink: 0;

    &_enabled {
      cursor: move;
    }
  }

  &__icon {
    width: var(--app-menu-item-icon-width);
    color: var(--app-menu-item-icon-color);
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }

  &_active &__icon {
    color: var(--app-menu-item-icon-color-active);
  }

  &__title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: var(--app-menu-item-title-font-size);
    font-weight: var(--app-menu-item-title-font-weight);
    padding: var(--app-menu-item-title-padding);
    color: var(--app-menu-item-title-color);
  }

  &_active &__title {
    color: var(--app-menu-item-title-color-active);
    font-weight: var(--app-menu-item-title-font-weight-active);
  }

  &:hover {
    background-color: var(--app-menu-item-background-color-hover);
  }

  &:hover &__handler {
    &_enabled {
      visibility: visible;
    }
  }
}
</style>
