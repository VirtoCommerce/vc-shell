<template>
  <div class="vc-app vc-fill_all" :class="`vc-theme_${theme}`">
    <slot v-if="!authorized" name="login">Login form not defined</slot>
    <template v-else>
      <vc-topbar
        class="vc-flex-shrink_0"
        :logo="logo"
        :version="version"
        :buttons="toolbar"
        :account="account"
      ></vc-topbar>
      <div class="vc-app__inner">
        <vc-nav :items="menu" @itemClick="$emit('menuClick', $event)"></vc-nav>
        <slot v-if="showDashboard" name="dashboard">
          Dashboard component not defined
        </slot>
        <div v-else class="vc-flex vc-flex-grow_1 vc-padding-horizontal_s">
          <component
            v-for="blade in workspace"
            :key="blade.uid"
            :is="blade.component"
            :uid="blade.uid"
            :expanded="blade.expanded"
            :closable="blade.closable"
            v-bind="blade.componentOptions"
          ></component>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import VcTopbar from "../vc-topbar/vc-topbar.vue";
import VcNav from "../vc-nav/vc-nav.vue";

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
  margin: 0;
  height: 100%;
  font-size: var(--font-size-m);
  background-color: var(--background-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__inner {
    overflow: hidden;
    display: flex;
    flex-grow: 1;
  }
}
</style>
