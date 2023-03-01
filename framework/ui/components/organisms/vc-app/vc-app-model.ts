import { ExtendedComponent, IBladeElement, IOpenBlade } from "@/shared";
import { IBladeToolbar, IMenuItems } from "@/core/types";
import { VNode } from "vue";

export interface VcAppProps {
  pages?: ExtendedComponent[] | undefined;
  menuItems?: IMenuItems[] | undefined;
  mobileMenuItems?: IMenuItems[] | undefined;
  toolbarItems?: IBladeToolbar[] | undefined;
  isReady?: boolean | undefined;
  isAuthorized?: boolean | undefined;
  logo?: string | undefined;
  version?: string | undefined;
  theme?: "light" | "dark" | undefined;
  bladesRefs?: IBladeElement[] | undefined;
  title?: string | undefined;
  onOpen?: (args: IOpenBlade) => void;
  onClose?: (index: number) => void;
  "onBacklink:click"?: (index: number) => void;
}

export interface VcAppSlots {
  appSwitcher: () => VNode[];
  bladeNavigation: () => VNode[];
  notifications: () => VNode[];
  passwordChange: () => VNode[];
}
