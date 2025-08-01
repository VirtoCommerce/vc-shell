import { ExtractPropTypes, h, VNode, Component, toValue } from "vue";
import { InputField } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { InputSchema, ControlSchema } from "../../types";
import { nodeBuilder } from "../../helpers/nodeBuilder";
import { unrefNested } from "../../helpers/unrefNested";
import { methodHandler } from "../../helpers/methodHandler";

const slotsMap = {
  append: "append",
  prepend: "prepend",
  appendInner: "append-inner",
  prependInner: "prepend-inner",
};

export default {
  name: "InputField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: InputSchema }) {
    return () => {
      const field = InputField({
        props: Object.assign(
          {},
          {
            type: props.element.variant,
            currentLanguage: props.currentLocale,
            clearable: props.element.clearable || false,
            maxlength: props.element.maxlength,
            datePickerOptions: props.element.datePickerOptions,
            loading: props.element.loading?.method
              ? methodHandler(
                  toValue(props.bladeContext?.scope)?.[props.element.loading?.method],
                  props.fieldContext,
                  props.element,
                )
              : false,
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),
        slots: Object.entries(slotsMap).reduce(
          (acc, [key, value]) => {
            if (props.element[key as keyof InputSchema]) {
              acc[value as keyof InputSchema] = () =>
                nodeBuilder({
                  controlSchema: props.element[key as keyof InputSchema] as ControlSchema,
                  parentId: `${(props.element[key as keyof InputSchema] as ControlSchema).id}`,
                  internalContext: props.fieldContext ?? {},
                  bladeContext: props.bladeContext,
                  currentLocale: props.currentLocale ?? "en-US",
                  formData: props.formData,
                });
            }
            return acc;
          },
          {} as Record<keyof InputSchema, () => VNode | false>,
        ),
      });

      const render = h(field.component as Component, field.props, field.slots);

      if (field.props.rules) {
        return h(
          ValidationField,
          {
            props: field.props,
            index: props.elIndex,
            rows: props.rows,
            key: `${String(field.props.key)}_validation`,
          },
          () => render,
        );
      } else {
        return render;
      }
    };
  },
};
