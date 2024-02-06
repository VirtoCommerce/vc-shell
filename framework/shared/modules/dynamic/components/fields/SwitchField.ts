import { Component, ExtractPropTypes, h } from "vue";
import { Switch } from "../factories";
import componentProps from "./props";
import { SwitchSchema } from "../../types";

export default {
  name: "SwitchEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: SwitchSchema }) {
    return () => {
      const field = Switch({
        props: {
          ...props.baseProps,
          trueValue: props.element.trueValue,
          falseValue: props.element.falseValue,
        },
      });

      return h(field.component as Component, field.props);
    };
  },
};
