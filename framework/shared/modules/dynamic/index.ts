/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pages from "./pages";
import { App, Component, DefineComponent, defineComponent } from "vue";
import { DynamicSchema, OverridesSchema } from "./types";
import * as _ from "lodash-es";
import { handleOverrides } from "./helpers/override";
import { reactiveComputed } from "@vueuse/core";
import { kebabToPascal } from "../../../core/utilities";
import { BladeInstanceConstructor } from "../../index";
import { createAppModule } from "../../../core/plugins";
import { BladeMenu, NavigationMenu } from "../../../core/types";
import { ComponentProps } from "./../../utilities/vueUtils";

interface Registered {
  component: BladeInstanceConstructor;
  name: string;
  model: DynamicSchema;
}

const createAppModuleWrapper = (args: {
  bladeName: string;
  bladeComponent: BladeInstanceConstructor;
  appModuleContent:
    | {
        locales?: { [key: string]: object };
        notificationTemplates?: { [key: string]: Component };
        moduleComponents?: { [key: string]: Component };
      }
    | undefined;
}) => {
  const { bladeName, bladeComponent, appModuleContent } = args;
  return createAppModule(
    { [bladeName]: bladeComponent },
    appModuleContent?.locales,
    appModuleContent?.notificationTemplates,
    appModuleContent?.moduleComponents
  );
};

const register = (
  args: {
    app: App;
    component: BladeInstanceConstructor;
    composables: { [key: string]: (...args: any[]) => any };
    json: DynamicSchema;
    options?: { router: any };
  },
  appModuleContent:
    | {
        locales?: { [key: string]: object };
        notificationTemplates?: { [key: string]: Component };
        moduleComponents?: { [key: string]: Component };
      }
    | undefined
): Registered => {
  const { app, component, json, options } = args;
  const bladeComponent = _.cloneDeep(component);
  let rawUrl: `/${string}`;

  const bladeName = kebabToPascal(json.settings.id);

  if (json.settings.url) {
    rawUrl = json.settings.url as `/${string}`;
    bladeComponent.url = rawUrl;
  }

  if (json.settings.permissions) {
    bladeComponent.permissions = json.settings.permissions;
  }

  const BladeInstanceConstructor = defineComponent({
    ...bladeComponent,
    name: bladeName,
    isWorkspace: "isWorkspace" in json.settings && json.settings.isWorkspace,
    setup: (props: ComponentProps<typeof bladeComponent>, ctx) =>
      (bladeComponent?.setup &&
        bladeComponent.setup(
          reactiveComputed(() => ({
            ...props,
            model: json,
            composables: args.composables,
          })) as any,
          reactiveComputed(() => ctx) as any
        )) ??
      {},
  });

  const module = createAppModuleWrapper({
    bladeName,
    bladeComponent: BladeInstanceConstructor,
    appModuleContent,
  });

  module.install(app, options);

  return {
    component: BladeInstanceConstructor,
    name: bladeName,
    model: json,
  };
};

const handleError = (errorKey: string, schema: { [key: string]: DynamicSchema }, text?: string) => {
  console.error(
    `Module initialization aborted. '${errorKey}' key not found in files: ${Object.keys(schema).join(
      ", "
    )}. '${errorKey}' key ${text}`
  );
};

export const createDynamicAppModule = <T extends BladeMenu>(args: {
  schema: { [key: string]: DynamicSchema };
  composables: { [key: string]: (...args: any[]) => any };
  menuConfig?: { [I in keyof T]: NavigationMenu<T[I]> };
  overrides?: OverridesSchema;
  moduleComponents?: { [key: string]: Component };
  locales?: { [key: string]: object };
  notificationTemplates?: { [key: string]: Component };
}) => {
  const moduleInitializer = _.findKey(args.schema, (o) => "isWorkspace" in o.settings && o.settings.isWorkspace);
  const everyHasTemplate = _.every(Object.values(args.schema), (o) => o?.settings?.component);

  if (!everyHasTemplate) handleError("component", args.schema, "must be included in 'settings' of every file");
  if (!moduleInitializer)
    handleError(
      "isWorkspace",
      args.schema,
      "must be included in one of this files to initialize module workspace blade"
    );

  if (moduleInitializer && everyHasTemplate) {
    let schemaCopy = _.cloneDeep({ ...args.schema });

    if (args.overrides) {
      schemaCopy = handleOverrides(args.overrides, schemaCopy);
    }

    return {
      install(app: App, options: { router: any }) {
        const bladePages = { ...pages };
        const appModuleContent = {
          locales: args?.locales,
          notificationTemplates: args?.notificationTemplates,
          moduleComponents: args?.moduleComponents,
        };
        Object.entries(schemaCopy).forEach(([, JsonSchema], index) => {
          const blade = register(
            {
              app,
              component: bladePages[
                JsonSchema.settings.component as keyof typeof bladePages
              ] as BladeInstanceConstructor,
              composables: { ...args.composables },
              json: JsonSchema,
              options,
            },
            index === 0 ? appModuleContent : undefined
          );

          if (!blade) {
            return;
          }
        });
      },
    };
  }
};

export * from "./pages";
export * from "./composables";
export * from "./components";
export * from "./factories";
export * from "./types";
