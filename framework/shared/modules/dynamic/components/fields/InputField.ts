import { ExtractPropTypes, h, VNode, Component } from "vue";
import { InputField } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { InputSchema, ControlSchema } from "../../types";
import { nodeBuilder } from "../../helpers/nodeBuilder";

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
        props: {
          ...props.baseProps,
          type: props.element.variant,
          currentLanguage: props.currentLocale,
          clearable: props.element.clearable || false,
        },
        options: props.baseOptions,
        slots: Object.entries(slotsMap).reduce((acc, [key, value]) => {
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
        }, {} as Record<keyof InputSchema, () => VNode | false>),
      });

      const render = h(field.component as Component, field.props, field.slots);

      if (field.props.rules) {
        return props.baseOptions.visibility
          ? h(
              ValidationField,
              {
                props: field.props,
                index: props.elIndex,
                rows: props.rows,
                key: `${String(field.props.key)}_validation`,
              },
              () => render
            )
          : null;
      } else {
        return props.baseOptions.visibility ? render : null;
      }
    };
  },
};
