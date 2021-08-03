import { App } from "vue";
import { init as initLogger } from "./composables/logger";
import { init as initI18n } from "./composables/i18n";
import { init as initRouter } from "./composables/router";

const init = [initLogger, initI18n, initRouter];

export default {
  install(app: App, options: unknown): void {
    // Init all children
    init.forEach((fn) => fn(app, options));
  },
};

export * from "./composables";
