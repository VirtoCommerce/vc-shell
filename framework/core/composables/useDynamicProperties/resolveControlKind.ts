import type { IBaseProperty } from "./types";
import { isColorProperty, isDictionaryProperty, isMeasureProperty } from "./utils";

/**
 * Which control `VcDynamicProperty` renders for a property.
 *
 * Precedence mirrors `resolveStrategy` exactly — the strategy is the data
 * contract, so the control follows it, not the template's old `v-else-if`
 * chain, which tested `dictionary` first and left Measure properties with a
 * dictionary unable to store a unit.
 */
export type ControlKind =
  | "dictionary"
  | "measure"
  | "boolean"
  | "datetime"
  | "long-text"
  | "number"
  | "number-multivalue"
  | "integer"
  | "integer-multivalue"
  | "short-text"
  | "short-text-multivalue"
  | "multivalue-dictionary"
  | "color"
  | "color-dictionary"
  | "color-multivalue"
  | "color-multivalue-dictionary"
  | "unsupported";

export function resolveControlKind(property: IBaseProperty): ControlKind {
  const multivalue = Boolean(property.multivalue);
  const dictionary = isDictionaryProperty(property);

  // Same order as resolveStrategy: measure, then colour, then boolean, then
  // dictionary, then the plain types.
  if (isMeasureProperty(property)) return "measure";

  if (isColorProperty(property)) {
    if (multivalue) return dictionary ? "color-multivalue-dictionary" : "color-multivalue";
    return dictionary ? "color-dictionary" : "color";
  }

  if (property.valueType === "Boolean") return "boolean";

  // A dictionary constrains the allowed values whatever the underlying type is,
  // and `resolveStrategy` routes every dictionary property to dictionaryStrategy.
  // The old chain missed multivalue Number, Integer, LongText and DateTime.
  if (dictionary) return multivalue ? "multivalue-dictionary" : "dictionary";

  switch (property.valueType) {
    case "ShortText":
      return multivalue ? "short-text-multivalue" : "short-text";
    case "Number":
      return multivalue ? "number-multivalue" : "number";
    case "Integer":
      return multivalue ? "integer-multivalue" : "integer";
    case "DateTime":
      return "datetime";
    case "LongText":
      return "long-text";
    default:
      // `valueType` is `string | undefined`, not a union, so the platform can
      // send a type this component has never heard of. The old chain had no
      // final `v-else`, which rendered a labelled field with no control at all.
      return "unsupported";
  }
}
