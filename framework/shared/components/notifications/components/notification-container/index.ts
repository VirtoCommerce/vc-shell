import { VcToast } from "@ui/components";
import { PropType, computed, defineComponent, h, toRaw } from "vue";
import { Content, NotificationType, NotificationPosition } from "@shared/components/notifications/types";
import { useContainer } from "@shared/components/notifications/composables/useContainer";

const NotificationContainer = defineComponent({
  name: "NotificationContainer",
  inheritAttrs: false,
  props: {
    limit: {
      type: Number,
      required: false,
      default: undefined,
    },
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
      // Get notifications for the specific position
      return notificationContainers[props.position as NotificationPosition].value || [];
    });

    function isComponent(content: Content) {
      return (
        typeof content === "object" &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (!!(content as any)?.render || !!(content as any)?.setup)
      );
    }

    function handleClose(id: string | number | undefined) {
      if (id) {
        actions.dismiss(id);
      }
    }

    return () =>
      notificationsList.value.map((item) => {
        const props = {
          ...item,
          key: item.notificationId,
          onClose: handleClose,
        };

        if (item.content && isComponent(item.content)) {
          return h(VcToast, {
            ...props,
            content: h(toRaw(item.content)),
          });
        }
        return h(VcToast, props);
      });
  },
});

export default NotificationContainer;
