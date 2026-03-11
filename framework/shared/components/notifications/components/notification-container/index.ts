import { VcToast } from "@ui/components/molecules/vc-toast";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { PropType, computed, defineComponent, h, ref, toRaw, reactive, inject } from "vue";
import { Content, NotificationType, NotificationPosition, NotificationContainerStateKey } from "@shared/components/notifications/types";

const GAP = 14;
const VISIBLE_TOASTS = 3;

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
    const { notificationContainers, actions } = inject(NotificationContainerStateKey)!;
    const notificationsList = computed(() => {
      return notificationContainers[props.position as NotificationPosition].value || [];
    });

    const expanded = ref(false);
    const interacting = ref(false);
    let collapseTimer: ReturnType<typeof setTimeout> | null = null;

    function expandStack() {
      if (collapseTimer) {
        clearTimeout(collapseTimer);
        collapseTimer = null;
      }
      expanded.value = true;
    }

    function collapseStack() {
      if (interacting.value) return;
      collapseTimer = setTimeout(() => {
        expanded.value = false;
        collapseTimer = null;
      }, 200);
    }

    // Height tracking: toastId → height
    const heightsMap = reactive(new Map<string | number, number>());

    function handleHeightReport(toastId: string | number, height: number) {
      const rounded = Math.round(height);
      if (heightsMap.get(toastId) !== rounded) {
        heightsMap.set(toastId, rounded);
      }
    }

    function isComponent(content: Content) {
      return (
        typeof content === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (!!(content as any)?.render || !!(content as any)?.setup)
      );
    }

    function handleClose(id: string | number | undefined) {
      if (id) {
        heightsMap.delete(id);
        actions.remove(id);
      }
    }

    function handleClearAll() {
      actions.clear();
      heightsMap.clear();
    }

    const isTop = computed(() => (props.position || "top-center").startsWith("top"));

    return () => {
      const items = notificationsList.value;
      const count = items.length;
      const isExpanded = expanded.value || count <= 1;
      const showClearAll = count > 1;

      // Front toast = newest = last in array
      const frontToastId = count > 0 ? items[count - 1].notificationId : undefined;
      const frontHeight = frontToastId !== undefined ? (heightsMap.get(frontToastId) || 0) : 0;

      const children = items.map((item, arrayIndex) => {
        // sonnerIndex: 0 = front/newest, higher = older/back
        const sonnerIndex = count - 1 - arrayIndex;

        // Expanded offset: sum heights of newer toasts + gap * sonnerIndex
        let heightSum = 0;
        for (let i = arrayIndex + 1; i < count; i++) {
          const id = items[i].notificationId;
          if (id !== undefined) {
            heightSum += heightsMap.get(id) || 0;
          }
        }
        const offset = sonnerIndex * GAP + heightSum;

        const initialHeight =
          item.notificationId !== undefined ? (heightsMap.get(item.notificationId) || 0) : 0;

        const toastStyle: Record<string, string | number> = {
          "--toasts-before": sonnerIndex,
          "--z-index": count - sonnerIndex,
          "--offset": `${offset}px`,
          "--initial-height": initialHeight ? `${initialHeight}px` : "auto",
        };

        const toastProps = {
          ...item,
          key: item.notificationId,
          onClose: handleClose,
          onReportHeight: handleHeightReport,
          toastIndex: sonnerIndex,
          toastsCount: count,
          expanded: isExpanded,
          visibleToasts: VISIBLE_TOASTS,
          style: toastStyle,
        };

        if (item.content && isComponent(item.content)) {
          return h(VcToast, {
            ...toastProps,
            content: h(toRaw(item.content)),
          });
        }
        return h(VcToast, toastProps);
      });

      // Clear all button — fixed position top-right of toast stack
      let clearAllButton = null;
      if (showClearAll) {
        clearAllButton = h(
          "div",
          {
            class: "notification__clear-all",
            style: {
              position: "absolute",
              [isTop.value ? "top" : "bottom"]: "0",
              left: "var(--width, 356px)",
              "margin-left": "8px",
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
                "Clear all",
              ],
            ),
          ],
        );
      }

      // Compute total stack height for the group element
      let groupHeight: number;
      if (isExpanded && count > 1) {
        // Expanded: offset of oldest toast + its height
        const oldestSonnerIdx = count - 1;
        let hSum = 0;
        for (let i = 1; i < count; i++) {
          const id = items[i].notificationId;
          hSum += id !== undefined ? (heightsMap.get(id) || 0) : 0;
        }
        const oldestOffset = oldestSonnerIdx * GAP + hSum;
        const oldestHeight =
          items[0].notificationId !== undefined
            ? (heightsMap.get(items[0].notificationId) || 0)
            : 0;
        groupHeight = oldestOffset + oldestHeight;
      } else {
        // Collapsed: front toast height + visible back toasts gap
        groupHeight = frontHeight + Math.min(count - 1, VISIBLE_TOASTS - 1) * GAP;
      }

      return h(
        "ol",
        {
          class: "notification__toast-group",
          "data-expanded": String(isExpanded),
          "data-position": props.position || "top-center",
          "data-y-position": isTop.value ? "top" : "bottom",
          style: {
            "--front-toast-height": `${frontHeight}px`,
            "--gap": `${GAP}px`,
            width: "var(--width, 356px)",
            height: `${groupHeight}px`,
          },
          onMouseenter: expandStack,
          onMouseleave: collapseStack,
          onPointerdown: () => {
            interacting.value = true;
          },
          onPointerup: () => {
            interacting.value = false;
          },
        },
        [...children, clearAllButton],
      );
    };
  },
});

export default NotificationContainer;
