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
        <slot v-if="showDashboard" name="dashboard">
          Dashboard component not defined
        </slot>

        <!-- Else show workspace blades -->
        <div v-else class="vc-flex vc-flex-grow_1 vc-padding-horizontal_s">
          <component
            v-for="(blade, i) in workspace"
            :key="blade.uid"
            v-show="i >= workspace.length - 2"
            :is="blade.component"
            :uid="blade.uid"
            :param="blade.param"
            :expanded="blade.expanded"
            :closable="blade.closable"
            :options="blade.componentOptions"
          ></component>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import VcTopbar from "./_internal/vc-topbar/vc-topbar.vue";
import VcNav from "./_internal/vc-nav/vc-nav.vue";

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

  emits: ["menuCollapse", "menuExpand", "menuClick"],

  setup(props) {
    console.debug("Init vc-app");
    const showDashboard = computed(() => props.workspace.length === 0);

    return {
      showDashboard,
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
