import { reactify } from "@vueuse/core";
import { toValue } from "vue";
import * as _ from "lodash-es";

export const getModel = reactify((property: string, context: Record<string, any>) => {
  if (property && context) {
    return _.get(context, property);
  }
  return null;
});
