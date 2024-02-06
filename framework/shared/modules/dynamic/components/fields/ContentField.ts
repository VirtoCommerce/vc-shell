import { ExtractPropTypes, h, Component } from "vue";
import { ContentField } from "../factories";
import componentProps from "./props";
import { FieldSchema } from "../../types";

export default {
  name: "ContentField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: FieldSchema }) {
    return () => {
      const field = ContentField({
        props: {
          ...props.baseProps,
          type: props.element.variant,
          copyable: props.element.copyable || false,
          orientation: props.element.orientation,
        },
      });

      const render = h(field.component as Component, field.props);

      return render;
    };
  },
};
