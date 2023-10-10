import { ExtractPropTypes, h, unref } from "vue";
import { Button } from "../factories";
import componentProps from "./props";
import { ButtonSchema } from "../../types";
import { unrefNested } from "../../helpers/unrefNested";
import { getModel } from "../../helpers/getters";

export default {
  name: "ButtonEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: ButtonSchema }) {
    return () => {
      const field = Button({
        props: {
          ...props.baseProps,

          small: props.element.small,
          icon: props.element?.icon,
          iconSize: props.element?.iconSize,
          text: props.element?.text,
          onClick: () => {
            unref(props.bladeContext.scope)[props.element.method]();
          },
        },
        options: props.baseOptions,
        slots: {
          default: () => props.element.content,
        },
      });

      return props.baseOptions.visibility ? h(field.component, field.props, field.slots) : null;
    };
  },
};
