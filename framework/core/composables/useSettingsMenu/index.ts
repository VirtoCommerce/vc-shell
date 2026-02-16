import { inject, provide, getCurrentScope, onScopeDispose } from "vue";
import {
  createSettingsMenuService,
  ISettingsMenuService,
  addSettingsMenuItem,
  settingsMenuBus,
} from "../../services/settings-menu-service";
import { SettingsMenuServiceKey } from "../../../injection-keys";
import { createLogger, InjectionError } from "../../utilities";

const logger = createLogger("use-settings-menu");

export function provideSettingsMenu(): ISettingsMenuService {
  const existingService = inject(SettingsMenuServiceKey, null);
  if (existingService) {
    return existingService;
  }

  const settingsMenuService = createSettingsMenuService();
  provide(SettingsMenuServiceKey, settingsMenuService);

  if (getCurrentScope()) {
    onScopeDispose(() => settingsMenuBus.dispose(settingsMenuService));
  }

  return settingsMenuService;
}

export function useSettingsMenu(): ISettingsMenuService {
  const settingsMenuService = inject(SettingsMenuServiceKey);
  if (!settingsMenuService) {
    logger.error("Settings menu service not found");
    throw new InjectionError("SettingsMenuService");
  }
  return settingsMenuService;
}

export { addSettingsMenuItem };
