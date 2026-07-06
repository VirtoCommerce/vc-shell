import { VcToast } from "@ui/components/molecules/vc-toast";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { PropType, computed, defineComponent, h, toRaw, inject } from "vue";
import {
  Content,
  NotificationType,
  NotificationPosition,
  NotificationContainerStateKey,
} from "@core/notifications/toast-types";
import { GAP, VISIBLE_TOASTS, computeToastOffsets } from "./computeToastOffsets";
import { useToastStack } from "./useToastStack";
import { i18n } from "@core/plugins/i18n";

const NotificationContainer = defineComponent({
  name: "NotificationContainer",
  inheritAttrs: false,
  props: {
    pauseOnHover: {
      type: Boolean,
      required: false,
      default: true,
    },
    timeout: {
      type: [Number, Boolean],
      required: false,
      default: 3000,
    },
    content: {
      type: [String, Object] as PropType<Content>,
      required: false,
      default: "",
    },
    notificationId: {
      type: [String, Number],
      required: false,
      default: "",
    },
    updateId: {
      type: [String, Number],
      required: false,
      default: "",
    },
    type: {
      type: String as PropType<NotificationType>,
      required: false,
      default: "default",
    },
    onOpen: {
      type: Function as PropType<<T>(payload: T) => void>,
      required: false,
      default: undefined,
    },
    onClose: {
      type: Function as PropType<<T>(payload: T) => void>,
      required: false,
      default: undefined,
    },
    payload: {
      type: [String, Object] as PropType<Record<string, any>>,
      required: false,
      default: () => ({}),
    },
    position: {
      type: String as PropType<NotificationPosition>,
      required: false,
      default: "top-center",
    },
  },
  setup(props) {
    const { notificationContainers, actions } = inject(NotificationContainerStateKey)!;
    const notificationsList = computed(() => {
      return notificationContainers[props.position as NotificationPosition].value || [];
    });

    const {
      expanded,
      heightsMap,
      expandStack,
      collapseStack,
      reportHeight,
      forgetHeight,
      clearHeights,
      setInteracting,
    } = useToastStack();

    function isComponent(content: Content) {
      return typeof content === "object" && (!!(content as any)?.render || !!(content as any)?.setup);
    }

    function handleClose(id: string | number | undefined) {
      if (id) {
        forgetHeight(id);
        actions.remove(id);
      }
    }

    function handleClearAll() {
      actions.clear();
      clearHeights();
    }

    const isTop = computed(() => (props.position || "top-center").startsWith("top"));

    return () => {
      const items = notificationsList.value;
      const count = items.length;
      const isExpanded = expanded.value || count <= 1;
      const showClearAll = count > 1;

      const layout = computeToastOffsets(
        items.map((item) => item.notificationId),
        heightsMap,
        isExpanded,
      );

      const children = items.map((item, arrayIndex) => {
        const { sonnerIndex, zIndex, offset, initialHeight } = layout.toasts[arrayIndex];

        const toastStyle: Record<string, string | number> = {
          "--toasts-before": sonnerIndex,
          "--z-index": zIndex,
          "--offset": `${offset}px`,
          "--initial-height": initialHeight ? `${initialHeight}px` : "auto",
        };

        const toastProps = {
          ...item,
          onClose: handleClose,
          onReportHeight: reportHeight,
          toastIndex: sonnerIndex,
          toastsCount: count,
          expanded: isExpanded,
          visibleToasts: VISIBLE_TOASTS,
          style: toastStyle,
        };

        const toastVNode =
          item.content && isComponent(item.content)
            ? h(VcToast, { ...toastProps, content: h(toRaw(item.content)) })
            : h(VcToast, toastProps);

        // The group is an <ol>, so each toast must be a list item
        // (WCAG 1.3.1 / axe `list`). display:contents keeps the wrapper
        // layout-transparent while preserving the listitem semantics.
        return h("li", { key: item.notificationId, style: { display: "contents" } }, [toastVNode]);
      });

      // Clear all button — fixed position top-right of toast stack
      let clearAllButton = null;
      if (showClearAll) {
        // <li>: the group is an <ol>, so every direct child must be a list item
        // (WCAG 1.3.1 / axe `list`).
        clearAllButton = h(
          "li",
          {
            class: "notification__clear-all",
            style: {
              position: "absolute",
              [isTop.value ? "top" : "bottom"]: "0",
              left: "var(--width, 356px)",
              "margin-left": "8px",
              "list-style": "none",
              opacity: isExpanded ? "1" : "0",
              "pointer-events": isExpanded ? "auto" : "none",
              transition: "opacity 200ms ease",
            },
          },
          [
            h(
              "button",
              {
                type: "button",
                onClick: handleClearAll,
              },
              [
                h(VcIcon, { icon: "lucide-x", size: "xs", "aria-hidden": "true" }),
                i18n.global.t("CORE.NOTIFICATIONS.CLEAR_ALL"),
              ],
            ),
          ],
        );
      }

      return h(
        "ol",
        {
          class: "notification__toast-group",
          "data-expanded": String(isExpanded),
          "data-position": props.position || "top-center",
          "data-y-position": isTop.value ? "top" : "bottom",
          style: {
            "--front-toast-height": `${layout.frontHeight}px`,
            "--gap": `${GAP}px`,
            width: "var(--width, 356px)",
            height: `${layout.groupHeight}px`,
          },
          onMouseenter: expandStack,
          onMouseleave: collapseStack,
          onPointerdown: () => {
            setInteracting(true);
          },
          onPointerup: () => {
            setInteracting(false);
          },
        },
        [...children, clearAllButton],
      );
    };
  },
});

export default NotificationContainer;
