import { createModule } from "../../core/plugins/modularity";
import * as components from "./components";
import * as locales from "./locales";

export default createModule(components, locales);

export * from "./components";
