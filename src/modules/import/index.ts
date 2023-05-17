import * as pages from "./pages";
import * as locales from "./locales";
import * as notificationTemplates from "./components/notifications";
import { createAppModule } from "@vc-shell/framework";

export default createAppModule(pages, locales, notificationTemplates);

export * from "./pages";
export * from "./components";
export * from "./composables";
