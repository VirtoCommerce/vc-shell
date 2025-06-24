import { ControlSchema } from "../types/index";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComputedRef, toValue } from "vue";

export const methodHandler = (
  visibility:
    | ComputedRef<boolean | undefined>
    | ((schema: ControlSchema, fieldContext: Record<string, any> | undefined) => boolean)
    | undefined,
  fieldContext: Record<string, any> | undefined,
  schema: ControlSchema,
) => {
  if (visibility === undefined) {
    return true;
  }

  if (typeof visibility === "function") {
    return visibility(schema, fieldContext);
  }

  return toValue(visibility);
};
