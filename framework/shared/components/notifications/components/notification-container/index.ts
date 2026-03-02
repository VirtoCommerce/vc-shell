import { VcToast, VcIcon } from "@ui/components";
import { PropType, computed, defineComponent, h, ref, toRaw } from "vue";
import { Content, NotificationType, NotificationPosition } from "@shared/components/notifications/types";
import { useContainer } from "@shared/components/notifications/composables/useContainer";

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const { notificationContainers, actions } = useContainer();
    const notificationsList = computed(() => {
      return notificationContainers[props.position as NotificationPosition].value || [];
    });

    // Stacking: expand toasts on hover
    const expanded = ref(false);

    function isComponent(content: Content) {
      return (
        typeof content === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (!!(content as any)?.render || !!(content as any)?.setup)
      );
    }

    // Called after VcToast finishes its exit transition — remove from the list directly
    function handleClose(id: string | number | undefined) {
      if (id) {
        actions.remove(id);
      }
    }

    function handleClearAll() {
      actions.clear();
    }

    return () => {
      const items = notificationsList.value;
      const count = items.length;
      const isExpanded = expanded.value || count <= 1;
      const showClearAll = expanded.value && count > 1;

      const children = items.map((item, index) => {
        const toastProps = {
          ...item,
          key: item.notificationId,
          onClose: handleClose,
          toastIndex: index,
          toastsCount: count,
          expanded: isExpanded,
        };

        if (item.content && isComponent(item.content)) {
          return h(VcToast, {
            ...toastProps,
            content: h(toRaw(item.content)),
          });
        }
        return h(VcToast, toastProps);
      });

      // "Clear all" button below the stack
      const clearAllButton = showClearAll
        ? h("div", { class: "notification__clear-all" }, [
            h(
              "button",
              {
                type: "button",
                onClick: handleClearAll,
              },
              [
                h(VcIcon, { icon: "lucide-x", size: "xs", "aria-hidden": "true" }),
                "Clear all",
              ],
            ),
          ])
        : null;

      // Wrap in a group div for hover-expand behavior
      return h(
        "div",
        {
          class: "notification__toast-group",
          "data-expanded": String(isExpanded),
          "data-position": props.position || "top-center",
          onMouseenter: () => {
            expanded.value = true;
          },
          onMouseleave: () => {
            expanded.value = false;
          },
        },
        [...children, clearAllButton],
      );
    };
  },
});

export default NotificationContainer;
