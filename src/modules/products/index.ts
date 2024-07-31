import * as components from "./components";
import * as schema from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";
import * as notificationTemplates from "./components/notifications";
import { createDynamicAppModule, createAppModule } from "@vc-shell/framework";
import { default as Associations } from "./pages/Associations.vue";
import { default as AssociationsItems } from "./pages/AssociationsItems.vue";
import { Router } from "vue-router";
import { App } from "vue";

export default (() => {
  const dynamic = createDynamicAppModule({
    schema,
    composables,
    moduleComponents: components,
    notificationTemplates,
    locales,
  });

  const module = createAppModule({
    Associations,
    AssociationsItems,
  });

  return {
    install(app: App, options: { router: Router }): void {
      dynamic.install(app, options);
      module.install(app, options);
    },
  };
})();

export { components, schema, locales, composables, notificationTemplates };
