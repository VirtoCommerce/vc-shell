<template>
  <div>
    <template v-if="component && component.url">
      <router-link :to="component.url" custom v-slot="{ isActive, navigate }">
        <vc-app-menu-link
          :isActive="isActive"
          :children="children"
          :sticky="sticky"
          :icon="icon"
          :title="title"
          @onClick="onMenuItemClick(navigate)"
        />
      </router-link>
    </template>
    <template v-else>
      <vc-app-menu-link
        :children="children"
        :sticky="sticky"
        :icon="icon"
        :title="title"
        @onClick="onMenuItemClick"
        :isActive="isHomePage"
      />

      <!-- Nested menu items -->
      <div class="vc-app-menu-item__child" v-if="isOpened">
        <template v-for="(nested, i) in children" :key="i">
          <router-link
            :to="nested.component.url"
            custom
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
              @click="
                $emit('child:click', { item: nested, navigationCb: navigate })
              "
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
import { onMounted, ref, computed } from "vue";
import { ExtendedComponent, IMenuItems } from "@/core/types";
import VcAppMenuLink from "./_internal/vc-app-menu-link.vue";
import {NavigationFailure, useRoute} from "vue-router";

export interface Props {
  sticky?: boolean;
  isVisible?: boolean;
  component?: ExtendedComponent;
  bladeOptions?: Record<string, unknown>;
  clickHandler?: () => void;
  icon: string;
  title: string;
  children?: IMenuItems[];
  isCollapsed?: boolean;
}

export interface Emits {
  (event: "click", navigationCb: () => Promise<void | NavigationFailure>): void;
  (
    event: "child:click",
    {
      item,
      navigationCb,
    }: {
      item: IMenuItems;
      navigationCb: () => Promise<void | NavigationFailure>;
    }
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
  isVisible: false,
  component: undefined,
  bladeOptions: () => ({}),
  clickHandler: undefined,
  icon: "",
  title: "",
  children: () => [],
  isCollapsed: true,
});

const route = useRoute();

const emit = defineEmits<Emits>();

const isOpened = ref(false);

const isHomePage = computed(() => route.path === '/')

onMounted(() => {
  if (
    props.children &&
    props.children.length &&
    props.children.find((x) => x.component?.url === route?.path)
  ) {
    isOpened.value = true;
  }
});

function onMenuItemClick(
  navigationCb?: () => Promise<void | NavigationFailure>
) {
  if (!props.children?.length) {
    emit("click", navigationCb);
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
