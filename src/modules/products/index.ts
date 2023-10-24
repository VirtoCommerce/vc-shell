import * as components from "./components";
import * as schema from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";
import * as notificationTemplates from "./components/notifications";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({
  schema,
  composables,
  moduleComponents: components,
  notificationTemplates,
  locales,
});

export { components, schema, locales, composables, notificationTemplates };
