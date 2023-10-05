import { reactiveComputed } from "@vueuse/core";
import { ExtractPropTypes, h, unref } from "vue";
import { Button } from "../factories";
import componentProps from "./props";

export default {
  name: "ButtonEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps>) {
    const field = reactiveComputed(() =>
      Button({
        props: {
          ...props.baseProps,
          small: props.element.small,
          icon: props.element?.icon,
          iconSize: props.element?.iconSize,
          text: props.element?.text,
          onClick: () => {
            unref(props.scope)[props.element.method]();
          },
        },
        options: props.baseOptions,
        slots: {
          default: () => props.element.content,
        },
      })
    );

    return () => h(field.component, field.props, field.slots);
  },
};
