<template>
  <VcPopup
    variant="warning"
    is-mobile-fullscreen
    :title="title"
    @close="$emit('close')"
  >
    <template
      v-if="$slots.header"
      #header
    >
      <slot name="header" />
    </template>
    <template #content>
      <slot />
    </template>

    <template #footer="{ close }">
      <div class="tw-flex tw-flex-auto tw-justify-end tw-gap-6">
        <VcButton
          text
          class="!tw-text-[var(--confirm-button-color)]"
          @click="$emit('confirm')"
          >{{ $t("COMPONENTS.ORGANISMS.VC_POPUP.CONFIRM") }}</VcButton
        >
        <VcButton @click="close">{{ $t("COMPONENTS.ORGANISMS.VC_POPUP.CANCEL") }}</VcButton>
      </div>
    </template>
  </VcPopup>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import VcPopup from "@ui/components/organisms/vc-popup/vc-popup.vue";

export interface Props {
  title?: string;
}

export interface Emits {
  (event: "close"): void;
  (event: "confirm"): void;
}

defineProps<Props>();

defineEmits<Emits>();

defineSlots<{
  header: (props: any) => any;
  default: (props: any) => any;
}>();
</script>

<style lang="scss">
:root {
  --confirm-button-color: var(--secondary-700);
}
</style>
