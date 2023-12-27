import { useMenuService } from "@vc-shell/framework";
import "./pages/Dashboard.vue";
import { App } from "vue";

export function bootstrap(app: App) {
  const { addMenuItem } = useMenuService();

  // Add Dashboard to main menu item
  addMenuItem({
    title: "SHELL.MENU.DASHBOARD",
    icon: "fas fa-home",
    priority: 0,
    url: "/",
  });
}
