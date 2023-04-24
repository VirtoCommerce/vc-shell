import { VcNotification } from "./../../../../../ui/components";
import { PropType, computed, defineComponent, h } from "vue";
import { NotificationType } from "../../types";
import { useContainer } from "../../composables";

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
      type: String,
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
    closeNotification: {
      type: Function as PropType<() => void>,
      required: false,
      default: undefined,
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
  },
  setup() {
    const { notificationContainer } = useContainer();
    const notificationsList = computed(() => {
      return notificationContainer.value || [];
    });

    return () =>
      notificationsList.value.map((item) => {
        return h(VcNotification, { ...item, key: item.notificationId });
      });
  },
});

export default NotificationContainer;
