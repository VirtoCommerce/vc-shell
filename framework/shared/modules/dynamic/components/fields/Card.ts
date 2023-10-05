import { reactiveComputed } from "@vueuse/core";
import { ExtractPropTypes, h, toValue } from "vue";
import { CardCollection } from "../factories";
import componentProps from "./props";

export default {
  name: "CardEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps>) {
    const field = reactiveComputed(() =>
      CardCollection({
        props: {
          ...props.baseProps,
          header: props.element.label,
          classNames: "tw-mb-4",
          isCollapsable: props.element.collapsible,
          isCollapsed: restoreCollapsed(props.element.id),
          "onState:collapsed": (e) => handleCollapsed(props.element.id, e),
        },
        options: props.baseOptions,

        slots: {
          default: () => h("div", { class: "tw-flex tw-flex-col tw-p-4 tw-gap-4" }, toValue(props.fields)),
          actions: () => {
            const elem = props.fieldHelper(props.element.action, `${props.element.id}`);
            return elem;
          },
        },
      })
    );

    function handleCollapsed(key: string, value: boolean): void {
      localStorage?.setItem(key, `${value}`);
    }

    function restoreCollapsed(key: string): boolean {
      return localStorage?.getItem(key) === "true";
    }

    return () => h(field.component, field.props, field.slots);
  },
};
