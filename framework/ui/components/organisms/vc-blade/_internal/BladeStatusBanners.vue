<template>
  <!-- Error banner -->
  <div
    v-if="hasError"
    class="vc-blade-status-banners__error"
  >
    <VcIcon
      size="s"
      icon="material-warning"
    />
    <div class="vc-blade-status-banners__error-text">{{ shortErrorMessage }}</div>
    <VcButton
      text
      class="vc-blade-status-banners__error-button"
      @click="openErrorDetails"
    >
      {{ t("COMPONENTS.ORGANISMS.VC_BLADE.SEE_DETAILS") }}
    </VcButton>
  </div>

  <!-- Unsaved changes banner -->
  <div
    v-if="modified"
    class="vc-blade-status-banners__unsaved-changes"
  >
    <VcIcon
      size="s"
      icon="material-info"
    />
    <div class="vc-blade-status-banners__unsaved-changes-text">
      {{ t("COMPONENTS.ORGANISMS.VC_BLADE.UNSAVED_CHANGES") }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from "vue";
import { useI18n } from "vue-i18n";
import { VcButton, VcIcon } from "@ui/components";
import { BladeInstance } from "@framework/injection-keys";
import { DEFAULT_BLADE_INSTANCE } from "@ui/components/organisms/vc-blade/constants";
import { useBladeError } from "@ui/components/organisms/vc-blade/_internal/composables/useBladeError";

interface Props {
  modified?: boolean;
}

defineProps<Props>();

const blade = inject(BladeInstance, DEFAULT_BLADE_INSTANCE);
const { t } = useI18n({ useScope: "global" });
const { hasError, shortErrorMessage, openErrorDetails } = useBladeError(blade);
</script>

<style lang="scss">
.vc-blade-status-banners {
  &__error {
    @apply tw-text-[color:var(--blade-text-color)] tw-p-2 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-error)];
  }

  &__error-text {
    @apply tw-line-clamp-1 tw-w-full tw-mx-2;
  }

  &__error-button {
    @apply tw-shrink-0 tw-opacity-80 hover:tw-opacity-100 hover:tw-text-[color:var(--blade-text-color)];
    @apply tw-text-[color:var(--blade-text-color)] !important;
  }

  &__unsaved-changes {
    @apply tw-text-[color:var(--blade-text-color)] tw-px-2 tw-py-1 tw-flex tw-flex-row tw-items-center tw-bg-[color:var(--blade-color-unsaved-changes)];
  }

  &__unsaved-changes-text {
    @apply tw-line-clamp-1 tw-w-full tw-ml-2;
  }
}
</style>
