import { ExtractPropTypes, h } from "vue";
import { InputField } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { InputSchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";
import { getModel } from "../../helpers/getters";

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
      });

      const render = h(field.component, field.props);

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
