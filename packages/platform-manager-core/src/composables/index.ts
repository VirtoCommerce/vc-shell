import * as useNavigation from "./navigation";
import useLogger, { init as initLogger } from "./logger";

export const init = [initLogger];
export const composables = [useLogger, useNavigation];
