<template>
  <div>
    <div
      class="vc-app-menu-item"
      :class="[
        { 'vc-app-menu-item_active': isActive && !children.length },
        { 'vc-app-menu-item_no-hover': children.length },
      ]"
      @click="onMenuItemClick"
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
      <div class="vc-app-menu-item__title">
        {{ title }}
        <vc-icon
          class="vc-margin-left_m vc-app-menu-item__title-icon"
          icon="fas fa-chevron-down"
          size="xs"
          v-if="children.length"
        ></vc-icon>
      </div>
    </div>
    <!-- Nested menu items -->
    <div class="vc-app-menu-item__child" v-if="isOpened">
      <div
        :class="[
          { 'vc-app-menu-item__child-item_active': activeChildItem === nested },
          'vc-app-menu-item__child-item',
        ]"
        v-for="(nested, i) in children"
        :key="i"
        @click="$emit('child:click', nested)"
      >
        {{ nested.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, watch } from "vue";
import VcIcon from "../../../../../../atoms/vc-icon/vc-icon.vue";
import { IBladeToolbar, IMenuItems } from "../../../../../../../typings";

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

    activeChildItem: {
      type: Object as PropType<IMenuItems>,
      default: undefined,
    },

    component: {
      type: Object as PropType<IMenuItems>,
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

    children: {
      type: Array as PropType<IBladeToolbar[]>,
      default: () => [],
    },

    isCollapsed: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["click", "child:click"],

  setup(props, { emit }) {
    const isOpened = ref(false);

    watch(
      () => props.isActive,
      (newVal) => {
        isOpened.value = !!(
          newVal &&
          props.children &&
          props.children.some((child) => child === props.activeChildItem)
        );
      },
      { immediate: true }
    );

    function onMenuItemClick() {
      if (!props.children?.length) {
        emit("click");
      } else {
        isOpened.value = !isOpened.value;
      }
    }

    return {
      isOpened,
      onMenuItemClick,
    };
  },
});
</script>

<style lang="less">
:root {
  --app-menu-item-height: 48px;
  --app-menu-item-icon-width: 20px;
  --app-menu-item-icon-color: #337599;
  --app-menu-item-icon-color-active: #ffffff;
  --app-menu-item-handler-width: 20px;
  --app-menu-item-background-color-hover: #337599;
  --app-menu-item-hover-radius: 4px;
  --app-menu-item-border-bottom: none;
  --app-menu-item-title-font-weight: var(--font-weight-medium);
  --app-menu-item-title-font-weight-active: var(--font-weight-bold);
  --app-menu-item-title-font-size: var(--font-size-l);
  --app-menu-item-title-padding: 0 var(--padding-m);
  --app-menu-item-title-color: #465769;
  --app-menu-item-title-color-active: #ffffff;
  --app-menu-item-handler-color: #bdd1df;
}

.vc-app-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  height: var(--app-menu-item-height);
  border-bottom: var(--app-menu-item-border-bottom);
  flex-wrap: nowrap;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
  text-transform: uppercase;

  &_active {
    background-color: var(--app-menu-item-background-color-hover);
    border-radius: var(--app-menu-item-hover-radius);

    &:before {
      opacity: 1;
    }
  }

  &_no-hover {
    &:hover {
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
    transition: color 0.2s ease;
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
    transition: color 0.2s ease, opacity 0.1s ease;
    opacity: 1;
    width: 100%;
  }

  &__title-icon {
    color: var(--app-menu-item-icon-color);
  }

  &__child {
    margin-left: 52px;
    gap: 4px;
    display: flex;
    flex-direction: column;
  }

  &__child-item {
    cursor: pointer;
    width: fit-content;
    padding: 5px 9px;
    border-radius: 4px;

    &_active {
      background-color: var(--app-menu-item-background-color-hover);
      color: var(--app-menu-item-title-color-active);
      font-weight: bold;
    }

    &:hover {
      background-color: var(--app-menu-item-background-color-hover);
      color: var(--app-menu-item-title-color-active);
    }
  }

  &_active &__title {
    color: var(--app-menu-item-title-color-active);
    font-weight: var(--app-menu-item-title-font-weight-active);
  }

  &_active &__title-icon {
    color: var(--app-menu-item-icon-color-active);
  }

  &:hover {
    background-color: var(--app-menu-item-background-color-hover);
    border-radius: var(--app-menu-item-hover-radius);

    &.vc-app-menu-item_no-hover {
      background-color: transparent;
      .vc-app-menu-item__title {
        color: var(--app-menu-item-title-color);
      }
      .vc-app-menu-item__title-icon {
        color: var(--app-menu-item-icon-color);
      }
      .vc-app-menu-item__icon {
        color: var(--app-menu-item-icon-color);
      }
    }
  }

  &:hover &__title {
    color: var(--app-menu-item-title-color-active);
  }

  &:hover &__icon {
    color: var(--app-menu-item-icon-color-active);
  }

  &:hover &__title-icon {
    color: var(--app-menu-item-icon-color-active);
  }

  &:hover &__handler {
    &_enabled {
      visibility: visible;
    }
  }
}
</style>
