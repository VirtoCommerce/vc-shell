<template>
  <div class="vc-flex">
    <div
      class="
        notification-dropdown__notification-icon
        vc-margin-right_l
        vc-flex
        vc-flex-align_center
        vc-flex-justify_center
        vc-flex-shrink_0
      "
      :style="{
        'background-color': current.styles.color,
      }"
    >
      <vc-icon :icon="current.styles.icon" size="l"></vc-icon>
    </div>

    <vc-row class="vc-flex-justify_space-between vc-flex-grow_1">
      <div class="notification-dropdown__notification-info">
        <component
          :is="current.component"
          :notification="notification"
          :variant="current.styles.color"
        >
          <template v-slot:title="{ title }">
            <p
              class="
                notification-dropdown__notification-title
                vc-margin_none
                vc-margin-bottom_xs
              "
            >
              {{ title }}
            </p>
          </template>
        </component>
      </div>
      <div class="vc-flex vc-flex-shrink_0">
        <p class="notification-dropdown__notification-time vc-margin_none">
          {{ pushTime }}
        </p>
      </div>
    </vc-row>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  reactive,
  ref,
  shallowRef,
  watch,
} from "vue";
import ImportPush from "./_internal/ImportPush.vue";
import DefaultPush from "./_internal/DefaultPush.vue";
import ProductPush from "./_internal/ProductPush.vue";
import moment from "moment";
export default defineComponent({
  name: "NotificationItem",
  props: {
    notification: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const locale = window.navigator.language;
    const current = ref();
    const pushComponents = reactive({
      ImportPushNotification: {
        component: shallowRef(ImportPush),
        styles: {
          color: computed(() => {
            return props.notification.finished &&
              !(props.notification.errors && props.notification.errors.length)
              ? "#87b563"
              : !(
                  props.notification.errors && props.notification.errors.length
                ) && !props.notification.finished
              ? "#A9BCCD"
              : "#F14E4E";
          }),
          icon: "fas fa-download",
        },
      },
      OfferCreatedDomainEvent: {
        component: shallowRef(DefaultPush),
        styles: {
          color: "#87b563",
          icon: "fas fa-percentage",
        },
      },
      OfferDeletedDomainEvent: {
        component: shallowRef(DefaultPush),
        styles: {
          color: "#F14E4E",
          icon: "fas fa-percentage",
        },
      },
      PublicationRequestStatusChangedDomainEvent: {
        component: shallowRef(ProductPush),
        styles: {
          color: computed(() => {
            switch (props.notification.newStatus) {
              case "RequestChanges":
                return "#F14E4E";
              case "Approved":
                return "#87B563";
              case "WaitForApproval":
                return "#f89406";
              case "Rejected":
                return "#F14E4E";
              case "HasStagedChanges":
                return "#f89406";
              case "Published":
                return "#87B563";
              default:
                return "#A9BCCD";
            }
          }),
          icon: "fas fa-box-open",
        },
      },
      DefaultPush: {
        component: DefaultPush,
        styles: {
          color: "#A9BCCD",
          icon: "fas fa-info",
        },
      },
    });

    watch(
      () => props.notification,
      (newVal) => {
        checkPushType(newVal);
      },
      { immediate: true }
    );

    function checkPushType(push) {
      if (push.notifyType in pushComponents) {
        current.value = pushComponents[push.notifyType];
      } else {
        current.value = pushComponents.DefaultPush;
      }
    }

    const pushTime = computed(() => {
      return moment(props.notification.created).locale(locale).format("L LT");
    });

    return {
      current,
      pushTime,
    };
  },
});
</script>

<style lang="less" scoped></style>
