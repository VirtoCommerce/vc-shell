import { usePermissions } from "@core/composables/usePermissions";
import { App } from "vue";

export const permissions = {
  install(app: App) {
    const { hasAccess } = usePermissions();
    app.config.globalProperties.$hasAccess = hasAccess;
    app.provide("$hasAccess", hasAccess);
  },
};
