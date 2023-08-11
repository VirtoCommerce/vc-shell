import { Router } from "vue-router";
import { BladeConstructor, kebabToPascal } from "@vc-shell/framework";
import { modulesListJSON } from "./../../json";
import DynamicBladeForm from "./pages/dynamic-blade-form.vue";
import DynamicBladeList from "./pages/dynamic-blade-list.vue";
import { App, Component, DefineComponent, VNode } from "vue";
import { useDynamicModule } from "./composables";
import { DynamicData } from "./types";
import * as _ from "lodash-es";

const { createMenuItem } = useDynamicModule();

function registerModule(
  page: BladeConstructor,
  data: {
    data: DynamicData;
    detailsComponent?: BladeConstructor;
  },
  router: Router,
  app?: App
) {
  const mainRouteName = router.getRoutes().find((r) => r.meta?.root)?.name;
  const bladeName = kebabToPascal(data.data.settings.url.substring(1));
  router.addRoute(mainRouteName, {
    name: bladeName,
    path: data.data.settings.url.substring(1),
    component: page,
    props: () => ({
      model: data.data,
      detailsComponent: data.detailsComponent,
    }),
  });
  console.log(bladeName);
  if (app) {
    app.component(bladeName, page);
  }
}

function createDynamicModule() {
  const modules: Record<string, DynamicData>[] = modulesListJSON;
  return {
    install(app: App, options?: { router: Router }) {
      modules.forEach((module) => {
        const listBladeDeepCopy = _.cloneDeep(DynamicBladeList);
        const detailsBladeDeepCopy = _.cloneDeep(DynamicBladeForm);

        let parent;
        let parentData;
        for (const [key, value] of Object.entries(module)) {
          if (key === "list") {
            listBladeDeepCopy.url = value.settings.url as `/${string}`;
            app.config.globalProperties.pages?.push(listBladeDeepCopy);
            app.config.globalProperties.bladeRoutes?.push({
              component: listBladeDeepCopy,
              route: listBladeDeepCopy.url,
              name: kebabToPascal(value.settings.url.substring(1)),
            });

            registerModule(listBladeDeepCopy, { data: value }, options.router);
            createMenuItem(listBladeDeepCopy, value);

            parent = listBladeDeepCopy;
            parentData = { data: value };
          }
          if (key === "form") {
            detailsBladeDeepCopy.url = value.settings.url as `/${string}`;
            app.config.globalProperties.pages?.push(detailsBladeDeepCopy);
            app.config.globalProperties.bladeRoutes?.push({
              component: detailsBladeDeepCopy,
              route: detailsBladeDeepCopy.url,
              name: kebabToPascal(value.settings.url.substring(1)),
            });

            registerModule(detailsBladeDeepCopy, { data: value }, options.router);

            // Extends parent blade with child component
            registerModule(parent, { ...parentData, detailsComponent: detailsBladeDeepCopy }, options.router, app);
          }
        }
      });
    },
  };
}

export default createDynamicModule();

export * from "./pages";
export * from "./composables";
