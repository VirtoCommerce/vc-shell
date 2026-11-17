import { defineAppModule } from "@core/plugins/modularity";
import * as components from "@modules/assets/components";

export const AssetsDetailsModule = defineAppModule({ blades: components });

export default components;
export type { IAssetInfoItem, AssetsDetailsOptions } from "@modules/assets/components/assets-details/types";
