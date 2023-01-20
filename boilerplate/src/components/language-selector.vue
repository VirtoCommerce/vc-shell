<template>
  <div
    class="tw-relative"
    v-click-outside="
      () => {
        isDropActive = false;
      }
    "
    :title="title"
    @click.stop="isDropActive = !isDropActive"
  >
    <div
      :class="[
        {
          'tw-shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] [clip-path:inset(0px_-20px_0px_-20px)] tw-bg-white tw-z-[10000]':
            isDropActive,
        },
        'tw-relative tw-h-full tw-flex tw-items-center tw-justify-center tw-w-[var(--app-bar-button-width)] tw-border-l tw-border-solid tw-border-l-[color:var(--app-bar-button-border-color)] tw-cursor-pointer tw-text-[color:var(--app-bar-button-color)] tw-bg-[color:var(--app-bar-button-background-color)]  tw-transition-[color]  tw-duration-200 hover:tw-text-[color:var(--app-bar-button-color-hover)] hover:tw-bg-[color:var(--app-bar-button-background-color-hover)]',
      ]"
    >
      <VcIcon icon="fas fa-globe" size="xl"></VcIcon>
    </div>
    <div
      class="tw-absolute tw-right-0 tw-top-[var(--app-bar-height)] tw-bg-white tw-z-[9999] tw-shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] tw-w-min tw-z-[10000]"
      v-if="isDropActive"
    >
      <div
        class="tw-p-3 tw-text-lg tw-text-black tw-border-l tw-border-solid tw-border-l-[#eef0f2] tw-border-b tw-border-b-[#eef0f2] tw-white tw-cursor-pointer hover:tw-bg-[#eff7fc]"
        v-for="(lang, i) in languageItems"
        :key="i"
        @click="
          lang.hasOwnProperty('clickHandler') && lang.clickHandler(lang.lang)
        "
      >
        {{ lang.title }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@vc-shell/framework";
import { ref } from "vue";

export interface Props {
  title: string;
  value: string;
  languageItems: { lang: string; title: string; clickHandler: () => void }[];
}

withDefaults(defineProps<Props>(), {
  title: "",
  value: "",
  languageItems: () => [],
});

const isDropActive = ref(false);
</script>
