import { ComputedRef, PropType, Ref, VNode } from "vue";

export default {
  baseProps: {
    type: Object,
    default: () => ({}),
  },
  baseOptions: {
    type: Object,
    default: () => ({}),
  },
  element: {
    type: Object,
    default: () => ({}),
  },
  bladeContext: {
    type: Object,
    default: () => ({}),
  },
  scope: {
    type: Object,
    default: () => ({}),
  },
  fields: {
    // type: Array as PropType<VNode[]>,
    default: () => [],
  },
  formData: {
    type: Object,
    default: () => ({}),
  },
  fieldContext: {
    type: Object,
    default: undefined,
  },
  fieldHelper: {
    type: Function,
    default: () => ({}),
  },
  setModel: {
    type: Function,
    default: () => ({}),
  },
  getModel: {
    type: Function,
    default: () => ({}),
  },
  currentLocale: {
    type: Object as PropType<string>,
    default: "",
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
