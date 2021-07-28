import { App } from "vue";

import { init } from "./composables";

export default {
  install(app: App): void {
    // Init all children
    init.forEach((fn) => fn(app));
  },
};

export { composables } from "./composables";
