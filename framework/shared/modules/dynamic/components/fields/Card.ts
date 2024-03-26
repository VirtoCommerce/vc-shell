import {
  ExtractPropTypes,
  h,
  toValue,
  VNodeChild,
  VNodeNormalizedChildren,
  Component,
  ref,
  onMounted,
  onUpdated,
} from "vue";
import { CardCollection } from "../factories";
import componentProps from "./props";
import { CardSchema } from "../../types";
import { nodeBuilder } from "../../helpers/nodeBuilder";
import { unrefNested } from "../../helpers/unrefNested";

export default {
  name: "CardEl",
  props: componentProps,
  setup(props: ExtractPropTypes<typeof componentProps> & { element: CardSchema }) {
    const hasNoComment = ref(true);

    onMounted(() => {
      hasNoComment.value = hasNoCommentNodes(toValue(props.fields));
    });

    onUpdated(() => {
      hasNoComment.value = hasNoCommentNodes(toValue(props.fields));
    });

    const hasNoCommentNodes = (components: (VNodeChild | VNodeNormalizedChildren)[]): boolean => {
      const vnodeIterable = Array.isArray(components) ? components : [components];
      const commentCounter = ref(0);

      for (const component of vnodeIterable) {
        if (Array.isArray(component) && component.length > 0) {
          if (!hasNoCommentNodes(component)) {
            commentCounter.value++;
            break;
          }
        } else if (component && typeof component === "object" && !Array.isArray(component)) {
          if (Array.isArray(component.children) && component.children.length > 0) {
            // Recursive check for nested components
            if (!hasNoCommentNodes(component.children)) {
              commentCounter.value++;
              break;
            }
          }

          if (component.el && (component.el as HTMLElement).nodeType === 8) {
            commentCounter.value++;
            break;
          }
        }
      }

      return commentCounter.value !== vnodeIterable.length;
    };

    return () => {
      const field = CardCollection({
        props: Object.assign(
          {},
          {
            header: toValue(props.baseProps.label),
            isCollapsable: props.element.collapsible,
            isCollapsed: restoreCollapsed(props.element.id) || props.element.collapsed,
            "onState:collapsed": (e: boolean) => handleCollapsed(props.element.id, e),
          },
          unrefNested(props.baseProps),
          {
            class: unrefNested(props.baseProps).classNames ?? "",
          },
        ),

        slots: {
          default: () =>
            h(
              "div",
              {
                class: {
                  "tw-flex": true,
                  "tw-flex-col": true,
                  "tw-p-4": !props.element.removePadding,
                  "tw-gap-4": true,
                },
              },
              toValue(props.fields),
            ),
          actions: () => {
            if (props.element.action) {
              const elem = nodeBuilder({
                controlSchema: props.element.action,
                parentId: `${props.element.id}`,
                internalContext: props.fieldContext ?? {},
                bladeContext: props.bladeContext,
                currentLocale: props.currentLocale ?? "en",
                formData: props.formData,
              });
              return elem;
            }
          },
        },
      });

      function handleCollapsed(key: string, value: boolean): void {
        localStorage?.setItem(key, `${value}`);
      }

      function restoreCollapsed(key: string): boolean {
        return localStorage?.getItem(key) === "true";
      }

      return hasNoComment.value ? h(field.component as Component, field.props, field.slots) : null;
    };
  },
};
