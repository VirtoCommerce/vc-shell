import * as _ from "lodash-es";
import { DynamicSchema, OverridesRemove, OverridesSchema } from "../types";
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
          let valueByPath = _.get(clonedSchema, args.path);
          let currentPath: string | (string | number)[] = args.path;

          // if we can't get value with lodash - try to parse path, cause it could be path with elements id's
          if (!valueByPath) {
            const pathParts = args.path.split(".");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let current: any = clonedSchema;
            const generatedPath = [];
            for (const part of pathParts) {
              if (Array.isArray(current)) {
                const currentCopy = [...current];
                current = current.find((x) => Object.entries(x).some(([key, value]) => key === part || value === part));

                const fountElIndex = currentCopy.findIndex((x) => x === current);

                generatedPath.push(fountElIndex);
              } else {
                if (current) {
                  current = current[part];
                  generatedPath.push(part);
                }
              }
            }

            currentPath = generatedPath;

            valueByPath = current;
          }

          if (Array.isArray(valueByPath) && valueByPath.length && typeof args.value === "object") {
            const findIndex = _.findIndex(valueByPath, { id: args.value.id });

            const spliced = valueByPath /* @ts-expect-error  - toSpliced is not parsed correctly by ts */
              .toSpliced(findIndex >= 0 ? findIndex : args.index ?? 0, findIndex >= 0 ? 1 : 0, args.value);
            _.set(clonedSchema, currentPath, spliced);
          } else {
            _.set(clonedSchema, currentPath, args.value);
          }
        });
      obj[name] = clonedSchema;
      return obj;
    },
    {} as Record<string, DynamicSchema>,
  );
};

const removeHelper = (overrides: OverridesSchema, schemaCopy: Record<string, DynamicSchema>) => {
  return Object.entries(schemaCopy).reduce(
    (obj, [name, schema]) => {
      const clonedSchema = _.cloneDeep(schema);
      sortByMaxIndexPath(overrides.remove?.filter((x) => schema.settings.id === x.id)).forEach(({ path }) => {
        if (path) {
          removePath(clonedSchema, path);
        }
      });
      obj[name] = clonedSchema;
      return obj;
    },
    {} as Record<string, DynamicSchema>,
  );
};

function removePath(obj: DynamicSchema, path: string) {
  const removeItem = _.get(obj, path);

  if (removeItem) {
    const parentPath = path.slice(0, path.lastIndexOf("["));
    _.unset(obj, path);
    _.update(obj, parentPath, _.compact);
  } else {
    const pathParts = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = obj;
    const generatedPath = [];
    for (const part of pathParts) {
      if (Array.isArray(current)) {
        const currentCopy = [...current];
        current = current.find((x) => Object.entries(x).some(([key, value]) => key === part || value === part));

        const foundElIndex = currentCopy.findIndex((x) => x === current);

        generatedPath.push(foundElIndex);
      } else {
        if (current) {
          current = current[part];
          generatedPath.push(part);
        }
      }
    }
    _.unset(obj, generatedPath);
    _.update(obj, generatedPath, _.compact);
  }
}

// this part sorts paths with indexes in descending order to avoid deleting items with already changed indexes
function sortByMaxIndexPath(items: { path: string }[] | undefined) {
  return (items || []).sort((a, b) => getMaxIndexFromPath(b.path) - getMaxIndexFromPath(a.path));
}

function getMaxIndexFromPath(path: string): number {
  const matches = path.match(/\[(\d+)\]/g);

  if (matches) {
    const indexes = matches.map((match) => parseInt(match.slice(1, -1), 10));
    return Math.max(...indexes);
  }

  return Infinity;
}
