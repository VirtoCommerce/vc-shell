import {
  PropType,
  computed,
  mergeProps,
  ref,
  toRefs,
  toValue,
  unref,
  watch,
  ExtractPropTypes,
  h,
  Fragment,
  VNode,
} from "vue";
import { ControlSchema } from "../types";
import { GeneratedModel, IControlBaseProps } from "./models";
import * as _ from "lodash-es";
import { reactify } from "@vueuse/core";
import FIELD_MAP from "./FIELD_MAP";

const schemeRenderProps = {
  context: {
    type: Object,
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

export default {
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
          internalFormData.value = _.cloneDeep(newVal);
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

    function unwrapInterpolation(property: string, context: typeof internalFormData.value) {
      const pattern = /{(.*)}/g;

      const match = property.match(pattern);

      if (match) {
        return getModel(property.replace(/{|}/g, ""), context);
      }

      return property;
    }

    function disabledHandler(disabled: { method?: string } | boolean): boolean {
      if (!disabled) return false;
      if (typeof disabled === "boolean") return disabled;
      else if (typeof props.context.scope[disabled.method] === "function")
        return props.context.scope[disabled.method]();
      else if (props.context.scope[disabled.method]) return props.context.scope[disabled.method];
      return false;
    }

    function fieldHelper(field: ControlSchema, parentId: string | number, context?: any) {
      if (!field) return false;

      const baseProps: IControlBaseProps = {
        key: `${parentId}-${field.id}`,
        label: field.label ? unref(unwrapInterpolation(field.label, context)) : undefined,
        disabled:
          ("disabled" in props.context.scope && props.context.scope.disabled) ||
          disabledHandler("disabled" in field && field.disabled),
        name: field.name,
        rules: field.rules,
        placeholder: field.placeholder,
        required: field.rules?.required,
        modelValue: getModel(field.property, context),
        "onUpdate:modelValue": (e) => setModel({ property: field.property, value: e, context }),
        tooltip: field.tooltip,
        multilanguage: field.multilanguage,
      };

      const baseOptions = {
        visibility: computed(() =>
          field.visibility?.method ? toValue(props.context.scope[field.visibility?.method]) : true
        ),
      };

      const component = FIELD_MAP[field.type];

      const fieldsHandler = computed(() => {
        if (!("fields" in field)) return null;
        const fieldsModel = getModel(field.property);

        if (toValue(fieldsModel) && Array.isArray(toValue(fieldsModel))) {
          return toValue(fieldsModel).map((model) =>
            field.fields.map((fieldItem) => fieldHelper(fieldItem, `fieldset-${fieldItem.id}-${model.id}`, model))
          );
        }
        return [field.fields.map((field) => fieldHelper(field, `fieldset-${parentId}-${field.id}`))];
      });

      const elProps = {
        baseProps,
        baseOptions,
        scope: props.context.scope,
        bladeContext: props.context,
        element: field,
        currentLocale,
        fields: fieldsHandler,
        formData: internalFormData.value,
        fieldContext: context,
        fieldHelper,
        setModel,
        getModel,
        onSetModelData: (e) => (internalFormData.value = e),
      };

      return h(component, elProps);
    }

    const getModel = reactify((property: string, context = internalFormData.value) => {
      if (property && unref(context)) {
        return _.get(unref(context), property);
      }
      return null;
    });

    function setModel(args: {
      property: string;
      value: string | number | Record<string, unknown>;
      option?: string;
      context: Record<string, any>;
    }) {
      const { property, value, option, context = internalFormData.value } = args;

      _.set(context, property, option ? value[option] : value);
    }

    return () =>
      h(
        "div",
        { class: "tw-flex tw-flex-col tw-gap-4" },
        props.uiSchema.reduce((arr, field): VNode[] => [...arr, fieldHelper(field, field.id)], [])
      );
  },
};
