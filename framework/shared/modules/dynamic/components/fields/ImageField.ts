import { ExtractPropTypes, h, Component, toValue } from "vue";
import { ImageField } from "../factories";
import componentProps from "./props";
import { ImageSchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";

export default {
  name: "ImageField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: ImageSchema }) {
    return () => {
      const field = ImageField({
        props: Object.assign(
          {},
          {
            src: toValue(props.baseProps.modelValue),
            aspect: props.element.aspect,
            rounded: props.element.rounded,
            bordered: props.element.bordered,
            size: props.element.size,
            background: props.element.background,
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
