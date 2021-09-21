<template>
  <div
    class="vc-app vc-fill_all vc-flex vc-flex-column vc-margin_none"
    :class="`vc-theme_${theme}`"
  >
    <!-- Show login form for unauthorized users -->
    <slot v-if="!authorized" name="login">Login form not defined</slot>

    <!-- Show main app layout for authorized users -->
    <template v-else>
      <!-- Init application top bar -->
      <vc-topbar
        class="vc-flex-shrink_0"
        :logo="logo"
        :version="version"
        :buttons="toolbar"
        :account="account"
      ></vc-topbar>

      <div class="vc-app__inner vc-flex vc-flex-grow_1">
        <!-- Init main menu -->
        <vc-nav
          class="vc-flex-shrink_0"
          :items="menu"
          :collapsed="menuCollapsed"
          @itemClick="$emit('menuClick', $event)"
          @collapse="$emit('menuCollapse')"
          @expand="$emit('menuExpand')"
        ></vc-nav>

        <!-- If no workspace active then show dashboard -->
        <slot v-if="!workspace.length" name="dashboard">
          Dashboard component not defined
        </slot>

        <!-- Else show workspace blades -->
        <div v-else class="vc-flex vc-flex-grow_1 vc-padding-horizontal_s">
          <component
            v-for="(blade, i) in workspace"
            v-show="i >= workspace.length - 2"
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
import VcTopbar from "./_internal/vc-topbar/vc-topbar.vue";
import VcNav from "./_internal/vc-nav/vc-nav.vue";

interface BladeElement extends HTMLElement {
  onBeforeClose: () => Promise<boolean>;
}

export default defineComponent({
  name: "VcApp",

  components: {
    VcTopbar,
    VcNav,
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
    let itemRefs = ref<BladeElement[]>([]);
    const setItemRef = (el: BladeElement) => {
      if (el) {
        itemRefs.value.push(el);
      }
    };

    onBeforeUpdate(() => {
      itemRefs.value = [];
    });

    onUpdated(() => {
      emit("bladesChanged", itemRefs.value);
    });

    const onClose = async (index: number) => {
      console.log(`onClose called on blade ${index}`);
      if (index > 0) {
        const lastBladeIndex = props.workspace.length - 1;
        const bladesRefs = itemRefs.value.slice(index).reverse();
        for (let i = 0; i < bladesRefs.length; i++) {
          if (
            bladesRefs[i]?.onBeforeClose &&
            typeof bladesRefs[i].onBeforeClose === "function"
          ) {
            const result = await bladesRefs[i].onBeforeClose();
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
      itemRefs,
      onClose,
      onOpenChild,
      setParent: (i: number) => {
        return i > 0 ? computed(() => itemRefs.value[i - 1]) : undefined;
      },
      setChild: (i: number) => {
        return i < props.workspace.length - 1
          ? computed(() => itemRefs.value[i + 1])
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
}
</style>
