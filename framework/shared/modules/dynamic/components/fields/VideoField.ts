import { Component, ExtractPropTypes, h, toValue } from "vue";
import { VideoField } from "../factories";
import componentProps from "./props";
import { VideoSchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";

export default {
  name: "VideoField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: VideoSchema }) {
    return () => {
      const field = VideoField({
        props: Object.assign(
          {},
          {
            source: toValue(props.baseProps.modelValue),
            size: props.element.size,
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
