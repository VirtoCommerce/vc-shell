import { usePermissions } from "./../../composables";
import { App } from "vue";

export const permissions = {
  install(app: App) {
    const { checkPermission } = usePermissions();
    app.config.globalProperties.$hasAccess = checkPermission;
    app.provide("$hasAccess", checkPermission);
  },
};
