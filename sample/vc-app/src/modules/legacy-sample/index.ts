import * as pages from "./pages";
import * as locales from "./locales";
import * as composables from "./composables";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales);

export { pages, locales, composables };
