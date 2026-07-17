<template>
  <VcPopup
    :model-value="open"
    :title="title"
    modal-width="tw-max-w-sm"
    @update:model-value="onVisibilityChange"
  >
    <template #content>
      <p class="vc-scheduler__confirm-body">{{ body }}</p>
    </template>

    <template #footer>
      <div class="vc-scheduler__confirm-footer">
        <VcButton
          variant="secondary"
          data-test="confirm-cancel"
          @click="emit('close')"
        >
          {{ $t("VC_SCHEDULER.CANCEL") }}
        </VcButton>
        <div class="vc-scheduler__confirm-footer-spacer" />
        <VcButton
          variant="danger"
          data-test="confirm-ok"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </VcButton>
      </div>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { VcPopup } from "@ui/components/organisms/vc-popup";
import { VcButton } from "@ui/components/atoms/vc-button";

export interface Props {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
}

export interface Emits {
  (event: "confirm"): void;
  (event: "close"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function onVisibilityChange(value: boolean) {
  if (!value) emit("close");
}
</script>

<style lang="scss">
.vc-scheduler {
  &__confirm-body {
    @apply tw-text-sm tw-w-full;
  }

  &__confirm-footer {
    @apply tw-flex tw-items-center tw-gap-3 tw-w-full;
  }

  &__confirm-footer-spacer {
    @apply tw-flex-1;
  }
}
</style>
