import { ComputedRef, PropType, ToRefs, UnwrapNestedRefs, VNode } from "vue";
import { DetailsBladeContext } from "@shared/modules/dynamic/factories";
import { IControlBaseProps } from "@shared/modules/dynamic/types/models";
import { ControlSchema } from "@shared/modules/dynamic/types";

export default {
  baseProps: {
    type: Object as PropType<ToRefs<IControlBaseProps>>,
    default: () => ({}) as ToRefs<IControlBaseProps>,
  },
  element: {
    type: Object as PropType<ControlSchema>,
    default: () => ({}) as ControlSchema,
  },
  bladeContext: {
    type: Object as PropType<UnwrapNestedRefs<DetailsBladeContext>>,
    default: () => ({}) as DetailsBladeContext,
  },
  fields: {
    type: Object as PropType<ComputedRef<VNode[][]>>,
    default: () => ({}) as ComputedRef<VNode[][]>,
  },
  formData: {
    type: Object as PropType<ToRefs<Record<string, unknown>>>,
    default: () => ({}) as ToRefs<Record<string, unknown>>,
  },
  fieldContext: {
    type: Object,
  },
  currentLocale: {
    type: String,
  },
  elIndex: {
    type: Number,
  },
  rows: {
    type: Number,
  },
};
