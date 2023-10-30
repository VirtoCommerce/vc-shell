import { ExtractPropTypes, h } from "vue";
import { ContentField } from "../factories";
import componentProps from "./props";
import { FieldSchema } from "../../types";

export default {
  name: "InputField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: FieldSchema }) {
    return () => {
      const field = ContentField({
        props: {
          ...props.baseProps,
          type: props.element.variant,
          copyable: props.element.copyable || false,
        },
        options: props.baseOptions,
      });

      const render = h(field.component, field.props);

      return props.baseOptions.visibility ? render : null;
    };
  },
};
