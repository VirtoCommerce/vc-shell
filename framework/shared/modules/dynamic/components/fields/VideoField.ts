import { Component, ExtractPropTypes, h, toValue } from "vue";
import { VideoField } from "@shared/modules/dynamic/components/factories";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import { VideoSchema } from "@shared/modules/dynamic/types";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";

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
