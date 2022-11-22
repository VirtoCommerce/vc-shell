<template>
  <VcPopup @close="$emit('close')" variant="small" :title="title">
    <div class="p-3">
      <slot name="description">{{
        $t("IMPORT.PAGES.IMPORTING.CONFIRMATION_POPUP.CONFIRMATION")
      }}</slot>

      <div class="flex justify-center items-center pt-2">
        <span v-if="$isDesktop.value" class="vc-grow basis-0"></span>
        <VcButton
          variant="primary"
          :outline="true"
          class="mr-3"
          @click="$emit('close')"
        >
          {{ $t("IMPORT.PAGES.IMPORTING.CONFIRMATION_POPUP.NO") }}
        </VcButton>
        <VcButton variant="primary" @click="$emit('confirm')">
          {{ $t("IMPORT.PAGES.IMPORTING.CONFIRMATION_POPUP.YES") }}
        </VcButton>
      </div>
    </div>
  </VcPopup>
</template>

<script lang="ts" setup>
import { VcPopup, VcButton } from "@vc-shell/framework";

export interface Props {
  title: string;
}

withDefaults(defineProps<Props>(), {
  title: "",
});
</script>
