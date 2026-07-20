import { createSettingsMenuService, ISettingsMenuService, settingsMenuBus } from "@core/services/settings-menu-service";
import { SettingsMenuServiceKey } from "@framework/injection-keys";
import { createLogger } from "@core/utilities";
import { createServiceRegistry } from "@core/composables/createServiceRegistry";

export type UseSettingsMenuReturn = ISettingsMenuService;

const logger = createLogger("use-settings-menu");

const registry = createServiceRegistry<ISettingsMenuService>({
  key: SettingsMenuServiceKey,
  create: createSettingsMenuService,
  bus: settingsMenuBus,
  name: "SettingsMenuService",
  onMissing: () => logger.error("Settings menu service not found"),
});

export function provideSettingsMenu(): ISettingsMenuService {
  return registry.provide();
}

export function useSettingsMenu(): UseSettingsMenuReturn {
  return registry.use();
}
