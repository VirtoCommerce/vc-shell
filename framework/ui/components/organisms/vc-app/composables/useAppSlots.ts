import { inject, provide, InjectionKey, Slots, VNode, h, Ref } from "vue";
import VcAppMenu from "../_internal/vc-app-menu/vc-app-menu.vue";
import { UserDropdownButton } from "../../../../../shared/components";
import { components } from "../../../../../shared/components/app-switcher";
import { AppDescriptor } from "../../../../../core/api/platform";
import { EMBEDDED_MODE } from "../../../../../injection-keys";

export interface AppSlots {
  navmenu?: () => VNode | VNode[];
  userDropdown?: () => VNode | VNode[];
  appSwitcher?: () => VNode | VNode[];
}

const APP_SLOTS_KEY: InjectionKey<AppSlots> = Symbol("app-slots");

/**
 * Provide app slots to child components
 */
export function provideAppSlots(
  slots: Slots,
  props: {
    disableMenu?: boolean;
    disableAppSwitcher?: boolean;
    version?: string;
    avatar?: string;
    name?: string;
    role?: string;
    appsList?: Ref<AppDescriptor[]>;
    isEmbedded?: boolean;
  },
  handlers: {
    onMenuItemClick?: (item: any) => void;
    switchApp?: (event: any) => void;
  },
) {

  const appSlots: AppSlots = {
    navmenu: () => {
      if (props.disableMenu) return [];
      return h(VcAppMenu, {
        version: props.version,
        onItemClick: handlers.onMenuItemClick,
      });
    },
    userDropdown: () => {
      if (props.isEmbedded) return [];
      return h(UserDropdownButton, {
        avatarUrl: props.avatar,
        name: props.name,
        role: props.role,
      });
    },
    appSwitcher: () => {
      if (props.disableAppSwitcher) return [];
      return (
        slots["app-switcher"]?.() ||
        h(components.VcAppSwitcher, {
          appsList: props.appsList?.value ?? [],
          onClick: handlers.switchApp,
        })
      );
    },
  };

  provide(APP_SLOTS_KEY, appSlots);
  return appSlots;
}

/**
 * Inject app slots in child components
 */
export function useAppSlots() {
  const slots = inject(APP_SLOTS_KEY, {});
  return slots;
}
