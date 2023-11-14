import { Component, ExtractPropTypes, h } from "vue";
import { VideoField } from "../factories";
import componentProps from "./props";
import { VideoSchema } from "../../types";

export default {
  name: "VideoField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: VideoSchema }) {
    return () => {
      const field = VideoField({
        props: {
          ...props.baseProps,
          source: props.baseProps.modelValue,
          size: props.element.size,
        },
        options: props.baseOptions,
      });

      const render = h(field.component as Component, field.props);

      return props.baseOptions.visibility ? render : null;
    };
  },
};
