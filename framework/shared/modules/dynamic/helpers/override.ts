import * as _ from "lodash-es";
import { DynamicSchema, OverridesSchema, OverridesUpsert } from "../types";

export const handleOverrides = (overrides, schemaCopy: { [key: string]: DynamicSchema }) => {
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
  return Object.entries(schemaCopy).reduce((obj, [name, schema]) => {
    const clonedSchema = _.cloneDeep(schema);
    overrides.upsert
      .filter((x) => clonedSchema.settings.id === x.id)
      .forEach(
        ({
          index,
          path,
          value,
          id,
        }: {
          index: OverridesUpsert["index"];
          path: OverridesUpsert["path"];
          value: OverridesUpsert["value"];
          id: OverridesUpsert["id"];
        }) => {
          const valueByPath = _.get(clonedSchema, path);
          if (Array.isArray(valueByPath) && valueByPath.length && typeof value === "object") {
            const findIndex = _.findIndex(valueByPath, { id: value.id });

            const spliced = valueByPath /* @ts-ignore */
              .toSpliced(findIndex >= 0 ? findIndex : index, findIndex >= 0 ? 1 : 0, value);
            _.set(clonedSchema, path, spliced);
          } else {
            _.set(clonedSchema, path, value);
          }
        },
        {}
      );
    obj[name] = clonedSchema;
    return obj;
  }, {});
};

const removeHelper = (overrides, schemaCopy: { [key: string]: DynamicSchema }) => {
  return Object.entries(schemaCopy).reduce((obj, [name, schema]) => {
    const clonedSchema = _.cloneDeep(schema);
    overrides.remove
      .filter((x) => clonedSchema.settings.id === x.id)
      .forEach(({ path }) => {
        if (path) {
          const parentPath = path.slice(0, path.lastIndexOf("["));
          _.unset(clonedSchema, path);
          _.update(clonedSchema, parentPath, _.compact);
        }
      }, {});
    obj[name] = clonedSchema;
    return obj;
  }, {});
};
