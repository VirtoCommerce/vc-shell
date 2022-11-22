<template>
  <div
    class="vc-app flex flex-col w-full h-full box-border m-0 overflow-hidden text-base"
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
      class="shrink-0"
      :logo="logo"
      :blades="blades"
      :version="version"
      :buttons="toolbarItems"
      @toolbarbutton:click="onToolbarButtonClick"
      @menubutton:click="$refs.menu.isMobileVisible = true"
      @backlink:click="$emit('backlink:click', blades.length - 1)"
      @logo:click="openDashboard"
    >
      <template v-slot:productName v-if="$slots['productName']">
        <slot name="productName"></slot>
      </template>
    </VcAppBar>

    <div class="overflow-hidden flex grow basis-0">
      <!-- Init main menu -->
      <VcAppMenu
        ref="menu"
        class="shrink-0"
        :items="menuItems"
        :mobileMenuItems="mobileMenuItems"
        @item:click="onMenuItemClick"
      ></VcAppMenu>

      <!-- Workspace blades -->
      <div
        class="vc-app__workspace px-2 w-full overflow-hidden flex grow basis-0"
      >
        <slot name="bladeNavigation"></slot>
      </div>

      <div
        class="[pointer-events:painted] absolute flex z-[1000] overflow-hidden top-0 left-2/4 -translate-x-2/4 flex-col items-center p-2 box-border"
      >
        <slot name="notifications"></slot>
      </div>
      <div>
        <slot name="passwordChange"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";
import { IBladeToolbar, IMenuItems, IPage, BladeElement, } from "../../../core/types";

const props = withDefaults(defineProps<Props>(), {
  pages: () => [],
  menuItems: () => [],
  mobileMenuItems: () => [],
  toolbarItems: () => [],
  isReady: false,
  isAuthorized: false,
  logo: undefined,
  version: undefined,
  theme: "light",
});

const emit = defineEmits(["onOpen", "onClose", 'backlink:click']);

console.debug("vc-app: Init vc-app");

const instance = getCurrentInstance();

const router = useRouter();

const onMenuItemClick = function (item: IBladeToolbar) {
  console.debug(`vc-app#onMenuItemClick() called.`);
  if (item.clickHandler && typeof item.clickHandler === "function") {
    item.clickHandler(instance?.exposed);
  } else {
    emit("onOpen", { parentBlade: item.component, id: 0 });
  }
};

const onToolbarButtonClick = function (item: Record<string, unknown>) {
  console.debug(`vc-app#onToolbarButtonClick() called.`);

  if (item.clickHandler && typeof item.clickHandler === "function") {
    item.clickHandler(instance?.proxy);
  }
};

const openDashboard = async () => {
  console.debug(`openDashboard() called.`);

  // Close all opened pages with onBeforeClose callback
  await emit("onClose", 0);

  router.push("/");
};

defineExpose({
  openDashboard,
  onToolbarButtonClick,
  onMenuItemClick,
});
</script>

<style lang="scss">
:root {
  --app-background: linear-gradient(180deg, #e4f5fb 5.06%, #e8f3f2 100%),
    linear-gradient(0deg, #e8f2f3, #e8f2f3), #eef2f8;
}

.vc-app {
  background: var(--app-background);

  &__workspace {
    .vc-app_mobile & {
      @apply p-0;
    }
  }
}
</style>
