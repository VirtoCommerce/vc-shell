import { defineAppModule } from "@vc-shell/framework";
import * as blades from "./pages";
import * as locales from "./locales";

export default defineAppModule({ blades, locales });

export * from "./pages";
export * from "./composables";
