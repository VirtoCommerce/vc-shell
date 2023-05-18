import * as pages from "./pages";
import * as locales from "./locales";
import * as notificationTemplates from "./components/notifications";
import { createAppModule } from "@vc-shell/framework";

const ImportModule = createAppModule(pages, locales, notificationTemplates);

export default ImportModule;

export * from "./pages";
export * from "./components";
export * from "./composables";
