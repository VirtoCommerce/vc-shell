<template>
  <div class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center">
    <VcIcon
      class="tw-text-[color:var(--videos-empty-grid-icon-color)]"
      icon="fas fa-film"
      size="xxxl"
    ></VcIcon>
    <div class="tw-m-4 tw-text-xl tw-font-medium">
      {{ $t("VIDEOS.PAGES.LIST.EMPTY.NO_ITEMS") }}
    </div>
    <VcButton
      v-if="!context.scope?.disabled"
      @click="$emit('add')"
      >{{ $t("VIDEOS.PAGES.LIST.EMPTY.ADD") }}</VcButton
    >
  </div>
</template>

<script setup lang="ts">
import { UnwrapNestedRefs } from "vue";
import { useVideosList } from "./../composables/useVideosList";

export interface Emits {
  (event: "add"): void;
}
// TODO Add to documentation
export interface Props {
  context: UnwrapNestedRefs<ReturnType<typeof useVideosList>>;
}

defineEmits<Emits>();
defineProps<Props>();
</script>

<style lang="scss">
:root {
  --videos-empty-grid-icon-color: var(--empty-grid-icon-color, var(--secondary-500));
}
</style>
