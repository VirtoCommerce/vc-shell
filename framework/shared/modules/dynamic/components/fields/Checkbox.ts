import { ExtractPropTypes, h } from "vue";
import { Checkbox } from "../factories";
import componentProps from "./props";
import ValidationField from "./ValidationField";
import { CheckboxSchema } from "../../types";

export default {
  name: "Checkbox",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: CheckboxSchema }) {
    return () => {
      const field = Checkbox({
        props: {
          ...props.baseProps,

          trueValue: props.element.trueValue,
          falseValue: props.element.falseValue,
        },
        options: props.baseOptions,
        slots: {
          default: () => props.element.content,
        },
      });

      const render = h(field.component, field.props, field.slots);

      if (field.props.rules) {
        return props.baseOptions.visibility
          ? h(
              ValidationField,
              {
                props: field.props,
                slots: field.slots,
                index: props.elIndex,
                rows: props.rows,
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
