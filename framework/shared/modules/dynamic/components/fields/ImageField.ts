import { ExtractPropTypes, h, Component, toValue } from "vue";
import { ImageField } from "@shared/modules/dynamic/components/factories";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import { ImageSchema } from "@shared/modules/dynamic/types";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";

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
