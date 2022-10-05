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
    <!-- Show login form for unauthorized users -->
    <slot v-if="!isAuthorized" name="login">
      Error: Login form is not defined.
    </slot>

    <!-- Show main app layout for authorized users -->
    <template v-else>
      <!-- Init application top bar -->
      <VcAppBar
        class="shrink-0"
        :logo="logo"
        :workspace="workspaceRefs"
        :version="version"
        :buttons="toolbarItems"
        @toolbarbutton:click="onToolbarButtonClick"
        @menubutton:click="$refs.menu.isMobileVisible = true"
        @backlink:click="onClosePage(workspace.length - 1)"
        :openPage="onOpenPage"
        :closePage="onClosePage"
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
          :activeItem="activeMenuItem"
          :activeChildItem="activeChildMenuItem"
          :mobileMenuItems="mobileMenuItems"
          @item:click="onMenuItemClick"
        ></VcAppMenu>

        <!-- If no workspace active then show dashboard -->
        <slot v-if="!workspace.length" name="dashboard" :openPage="onOpenPage">
          Dashboard is not defined
        </slot>

        <!-- Else show workspace blades -->
        <div
          v-else
          class="vc-app__workspace px-2 w-full overflow-hidden flex grow basis-0"
        >
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

        <div
          class="[pointer-events:painted] absolute flex z-[1000] overflow-hidden top-0 left-2/4 -translate-x-2/4 flex-col items-center p-2 box-border"
        >
          <slot name="notifications"></slot>
        </div>
        <div>
          <slot name="passwordChange"></slot>
        </div>
      </div>
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

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import { useRouter, useRoute } from "vue-router";
import pattern from "url-pattern";
import VcAppBar from "./_internal/vc-app-bar/vc-app-bar.vue";
import VcAppMenu from "./_internal/vc-app-menu/vc-app-menu.vue";
import { IBladeToolbar, IMenuItems, IPage } from "../../../typings";
import { usePermissions } from "@virto-shell/core";

interface BladeElement extends ComponentPublicInstance {
  onBeforeClose: () => Promise<boolean>;
  [x: string]: unknown;
}

interface IParentCallArgs {
  method: string;
  args?: unknown;
  callback?: (args: unknown) => void;
}

const props = defineProps({
  pages: {
    type: Array,
    default: () => [],
  },

  menuItems: {
    type: Array as PropType<IMenuItems[]>,
    default: () => [],
  },

  mobileMenuItems: {
    type: Array as PropType<IBladeToolbar[]>,
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
});

console.debug("vc-app: Init vc-app");

const instance = getCurrentInstance();

const router = useRouter();
const route = useRoute();
const { checkPermission } = usePermissions();
const activeMenuItem = ref<IMenuItems>();
const activeChildMenuItem = ref<IMenuItems>();

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
  () => props.isAuthorized,
  (value) => {
    if (!value) {
      openDashboard();
    }
  }
);

