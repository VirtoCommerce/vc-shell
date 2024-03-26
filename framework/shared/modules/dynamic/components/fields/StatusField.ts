import { useI18n } from "vue-i18n";
import { Component, ExtractPropTypes, computed, h, unref } from "vue";
import componentProps from "./props";
import { StatusSchema } from "../../types";
import { StatusField } from "../factories";
import { VcIcon } from "../../../../../ui/components";
import { unrefNested } from "../../helpers/unrefNested";

export default {
  name: "StatusField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: StatusSchema }) {
    const { t } = useI18n({ useScope: "global" });

    return () => {
      const slotContent = computed(() => {
        if (props.element.content && typeof props.element.content === "string") {
          return t(props.element.content);
        } else if (
          typeof props.element.content === "object" &&
          "method" in props.element.content &&
          props.element.content?.method
        ) {
          const method = unref(props.bladeContext.scope)?.[props.element.content?.method];
          if (typeof method === "function") {
            return method();
          } else {
            return method;
          }
        }

        return null;
      });

      const field = StatusField({
        props: Object.assign(
          {
            variant: props.element.variant,
            outline: props.element.outline,
            extend: props.element.extend,
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),
        slots: {
          default: () => {
            return h("div", { class: "tw-flex tw-flex-row tw-items-center" }, [
              props.element.icon
                ? h(VcIcon, {
                    icon: props.element.icon,
                    size: props.element.iconSize,
                    variant: props.element.iconVariant,
                    class: "tw-mr-3",
                  })
                : undefined,
              h("div", [
                h("div", { class: "tw-font-bold" }, computed(() => t(props.element.title ?? "")).value),
                h("div", slotContent.value),
              ]),
            ]);
          },
        },
      });

      return h(
        field.component as Component,
        { ...field.props, class: props.element.extend ? "tw-w-full tw-box-border" : "tw-flex tw-self-start" },
        field.slots,
      );
    };
  },
};
