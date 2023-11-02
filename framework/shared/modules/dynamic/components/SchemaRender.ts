/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropType, ref, toRefs, watch, ExtractPropTypes, h, VNode, defineComponent, UnwrapNestedRefs } from "vue";
import { ControlSchema } from "../types";
import * as _ from "lodash-es";
import { DetailsBladeContext } from "../factories/types";
import { nodeBuilder } from "../helpers/nodeBuilder";

const schemeRenderProps = {
  context: {
    type: Object as PropType<UnwrapNestedRefs<DetailsBladeContext>>,
    default: () => ({}),
  },
  modelValue: {
    type: Object as PropType<Record<string, any>>,
    required: true,
    default: () => ({}),
  },
  uiSchema: {
    type: Array as PropType<ControlSchema[]>,
    required: true,
    default: () => [],
  },
  currentLocale: {
    type: String,
    default: undefined,
  },
};

export default defineComponent({
  name: "SchemaRender",
  props: schemeRenderProps,
  emits: ["update:modelValue"],
  setup(props: ExtractPropTypes<typeof schemeRenderProps>, ctx) {
    const { currentLocale } = toRefs(props);
    const internalFormData = ref();

    watch(
      () => props.modelValue,
      (newVal) => {
        if (!_.isEqual(internalFormData.value, newVal)) {
          internalFormData.value = newVal;
        }
      },
      { deep: true, immediate: true }
    );

    watch(
      internalFormData,
      (newVal) => {
        if (!_.isEqual(newVal, props.modelValue)) {
          emitChange(newVal);
        }
      },
      { deep: true }
    );

    function emitChange(newVal) {
      ctx.emit("update:modelValue", newVal);
    }

    return () =>
      h(
        "div",
        { class: "tw-flex tw-flex-col tw-gap-4" },
        props.uiSchema.reduce(
          (arr, field): VNode[] => [
            ...arr,
            nodeBuilder({
              controlSchema: field,
              parentId: field.id,
              internalContext: internalFormData,
              bladeContext: props.context,
              currentLocale: currentLocale,
              formData: internalFormData,
            }),
          ],
          []
        )
      );
  },
});
