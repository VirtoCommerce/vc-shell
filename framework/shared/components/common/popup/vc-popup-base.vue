<template>
  <VcPopup
    :variant="variant"
    :is-mobile-fullscreen="isMobileFullscreen"
    :title="title"
    :closable="closable"
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
      <slot
        name="footer"
        :close="close"
        :confirm="() => handleConfirm(close)"
      >
        <div
          class="vc-popup-base__actions"
          :class="{
            'vc-popup-base__actions--confirm': mode === 'confirm',
            'vc-popup-base__actions--single': mode === 'acknowledge',
          }"
        >
          <template v-if="mode === 'confirm'">
            <VcButton
              :text="confirmAsText"
              class="vc-popup-base__confirm"
              @click="handleConfirm(close)"
            >
              {{ confirmLabel }}
            </VcButton>
            <VcButton @click="close">{{ cancelLabel }}</VcButton>
          </template>
          <VcButton
            v-else
            class="vc-popup-base__single"
            @click="close"
          >
            {{ actionLabel }}
          </VcButton>
        </div>
      </slot>
    </template>
  </VcPopup>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import VcPopup, { type PopupVariant } from "@ui/components/organisms/vc-popup/vc-popup.vue";

export interface Props {
  title?: string;
  variant?: PopupVariant;
  mode?: "acknowledge" | "confirm";
  actionLabel?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmAsText?: boolean;
  closable?: boolean;
  isMobileFullscreen?: boolean;
  closeOnConfirm?: boolean;
}

export interface Emits {
  (event: "close"): void;
  (event: "confirm"): void;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  mode: "acknowledge",
  actionLabel: "",
  confirmLabel: "",
  cancelLabel: "",
  confirmAsText: false,
  closable: true,
  isMobileFullscreen: true,
  closeOnConfirm: false,
});

const emit = defineEmits<Emits>();

defineSlots<{
  header: (props: any) => any;
  default: (props: any) => any;
  footer: (props: { close: () => void; confirm: () => void }) => any;
}>();

function handleConfirm(close: () => void): void {
  emit("confirm");

  if (props.closeOnConfirm) {
    close();
  }
}
</script>

<style lang="scss">
:root {
  // Deprecated alias: --confirm-button-color
  --popup-base-confirm-color: var(--confirm-button-color, var(--secondary-700));
}

.vc-popup-base {
  &__actions {
    @apply tw-flex tw-flex-auto tw-justify-end;

    &--confirm {
      @apply tw-gap-6;
    }

    &--single {
      @apply tw-gap-0;
    }
  }

  &__single {
    @apply tw-ml-auto;
  }

  &__confirm {
    color: var(--popup-base-confirm-color) !important;
  }
}
</style>
