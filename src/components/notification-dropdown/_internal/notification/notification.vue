<template>
  <div class="tw-flex">
    <div
      class="tw-w-[41px] tw-h-[41px] tw-rounded-full tw-text-white tw-mr-4 tw-flex tw-items-center tw-justify-center tw-shrink-0"
      :style="{
        'background-color': current.styles.color,
      }"
    >
      <VcIcon :icon="current.styles.icon" size="l"></VcIcon>
    </div>

    <VcRow class="tw-justify-between tw-grow tw-basis-0">
      <div>
        <component
          :is="current.component"
          :notification="notification"
          :variant="current.styles.color"
        >
          <template v-slot:title="{ title }">
            <p
              class="tw-text-[color:var(--basic-black-color)] tw-text-xl tw-leading-[19px] tw-font-bold tw-m-0 tw-mb-1"
              :class="{ 'tw-mr-4': $isDesktop.value }"
            >
              {{ title }}
            </p>
          </template>
        </component>
      </div>
      <div class="tw-flex tw-shrink-0">
        <p class="tw-text-s tw-leading-[18px] tw-text-[#8e8e8e] tw-m-0">
          {{ pushTime }}
        </p>
      </div>
    </VcRow>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, shallowRef, watch } from "vue";
import {
  VcRow,
  VcIcon,
  IPushNotification,
  PushNotification,
} from "@vc-shell/framework";
import ImportPush from "./_internal/ImportPush.vue";
import DefaultPush from "./_internal/DefaultPush.vue";
import ProductPush from "./_internal/ProductPush.vue";
import moment from "moment";

interface IExtendedPush extends IPushNotification {
  finished: Date;
  errors: string[];
  newStatus: string;
}

export interface Props {
  notification: PushNotification | IExtendedPush;
}

const props = withDefaults(defineProps<Props>(), {
  notification: undefined,
});

const locale = window.navigator.language;
const current = ref();
const pushComponents = reactive({
  ImportPushNotification: {
    component: shallowRef(ImportPush),
    styles: {
      color: computed(() => {
        const notification = props.notification as IExtendedPush;
        return notification.finished &&
          !(notification.errors && notification.errors.length)
          ? "#87b563"
          : !(notification.errors && notification.errors.length) &&
            !notification.finished
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
        switch ((props.notification as IExtendedPush).newStatus) {
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
</script>
