import { ExtractPropTypes, computed, h, unref } from "vue";
import componentProps from "./props";
import { StatusSchema } from "../../types";
import { StatusField } from "../factories";
import { VcIcon } from "../../../../../ui/components";

export default {
  name: "StatusField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: StatusSchema }) {
    return () => {
      const slotContent = computed(() => {
        if (props.element.content && typeof props.element.content === "string") {
          return props.element.content;
        } else if (props.element.content?.method) {
          const method = unref(props.bladeContext.scope)[props.element.content?.method];
          if (method === "function") {
            return method();
          } else {
            return method;
          }
        }

        return null;
      });

      const field = StatusField({
        props: {
          ...props.baseProps,
          variant: props.element.variant,
          outline: props.element.outline,
          extend: props.element.extend,
        },
        options: props.baseOptions,
        slots: {
          default: () => {
            return h("div", { class: "tw-flex tw-flex-row tw-items-center" }, [
              h(VcIcon, {
                icon: props.element.icon,
                size: props.element.iconSize,
                variant: props.element.iconVariant,
                class: "tw-mr-3",
              }),
              h("div", [h("div", { class: "tw-font-bold" }, props.element.title), h("div", slotContent.value)]),
            ]);
          },
        },
      });

      return props.baseOptions.visibility
        ? h(field.component, { ...field.props, class: "tw-w-full tw-box-border" }, field.slots)
        : null;
    };
  },
};
