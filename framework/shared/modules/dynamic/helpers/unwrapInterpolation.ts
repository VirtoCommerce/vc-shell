import { getModel } from "@shared/modules/dynamic/helpers/getters";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapInterpolation<T extends Record<string, any>>(property: string, context: T) {
  const pattern = /{(.*)}/g;

  const match = property.match(pattern);

  if (match !== null) {
    return getModel(property.replace(/{|}/g, ""), context);
  }

  return property;
}

export { unwrapInterpolation };
