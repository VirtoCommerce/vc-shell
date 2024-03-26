import * as _ from "lodash-es";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getModel = (property: string, context: Record<string, any>) => {
  if (property && context) {
    if (typeof context[property] === "function") {
      return context[property]();
    }
    return _.get(context, property);
  }
  return null;
};
