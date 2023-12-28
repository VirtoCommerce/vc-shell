import { reactify } from "@vueuse/core";
import * as _ from "lodash-es";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getModel = reactify((property: string, context: Record<string, any>) => {
  if (property && context) {
    return _.get(context, property);
  }
  return null;
});
