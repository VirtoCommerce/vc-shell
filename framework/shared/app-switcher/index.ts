import { App } from "vue";
import * as components from './components'

export default {
  install(app: App): void {
    // Register exported components
    Object.entries(components).forEach(([componentName, component]) => {
      app.component(componentName, component);
    });
  },
};

export * from './composables'
export * from './components'
