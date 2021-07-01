<template>
  <vc-layout :toolbar-items="toolbarItems" :account="account">
    <template #banner>
      <div>
        Running community edition, click to request a commercial license.
      </div>
      <vc-button variant="special" title="Purchase"></vc-button>
    </template>

    <template #left>
      <vc-drawer
        :items="menuItems"
        logo="/assets/logo.svg"
        @itemClick="openWorkspace($event)"
      ></vc-drawer>
    </template>

    <div class="vc-flex vc-flex-grow_1">
    </div>
  </vc-layout>
</template>

<script>
import {
  VcLayout,
  VcButton,
  VcDrawer,
  routing,
} from "@virtocommerce/ui-kit";
import { defineComponent, ref } from "vue";
import { drawer, routes } from "./addons";

export default defineComponent({
  components: { VcLayout, VcButton, VcDrawer },

  setup() {
    const route = window.location.pathname;

    if (route) {
      let blade = null;
      for (var item in routes) {
        if (routes[item].url === route) {
          blade = routes[item];
          break;
        }
      }
      if (blade) {
        routing.openBlade(blade.component, {});
      }
    }

    const toolbarItems = ref([
      {
        id: "settings",
        icon: "cog",
        title: "Settings",
      },
      {
        id: "help",
        icon: "life-ring",
        title: "Help",
      },
      {
        id: "bell",
        icon: "bell",
        accent: true,
        title: "Notifications",
      },
    ]);

    const account = ref({
      avatar: "/assets/avatar.jpg",
      name: "Iurii A Taranov",
      role: "Administrator",
    });

    return {
      menuItems: drawer,
      toolbarItems,
      account,
      openedBlades: routing.opened.value,

      openBlade(data) {
        const blade = routes[data.routeName];
        routing.openBlade(blade.component, data.componentOptions);
      },

      openWorkspace(data) {
        routing.closeBlades();
        routing.openBlade(data.component, data.componentOptions);
        history.pushState({}, data.title, data.url);
      },

      closeBlade(id) {
        routing.closeBlade(id);
      },
    };
  },
});
</script>

<style lang="less">
@import "~@virtocommerce/ui-kit/dist/ui-kit.css";

@import "./assets/fonts/FontAwesome/css/all.css";

@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 100;
  font-display: swap;
  src: url("./assets/fonts/Roboto/Roboto-Thin.ttf") format("truetype");
}

@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 300;
  font-display: swap;
  src: url("./assets/fonts/Roboto/Roboto-Light.ttf") format("truetype");
}

@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("./assets/fonts/Roboto/Roboto-Regular.ttf") format("truetype");
}

@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("./assets/fonts/Roboto/Roboto-Medium.ttf") format("truetype");
}

@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("./assets/fonts/Roboto/Roboto-Bold.ttf") format("truetype");
}

@font-face {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url("./assets/fonts/Roboto/Roboto-Black.ttf") format("truetype");
}

html,
body,
#app {
  margin: 0;
  height: 100%;
  font-family: "Roboto";
  font-size: var(--font-size-m);
}
</style>
