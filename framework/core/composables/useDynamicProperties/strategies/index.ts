import type { IBaseProperty } from "../types";
import type { PropertyValueStrategy } from "./types";
import { isMeasureProperty, isColorProperty, isDictionaryProperty } from "../utils";
import { regularStrategy } from "./regular";
import { booleanStrategy } from "./boolean";
import { dictionaryStrategy } from "./dictionary";
import { measureStrategy } from "./measure";
import { colorStrategy } from "./color";

export function resolveStrategy(property: IBaseProperty): PropertyValueStrategy {
  if (isMeasureProperty(property)) return measureStrategy;
  if (isColorProperty(property) && !isDictionaryProperty(property)) return colorStrategy;
  if (property.valueType === "Boolean") return booleanStrategy;
  if (isDictionaryProperty(property)) return dictionaryStrategy;
  return regularStrategy;
}
