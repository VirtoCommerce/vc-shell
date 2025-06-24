import { useMenuService } from "@vc-shell/framework";
import { App } from "vue";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function bootstrap(app: App) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { addMenuItem } = useMenuService();

  // Add Dashboard to main menu item
  //   addMenuItem({
  //     title: "SHELL.MENU.DASHBOARD",
  //     icon: "material-home",
  //     priority: 0,
  //     url: "/",
  //   });
}
