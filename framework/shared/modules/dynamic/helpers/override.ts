import * as _ from "lodash-es";
import { DynamicSchema, OverridesSchema, OverridesUpsert } from "../types";

export const handleOverrides = (overrides, schemaCopy: { [key: string]: DynamicSchema }) => {
  let schema = _.cloneDeep(schemaCopy);
  // UPSERT
  if (overrides.upsert && overrides.upsert.length > 0) {
    schema = upsertHelper(overrides, schemaCopy);
  }

  // REMOVE
  if (overrides.remove && overrides.remove.length > 0) {
    schema = removeHelper(overrides, schema);
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
      }: {
        index: OverridesUpsert["index"];
        path: OverridesUpsert["path"];
        value: OverridesUpsert["value"];
      }) => {
        const valueByPath = _.get(clonedSchema, path);

        console.log("valueByPath", valueByPath);

        if (Array.isArray(valueByPath) && valueByPath.length) {
          const findIndex = _.findIndex(valueByPath, { id: value.id });

          const spliced = valueByPath /* @ts-ignore */
            .toSpliced(findIndex >= 0 ? findIndex : index, findIndex >= 0 ? 1 : 0, value);
          _.set(clonedSchema, path, spliced);
        }

        obj[name] = clonedSchema;
      }
    );
    return obj;
  }, {});
};

const removeHelper = (overrides, schemaCopy: { [key: string]: DynamicSchema }) => {
  return Object.entries(schemaCopy).reduce((obj, [name, schema]) => {
    overrides.remove.forEach(({ path }) => {
      if (path) {
        const clonedSchema = _.cloneDeep(schema);
        _.unset(clonedSchema, path);
        obj[name] = clonedSchema;
      }
    });
    return obj;
  }, {});
};
