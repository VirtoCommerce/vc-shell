import { App } from "vue";
import { createModule } from "./../../../core/plugins";
import * as components from "./components";
import * as locales from "./locales";
import { CommonPageComposables } from "./../../../typings";

export const LoginPage = {
  install(app: App, config: CommonPageComposables) {
    // Register components
    createModule(components, locales).install(app);

    if (config) {
      app.config.globalProperties.commonPageComposables = config;
      app.provide("commonPageComposables", config);
    }
  },
};
