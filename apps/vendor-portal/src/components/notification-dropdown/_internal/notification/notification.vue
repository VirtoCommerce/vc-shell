<template>
  <div class="vc-flex">
    <div
      class="notification__icon vc-margin-right_l vc-flex vc-flex-align_center vc-flex-justify_center vc-flex-shrink_0"
      :style="{
        'background-color': current.styles.color,
      }"
    >
      <VcIcon :icon="current.styles.icon" size="l"></VcIcon>
    </div>

    <VcRow class="vc-flex-justify_space-between vc-flex-grow_1">
      <div>
        <component
          :is="current.component"
          :notification="notification"
          :variant="current.styles.color"
        >
          <template v-slot:title="{ title }">
            <p
              class="notification__title vc-margin_none vc-margin-bottom_xs"
              :class="{ 'vc-margin-right_l': $isDesktop.value }"
            >
              {{ title }}
            </p>
          </template>
        </component>
      </div>
      <div class="vc-flex vc-flex-shrink_0">
        <p class="notification__time vc-margin_none">
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

<style lang="less" scoped>
.notification {
  &__icon {
    width: 41px;
    height: 41px;
    border-radius: 50%;
    color: #fff;
  }

  &__title {
    color: var(--basic-black-color);
    font-size: var(--font-size-xl);
    line-height: var(--line-height-l);
    font-weight: var(--font-weight-bold);
  }

  &__time {
    font-size: var(--font-size-s);
    line-height: var(--line-height-m);
    color: #8e8e8e;
  }
}
</style>
