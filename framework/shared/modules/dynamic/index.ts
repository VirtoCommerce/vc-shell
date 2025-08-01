/* eslint-disable @typescript-eslint/no-explicit-any */
import * as pages from "./pages";
import { App, Component, SetupContext, defineComponent, watch } from "vue";
import { DynamicSchema, OverridesSchema } from "./types";
import * as _ from "lodash-es";
import { handleOverrides } from "./helpers/override";
import { reactiveComputed } from "@vueuse/core";
import { kebabToPascal } from "../../../core/utilities";
import { BladeInstanceConstructor, notification } from "../../index";
import { createAppModule } from "../../../core/plugins";
import { ComponentProps } from "./../../utilities/vueUtils";
import { Router } from "vue-router";

interface Registered {
  component: BladeInstanceConstructor;
  name: string;
  model: DynamicSchema;
  composables: { [key: string]: (...args: any[]) => any };
  mixin?: ((...args: any[]) => any)[];
}

const registeredModules: { [key: string]: Registered } = {};
const installedBladeIds = new Set<string>();
const registeredSchemas: { [key: string]: DynamicSchema } = {};

const createAppModuleWrapper = (args: {
  bladeName: string;
  bladeComponent: BladeInstanceConstructor;
  appModuleContent?:
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
    appModuleContent?.notificationTemplates as { [key: string]: Component & { notifyType: string } },
    appModuleContent?.moduleComponents,
  );
};

const createBladeInstanceConstructor = (
  bladeComponent: any,
  bladeName: string,
  json: DynamicSchema,
  args: {
    moduleUid: string;
    composables?: { [key: string]: (...args: any[]) => any };
    mixin?: ((...args: any[]) => any)[];
  },
  existingComposables?: { [key: string]: (...args: any[]) => any },
  existingMixins?: ((...args: any[]) => any)[],
) => {
  return defineComponent({
    ...bladeComponent,
    name: bladeName,
    url: json.settings.url ? (json.settings.url as `/${string}`) : undefined,
    permissions: json.settings.permissions,
    isWorkspace: "isWorkspace" in json.settings && json.settings.isWorkspace,
    menuItem: ("menuItem" in json.settings && json.settings.menuItem) ?? undefined,
    moduleUid: args.moduleUid,
    routable: json.settings.routable ?? true,
    notifyType: json.settings.pushNotificationType,
    composables: existingComposables ? { ...existingComposables, ...args.composables } : args.composables,
    setup: (props: ComponentProps<typeof bladeComponent>, ctx: SetupContext) =>
      (bladeComponent?.setup &&
        bladeComponent.setup(
          reactiveComputed(() =>
            Object.assign({}, props, {
              model: json,
              composables: existingComposables ? { ...existingComposables, ...args.composables } : args.composables,
              mixinFn: existingMixins
                ? [...existingMixins, ...(args.mixin || [])]
                : args.mixin?.length
                  ? args.mixin
                  : undefined,
            } as any),
          ),
          ctx,
        )) ??
      {},
  });
};

const register = (
  args: {
    app: App;
    component: BladeInstanceConstructor;
    composables: { [key: string]: (...args: any[]) => any } | undefined;
    mixin?: ((...args: any[]) => any)[];
    json: DynamicSchema;
    options?: { router: Router };
    moduleUid: string;
  },
  appModuleContent?:
    | {
        locales?: { [key: string]: object };
        notificationTemplates?: { [key: string]: Component };
        moduleComponents?: { [key: string]: Component };
      }
    | undefined,
): Registered => {
  const { app, component, json, options } = args;
  const bladeId = json.settings.id;
  const bladeName = kebabToPascal(bladeId);

  if (registeredModules[bladeName]) {
    // Module already registered, updating it
    updateBlade(bladeName, json, args, appModuleContent);
    return registeredModules[bladeName];
  }

  const bladeComponent = _.cloneDeep(component);
  const BladeInstanceConstructor = createBladeInstanceConstructor(bladeComponent, bladeName, json, args);

  const module = createAppModuleWrapper({
    bladeName,
    bladeComponent: BladeInstanceConstructor as BladeInstanceConstructor,
    appModuleContent,
  });

  module.install(app, options);

  const newModule: Registered = {
    component: BladeInstanceConstructor as BladeInstanceConstructor,
    name: bladeName,
    model: json,
    composables: { ...args.composables },
    mixin: args.mixin, // Set mixin directly
  };

  registeredModules[bladeName] = newModule;

  return newModule;
};

const handleError = (errorKey: string, schemas: { [key: string]: DynamicSchema }, text?: string) => {
  return console.error(
    `Module initialization aborted. Key '${errorKey}' not found in schemas: ${Object.keys(schemas).join(
      ", ",
    )}. Key '${errorKey}' ${text}`,
  );
};

