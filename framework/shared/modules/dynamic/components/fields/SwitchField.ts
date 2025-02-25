import { Component, ExtractPropTypes, h } from "vue";
import { Switch } from "../factories";
import componentProps from "./props";
import { SwitchSchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";

export default {
  name: "SwitchEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: SwitchSchema }) {
    return () => {
      const field = Switch({
        props: Object.assign(
          {},
          {
            trueValue: props.element.trueValue,
            falseValue: props.element.falseValue,
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
