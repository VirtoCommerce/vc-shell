import { ExtractPropTypes, h, Component } from "vue";
import { ContentField } from "../factories";
import componentProps from "./props";
import { FieldSchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";

export default {
  name: "ContentField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: FieldSchema }) {
    return () => {
      const field = ContentField({
        props: Object.assign(
          {},
          {
            type: props.element.variant,
            copyable: props.element.copyable || false,
            orientation: props.element.orientation,
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),
      });

      const render = h(field.component as Component, field.props);

      return render;
    };
  },
};
