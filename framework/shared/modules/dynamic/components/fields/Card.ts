import { ExtractPropTypes, computed, h, toValue, VNodeChild, VNodeNormalizedChildren, watch, VNode } from "vue";
import { CardCollection } from "../factories";
import componentProps from "./props";
import { CardSchema } from "../../types";
import { nodeBuilder } from "../../helpers/nodeBuilder";
import { useMounted } from "@vueuse/core";
import * as _ from "lodash-es";

export default {
  name: "CardEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: CardSchema }) {
    const isMounted = useMounted();

    const commentRecursiveNodeCheck = (node: VNodeChild | VNodeNormalizedChildren) => {
      return _.every(Array.isArray(node) ? node : [node], (nodeItem) => {
        if (typeof nodeItem === "object") {
          if (
            "children" in nodeItem &&
            nodeItem.children &&
            Array.isArray(nodeItem.children) &&
            !!nodeItem.children.length
          ) {
            return commentRecursiveNodeCheck(nodeItem.children);
          }
          if (
            "el" in nodeItem &&
            nodeItem.el &&
            "nodeType" in (nodeItem.el as VNode["el"]) &&
            (nodeItem.el as VNode["el"]).nodeType
          ) {
            return (nodeItem.el as VNode["el"]).nodeType !== 8;
          } else return true;
        } else return true;
      });
    };

    const isNotEmpty = computed(() => {
      if (isMounted.value) {
        const fields = toValue(props.fields);
        if (fields && Array.isArray(fields) && fields.length) {
          return _.every(fields, (w) => commentRecursiveNodeCheck(w));
        }
      }
      return true;
    });

    return () => {
      const field = CardCollection({
        props: {
          ...props.baseProps,
          header: props.element.label,
          isCollapsable: props.element.collapsible,
          isCollapsed: restoreCollapsed(props.element.id),
          "onState:collapsed": (e) => handleCollapsed(props.element.id, e),
        },
        options: props.baseOptions,

        slots: {
          default: () => h("div", { class: "tw-flex tw-flex-col tw-p-4 tw-gap-4" }, toValue(props.fields)),
          actions: () => {
            const elem = nodeBuilder({
              controlSchema: props.element.action,
              parentId: `${props.element.id}`,
              internalContext: props.fieldContext,
              bladeContext: props.bladeContext,
              currentLocale: props.currentLocale,
              formData: props.formData,
            });
            return elem;
          },
        },
      });

      function handleCollapsed(key: string, value: boolean): void {
        localStorage?.setItem(key, `${value}`);
      }

      function restoreCollapsed(key: string): boolean {
        return localStorage?.getItem(key) === "true";
      }

      return props.baseOptions.visibility && isNotEmpty.value ? h(field.component, field.props, field.slots) : null;
    };
  },
};
