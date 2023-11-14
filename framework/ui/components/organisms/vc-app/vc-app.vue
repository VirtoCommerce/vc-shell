<template>
  <div
    class="vc-app tw-flex tw-flex-col tw-w-full tw-h-full tw-box-border tw-m-0 tw-overflow-hidden tw-text-base"
    :class="[
      `vc-theme_${theme}`,
      {
        'vc-app_touch': $isTouch,
        'vc-app_phone': $isPhone.value,
        'vc-app_mobile': $isMobile.value,
      },
    ]"
  >
    <!-- Init application top bar -->
    <VcAppBar
      class="tw-shrink-0"
      :logo="logo"
      :blades="bladesRefs"
      :buttons="toolbarItems"
      :title="title"
      @menubutton:click="($refs.menu as Record<'isMobileVisible', boolean>).isMobileVisible = true"
      @backlink:click="$emit('backlink:click', bladesRefs.length - 2)"
      @logo:click="$emit('logo:click')"
    >
      <template
        v-if="$slots['appSwitcher']"
        #appSwitcher
      >
        <slot name="appSwitcher"></slot>
      </template>
    </VcAppBar>

    <div class="tw-overflow-hidden tw-flex tw-grow tw-basis-0">
      <!-- Init main menu -->
      <VcAppMenu
        ref="menu"
        class="tw-shrink-0"
        :items="menuItems"
        :version="version"
        :mobile-menu-items="mobileMenuItems"
        @item:click="onMenuItemClick"
      ></VcAppMenu>

      <!-- Workspace blades -->
      <div
        v-if="$slots['bladeNavigation']"
        class="vc-app__workspace tw-px-2 tw-w-full tw-overflow-hidden !tw-flex tw-grow tw-basis-0 tw-relative"
      >
        <slot name="bladeNavigation"></slot>
      </div>

      <div v-if="$slots['modals']">
        <slot name="modals"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, markRaw } from "vue";
import { BladeMenu, IBladeToolbar } from "../../../../core/types";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";
import { BladeInstanceConstructor, IBladeRef, useBladeNavigation } from "./../../../../shared";

export interface Props {
  pages?: BladeInstanceConstructor[];
  menuItems?: BladeMenu[];
  mobileMenuItems?: IBladeToolbar[];
  toolbarItems?: IBladeToolbar[];
  isReady?: boolean;
  isAuthorized?: boolean;
  logo: string;
  version?: string;
  theme?: "light" | "dark";
  bladesRefs?: IBladeRef[];
  title?: string;
}

export interface Emits {
  (event: "close", index: number): void;
  (event: "backlink:click", index: number): void;
  (event: "logo:click"): void;
}

defineOptions({
  inheritAttrs: false,
});

withDefaults(defineProps<Props>(), {
  pages: () => [],
  menuItems: () => [],
  mobileMenuItems: () => [],
  toolbarItems: () => [],
  theme: "light",
  bladesRefs: () => [],
});

defineEmits<Emits>();

console.debug("vc-app: Init vc-app");

const { openBlade } = useBladeNavigation();

const instance = getCurrentInstance();

const onMenuItemClick = function ({ item }: { item: BladeMenu }) {
  console.debug(`vc-app#onMenuItemClick() called.`);
  if (item.clickHandler && typeof item.clickHandler === "function") {
    item.clickHandler(instance?.exposed);
  } else {
    if (item.component) {
      openBlade(
        {
          blade: markRaw(item.component),
        },
        true
      );
    }
  }
};

defineExpose({
  onMenuItemClick,
});
</script>

<style lang="scss">
:root {
  --app-background: linear-gradient(180deg, #e4f5fb 5.06%, #e8f3f2 100%), linear-gradient(0deg, #e8f2f3, #e8f2f3),
    #eef2f8;
}

.vc-app {
  background: var(--app-background);

  &__workspace {
    .vc-app_mobile & {
      @apply tw-p-0;
    }
  }
}
</style>
