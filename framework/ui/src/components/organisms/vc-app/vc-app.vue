<template>
  <div
    class="vc-app vc-fill_all vc-flex vc-flex-column vc-margin_none"
    :class="[
      `vc-theme_${theme}`,
      { 'vc-app_touch': $isTouch, 'vc-app_phone': $isPhone.value },
    ]"
  >
    <!-- Show login form for unauthorized users -->
    <slot v-if="!authorized" name="login">Login form not defined</slot>

    <!-- Show main app layout for authorized users -->
    <template v-else>
      <!-- Init application top bar -->
      <vc-app-bar
        class="vc-flex-shrink_0"
        :logo="logo"
        :blades="blades"
        :version="version"
        :buttons="toolbar"
        :account="account"
        @toggleMobileMenu="$refs.appMenu.mobileVisible = true"
        @backClick="onClose(blades.length - 1)"
      ></vc-app-bar>

      <div class="vc-app__inner vc-flex vc-flex-grow_1">
        <!-- Init main menu -->
        <vc-app-menu
          ref="appMenu"
          class="vc-flex-shrink_0"
          :items="menu"
          :collapsed="menuCollapsed"
          @itemClick="$emit('menuClick', $event)"
          @collapse="$emit('menuCollapse')"
          @expand="$emit('menuExpand')"
        ></vc-app-menu>

        <!-- If no workspace active then show dashboard -->
        <slot v-if="!workspace.length" name="dashboard">
          Dashboard component not defined
        </slot>

        <!-- Else show workspace blades -->
        <div v-else class="vc-app__workspace vc-flex vc-flex-grow_1">
          <component
            v-for="(blade, i) in workspace"
            v-show="i >= workspace.length - ($isDesktop.value ? 2 : 1)"
            :key="i"
            :is="blade.component"
            :ref="setItemRef"
            :parent="setParent(i)"
            :child="setChild(i)"
            :param="blade.param"
            :closable="i > 0"
            :options="blade.componentOptions"
            @close="onClose(i)"
            @openChild="onOpenChild(i)"
          ></component>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUpdate, onUpdated, ref, computed } from "vue";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";

interface BladeElement extends HTMLElement {
  onBeforeClose: () => Promise<boolean>;
}

export default defineComponent({
  name: "VcApp",

  components: {
    VcAppBar,
    VcAppMenu,
  },

  props: {
    authorized: {
      type: Boolean,
      default: false,
    },

    workspace: {
      type: Array,
      default: () => [],
    },

    menu: {
      type: Array,
      default: () => [],
    },

    menuCollapsed: {
      type: Boolean,
      default: false,
    },

    toolbar: {
      type: Array,
      default: () => [],
    },

    theme: {
      type: String,
      default: "light",
    },

    logo: {
      type: String,
      default: undefined,
    },

    background: {
      type: String,
      default: undefined,
    },

    title: {
      type: String,
      default: "VirtoShell Application",
    },

    version: {
      type: String,
      default: undefined,
    },

    account: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: [
    "menuCollapse",
    "menuExpand",
    "menuClick",
    "bladesChanged",
    "closeBlade",
  ],

  setup(props, { emit }) {
    console.debug("Init vc-app");
    let blades = ref<BladeElement[]>([]);
    const setItemRef = (el: BladeElement) => {
      if (el) {
        blades.value.push(el);
      }
    };

    onBeforeUpdate(() => {
      blades.value = [];
    });

    onUpdated(() => {
      emit("bladesChanged", blades.value);
    });

    const onClose = async (index: number) => {
      console.log(`onClose called on blade ${index}`);
      if (index > 0) {
        const lastBladeIndex = props.workspace.length - 1;
        const children = blades.value.slice(index).reverse();
        for (let i = 0; i < children.length; i++) {
          if (
            children[i]?.onBeforeClose &&
            typeof children[i].onBeforeClose === "function"
          ) {
            const result = await children[i].onBeforeClose();
            if (result === false) {
              break;
            } else {
              emit("closeBlade", lastBladeIndex - i);
            }
          } else {
            emit("closeBlade", lastBladeIndex - i);
          }
        }
      }
    };

    const onOpenChild = async (index: number) => {
      console.log(`onOpenChild called on blade ${index}`);
    };

    return {
      setItemRef,
      blades,
      onClose,
      onOpenChild,
      setParent: (i: number) => {
        return i > 0 ? computed(() => blades.value[i - 1]) : undefined;
      },
      setChild: (i: number) => {
        return i < props.workspace.length - 1
          ? computed(() => blades.value[i + 1])
          : undefined;
      },
    };
  },
});
</script>

<style lang="less">
.vc-app {
  font-size: var(--font-size-m);
  background-color: var(--background-color);
  overflow: hidden;

  &__inner {
    overflow: hidden;
  }

  &__workspace {
    padding-left: var(--padding-s);
    padding-right: var(--padding-s);

    .vc-app_phone & {
      padding: 0;
      width: 100%;
    }
  }
}
</style>
