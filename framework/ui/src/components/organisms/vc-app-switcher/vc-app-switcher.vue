<template>
  <div
    class="relative h-full flex items-center justify-center ml-2 mr-[15px] shrink-0"
    v-click-outside="onClose"
  >
    <button
      class="hover:[&>img] hover:[&_div]:bg-[color:var(--app-bar-button-color-hover)]"
      @click.stop="toggleAppSwitch"
    >
      <div
        class="h-[22px] w-[22px] [mask:url(/assets/app-select.svg)] bg-[color:var(--app-bar-button-color)] duration-200"
      />
    </button>

    <div
      v-if="isVisible && appsList && appsList.length"
      class="px-4 py-3.5 bg-white drop-shadow-[4px_4px_20px_rgba(47,86,108,0.25)] absolute z-[10000] rounded top-[var(--app-bar-height)] left-0"
    >
      <ul class="flex flex-col gap-3 overflow-hidden">
        <li
          v-for="item in appsList"
          :key="item.id"
          @click="switchApp(item)"
          class="flex flex-row items-center cursor-pointer group"
          :class="{ '[&>p]:font-extrabold': locationHandler(item.relativeUrl) }"
        >
          <img
            :src="imageUrl(item.iconUrl)"
            :alt="`icon_${item.id}`"
            class="w-5 h-5 mr-2 shrink-0"
          />
          <p
            class="font-normal text-sm text-[#727C87] truncate group-hover:opacity-80"
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
import { AppDescriptor } from "@vc-shell/api-client";

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

const imageUrl = (url: string) => window.location.origin + url;

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
