import { App } from "vue";
import { init as initLogger } from "./composables/logger";
import { init as initI18n } from "./composables/i18n";

const init = [initLogger, initI18n];

export default {
  install(app: App): void {
    // Init all children
    init.forEach((fn) => fn(app));
  },
};

export * from "./composables";
