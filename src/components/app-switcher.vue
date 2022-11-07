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
      v-if="isVisible && switcherItems && switcherItems.length"
      class="px-4 py-3.5 bg-white drop-shadow-[4px_4px_20px_rgba(47,86,108,0.25)] absolute z-[10000] rounded top-[var(--app-bar-height)] left-0 max-w-[200px] w-max"
    >
      <ul class="flex flex-col gap-3 overflow-hidden">
        <li
          @click="switchApp"
          v-for="item in switcherItems"
          :key="item.id"
          class="flex flex-row items-center cursor-pointer group"
          :class="{ '[&>p]:font-extrabold': item.name === 'Vendor Portal' }"
        >
          <img
            :src="item.icon"
            :alt="`icon_${item.id}`"
            class="w-5 h-5 mr-2.5"
          />
          <p
            class="font-normal text-sm text-[#727C87] truncate group-hover:opacity-80"
          >
            {{ item.name }}
            {{ item.description ? `(${item.description})` : "" }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { IAppSwitcherItem } from "../types";
import { ref } from "vue";

export interface Props {
  switcherItems: IAppSwitcherItem[];
}

const props = withDefaults(defineProps<Props>(), {
  switcherItems: undefined,
});

const isVisible = ref(false);

const switchApp = () => {
  // open app logic
  onClose();
};

const toggleAppSwitch = () => {
  if (props.switcherItems && props.switcherItems.length) {
    isVisible.value = !isVisible.value;
  }
};

const onClose = () => {
  isVisible.value = false;
};
</script>

<style lang="less" scoped></style>
