import { ComputedRef, MaybeRef, PropType, UnwrapNestedRefs, VNode } from "vue";
import { DetailsBladeContext } from "../../factories";
import { IControlBaseProps } from "../../types/models";
import { ControlSchema } from "../../types";

export default {
  baseProps: {
    type: Object as PropType<UnwrapNestedRefs<IControlBaseProps>>,
    default: () => ({}) as IControlBaseProps,
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
    type: Object as PropType<MaybeRef<Record<string, unknown>>>,
    default: () => ({}) as MaybeRef<Record<string, unknown>>,
  },
  fieldContext: {
    type: Object,
  },
  nodeBuilder: {
    type: Function,
    default: () => ({}),
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
  onSetModelData: {
    type: Function,
    default: () => ({}),
  },
};
