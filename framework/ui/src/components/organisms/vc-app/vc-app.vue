<template>
  <div
    class="vc-app vc-fill_all vc-flex vc-flex-column vc-margin_none"
    :class="[
      `vc-theme_${theme}`,
      { 'vc-app_touch': $isTouch, 'vc-app_phone': $isPhone.value },
    ]"
  >
    <vc-loading v-if="!isReady" :active="true"></vc-loading>
    <template v-else>
      <!-- Show login form for unauthorized users -->
      <slot v-if="!isAuthorized" name="login">
        Error: Login form is not defined.
      </slot>

      <!-- Show main app layout for authorized users -->
      <template v-else>
        <!-- Init application top bar -->
        <vc-app-bar
          class="vc-flex-shrink_0"
          :logo="logo"
          :workspace="workspaceRefs"
          :version="version"
          :buttons="toolbarItems"
          @toolbarbutton:click="onToolbarButtonClick"
          @menubutton:click="$refs.menu.isMobileVisible = true"
          @backlink:click="onClosePage(workspace.length - 1)"
        ></vc-app-bar>

        <div class="vc-app__inner vc-flex vc-flex-grow_1">
          <!-- Init main menu -->
          <vc-app-menu
            ref="menu"
            class="vc-flex-shrink_0"
            :items="menuItems"
            @item:click="onMenuItemClick"
          ></vc-app-menu>

          <!-- If no workspace active then show dashboard -->
          <slot v-if="!workspace.length" name="dashboard">
            Dashboard is not defined
          </slot>

          <!-- Else show workspace blades -->
          <div v-else class="vc-app__workspace vc-flex vc-flex-grow_1">
            <component
              v-for="(blade, index) in workspace"
              v-show="index >= workspace.length - ($isDesktop.value ? 2 : 1)"
              :key="index"
              :is="blade.component"
              :ref="setWorkspaceRef"
              :param="blade.param"
              :closable="index > 0"
              :expanded="index === workspace.length - 1"
              :options="blade.componentOptions"
              @page:open="onOpenPage(index, $event)"
              @page:close="onClosePage(index, $event)"
              @parent:call="onParentCall(index, $event)"
              @notification:show="onShowNotification(index, $event)"
            ></component>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUpdate,
  ref,
  getCurrentInstance,
  Component,
  ComponentPublicInstance,
  watch,
  onMounted,
} from "vue";
import pattern from "url-pattern";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";

interface BladeElement extends ComponentPublicInstance {
  onBeforeClose: () => Promise<boolean>;
  [x: string]: unknown;
}

interface IAppBarButton {
  isVisible?: boolean | (() => boolean);
}

interface IMenuItem {
  isVisible?: boolean | (() => boolean);
}

interface IPage {
  component: Component | unknown;
  componentOptions?: Record<string, unknown> | unknown;
  url?: string;
  param?: string;
}

interface IParentCallArgs {
  method: string;
  args?: unknown;
  callback?: (args: unknown) => void;
}

