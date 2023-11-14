import { createDynamicAppModule } from "@vc-shell/framework";
import * as schema from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";

export default createDynamicAppModule({
  schema,
  composables,
  locales,
});

export { composables, locales, schema };
