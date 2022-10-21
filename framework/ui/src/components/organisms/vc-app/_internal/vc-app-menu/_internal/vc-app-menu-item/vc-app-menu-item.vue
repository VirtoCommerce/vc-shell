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
        <VcIcon icon="fas fa-ellipsis-v" size="m" />
      </div>
      <div v-if="icon" class="vc-app-menu-item__icon">
        <VcIcon :icon="icon" size="m" />
      </div>
      <div class="vc-app-menu-item__title">
        {{ title }}
        <VcIcon
          class="vc-app-menu-item__title-icon"
          icon="fas fa-chevron-down"
          size="xs"
          v-if="children.length"
        ></VcIcon>
      </div>
    </div>
    <!-- Nested menu items -->
    <div class="vc-app-menu-item__child" v-if="isOpened">
      <template v-for="(nested, i) in children">
        <div
          :class="[
            {
              'vc-app-menu-item__child-item_active': activeChildItem === nested,
            },
            'vc-app-menu-item__child-item',
          ]"
          v-if="nested.isVisible === undefined || nested.isVisible"
          :key="i"
          @click="$emit('child:click', nested)"
        >
          {{ nested.title }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, watch } from "vue";
import VcIcon from "../../../../../../atoms/vc-icon/vc-icon.vue";
import { IBladeToolbar, IMenuItems } from "../../../../../../../typings";

const props = defineProps({
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
});

const emit = defineEmits(["click", "child:click"]);

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
</script>

<style lang="scss">
:root {
  --app-menu-item-height: 38px;
  --app-menu-item-icon-width: 20px;
  --app-menu-item-icon-color: #337599;
  --app-menu-item-icon-color-active: #ffffff;
  --app-menu-item-handler-width: 10px;
  --app-menu-item-background-color-hover: #337599;
  --app-menu-item-hover-radius: 4px;
  --app-menu-item-title-color: #465769;
  --app-menu-item-title-color-active: #ffffff;
  --app-menu-item-handler-color: #bdd1df;
}

.vc-app-menu-item {
  @apply flex items-center w-full h-[var(--app-menu-item-height)]
    border-none
    flex-nowrap box-border cursor-pointer relative uppercase;

  &_active {
    @apply bg-[color:var(--app-menu-item-background-color-hover)]
    rounded-[var(--app-menu-item-hover-radius)]
    before:opacity-100;
  }

  &__handler {
    @apply w-[var(--app-menu-item-handler-width)]
      text-[color:var(--app-menu-item-handler-color)]
      text-center invisible shrink-0;

    &_enabled {
      @apply cursor-move;
    }
  }

  &__icon {
    @apply w-[var(--app-menu-item-icon-width)]
      text-[color:var(--app-menu-item-icon-color)]
      overflow-hidden flex
      justify-center shrink-0 transition-[color] duration-200;
  }

  &_active &__icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &__title {
    @apply text-ellipsis overflow-hidden whitespace-nowrap
      text-lg
      font-medium
      px-3
      text-[color:var(--app-menu-item-title-color)]
      [transition:color_0.2s_ease] [transition:opacity_0.1s_ease]
      opacity-100 w-full;
  }

  &__title-icon {
    @apply text-[color:var(--app-menu-item-icon-color)] ml-3;
  }

  &__child {
    @apply ml-[42px] gap-[4px] flex flex-col;
  }

  &__child-item {
    @apply cursor-pointer w-fit py-[5px] px-[9px] rounded-[4px]
    hover:bg-[color:var(--app-menu-item-background-color-hover)]
    hover:text-[color:var(--app-menu-item-title-color-active)];

    &_active {
      @apply bg-[color:var(--app-menu-item-background-color-hover)]
        text-[color:var(--app-menu-item-title-color-active)] font-bold;
    }
  }

  &_active &__title {
    @apply text-[color:var(--app-menu-item-title-color-active)]
      font-bold;
  }

  &_active &__title-icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover {
    @apply bg-[color:var(--app-menu-item-background-color-hover)]
      rounded-[var(--app-menu-item-hover-radius)];

    &.vc-app-menu-item_no-hover {
      @apply bg-transparent;
      > .vc-app-menu-item__title {
        @apply text-[color:var(--app-menu-item-title-color)];
      }
      > .vc-app-menu-item__title-icon {
        @apply text-[color:var(--app-menu-item-icon-color)];
      }
      > .vc-app-menu-item__icon {
        @apply text-[color:var(--app-menu-item-icon-color)];
      }
    }
  }

  &:hover &__title {
    @apply text-[color:var(--app-menu-item-title-color-active)];
  }

  &:hover &__icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__title-icon {
    @apply text-[color:var(--app-menu-item-icon-color-active)];
  }

  &:hover &__handler {
    &_enabled {
      @apply invisible;
    }
  }
}
</style>
