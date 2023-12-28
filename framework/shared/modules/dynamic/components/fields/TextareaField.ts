import { TextareaField } from "./../factories";
import { TextareaSchema } from "./../../types/index";
import { ExtractPropTypes, h, Component } from "vue";
import componentProps from "./props";
import ValidationField from "./ValidationField";

export default {
  name: "TextareaField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: TextareaSchema }) {
    return () => {
      const field = TextareaField({
        props: {
          ...props.baseProps,
          currentLanguage: props.currentLocale,
          clearable: props.element.clearable || false,
        },
        options: props.baseOptions,
      });

      const render = h(field.component as Component, field.props);

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
              () => render,
            )
          : null;
      } else {
        return props.baseOptions.visibility ? render : null;
      }
    };
  },
};
