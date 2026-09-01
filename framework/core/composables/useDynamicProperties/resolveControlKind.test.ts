import { describe, it, expect } from "vitest";
import { resolveControlKind, type ControlKind } from "./resolveControlKind";
import { resolveStrategy } from "./strategies";
import { booleanStrategy } from "./strategies/boolean";
import { dictionaryStrategy } from "./strategies/dictionary";
import { measureStrategy } from "./strategies/measure";
import { colorStrategy } from "./strategies/color";
import { regularStrategy } from "./strategies/regular";
import type { IBaseProperty } from "./types";

function property(valueType: string | undefined, multivalue = false, dictionary = false): IBaseProperty {
  return { name: "p", valueType, multivalue, dictionary } as IBaseProperty;
}

const VALUE_TYPES = ["ShortText", "LongText", "Number", "Integer", "DateTime", "Boolean", "Measure", "Color"];
const COMBINATIONS = VALUE_TYPES.flatMap((valueType) =>
  [false, true].flatMap((multivalue) => [false, true].map((dictionary) => ({ valueType, multivalue, dictionary }))),
);

/**
 * Which strategy each control family belongs to. This is the invariant that
 * broke: the control and the strategy have to agree about what kind of value
 * is on screen, because the strategy is what reads and writes it.
 */
const EXPECTED_STRATEGY: Record<ControlKind, unknown> = {
  measure: measureStrategy,
  boolean: booleanStrategy,
  dictionary: dictionaryStrategy,
  "multivalue-dictionary": dictionaryStrategy,
  color: colorStrategy,
  "color-multivalue": colorStrategy,
  "color-dictionary": dictionaryStrategy,
  "color-multivalue-dictionary": dictionaryStrategy,
  "short-text": regularStrategy,
  "short-text-multivalue": regularStrategy,
  "long-text": regularStrategy,
  number: regularStrategy,
  "number-multivalue": regularStrategy,
  integer: regularStrategy,
  "integer-multivalue": regularStrategy,
  datetime: regularStrategy,
  unsupported: regularStrategy,
};

describe("resolveControlKind", () => {
  it.each(COMBINATIONS)("$valueType multivalue=$multivalue dictionary=$dictionary resolves to one kind", (combo) => {
    const kind = resolveControlKind(property(combo.valueType, combo.multivalue, combo.dictionary));

    expect(kind).toBeTruthy();
    expect(Object.keys(EXPECTED_STRATEGY)).toContain(kind);
  });

  // The defect: the template tested `dictionary` first and `resolveStrategy`
  // tests `Measure` first, so a Measure property with a dictionary rendered a
  // dictionary select while its value was read and written as a measure. The
  // select works in `valueId`, the strategy in `value` — nothing selected, no
  // dictionary reference stored, and no way to set the unit.
  it.each(COMBINATIONS)(
    "$valueType multivalue=$multivalue dictionary=$dictionary picks a control its strategy agrees with",
    (combo) => {
      const p = property(combo.valueType, combo.multivalue, combo.dictionary);

      expect(EXPECTED_STRATEGY[resolveControlKind(p)]).toBe(resolveStrategy(p));
    },
  );

  it("keeps a dictionary property on the dictionary control", () => {
    expect(resolveControlKind(property("ShortText", false, true))).toBe("dictionary");
  });

  it("gives a measure with a dictionary the measure control, not the dictionary one", () => {
    expect(resolveControlKind(property("Measure", false, true))).toBe("measure");
  });

  it("gives a boolean with a dictionary the boolean control", () => {
    expect(resolveControlKind(property("Boolean", false, true))).toBe("boolean");
  });

  it.each([
    ["Color", false, false, "color"],
    ["Color", true, false, "color-multivalue"],
    ["Color", false, true, "color-dictionary"],
    ["Color", true, true, "color-multivalue-dictionary"],
  ] as const)("keeps the four colour cases apart: %s multi=%s dict=%s", (valueType, multi, dict, expected) => {
    expect(resolveControlKind(property(valueType, multi, dict))).toBe(expected);
  });

  // `valueType` is `string | undefined`, not a union, so the platform can send
  // something this component has never heard of. The old chain had no final
  // `v-else` and rendered a labelled field with no control at all.
  it.each([["Html"], ["Image"], [undefined], [""]])("answers for an unknown value type: %s", (valueType) => {
    expect(resolveControlKind(property(valueType as string | undefined))).toBe("unsupported");
  });
});
