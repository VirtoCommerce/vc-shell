import { defineAppModule } from "@core/plugins/modularity";
import * as components from "@modules/assets/components";

export const AssetsDetailsModule = defineAppModule({ blades: components });

export default components;
