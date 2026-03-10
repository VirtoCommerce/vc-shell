import { provide, inject, getCurrentInstance, getCurrentScope, onScopeDispose } from "vue";
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
import { createLogger, InjectionError } from "@core/utilities";

export type UseMenuServiceReturn = MenuService;

const logger = createLogger("use-menu-service");

export function provideMenuService(): MenuService {
  const existingService = inject(MenuServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const service = createMenuService();
  provide(MenuServiceKey, service);

  if (getCurrentScope()) {
    onScopeDispose(() => menuServiceBus.dispose(service));
  }

  return service;
}

export function useMenuService(): MenuService {
  const service = inject(MenuServiceKey);
  if (!service) {
    logger.error("Menu service not found in current context. Injection chain:", getCurrentInstance());
    throw new InjectionError("MenuService");
  }
  return service;
}

export { addMenuItem, removeRegisteredMenuItem, setMenuBadge, getMenuBadge, removeMenuBadge, getMenuBadges };
