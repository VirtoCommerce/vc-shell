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
    overrides.upsert.forEach(
      ({
        index,
        path,
        value,
        name: overrideName,
      }: {
        index: OverridesUpsert["index"];
        path: OverridesUpsert["path"];
        value: OverridesUpsert["value"];
        name: OverridesUpsert["name"];
      }) => {
        const isOverrided = clonedSchema.settings.name === overrideName;
        if (isOverrided) {
          const valueByPath = _.get(clonedSchema, path);

          if (Array.isArray(valueByPath) && valueByPath.length) {
            const findIndex = _.findIndex(valueByPath, { id: value.id });

            const spliced = valueByPath /* @ts-ignore */
              .toSpliced(findIndex >= 0 ? findIndex : index, findIndex >= 0 ? 1 : 0, value);
            _.set(clonedSchema, path, spliced);
          }
        }
        obj[name] = clonedSchema;
      }
    );
    return obj;
  }, {});
};

const removeHelper = (overrides, schemaCopy: { [key: string]: DynamicSchema }) => {
  return Object.entries(schemaCopy).reduce((obj, [name, schema]) => {
    overrides.remove.forEach(({ path, name: overrideName }) => {
      const isOverrided = schema.settings.name === overrideName;
      const clonedSchema = _.cloneDeep(schema);
      if (isOverrided) {
        if (path) {
          const parentPath = path.slice(0, path.lastIndexOf("["));
          _.unset(clonedSchema, path);
          _.update(clonedSchema, parentPath, _.compact);
        }
      }
      obj[name] = clonedSchema;
    });
    return obj;
  }, {});
};
