import { CustomComponentSchema } from "./../../types";
import { ExtractPropTypes, resolveComponent, h } from "vue";
import componentProps from "./props";

export default {
  name: "CustomComponentRenderer",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: CustomComponentSchema }) {
    return () => {
      const component = resolveComponent(props.element?.name);

      return typeof component === "object"
        ? h(component, {
            context: props.bladeContext,
          })
        : null;
    };
  },
};
