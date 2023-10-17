import { ComputedRef, PropType, UnwrapNestedRefs, VNodeArrayChildren } from "vue";
import { DetailsBladeContext } from "../../factories";
import { IControlBaseOptions, IControlBaseProps } from "../../types/models";
import { ControlSchema } from "../../types";

export default {
  baseProps: {
    type: Object as PropType<UnwrapNestedRefs<IControlBaseProps>>,
    default: () => ({} as IControlBaseProps),
  },
  baseOptions: {
    type: Object as PropType<UnwrapNestedRefs<IControlBaseOptions>>,
    default: () => ({} as IControlBaseOptions),
  },
  element: {
    type: Object as PropType<ControlSchema>,
    default: () => ({} as ControlSchema),
  },
  bladeContext: {
    type: Object as PropType<UnwrapNestedRefs<DetailsBladeContext>>,
    default: () => ({} as DetailsBladeContext),
  },
  fields: {
    type: Object as PropType<ComputedRef<VNodeArrayChildren>>,
    default: () => ({} as ComputedRef<VNodeArrayChildren>),
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
  fieldContext: {
    type: Object,
    default: undefined,
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
