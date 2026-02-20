import { ExtractPropTypes, h, Component } from "vue";
import { ContentField } from "@shared/modules/dynamic/components/factories";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import { FieldSchema } from "@shared/modules/dynamic/types";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";

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
            aspectRatio: props.element.aspectRatio,
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
