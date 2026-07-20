import { getCurrentInstance } from "vue";
import {
  MenuService,
  createMenuService,
  addMenuItem,
  removeRegisteredMenuItem,
  setMenuBadge,
  getMenuBadge,
  removeMenuBadge,
  getMenuBadges,
  menuServiceBus,
} from "@core/services/menu-service";
import { MenuServiceKey } from "@framework/injection-keys";
import { createLogger } from "@core/utilities";
import { createServiceRegistry } from "@core/composables/createServiceRegistry";

export type UseMenuServiceReturn = MenuService;

const logger = createLogger("use-menu-service");

const registry = createServiceRegistry<MenuService>({
  key: MenuServiceKey,
  create: createMenuService,
  bus: menuServiceBus,
  name: "MenuService",
  onMissing: () => logger.error("Menu service not found in current context. Injection chain:", getCurrentInstance()),
});

export function provideMenuService(): MenuService {
  return registry.provide();
}

export function useMenuService(): MenuService {
  return registry.use();
}

export { addMenuItem, removeRegisteredMenuItem, setMenuBadge, getMenuBadge, removeMenuBadge, getMenuBadges };
