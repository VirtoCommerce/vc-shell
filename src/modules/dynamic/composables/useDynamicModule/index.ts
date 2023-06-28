import { useRouter } from "vue-router";
import custom from "./../../list.json";
import { kebabToPascal } from "@vc-shell/framework";
import dynamic from "./../../dynamic-blade-list.vue";

export default () => {
  const router = useRouter();

  function registerModule() {
    const mainRouteName = router.getRoutes().find((r) => r.meta?.root)?.name;

    router.addRoute(mainRouteName, {
      name: kebabToPascal(custom.settings.url.substring(1)),
      path: custom.settings.url.substring(1),
      component: dynamic,
    });
  }

  function menuItemFactory(title, icon, component) {
    return {
      title,
      icon,
      isVisible: true,
      component,
    };
  }

  function menu() {
    const item = menuItemFactory(custom.settings.moduleName, custom.settings.icon, dynamic);

    return item;
  }

  return {
    items: menu,
    registerModule,
  };
};
