<template>
  <div
    class="relative"
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
          'shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] [clip-path:inset(0px_-20px_0px_-20px)] bg-white z-[10000]':
            isDropActive,
        },
        'relative h-full flex items-center justify-center w-[var(--app-bar-button-width)] border-l border-solid border-l-[color:var(--app-bar-button-border-color)] cursor-pointer text-[color:var(--app-bar-button-color)] bg-[color:var(--app-bar-button-background-color)] transition-[color] duration-200 hover:text-[color:var(--app-bar-button-color-hover)] hover:bg-[color:var(--app-bar-button-background-color-hover)]',
      ]"
    >
      <VcIcon icon="fas fa-globe" size="xl"></VcIcon>
    </div>
    <div
      class="absolute right-0 top-[var(--app-bar-height)] bg-white z-[9999] shadow-[0_-6px_6px_white,1px_1px_22px_rgba(126,142,157,0.2)] w-min z-[10000]"
      v-if="isDropActive"
    >
      <div
        class="p-3 text-lg text-black border-l border-solid border-l-[#eef0f2] border-b border-b-[#eef0f2] white cursor-pointer hover:bg-[#eff7fc]"
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
