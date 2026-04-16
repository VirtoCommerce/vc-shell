import { defineAppModule } from "@core/plugins/modularity";
import * as components from "@modules/assets-manager/components";

export const AssetsManagerModule = defineAppModule({ blades: components });

export * from "@modules/assets-manager/components";
