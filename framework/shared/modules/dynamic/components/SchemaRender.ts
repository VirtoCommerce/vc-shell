/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PropType,
  ToRefs,
  toRefs,
  watch,
  ExtractPropTypes,
  h,
  VNode,
  defineComponent,
  UnwrapNestedRefs,
  reactive,
} from "vue";
import { ControlSchema } from "../types";
import * as _ from "lodash-es";
import { DetailsBladeContext } from "../factories/types";
import { nodeBuilder } from "../helpers/nodeBuilder";
import { visibilityHandler } from "../helpers/visibilityHandler";
import { toValue } from "@vueuse/core";
import { safeIn } from "../helpers/safeIn";
import { unrefNested } from "../helpers/unrefNested";
import { usePermissions } from "../../../../core/composables";

const schemeRenderProps = {
  context: {
    type: Object as PropType<UnwrapNestedRefs<DetailsBladeContext>>,
    default: () => ({}) as DetailsBladeContext,
  },
  modelValue: {
    type: Object as PropType<Record<string, any>>,
    required: true,
    default: () => ({}),
  },
  uiSchema: {
    type: Array as PropType<ControlSchema[]>,
    required: true,
    default: (): ControlSchema[] => [],
  },
  currentLocale: {
    type: String,
    default: "",
  },
};

export default defineComponent({
  name: "SchemaRender",
  props: schemeRenderProps,
  emits: ["update:modelValue"],
  setup(props: ExtractPropTypes<typeof schemeRenderProps>, ctx) {
    const { currentLocale } = toRefs(props);
    const internalFormData = reactive({});
    const { hasAccess } = usePermissions();

    watch(
      () => props.modelValue,
      (newVal) => {
        if (!_.isEqual(internalFormData, newVal)) {
          Object.assign(internalFormData, toRefs(newVal));
        }
      },
      { deep: true, immediate: true },
    );

    function updateFormData(newVal: ToRefs<unknown>) {
      if (!_.isEqual(newVal, internalFormData)) {
        ctx.emit("update:modelValue", unrefNested(newVal));
      }
    }

    return () =>
      h(
        "div",
        { class: "tw-flex tw-flex-col tw-gap-4" },
        props.uiSchema.reduce((arr, field): VNode[] => {
          if (safeIn("permissions", field) && !hasAccess(field.permissions)) {
            return arr;
          }

          if (
            safeIn("visibility", field) &&
            field.visibility?.method &&
            !visibilityHandler(toValue(props.context?.scope)?.[field.visibility.method], props.context, field)
          ) {
            return arr;
          }

          return [
            ...arr,
            nodeBuilder({
              controlSchema: field,
              parentId: field.id,
              internalContext: internalFormData,
              bladeContext: props.context,
              currentLocale: currentLocale,
              formData: internalFormData,
              updateFormData,
            }),
          ];
        }, [] as VNode[]),
      );
  },
});
