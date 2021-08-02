import { App } from "vue";
import { init as initLogger } from "./composables/logger";

const init = [initLogger];

export default {
  install(app: App): void {
    // Init all children
    init.forEach((fn) => fn(app));
  },
};

export * from "./composables";
