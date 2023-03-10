import { createModule } from "../../core/plugins/modularity";
import * as components from "./components";

export default createModule(components);

export * from "./components";
export * from "./composables";
