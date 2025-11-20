import { createAppModule } from "@vc-shell/framework";
import * as pages from "./pages";
import locales from "./locales";

export default createAppModule(
  pages,
  locales,
);

export * from "./types";
export * from "./composables";
