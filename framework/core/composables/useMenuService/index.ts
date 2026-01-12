import { provide, inject, getCurrentInstance } from "vue";
import {
  MenuService,
  createMenuService,
  addMenuItem,
  setMenuBadge,
  getMenuBadge,
  removeMenuBadge,
  getMenuBadges,
} from "../../services/menu-service";
import { MenuServiceKey } from "../../../injection-keys";

export function provideMenuService(): MenuService {
  const service = createMenuService();
  provide(MenuServiceKey, service);
  return service;
}

export function useMenuService(): MenuService {
  const service = inject(MenuServiceKey);
  if (!service) {
    console.error("Menu service not found in current context. Injection chain:", getCurrentInstance());
    throw new Error("MenuService not provided");
  }
  return service;
}

export { addMenuItem, setMenuBadge, getMenuBadge, removeMenuBadge, getMenuBadges };
