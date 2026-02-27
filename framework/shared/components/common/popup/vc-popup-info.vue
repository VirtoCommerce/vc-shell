<template>
  <VcPopupBase
    variant="info"
    mode="acknowledge"
    :action-label="$t('COMPONENTS.ORGANISMS.VC_POPUP.OK')"
    :title="title"
    @close="$emit('close')"
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
import VcPopupBase from "@shared/components/common/popup/vc-popup-base.vue";

export interface Props {
  title?: string;
}

export interface Emits {
  (event: "close"): void;
}

defineProps<Props>();

defineEmits<Emits>();

defineSlots<{
  header: (props: any) => any;
  default: (props: any) => any;
}>();
</script>
