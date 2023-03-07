import { ExtendedComponent, IBladeElement, IOpenBlade } from "./../../../../shared";
import { IBladeToolbar, IMenuItems } from "./../../../../core/types";
import { PropType, VNode } from "vue";
import { ExtractTypes } from "./../../../types/ts-helpers";
import { isObject, isNumber } from "./../../../utils";

export const appProps = {
  pages: {
    type: Array as PropType<ExtendedComponent[]>,
    default: () => [],
  },
  menuItems: {
    type: Array as PropType<IMenuItems[]>,
    default: () => [],
  },
  mobileMenuItems: {
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
    type: String as PropType<"light" | "dark">,
    default: "light",
  },
  bladesRefs: {
    type: Array as PropType<IBladeElement[]>,
    default: () => [],
  },
  title: String,
};

export const appEmits = {
  open: (args: IOpenBlade) => isObject(args),
  close: (index: number) => isNumber(index),
  "backlink:click": (index: number) => isNumber(index),
};

export type VcAppProps = ExtractTypes<typeof appProps>;
export type VcAppEmits = typeof appEmits;

export interface VcAppSlots {
  appSwitcher: () => VNode[];
  bladeNavigation: () => VNode[];
  notifications: () => VNode[];
  passwordChange: () => VNode[];
}
