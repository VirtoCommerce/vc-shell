import { ExtractPropTypes, h, Component } from "vue";
import { ImageField } from "../factories";
import componentProps from "./props";
import { ImageSchema } from "../../types";

export default {
  name: "ImageField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: ImageSchema }) {
    return () => {
      const field = ImageField({
        props: {
          ...props.baseProps,
          src: props.baseProps.modelValue,
          aspect: props.element.aspect,
          rounded: props.element.rounded,
          bordered: props.element.bordered,
          clickable: props.element.clickable,
          size: props.element.size,
          background: props.element.background,
        },
        options: props.baseOptions,
      });

      const render = h(field.component as Component, field.props);

      return props.baseOptions.visibility ? render : null;
    };
  },
};