const updateBlade = (
  moduleName: string,
  newSchema: DynamicSchema,
  args: {
    app: App;
    component: BladeInstanceConstructor;
    composables?: { [key: string]: (...args: any[]) => any };
    mixin?: ((...args: any[]) => any)[];
    json: DynamicSchema;
    options?: { router: Router };
    moduleUid: string;
  },
  appModuleContent?:
    | {
        locales?: { [key: string]: object };
        notificationTemplates?: { [key: string]: Component };
        moduleComponents?: { [key: string]: Component };
      }
    | undefined,
) => {
  const existingModule = registeredModules[moduleName];

  if (existingModule) {
    // Updating blade model
    existingModule.model = newSchema;

    // Updating blade component
    const bladeComponent = _.cloneDeep(args.component);
    const BladeInstanceConstructor = createBladeInstanceConstructor(
      bladeComponent,
      moduleName,
      newSchema,
      args,
      existingModule.composables,
      existingModule.mixin,
    );

    // Reinstall the blade with the updated component
    const module = createAppModuleWrapper({
      bladeName: moduleName,
      bladeComponent: BladeInstanceConstructor as BladeInstanceConstructor,
      appModuleContent,
    });

    module.install(args.app, args.options);

    // Update registered blade with the new component and merged mixins
    existingModule.component = BladeInstanceConstructor as BladeInstanceConstructor;
    existingModule.mixin = existingModule.mixin ? [...existingModule.mixin, ...(args.mixin || [])] : args.mixin;
  }
};

export function createDynamicAppModule(args: {
  schema?: { [key: string]: DynamicSchema };
  composables?: { [key: string]: (...args: any[]) => any };
  mixin?: { [x: string]: ((...args: any[]) => any)[] };
  overrides?: OverridesSchema;
  moduleComponents?: { [key: string]: Component };
  locales?: { [key: string]: object };
  notificationTemplates?: { [key: string]: Component };
}): {
  install(
    app: App<any>,
    options?:
      | {
          router: Router;
        }
      | undefined,
  ): void;
} {
  let schemaCopy: { [key: string]: DynamicSchema & { moduleUid: string } } = {};

  if (args.schema && Object.keys(args.schema).length > 0) {
    const moduleUid = _.uniqueId("module_");
    Object.entries(args.schema).forEach(([, schema]) => {
      if (schema.settings && schema.settings.id) {
        schemaCopy[schema.settings.id] = { ..._.cloneDeep(schema), moduleUid };
        registeredSchemas[schema.settings.id] = schemaCopy[schema.settings.id];
      }
    });
  } else {
    // Use registered schemas if new ones are not provided
    schemaCopy = _.cloneDeep({ ...registeredSchemas }) as { [key: string]: DynamicSchema & { moduleUid: string } };
  }

  if (args.overrides) {
    schemaCopy = handleOverrides(args.overrides, schemaCopy) as {
      [key: string]: DynamicSchema & { moduleUid: string };
    };

    const newUid = _.uniqueId("module_");
    const newSchemas = Object.entries(schemaCopy).reduce(
      (acc, [key, schema]) => {
        acc[key] = { ...schema, moduleUid: newUid };
        return acc;
      },
      {} as { [key: string]: DynamicSchema & { moduleUid: string } },
    );

    Object.assign(registeredSchemas, newSchemas);
  }

  // Validation
  const moduleInitializer = _.findKey(schemaCopy, (o) => o.settings.isWorkspace);
  const everyHasTemplate = _.every(Object.values(schemaCopy), (o) => o?.settings?.component);

  if (!everyHasTemplate) handleError("component", schemaCopy, "must be included in 'settings' of each file");
  if (!moduleInitializer)
    handleError("isWorkspace", schemaCopy, "must be included in one of the files to initialize the module workspace");

  return {
    install(app: App, options: { router: Router }) {
      const bladePages = { ...pages };
      const appModuleContent = {
        locales: args?.locales,
        notificationTemplates: args?.notificationTemplates,
        moduleComponents: args?.moduleComponents,
      };

      const getComposables = (bladeId: string) => {
        const composable = schemaCopy[bladeId]?.settings.composable;

        const composableFn = Object.values(registeredModules).find((module) => {
          return module.composables?.[composable];
        });

        if (!composableFn) {
          return args.composables;
        }

        return composableFn?.composables;
      };

      Object.entries(schemaCopy).forEach(([, JsonSchema], index) => {
        const bladeId = JsonSchema.settings.id;
        const mixin = args.mixin?.[bladeId];

        const registerArgs = {
          app,
          component: bladePages[JsonSchema.settings.component as keyof typeof bladePages] as BladeInstanceConstructor,
          composables: getComposables(JsonSchema.settings.id),
          mixin,
          json: JsonSchema,
          options,
          moduleUid: JsonSchema.moduleUid,
        };

        if (installedBladeIds.has(bladeId)) {
          // Blade already installed, updating it
          updateBlade(kebabToPascal(bladeId), JsonSchema, registerArgs, index === 0 ? appModuleContent : undefined);
          return;
        }

        installedBladeIds.add(bladeId);

        register(registerArgs, index === 0 ? appModuleContent : undefined);
      });
    },
  };
}

export * from "./factories";
export * from "./types";
export * from "./pages";
export { useDynamicViewsUtils } from "./composables";
