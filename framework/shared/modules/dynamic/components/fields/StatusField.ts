import { useI18n } from "vue-i18n";
import { Component, ExtractPropTypes, computed, h, onMounted, ref, unref } from "vue";
import componentProps from "./props";
import { StatusSchema } from "../../types";
import { StatusField } from "../factories";
import { VcIcon } from "../../../../../ui/components";
import { unrefNested } from "../../helpers/unrefNested";
import VcButton from "../../../../../ui/components/atoms/vc-button/vc-button.vue";

export default {
  name: "StatusField",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: StatusSchema }) {
    const { t } = useI18n({ useScope: "global" });
    const hasOverflow = ref(false);
    const isExpanded = ref(false);
    const contentRef = ref<HTMLElement | null>(null);

    const toggle = () => {
      isExpanded.value = !isExpanded.value;
    };

    const checkOverflow = () => {
      if (contentRef.value) {
        hasOverflow.value = contentRef.value.scrollHeight > 100;
      }
    };

    onMounted(() => {
      checkOverflow();
    });

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
              h("div", { class: "tw-flex tw-flex-col" }, [
                h("div", { class: "tw-font-bold" }, computed(() => t(props.element.title ?? "")).value),
                h(
                  "div",
                  {
                    class: {
                      "tw-overflow-hidden": true,
                      "tw-max-h-[100px] tw-line-clamp-4": !isExpanded.value,
                      "tw-max-h-[100%]": isExpanded.value,
                    },
                    ref: contentRef,
                  },
                  slotContent.value,
                ),
                hasOverflow.value
                  ? h(VcButton, { text: true, class: "tw-self-end", onClick: toggle }, () =>
                      isExpanded.value
                        ? t("COMPONENTS.ATOMS.VC_STATUS.SHOW_LESS")
                        : t("COMPONENTS.ATOMS.VC_STATUS.SHOW_MORE"),
                    )
                  : undefined,
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
