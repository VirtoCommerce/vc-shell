import { CustomComponentSchema } from "./../../types";
import { ExtractPropTypes, resolveComponent, h } from "vue";
import componentProps from "./props";
import { unrefNested } from "../../helpers/unrefNested";

export default {
  name: "CustomComponentRenderer",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: CustomComponentSchema }) {
    return () => {
      const component = resolveComponent(props.element?.name);

      return typeof component === "object"
        ? h(
            component,
            Object.assign(
              {},
              {
                context: props.bladeContext,
              },
              {
                class: unrefNested(props.baseProps).classNames ?? "",
              },
            ),
          )
        : null;
    };
  },
};
