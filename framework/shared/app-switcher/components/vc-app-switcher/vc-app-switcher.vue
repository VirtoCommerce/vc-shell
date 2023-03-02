<template>
  <div
    class="tw-relative tw-h-full tw-flex tw-items-center tw-justify-center tw-mx-2 tw-shrink-0"
    v-click-outside="onClose"
  >
    <button
      class="hover:[&>img] hover:[&_div]:tw-bg-[color:var(--app-bar-button-color-hover)]"
      @click.stop="toggleAppSwitch"
    >
      <div
        class="tw-h-[22px] tw-w-[22px] [mask:url(/assets/app-select.svg)] tw-bg-[color:var(--app-bar-button-color)] tw-duration-200"
      />
    </button>

    <div
      v-if="isVisible && appsList && appsList.length"
      class="tw-px-4 tw-py-3.5 tw-bg-white tw-drop-shadow-[4px_4px_20px_rgba(47,86,108,0.25)] tw-absolute tw-z-[10000] tw-rounded tw-top-[var(--app-bar-height)] tw-left-0"
    >
      <ul class="tw-flex tw-flex-col tw-gap-3 tw-overflow-hidden">
        <li
          v-for="item in appsList"
          :key="item.id"
          @click="switchApp(item)"
          class="tw-flex tw-flex-row tw-items-center tw-cursor-pointer tw-group"
          :class="{
            '[&>p]:tw-font-extrabold': locationHandler(item.relativeUrl),
          }"
        >
          <img
            :src="imageUrl(item.iconUrl)"
            :alt="`icon_${item.id}`"
            class="tw-w-5 tw-h-5 tw-mr-2 tw-shrink-0"
          />
          <p
            class="tw-font-normal tw-text-sm tw-text-[#727C87] tw-truncate group-hover:tw-opacity-80"
          >
            {{ item.title }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { AppDescriptor } from "./../../../../core/api";

export interface Props {
  appsList: AppDescriptor[];
}

interface Emits {
  (event: "onClick", item: AppDescriptor): void;
}

const props = withDefaults(defineProps<Props>(), {
  appsList: undefined,
});

const emit = defineEmits<Emits>();

const isVisible = ref(false);

const imageUrl = (url: string) =>
  import.meta.env.APP_PLATFORM_URL.replace(/\/+$/, "") + url;

const locationHandler = (url: string) => {
  const cleanUrl = window.location.pathname.replace(/\/+$/, "");
  const match = url.match(cleanUrl);
  if (match) {
    return match[0];
  }
  return null;
};

const switchApp = (app: AppDescriptor) => {
  emit("onClick", app);
  onClose();
};

const toggleAppSwitch = () => {
  if (props.appsList && props.appsList.length) {
    isVisible.value = !isVisible.value;
  }
};

const onClose = () => {
  isVisible.value = false;
};
</script>

<style lang="less" scoped></style>
