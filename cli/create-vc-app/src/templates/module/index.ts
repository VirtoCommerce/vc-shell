import * as pages from "./pages";
import * as composables from "./composables";
import * as components from "./components";
import * as locales from "./locales";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(
  pages,
  locales,
  composables,
  components,
);

