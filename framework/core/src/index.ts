import { App } from "vue";
import { init as initLogger } from "./composables/useLogger";
import { init as initI18n } from "./composables/useI18n";
import * as directives from "./directives";

const init = [initLogger, initI18n];

export default {
  install(app: App): void {
    console.debug(`[@virto-shell/core] - Install plugin`);

    // Init all children
    init.forEach((fn) => fn(app));

    // Register exported directives
    Object.entries(directives).forEach(([directiveName, directive]) => {
      app.directive(directiveName, directive);
    });
  },
};

export * from "./composables";
export * from "./types";
export * from "./utils";
