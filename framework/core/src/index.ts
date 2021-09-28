import { App } from "vue";
import { init as initLogger } from "./composables/useLogger";
import { init as initI18n } from "./composables/useI18n";

const init = [initLogger, initI18n];

export default {
  install(app: App): void {
    console.debug(`[@virtoshell/core] - Install plugin`);

    // Init all children
    init.forEach((fn) => fn(app));
  },
};

export * from "./composables";
export * from "./types";
export * from "./utils";
