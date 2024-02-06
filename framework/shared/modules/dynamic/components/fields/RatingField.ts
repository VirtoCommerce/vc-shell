import { Component, ExtractPropTypes, h } from "vue";
import { Rating } from "../factories";
import componentProps from "./props";
import { RatingSchema } from "../../types";

export default {
  name: "RatingEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: RatingSchema }) {
    return () => {
      const field = Rating({
        props: {
          ...props.baseProps,
          variant: props.element.type,
        },
      });

      return h(field.component as Component, field.props);
    };
  },
};
