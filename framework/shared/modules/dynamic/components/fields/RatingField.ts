import { Component, ExtractPropTypes, h } from "vue";
import { Rating } from "@shared/modules/dynamic/components/factories";
import componentProps from "@shared/modules/dynamic/components/fields/props";
import { RatingSchema } from "@shared/modules/dynamic/types";
import { unrefNested } from "@shared/modules/dynamic/helpers/unrefNested";

export default {
  name: "RatingEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: RatingSchema }) {
    return () => {
      const field = Rating({
        props: Object.assign(
          {},
          {
            variant: props.element.type,
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),
      });

      return h(field.component as Component, field.props);
    };
  },
};
