import _VcMenu from "@ui/components/molecules/vc-menu/vc-menu.vue";
import _VcMenuItem from "@ui/components/molecules/vc-menu/vc-menu-item.vue";
import _VcMenuGroup from "@ui/components/molecules/vc-menu/vc-menu-group.vue";

export const VcMenu = _VcMenu as typeof _VcMenu;
export const VcMenuItem = _VcMenuItem as typeof _VcMenuItem;
export const VcMenuGroup = _VcMenuGroup as typeof _VcMenuGroup;

export type { VcMenuProps, VcMenuItemProps, VcMenuItemBadge, VcMenuGroupProps } from "@ui/components/molecules/vc-menu/types";

export { VcMenuExpandedKey } from "@ui/components/molecules/vc-menu/constants";
