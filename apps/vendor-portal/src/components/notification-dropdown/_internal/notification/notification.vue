<template>
  <div class="flex">
    <div
      class="w-[41px] h-[41px] rounded-full text-white mr-4 flex items-center justify-center shrink-0"
      :style="{
        'background-color': current.styles.color,
      }"
    >
      <VcIcon :icon="current.styles.icon" size="l"></VcIcon>
    </div>

    <VcRow class="justify-between grow basis-0">
      <div>
        <component
          :is="current.component"
          :notification="notification"
          :variant="current.styles.color"
        >
          <template v-slot:title="{ title }">
            <p
              class="text-[color:var(--basic-black-color)] text-xl leading-[19px] font-bold m-0 mb-1"
              :class="{ 'mr-4': $isDesktop.value }"
            >
              {{ title }}
            </p>
          </template>
        </component>
      </div>
      <div class="flex shrink-0">
        <p class="text-s leading-[18px] text-[#8e8e8e] m-0">
          {{ pushTime }}
        </p>
      </div>
    </VcRow>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, shallowRef, watch } from "vue";
import ImportPush from "./_internal/ImportPush.vue";
import DefaultPush from "./_internal/DefaultPush.vue";
import ProductPush from "./_internal/ProductPush.vue";
import moment from "moment";

const props = defineProps({
  notification: {
    type: Object,
    default: () => ({}),
  },
});
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
          : !(props.notification.errors && props.notification.errors.length) &&
            !props.notification.finished
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
</script>
