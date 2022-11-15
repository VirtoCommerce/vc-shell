<template>
  <div>
    <template v-if="component && component.url">
      <router-link :to="component.url" v-slot="{ isActive, navigate }">
        <vc-app-menu-link
          v-bind="props"
          :isActive="isActive"
          @onClick="onMenuItemClick(navigate)"
        />
      </router-link>
    </template>
    <template v-else>
      <vc-app-menu-link v-bind="props" @onClick="onMenuItemClick" />

      <!-- Nested menu items -->
      <div class="vc-app-menu-item__child" v-if="isOpened">
        <template v-for="(nested, i) in children" :key="i">
          <router-link
            :to="nested.component.url"
            v-slot="{ isActive, navigate }"
          >
            <div
              :class="[
                {
                  'vc-app-menu-item__child-item_active': isActive,
                },
                'vc-app-menu-item__child-item',
              ]"
              v-if="nested.isVisible === undefined || nested.isVisible"
              :key="i"
              @click="navigate"
            >
              {{ nested.title }}
            </div>
          </router-link>
        </template>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import {
  BladeComponent,
  IBladeToolbar,
  IMenuItems,
} from "../../../../../../../typings";
import VcAppMenuLink from "./_internal/vc-app-menu-link.vue";

interface Props {
  sticky: boolean;
  isVisible: boolean;
  activeChildItem: IMenuItems;
  component: BladeComponent;
  bladeOptions: Record<string, unknown>;
  clickHandler: () => void;
  icon: string;
  title: string;
  children: IBladeToolbar[];
  isCollapsed: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
  isVisible: false,
  activeChildItem: undefined,
  component: undefined,
  bladeOptions: () => ({}),
  clickHandler: undefined,
  icon: "",
  title: "",
  children: () => [],
  isCollapsed: true,
});

const emit = defineEmits(["click"]);

const isOpened = ref(false);

function onMenuItemClick(navigate?: () => void) {
  if (navigate && typeof navigate === "function" && !props.children?.length) {
    navigate();
  } else {
    isOpened.value = !isOpened.value;
  }

  emit("click");
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
}
</style>
