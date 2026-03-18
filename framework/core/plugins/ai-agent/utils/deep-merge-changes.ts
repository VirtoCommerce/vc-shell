import { mergeWith, isPlainObject } from "lodash-es";

/**
 * Custom merge function for AI agent preview changes.
 * Handles sparse arrays where null means "skip this index".
 *
 * @example
 * // Nested objects - deep merge
 * deepMergeChanges({seo: {title: "Old", desc: "Desc"}}, {seo: {title: "New"}})
 * // -> {seo: {title: "New", desc: "Desc"}}
 *
 * @example
 * // Sparse arrays - null skips index
 * deepMergeChanges({items: [{a:1}, {b:2}]}, {items: [null, {c:3}]})
 * // -> {items: [{a:1}, {b:2, c:3}]}
 */
export function deepMergeChanges<T extends object>(target: T, source: object): T {
  const customizer = (targetVal: unknown, sourceVal: unknown): unknown => {
    // If source value is null/undefined, keep target value (skip this index/field)
    if (sourceVal === null || sourceVal === undefined) {
      return targetVal;
    }

    // If both are arrays, merge by index with sparse array support
    if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
      const result = [...targetVal];
      sourceVal.forEach((item, index) => {
        if (item !== null && item !== undefined) {
          if (isPlainObject(item) && isPlainObject(result[index])) {
            // Recursively merge objects in array
            result[index] = deepMergeChanges(result[index] as object, item);
          } else {
            // Replace primitive or non-object values
            result[index] = item;
          }
        }
        // null/undefined in source array = skip this index
      });
      return result;
    }

    // For objects, let mergeWith handle recursively with this customizer
    return undefined;
  };

  return mergeWith({}, target, source, customizer);
}
