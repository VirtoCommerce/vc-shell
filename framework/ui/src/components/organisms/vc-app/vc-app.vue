<template>
  <div
    class="vc-app vc-fill_all vc-flex vc-flex-column vc-margin_none"
    :class="[
      `vc-theme_${theme}`,
      {
        'vc-app_touch': $isTouch,
        'vc-app_phone': $isPhone.value,
        'vc-app_mobile': $isMobile.value,
      },
    ]"
  >
    <vc-loading v-if="!isReady" active></vc-loading>
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
          @logo:click="openDashboard"
        ></vc-app-bar>

        <div class="vc-app__inner vc-flex vc-flex-grow_1">
          <!-- Init main menu -->
          <vc-app-menu
            ref="menu"
            class="vc-flex-shrink_0"
            :items="menuItems"
            :activeItem="activeMenuItem"
            @item:click="onMenuItemClick"
          ></vc-app-menu>

          <!-- If no workspace active then show dashboard -->
          <slot
            v-if="!workspace.length"
            name="dashboard"
            :openPage="onOpenPage"
          >
            Dashboard is not defined
          </slot>

          <!-- Else show workspace blades -->
          <div v-else class="vc-app__workspace vc-flex vc-flex-grow_1">
            <component
              v-for="(blade, index) in workspace"
              v-show="index >= workspace.length - ($isMobile.value ? 1 : 2)"
              :key="index"
              :is="blade.component"
              :ref="setWorkspaceRef"
              :param="blade.param"
              :closable="index > 0"
              :expanded="index === workspace.length - 1"
              :options="blade.componentOptions"
              @page:open="onOpenPage(index, $event)"
              @page:close="onClosePage(index, $event)"
              @page:closeChildren="onClosePage(index + 1, $event)"
              @parent:call="onParentCall(index, $event)"
              @notification:show="onShowNotification(index, $event)"
            ></component>
          </div>

          <div class="vc-app__notifications">
            <slot name="notifications"></slot>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onBeforeUpdate,
  ref,
  getCurrentInstance,
  ComponentPublicInstance,
  watch,
  onMounted,
  shallowRef,
  PropType,
} from "vue";
import pattern from "url-pattern";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";
import { IBladeToolbar, IMenuItems, IPage } from "../../../typings";

interface BladeElement extends ComponentPublicInstance {
  onBeforeClose: () => Promise<boolean>;
  [x: string]: unknown;
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
      type: Array as PropType<IMenuItems[]>,
      default: () => [],
    },

    toolbarItems: {
      type: Array as PropType<IBladeToolbar[]>,
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
    console.debug("vc-app: Init vc-app");

    const instance = getCurrentInstance();

    const activeMenuItem = ref<IBladeToolbar>();

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
        if (props.isReady) {
          if (value && value.length) {
            const ws = value[0].url;
            activeMenuItem.value =
              (props.menuItems as IBladeToolbar[]).find(
                (item) => item.component?.url === ws
              ) || props.menuItems[0];
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
        }
      },
      { deep: true }
    );

    /**
     * Parse location and open corresponding workspace and blade.
     */
    onMounted(() => {
      console.debug(`vc-app#onMounted() called.`);

      const url = window?.location?.pathname || "/";
      const data = urlPattern.match(url);
      if (data?.workspace) {
        const ws = (props.pages as IPage[]).find(
          (item) => item.url === data.workspace
        );
        if (ws) {
          workspace.value.push({
            component: shallowRef(ws),
            url: ws.url,
          });

          activeMenuItem.value = (props.menuItems as IBladeToolbar[]).find(
            (item) => item.component?.url === ws.url
          );

          if (data.blade) {
            const blade = (props.pages as IPage[]).find(
              (item) => item.url === data.blade
            );
            if (blade) {
              if (workspace.value.length) {
                workspace.value[0].param = data.param;
              }
              workspace.value.push({
                component: shallowRef(blade),
                url: blade.url,
                param: data.param,
              });
            }
          }
        }
      } else {
        activeMenuItem.value = props.menuItems[0];
      }
    });

    const onMenuItemClick = function (item: Record<string, unknown>) {
      console.debug(`vc-app#onMenuItemClick() called.`);

      activeMenuItem.value = item;

      if (item.clickHandler && typeof item.clickHandler === "function") {
        item.clickHandler(instance?.proxy);
      } else {
        openWorkspace({
          component: item.component,
          componentOptions: item.componentOptions,
        });
      }
    };

    const onToolbarButtonClick = function (item: Record<string, unknown>) {
      console.debug(`vc-app#onToolbarButtonClick() called.`);

      if (item.clickHandler && typeof item.clickHandler === "function") {
        item.clickHandler(instance?.proxy);
      }
    };

    const openDashboard = async () => {
      console.debug(`vc-app#openDashboard() called.`);

      // Close all opened pages with onBeforeClose callback
      await onClosePage(0);
      activeMenuItem.value = props.menuItems[0];
    };

    const openWorkspace = async (page: IPage) => {
      console.debug(`vc-app#openWorkspace() called.`);

      // Close all opened pages with onBeforeClose callback
      await onClosePage(0);
      workspace.value = [
        {
          ...page,
          component: shallowRef(page.component),
          url:
            page.url === undefined
              ? (page.component as Record<string, string>).url
              : page.url,
        },
      ];
    };

    const onOpenPage = async (index: number, page: IPage) => {
      console.debug(`vc-app#onOpenPage(${index}) called.`);

      // Close all child pages with onBeforeClose callback
      if (workspace.value.length > index + 1) {
        await onClosePage(index + 1);
      }
      workspace.value.push({
        ...page,
        component: shallowRef(page.component),
        url:
          page.url === undefined
            ? (page.component as Record<string, string>).url
            : page.url,
      });
      if (typeof page?.onOpen === "function") {
        page?.onOpen?.();
      }
    };

    const onClosePage = async (index: number) => {
      console.debug(`vc-app#onClosePage(${index}) called.`);
      if (index < workspace.value.length) {
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
          if (typeof workspace.value[index]?.onClose === "function") {
            workspace.value[index]?.onClose?.();
          }
          workspace.value.splice(index);
        } else {
          throw "Closing prevented";
        }
      }
    };

    const onParentCall = async (index: number, args: IParentCallArgs) => {
      console.debug(
        `vc-app#onParentCall(${index}, { method: ${args.method} }) called.`
      );
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
      activeMenuItem,
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
:root {
  --app-background: #eff2fa;
}

.vc-app {
  font-size: var(--font-size-m);
  background: var(--app-background);
  overflow: hidden;

  &__inner {
    overflow: hidden;
  }

  &__workspace {
    padding-left: var(--padding-s);
    padding-right: var(--padding-s);
    width: 100%;
    overflow: hidden;

    .vc-app_mobile & {
      padding: 0;
    }
  }

  &__notifications {
    position: absolute;
    display: flex;
    z-index: 1000;
    overflow: hidden;
    pointer-events: painted;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column;
    align-items: center;
    padding: var(--padding-s);
    box-sizing: border-box;
  }
}
</style>
