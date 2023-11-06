// import * as pages from "./pages";
// import * as locales from "./locales";
// import { createAppModule } from "@vc-shell/framework";

// export default createAppModule(pages, locales);

// export * from "./pages";
// export * from "./composables";

import * as components from "./components";
import * as schema from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";
//import * as notificationTemplates from "./components/notifications";
import { createDynamicAppModule } from "@vc-shell/framework";

export default createDynamicAppModule({
  schema,
  composables,
  moduleComponents: components,
  //  notificationTemplates,
  locales,
});

export { components, schema, locales, composables /*, notificationTemplates*/ };
