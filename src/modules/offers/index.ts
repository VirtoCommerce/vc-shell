import * as components from "./components";
import * as schema from "./pages";
import * as composables from "./composables";
import * as locales from "./locales";
import * as notificationTemplates from "./components/notifications";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({
  schema,
  composables,
  moduleComponents: components,
  locales,
  notificationTemplates,
});

export { components, composables, schema, locales, notificationTemplates };
