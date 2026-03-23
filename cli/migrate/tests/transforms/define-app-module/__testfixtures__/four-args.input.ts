import { createAppModule } from "@vc-shell/framework";
import * as pages from "./pages";
import * as locales from "./locales";
import * as notificationTemplates from "./components/notifications";
import * as components from "./components";
export default createAppModule(pages, locales, notificationTemplates, components);
