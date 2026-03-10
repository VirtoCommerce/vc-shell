import * as pages from "@shared/modules/dynamic/pages";
import { App, Component, SetupContext, defineComponent, inject } from "vue";
import { DynamicSchema, OverridesSchema } from "@shared/modules/dynamic/types";
import * as _ from "lodash-es";
import { handleOverrides } from "@shared/modules/dynamic/helpers/override";
import { reactiveComputed } from "@vueuse/core";
import { kebabToPascal } from "@core/utilities";
import type { BladeInstanceConstructor } from "@shared/components/blade-navigation/types";
import { notification } from "@shared/components/notifications/core/notification";
import { createAppModule } from "@core/plugins";
import { ComponentProps } from "@shared/utilities/vueUtils";
import { Router } from "vue-router";
import { DynamicModuleRegistryStateKey, type DynamicModuleRegistryState } from "@framework/injection-keys";

/** Generic composable function signature used in dynamic module registration. */
type ComposableFn = (...args: unknown[]) => unknown;

/** Map of named composable functions provided to a dynamic blade. */
type ComposableMap = { [key: string]: ComposableFn };

/** Mixin function array used to extend a dynamic blade's setup. */
type MixinFnArray = ComposableFn[];

interface Registered {
  component: BladeInstanceConstructor;
  name: string;
  model: DynamicSchema;
  composables: ComposableMap;
  mixin?: MixinFnArray;
}

// Note: registeredModules, installedBladeIds, registeredSchemas are no longer
// module-level singletons. They are injected per-app via DynamicModuleRegistryStateKey.

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
  bladeComponent: BladeInstanceConstructor,
  bladeName: string,
  json: DynamicSchema,
  args: {
    moduleUid: string;
    composables?: ComposableMap;
    mixin?: MixinFnArray;
  },
  existingComposables?: ComposableMap,
  existingMixins?: MixinFnArray,
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Object.assign result does not satisfy ComponentProps<T>; cast required for Vue internal API compatibility
            } as Record<string, unknown>) as any,
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
    composables: ComposableMap | undefined;
    mixin?: MixinFnArray;
    json: DynamicSchema;
    options?: { router: Router };
    moduleUid: string;
  },
  registry: DynamicModuleRegistryState,
  appModuleContent?:
    | {
        locales?: { [key: string]: object };
        notificationTemplates?: { [key: string]: Component };
        moduleComponents?: { [key: string]: Component };
      }
    | undefined,
): Registered => {
  const { app, component, json, options } = args;
  const { registeredModules, installedBladeIds: _installedBladeIds } = registry;
  const bladeId = json.settings.id;
  const bladeName = kebabToPascal(bladeId);

  if (registeredModules[bladeName]) {
    // Module already registered, updating it
    updateBlade(bladeName, json, args, registry, appModuleContent);
    return registeredModules[bladeName] as Registered;
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
    composables?: ComposableMap;
    mixin?: MixinFnArray;
    json: DynamicSchema;
    options?: { router: Router };
    moduleUid: string;
  },
  registry: DynamicModuleRegistryState,
  appModuleContent?:
    | {
        locales?: { [key: string]: object };
        notificationTemplates?: { [key: string]: Component };
        moduleComponents?: { [key: string]: Component };
      }
    | undefined,
) => {
  const { registeredModules } = registry;
  const existingModule = registeredModules[moduleName] as Registered | undefined;

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
  composables?: ComposableMap;
  mixin?: { [x: string]: MixinFnArray };
  overrides?: OverridesSchema;
  moduleComponents?: { [key: string]: Component };
  locales?: { [key: string]: object };
  notificationTemplates?: { [key: string]: Component };
}): {
  install(
    app: App,
    options?:
      | {
          router: Router;
        }
      | undefined,
  ): void;
} {
  // Capture provided schemas early (before install) for validation purposes.
  // Actual registration into the per-app registry happens inside install().
  let earlySchema: { [key: string]: DynamicSchema & { moduleUid: string } } = {};

  if (args.schema && Object.keys(args.schema).length > 0) {
    const moduleUid = _.uniqueId("module_");
    Object.entries(args.schema).forEach(([, schema]) => {
      if (schema.settings && schema.settings.id) {
        earlySchema[schema.settings.id] = { ..._.cloneDeep(schema), moduleUid };
      }
    });
  }

  // Pre-apply overrides to the early schema copy for validation
  if (args.overrides && Object.keys(earlySchema).length > 0) {
    earlySchema = handleOverrides(args.overrides, earlySchema) as {
      [key: string]: DynamicSchema & { moduleUid: string };
    };
    const newUid = _.uniqueId("module_");
    earlySchema = Object.entries(earlySchema).reduce(
      (acc, [key, schema]) => {
        acc[key] = { ...schema, moduleUid: newUid };
        return acc;
      },
      {} as { [key: string]: DynamicSchema & { moduleUid: string } },
    );
  }

  // Validation (only when schema was provided; overrides-only modules skip this)
  if (Object.keys(earlySchema).length > 0) {
    const everyHasTemplate = _.every(Object.values(earlySchema), (o) => o?.settings?.component);
    const moduleInitializer = _.findKey(earlySchema, (o) => o.settings.isWorkspace);
    if (!everyHasTemplate) handleError("component", earlySchema, "must be included in 'settings' of each file");
    if (!moduleInitializer)
      handleError("isWorkspace", earlySchema, "must be included in one of the files to initialize the module workspace");
  }

  return {
    install(app: App, options: { router: Router }) {
      // Inject per-app registry (provided by framework install before dynamic modules run)
      const registry = app.runWithContext(() =>
        inject<DynamicModuleRegistryState>(DynamicModuleRegistryStateKey),
      );
      if (!registry) {
        throw new Error(
          "[vc-shell] DynamicModuleRegistryState not found. " +
            "Ensure the framework plugin is installed before dynamic modules.",
        );
      }
      const { registeredModules, installedBladeIds, registeredSchemas } = registry;

      // Build schemaCopy inside install() so we can use the per-app registeredSchemas
      let schemaCopy: { [key: string]: DynamicSchema & { moduleUid: string } };

      if (args.schema && Object.keys(args.schema).length > 0) {
        schemaCopy = { ...earlySchema };
        // Register provided schemas into the per-app registry
        Object.entries(schemaCopy).forEach(([key, schema]) => {
          registeredSchemas[key] = schema;
        });
      } else {
        // Use the per-app registered schemas if no new schemas provided
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
        schemaCopy = newSchemas;
      }

      const bladePages = { ...pages };
      const appModuleContent = {
        locales: args?.locales,
        notificationTemplates: args?.notificationTemplates,
        moduleComponents: args?.moduleComponents,
      };

      const getComposables = (bladeId: string) => {
        const composable = schemaCopy[bladeId]?.settings.composable;

        const composableFn = Object.values(registeredModules).find((module) => {
          return (module as Registered).composables?.[composable];
        });

        if (!composableFn) {
          return args.composables;
        }

        return (composableFn as Registered)?.composables;
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
          updateBlade(
            kebabToPascal(bladeId),
            JsonSchema,
            registerArgs,
            registry,
            index === 0 ? appModuleContent : undefined,
          );
          return;
        }

        installedBladeIds.add(bladeId);

        register(registerArgs, registry, index === 0 ? appModuleContent : undefined);
      });
    },
  };
}

export * from "@shared/modules/dynamic/factories";
export * from "@shared/modules/dynamic/types";
export * from "@shared/modules/dynamic/pages";
export { useDynamicViewsUtils } from "@shared/modules/dynamic/composables";
