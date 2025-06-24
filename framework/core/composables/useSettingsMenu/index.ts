import { inject, provide } from "vue";
import {
  createSettingsMenuService,
  ISettingsMenuService,
  addSettingsMenuItem,
} from "../../services/settings-menu-service";
import { SettingsMenuServiceKey } from "../../../injection-keys";

export function provideSettingsMenu(): ISettingsMenuService {
  const settingsMenuService = createSettingsMenuService();
  provide(SettingsMenuServiceKey, settingsMenuService);
  return settingsMenuService;
}

export function useSettingsMenu(): ISettingsMenuService {
  const settingsMenuService = inject(SettingsMenuServiceKey);
  if (!settingsMenuService) {
    throw new Error("Settings menu service not found");
  }
  return settingsMenuService;
}

export { addSettingsMenuItem };
