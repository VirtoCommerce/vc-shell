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
      @toolbarbutton:click="onToolbarButtonClick"
      @menubutton:click="($refs.menu as Record<'isMobileVisible', boolean>).isMobileVisible = true"
      @backlink:click="$emit('backlink:click', bladesRefs.length - 2)"
      @logo:click="openDashboard"
      :title="title"
    >
      <template v-slot:appSwitcher>
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
        :mobileMenuItems="mobileMenuItems"
        @item:click="onMenuItemClick"
      ></VcAppMenu>

      <!-- Workspace blades -->
      <div class="vc-app__workspace tw-px-2 tw-w-full tw-overflow-hidden !tw-flex tw-grow tw-basis-0">
        <slot name="bladeNavigation"></slot>
      </div>

      <div
        class="[pointer-events:painted] tw-absolute tw-flex tw-z-[1000] tw-overflow-hidden tw-top-0 tw-left-2/4 -tw-translate-x-2/4 tw-flex-col tw-items-center tw-p-2 tw-box-border"
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
import { IMenuClickEvent } from "./../../../../shared";
import { appEmits, appProps } from "./vc-app-model";

defineProps({...appProps});

const emit = defineEmits({...appEmits});

console.debug("vc-app: Init vc-app");

const instance = getCurrentInstance();

const router = useRouter();

const onMenuItemClick = function ({ item, navigationCb }: IMenuClickEvent) {
  console.debug(`vc-app#onMenuItemClick() called.`);
  if (item.clickHandler && typeof item.clickHandler === "function") {
    item.clickHandler(instance?.exposed);
  } else {
    emit("open", { parentBlade: item.component, id: 0, navigationCb });
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
  await emit("close", 0);

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
