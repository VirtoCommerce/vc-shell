import * as blades from "./pages";
import * as locales from "./locales";
import { defineAppModule } from "@vc-shell/framework";

export default defineAppModule({
  blades,
  locales,
});

export * from "./pages";
export * from "./composables";
