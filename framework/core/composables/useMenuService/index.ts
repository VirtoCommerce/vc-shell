import { provide, inject, getCurrentInstance } from "vue";
import { MenuService, createMenuService, addMenuItem } from "../../services/menu-service";
import { MenuServiceKey } from "../../../injection-keys";
import { createLogger, InjectionError } from "../../utilities";

const logger = createLogger("use-menu-service");

export function provideMenuService(): MenuService {
  const service = createMenuService();
  provide(MenuServiceKey, service);
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

export { addMenuItem };
