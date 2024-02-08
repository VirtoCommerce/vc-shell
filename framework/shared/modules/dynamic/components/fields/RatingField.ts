import { Component, ExtractPropTypes, h } from "vue";
import { Rating } from "../factories";
import componentProps from "./props";
import { RatingSchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";

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
        ),
      });

      return h(field.component as Component, field.props);
    };
  },
};
