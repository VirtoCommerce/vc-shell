<template>
  <VcPopupBase
    variant="warning"
    mode="confirm"
    :confirm-label="$t('COMPONENTS.ORGANISMS.VC_POPUP.CONFIRM')"
    :cancel-label="$t('COMPONENTS.ORGANISMS.VC_POPUP.CANCEL')"
    confirm-as-text
    :title="title"
    @close="$emit('close')"
    @confirm="$emit('confirm')"
  >
    <template
      v-if="$slots.header"
      #header
    >
      <slot name="header" />
    </template>
    <slot />
  </VcPopupBase>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import VcPopupBase from "@shell/_internal/popup/common/vc-popup-base.vue";

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
