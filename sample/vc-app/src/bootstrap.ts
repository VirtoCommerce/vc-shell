import { useMenuService, useLanguages } from "@vc-shell/framework";
import { App } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function bootstrap(app: App) {
  const { addMenuItem } = useMenuService();

  const { setLocale, currentLocale } = useLanguages();

  setLocale(currentLocale.value);

  // Add Dashboard to main menu item
  addMenuItem({
    title: "SHELL.MENU.DASHBOARD",
    icon: "fas fa-home",
    priority: 0,
    url: "/",
  });
}
