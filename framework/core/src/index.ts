import { App } from "vue";
import { init as initLogger } from "./composables/useLogger";
import { init as initI18n } from "./composables/useI18n";
import { init as initBlade } from "./composables/useRouter";

const init = [initLogger, initI18n, initBlade];

export default {
  install(app: App, options: Record<string, unknown>): void {
    console.debug(`[@virtoshell/core] - Install plugin`);

    // Init all children
    init.forEach((fn) => fn(app, options));
  },
};

export * from "./composables";
export * from "./types";
export * from "./utils";
