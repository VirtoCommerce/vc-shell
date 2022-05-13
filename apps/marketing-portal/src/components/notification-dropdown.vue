<template>
  <div
    class="relative flex items-center h-full"
    @click="toggleNotificationsDrop"
    v-click-outside="
      () => {
        isDropdownVisible = false;
      }
    "
    :title="title"
  >
    <div
      :class="[
        'relative h-full flex items-center justify-center w-[var(--app-bar-button-width)] border-l border-solid border-l-[color:var(--app-bar-button-border-color)] cursor-pointer text-[color:var(--app-bar-button-color)] bg-[color:var(--app-bar-button-background-color)] transition-[color] duration-200 hover:text-[color:var(--app-bar-button-color-hover)] bg-[color:var(--app-bar-button-background-color-hover)]',
        { 'notification-dropdown__button_accent': isAccent },
        {
          'shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] [clip-path:inset(0px_-20px_0px_-20px)] bg-white z-[10000]':
            isDropdownVisible,
        },
      ]"
    >
      <VcIcon icon="fas fa-bell" size="xl"></VcIcon>
    </div>
    <div
      class="absolute top-[var(--app-bar-height)] z-[9999] drop-shadow-[0px_4px_15px_rgba(43,67,84,0.15)] bg-white rounded-b-[6px] w-[439px] max-h-[350px] min-h-[50px] right-0 overflow-hidden flex flex-col"
      v-if="isDropdownVisible"
    >
      <VcContainer :noPadding="true">
        <div v-if="populatedList && populatedList.length">
          <div
            @click="handleClick(item.notifyType)"
            class="py-[18px] px-[15px] border-b border-solid border-b-[#e3e7ec] cursor-pointer last-of-type:border-b-0"
            v-for="item in populatedList"
            :key="`notification_${item.id}`"
          >
            <VcRow>
              <VcCol size="1">
                <div
                  class="w-[41px] h-[41px] rounded-full text-white flex items-center justify-center"
                  :style="{ 'background-color': item.params.color }"
                >
                  <VcIcon :icon="item.params.icon" size="l"></VcIcon>
                </div>
              </VcCol>
              <VcCol size="4" class="justify-center">
                <div>
                  <p
                    class="text-[color:var(--basic-black-color)] text-xl leading-[19px] font-bold m-0 mb-1"
                  >
                    {{ item.title }}
                  </p>
                  <VcHint>{{ item.description }}</VcHint>
                  <div v-if="item.errors && item.errors.length">
                    <VcHint class="notification-dropdown__error"
                      >Errors: {{ item.errors && item.errors.length }}</VcHint
                    >
                  </div>
                </div>
              </VcCol>
              <VcCol size="2" class="items-end">
                <p class="text-s leading-[19px] text-[#8e8e8e] m-0">
                  {{ item.params.time }}
                </p>
              </VcCol>
            </VcRow>
          </div>
        </div>
        <div class="flex justify-center items-center p-4" v-else>
          No notifications yet
        </div>
      </VcContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, PropType, ref, watch } from "vue";
import {
  BulkActionPushNotification,
  PushNotification,
} from "@virtoshell/api-client";
import { useNotifications } from "@virtoshell/core";
import moment from "moment";
import { IMenuItems } from "@virtoshell/ui";

interface INotificationParams
  extends PushNotification,
    BulkActionPushNotification {
  params: {
    icon: string;
    time: string;
    color: string;
  };
}

const props = defineProps({
  isAccent: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: "",
  },

  items: {
    type: Array as PropType<IMenuItems[]>,
    default: () => [],
  },
});

const emit = defineEmits(["notification:click"]);

const isDropdownVisible = ref(false);
const { loadFromHistory, notifications } = useNotifications();
const locale = window.navigator.language;

const populatedList = ref<INotificationParams[]>([]);

watch(
  () => notifications,
  (newVal) => {
    populatedList.value = newVal.value.map((item: INotificationParams) => {
      return Object.assign(
        {},
        {
          ...item,
          params: {
            icon: notificationIcon(item.notifyType),
            time: moment(item.created).locale(locale).format("L LT"),
            color: notificationColor(item),
          },
        }
      ) as INotificationParams;
    });
  },
  { deep: true }
);

onMounted(async () => {
  await loadFromHistory();
});

function toggleNotificationsDrop() {
  isDropdownVisible.value = !isDropdownVisible.value;
}

const notificationIcon = (type: string) => {
  const lower = type.toLowerCase();
  if (lower.includes("offer")) {
    return "fas fa-percentage";
  } else if (lower.includes("product")) {
    return "fas fa-box-open";
  } else if (lower.includes("import")) {
    return "fas fa-download";
  }
  return "fas fa-info";
};

const notificationColor = (item: INotificationParams) => {
  if (item.created && item.finished) {
    return "#87b563";
  } else if (item.created && !item.finished && !item.errors) {
    return "#A9BCCD";
  } else if (item.created && item.errors && item.errors.length) {
    return "#F14E4E";
  }

  return "#87b563";
};

const handleClick = (notifyType: string) => {
  const low = notifyType.toLowerCase();

  // TODO need to discuss on arch meeting
  if (low.includes("import")) {
    const page = props.items.find(
      (page: IMenuItems) => page.title === "Import"
    );
    if (page) {
      emit("notification:click", page);
    }
  }
};
</script>

<style lang="scss">
:root {
  --notification-color-error: #f14e4e;
}
.notification-dropdown {
  &__button {
    &_accent:before {
      @apply content-[""] block absolute right-[12px] top-[18px]
        w-[7px] h-[7px] bg-[#ff4a4a] rounded-full z-[1];
    }
  }

  &__error {
    --hint-color: var(--notification-color-error);
  }
}
</style>
