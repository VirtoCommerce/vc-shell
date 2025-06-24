<template>
  <VcPopup
    variant="error"
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
      <div class="tw-flex tw-flex-auto tw-justify-end">
        <VcButton
          class="tw-ml-auto"
          @click="close"
          >{{ $t("COMPONENTS.ORGANISMS.VC_POPUP.OK") }}</VcButton
        >
      </div>
    </template>
  </VcPopup>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import VcPopup from "./../../../../ui/components/organisms/vc-popup/vc-popup.vue";

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

<style lang="scss">
:root {
  --confirm-button-color: var(--secondary-700);
}
</style>
