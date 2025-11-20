import { createAppModule } from "@vc-shell/framework";
import * as pages from "./pages";
import * as locales from "./locales";

export default createAppModule(pages, locales);

export * from "./types";
