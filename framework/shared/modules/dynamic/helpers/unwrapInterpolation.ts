import { getModel } from "./getters";

function unwrapInterpolation<T>(property: string, context: T) {
  const pattern = /{(.*)}/g;

  const match = property.match(pattern);

  if (match !== null) {
    return getModel(property.replace(/{|}/g, ""), context);
  }

  return property;
}

export { unwrapInterpolation };