export default defineComponent({
  name: "VcApp",

  inheritAttrs: false,

  components: {
    VcAppBar,
    VcAppMenu,
  },

  props: {
    pages: {
      type: Array,
      default: () => [],
    },

    menuItems: {
      type: Array,
      default: () => [],
    },

    toolbarItems: {
      type: Array,
      default: () => [],
    },

    isReady: {
      type: Boolean,
      default: false,
    },

    isAuthorized: {
      type: Boolean,
      default: false,
    },

    logo: {
      type: String,
      default: undefined,
    },

    version: {
      type: String,
      default: undefined,
    },

    theme: {
      type: String,
      default: "light",
    },
  },

  setup(props) {
    console.debug("Init vc-app");

    const instance = getCurrentInstance();

    // Setup workspace
    const workspace = ref<IPage[]>([]);
    const workspaceRefs = ref<BladeElement[]>([]);
    const setWorkspaceRef = (el: BladeElement) => {
      if (el) {
        workspaceRefs.value.push(el);
      }
    };
    onBeforeUpdate(() => {
      workspaceRefs.value = [];
    });

    const urlPattern = new pattern("(/:workspace(/:blade(/:param)))");

    watch(
      () => workspace.value,
      (value) => {
        console.log("Workspace changed");
        setTimeout(() => {
          if (value && value.length) {
            const ws = value[0].url;
            let lastBladeWithUrlIndex = -1;
            value.forEach((item, i) => {
              if (item.url) {
                lastBladeWithUrlIndex = i;
              }
            });
            const lastBladeWithUrl = value[lastBladeWithUrlIndex];
            const blade =
              (lastBladeWithUrl &&
                lastBladeWithUrl.url !== ws &&
                lastBladeWithUrl.url) ||
              undefined;
            const param =
              (lastBladeWithUrl &&
                lastBladeWithUrl.url !== ws &&
                lastBladeWithUrl.param) ||
              undefined;

            const url = urlPattern.stringify({
              workspace: ws,
              blade,
              param,
            });
            window?.history?.pushState(null, "", url);
          } else {
            window?.history?.pushState(null, "", "/");
          }
        }, 0);
      }
    );

    /**
     * Parse given URL and open corresponding workspace and blade.
     * @param url Url path (ex.: /products/product-edit/32)
     */
    onMounted(() => {
      const url = window?.location?.pathname || "/";
      const data = urlPattern.match(url);
      if (data?.workspace) {
        const ws = (props.pages as IPage[]).find(
          (item) => item.url === data.workspace
        );
        if (ws) {
          openWorkspace(ws);

          if (data.blade) {
            const blade = (props.pages as IPage[]).find(
              (item) => item.url === data.blade
            );
            if (blade) {
              onOpenPage(0, {
                ...blade,
                param: data.param,
              });
            }
          }
        }
      }
    });

    const onMenuItemClick = function (item: Record<string, unknown>) {
      if (item.clickHandler && typeof item.clickHandler === "function") {
        item.clickHandler(instance?.proxy);
      } else {
        workspace.value = [
          {
            component: item.component,
            componentOptions: item.componentOptions,
          },
        ];
      }
    };

    const onToolbarButtonClick = function (item: Record<string, unknown>) {
      if (item.clickHandler && typeof item.clickHandler === "function") {
        item.clickHandler(instance?.proxy);
      }
    };

    const openDashboard = async () => {
      // Close all opened pages with onBeforeClose callback
      await onClosePage(0);
    };

    const openWorkspace = async (page: IPage) => {
      // Close all opened pages with onBeforeClose callback
      await onClosePage(0);
      workspace.value = [page];
    };

    const onOpenPage = async (index: number, page: IPage) => {
      // Close all child pages with onBeforeClose callback
      if (workspace.value.length > index + 1) {
        await onClosePage(index + 1);
      }
      workspace.value.push(page);
    };

    const onClosePage = async (index: number) => {
      console.log(`onClose called on blade ${index}`);
      const children = workspaceRefs.value.slice(index).reverse();
      let isPrevented = false;
      for (let i = 0; i < children.length; i++) {
        if (
          children[i]?.onBeforeClose &&
          typeof children[i].onBeforeClose === "function"
        ) {
          const result = await children[i].onBeforeClose();
          if (result === false) {
            isPrevented = true;
            break;
          }
        }
      }
      if (!isPrevented) {
        workspace.value.splice(index);
      } else {
        throw "Closing prevented";
      }
    };

    const onParentCall = async (index: number, args: IParentCallArgs) => {
      if (index > 0) {
        const parent = workspaceRefs.value[index - 1];
        if (args.method && typeof parent[args.method] === "function") {
          const method = parent[args.method] as (
            args: unknown
          ) => Promise<unknown>;
          const result = await method(args.args);
          if (typeof args.callback === "function") {
            args.callback(result);
          }
        }
      }
    };

    return {
      workspace,
      workspaceRefs,
      setWorkspaceRef,
      onMenuItemClick,
      onToolbarButtonClick,
      openDashboard,
      openWorkspace,
      onOpenPage,
      onClosePage,
      onParentCall,
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
