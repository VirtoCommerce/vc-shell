<template>
  <div class="tw-flex">
    <div
      class="tw-w-[41px] tw-h-[41px] tw-rounded-full tw-text-white tw-mr-4 tw-flex tw-items-center tw-justify-center tw-shrink-0"
      :style="{
        'background-color': current.styles.color,
      }"
    >
      <VcIcon
        :icon="current.styles.icon"
        size="l"
      ></VcIcon>
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
import { computed, reactive, ref, watch } from "vue";
import { VcRow, VcIcon, IPushNotification, PushNotification } from "@vc-shell/framework";
import DefaultPush from "./_internal/DefaultPush.vue";
import moment from "moment";

export interface IExtendedPush extends IPushNotification {
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
