<template>
  <div class="vc-app-menu-item" @click="$emit('click')">
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
  --app-menu-item-height: 40px;
  --app-menu-item-icon-width: 20px;
  --app-menu-item-icon-color: #319ed4;
  --app-menu-item-handler-width: 20px;
  --app-menu-item-background-color: var(--app-menu-background-color);
  --app-menu-item-background-color-hover: #eff7fc;
  --app-menu-item-border-bottom-color: #e7ebf1;
  --app-menu-item-title-font-weight: var(--font-weight-medium);
  --app-menu-item-title-font-size: var(--font-size-l);
  --app-menu-item-title-padding-right: 5px;
  --app-menu-item-title-padding-left: 9px;
  --app-menu-item-title-color: #465769;
  --app-menu-item-handler-color: #bdd1df;
}

.vc-app-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--app-menu-item-height);
  background-color: var(--app-menu-item-background-color);
  border-bottom: 1px solid var(--app-menu-item-border-bottom-color);
  flex-wrap: nowrap;
  box-sizing: border-box;
  cursor: pointer;

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

  &__title {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: var(--app-menu-item-title-font-size);
    font-weight: var(--app-menu-item-title-font-weight);
    padding-right: var(--app-menu-item-title-padding-right);
    padding-left: var(--app-menu-item-title-padding-left);
    color: var(--app-menu-item-title-color);
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