watch(
  () => workspace.value,
  (value) => {
    if (props.isReady) {
      if (value && value.length) {
        let ws: string;
        if (
          value[0].componentOptions &&
          (value[0].componentOptions as Record<string, string>).url
        ) {
          ws = (value[0].componentOptions as Record<string, string>).url;
        } else {
          ws = value[0].url as string;
        }

        activeMenuItem.value =
          (props.menuItems as IMenuItems[]).find(
            (item) => item.component?.url === ws
          ) ||
          (props.menuItems as IMenuItems[]).find((item) =>
            item.children?.find(
              (child) =>
                (child.componentOptions as Record<string, string>) &&
                (child.componentOptions as Record<string, string>).url === ws
            )
          ) ||
          (props.menuItems as IMenuItems[]).find((item) =>
            item.children?.find((child) => child.component?.url === ws)
          ) ||
          props.menuItems[0];

        activeChildMenuItem.value =
          activeMenuItem.value &&
          activeMenuItem.value?.children &&
          activeMenuItem.value?.children.find((child) => {
            if (
              child.componentOptions &&
              (child.componentOptions as Record<string, string>).url
            ) {
              return (
                (child.componentOptions as Record<string, string>).url === ws
              );
            }
            return child.component?.url === ws;
          });

        let lastBladeWithUrlIndex = -1;
        value.forEach((item, i) => {
          if (
            item.componentOptions &&
            (item.componentOptions as Record<string, string>).url
          ) {
            lastBladeWithUrlIndex = i;
          } else if (item.url) {
            lastBladeWithUrlIndex = i;
          }
        });
        const lastBladeWithUrl = value[lastBladeWithUrlIndex];

        let blade: string | undefined;
        let param: string | undefined;

        if (
          lastBladeWithUrl.componentOptions &&
          (lastBladeWithUrl.componentOptions as Record<string, string>).url
        ) {
          blade =
            (lastBladeWithUrl &&
              (lastBladeWithUrl.componentOptions as Record<string, string>)
                .url !== ws &&
              (lastBladeWithUrl.componentOptions as Record<string, string>)
                .url) ||
            undefined;

          param =
            (lastBladeWithUrl &&
              (lastBladeWithUrl.componentOptions as Record<string, string>)
                .url !== ws &&
              lastBladeWithUrl.param) ||
            undefined;
        } else {
          blade =
            (lastBladeWithUrl &&
              lastBladeWithUrl.url !== ws &&
              lastBladeWithUrl.url) ||
            undefined;
          param =
            (lastBladeWithUrl &&
              lastBladeWithUrl.url !== ws &&
              lastBladeWithUrl.param) ||
            undefined;
        }

        const url = urlPattern.stringify({
          workspace: ws,
          blade,
          param,
        });
        router.push(url);
      } else {
        router.push("/");
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

  const url = route.path || "/";
  const data = urlPattern.match(url);
  if (data?.workspace) {
    const ws = (props.pages as IPage[]).find(
      (item) => item.url === data.workspace
    );

    if (ws) {
      const permissions = ws.permissions;

      const hasAccess =
        permissions && permissions.length ? checkPermission(permissions) : true;

      if (hasAccess) {
        workspace.value.push({
          component: shallowRef(ws),
          url: ws.url,
        });

        activeMenuItem.value =
          (props.menuItems as IMenuItems[]).find(
            (item) => item.component?.url === ws.url
          ) ||
          (props.menuItems as IMenuItems[]).find((item) =>
            item.children?.find((child) => child.component?.url === ws.url)
          );

        activeChildMenuItem.value =
          activeMenuItem.value &&
          activeMenuItem.value?.children &&
          activeMenuItem.value?.children.find(
            (child) => child.component?.url === ws.url
          );

        if (data.blade) {
          const blade = (props.pages as IPage[]).find(
            (item) => item.url === data.blade
          );

          if (blade && accessGuard(blade)) {
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
    }
  } else {
    activeMenuItem.value = props.menuItems[0];
  }
});

const accessGuard = (bladeComponent: IPage) => {
  const permissions = bladeComponent.permissions;
  return permissions ? checkPermission(permissions as string | string[]) : true;
};

const onMenuItemClick = function (item: Record<string, unknown>) {
  console.debug(`vc-app#onMenuItemClick() called.`);

  if (item.clickHandler && typeof item.clickHandler === "function") {
    item.clickHandler(instance?.exposed);
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
  activeChildMenuItem.value = props.menuItems[0];
};

const openWorkspace = async (page: IPage) => {
  console.debug(`vc-app#openWorkspace() called.`);

  // Close all opened pages with onBeforeClose callback
  await onClosePage(0);

  if (accessGuard(page.component as IPage)) {
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
  } else {
    alert("Access restricted");
  }
};

const onOpenPage = async (index: number, page: IPage) => {
  console.debug(`vc-app#onOpenPage(${index}) called.`);

  // Close all child pages with onBeforeClose callback
  if (workspace.value.length > index + 1) {
    await onClosePage(index + 1);
  }

  if (accessGuard(page.component as IPage)) {
    const isPageInWorkspace = workspace.value.some((x) => x.url === page.url);
    if (!isPageInWorkspace) {
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
    }
  } else {
    alert("Access restricted");
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
      const method = parent[args.method] as (args: unknown) => Promise<unknown>;
      const result = await method(args.args);
      if (typeof args.callback === "function") {
        args.callback(result);
      }
    }
  }
};

defineExpose({
  openDashboard,
  openWorkspace,
  onOpenPage,
  onClosePage,
  onParentCall,
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
