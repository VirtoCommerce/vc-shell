import * as _ from "lodash-es";
import { DynamicSchema, OverridesSchema } from "../types";
import "core-js/actual/array/to-spliced";

export const handleOverrides = (overrides: OverridesSchema, schemaCopy: { [key: string]: DynamicSchema }) => {
  let schema = _.cloneDeep(schemaCopy);

  // REMOVE
  if (overrides.remove && overrides.remove.length > 0) {
    schema = removeHelper(overrides, schema);
  }

  // UPSERT
  if (overrides.upsert && overrides.upsert.length > 0) {
    schema = upsertHelper(overrides, schema);
  }

  return schema;
};

const upsertHelper = (overrides: OverridesSchema, schemaCopy: { [key: string]: DynamicSchema }) => {
  return Object.entries(schemaCopy).reduce(
    (obj, [name, schema]) => {
      const clonedSchema = _.cloneDeep(schema);
      overrides.upsert
        ?.filter((x) => clonedSchema.settings.id === x.id)
        .forEach((args) => {
          const valueByPath = _.get(clonedSchema, args.path);
          if (Array.isArray(valueByPath) && valueByPath.length && typeof args.value === "object" && "index" in args) {
            const findIndex = _.findIndex(valueByPath, { id: args.value.id });

            const spliced = valueByPath /* @ts-ignore */
              .toSpliced(findIndex >= 0 ? findIndex : args.index, findIndex >= 0 ? 1 : 0, args.value);
            _.set(clonedSchema, args.path, spliced);
          } else {
            _.set(clonedSchema, args.path, args.value);
          }
        }, {});
      obj[name] = clonedSchema;
      return obj;
    },
    {} as Record<string, DynamicSchema>,
  );
};

const removeHelper = (overrides: OverridesSchema, schemaCopy: { [key: string]: DynamicSchema }) => {
  return Object.entries(schemaCopy).reduce(
    (obj, [name, schema]) => {
      const clonedSchema = _.cloneDeep(schema);
      overrides.remove
        ?.filter((x) => clonedSchema.settings.id === x.id)
        .forEach(({ path }) => {
          if (path) {
            const parentPath = path.slice(0, path.lastIndexOf("["));
            _.unset(clonedSchema, path);
            _.update(clonedSchema, parentPath, _.compact);
          }
        }, {});
      obj[name] = clonedSchema;
      return obj;
    },
    {} as Record<string, DynamicSchema>,
  );
};
