import type { IBaseProperty } from "./types";
import { isColorProperty, isDictionaryProperty, isMeasureProperty } from "./utils";

/**
 * Which control `VcDynamicProperty` renders for a property.
 *
 * This exists because the choice was encoded twice: once here in effect, as a
 * chain of sixteen ordered `v-else-if` conditions in the template, and once in
 * `resolveStrategy`, which decides how the value is read and written. The two
 * chains had opposite precedence — the template tested `dictionary` first,
 * `resolveStrategy` tests `Measure` first — so they disagreed.
 *
 * A `Measure` property carrying a dictionary got the dictionary `VcSelect`,
 * while `measureStrategy` read `values[0].value` and wrote
 * `{ value, unitOfMeasureId }`. The select works in `valueId`, so it showed
 * nothing selected and stored no dictionary reference, and the unit could not
 * be set at all. `Boolean` with a dictionary diverged the same way.
 *
 * Precedence here mirrors `resolveStrategy` exactly. The strategy is the data
 * contract — non-UI code reads through it — so the control follows it, not the
 * other way round.
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
  // The old chain only had a dictionary control for the single-value case and
  // for multivalue ShortText, so Number, Integer, LongText and DateTime with a
  // multivalue dictionary rendered a plain input while their value was read and
  // written by valueId.
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
