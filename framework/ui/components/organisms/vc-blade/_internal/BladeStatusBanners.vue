<template>
  <!-- Error banner -->
  <Transition name="banner-reveal">
    <div v-if="hasError" class="vc-blade-status-banners__error" role="alert">
      <div class="vc-blade-status-banners__error-accent" />

      <!-- Collapsed header row -->
      <div class="vc-blade-status-banners__error-header" @click="toggle">
        <VcIcon size="s" icon="fas fa-exclamation-circle" class="vc-blade-status-banners__error-icon" />
        <span class="vc-blade-status-banners__error-text">{{ shortErrorMessage }}</span>
        <VcIcon size="xs" :icon="isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          class="vc-blade-status-banners__error-chevron" />
      </div>

      <!-- Expandable details (useCollapsible: measured max-height transition) -->
      <div ref="contentRef" class="vc-blade-status-banners__error-details-wrapper" :style="wrapperStyle">
        <div class="vc-blade-status-banners__error-details">
          <pre class="vc-blade-status-banners__error-details-text">{{ errorDetails }}</pre>
          <button class="vc-blade-status-banners__error-copy"
            :title="t('COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.COPY_ERROR')" @click.stop="handleCopy">
            <VcIcon size="xs" :icon="copied ? 'fas fa-check' : 'fas fa-copy'" />
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Unsaved changes banner -->
  <Transition name="banner-reveal">
    <div v-if="modified" class="vc-blade-status-banners__unsaved" role="status">
      <div class="vc-blade-status-banners__unsaved-accent" />
      <VcIcon size="s" icon="fas fa-pen" class="vc-blade-status-banners__unsaved-icon" />
      <span class="vc-blade-status-banners__unsaved-text">
        {{ t("COMPONENTS.ORGANISMS.VC_BLADE.UNSAVED_CHANGES") }}
      </span>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
import { inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useCollapsible } from "@ui/composables/useCollapsible";
import { BladeInstance } from "@framework/injection-keys";
import { DEFAULT_BLADE_INSTANCE } from "@ui/components/organisms/vc-blade/constants";
import { useBladeError } from "@ui/components/organisms/vc-blade/_internal/composables/useBladeError";

interface Props {
  modified?: boolean;
}

defineProps<Props>();

const blade = inject(BladeInstance, DEFAULT_BLADE_INSTANCE);
const { t } = useI18n({ useScope: "global" });
const { hasError, shortErrorMessage, errorDetails, copyError } = useBladeError(blade);

const { contentRef, isExpanded, wrapperStyle, toggle } = useCollapsible();
const copied = ref(false);

async function handleCopy() {
  const ok = await copyError();
  if (ok) {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}
</script>

<style lang="scss">
// ── Banner entrance/exit (opacity + translateY, GPU-accelerated) ─────
.banner-reveal-enter-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.banner-reveal-leave-active {
  transition:
    opacity 0.15s ease-in,
    transform 0.15s ease-in;
}

.banner-reveal-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.banner-reveal-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

// ── Error banner ──────────────────────────────────────────────────────
.vc-blade-status-banners {
  &__error {
    @apply tw-relative tw-overflow-hidden;
    background: var(--danger-50);
    border-bottom: 1px solid var(--danger-100);
  }

  &__error-accent {
    @apply tw-absolute tw-left-0 tw-top-0 tw-bottom-0;
    width: 3px;
    background: var(--danger-500);
  }

  &__error-header {
    @apply tw-flex tw-items-center tw-cursor-pointer tw-select-none;
    @apply tw-py-2 tw-pl-3 tw-pr-3;

    &:hover {
      background: var(--danger-100);
    }
  }

  &__error-icon {
    @apply tw-shrink-0 tw-mr-2;
    color: var(--danger-500);
  }

  &__error-text {
    @apply tw-flex-1 tw-min-w-0 tw-text-xs tw-font-medium tw-leading-snug tw-line-clamp-1;
    color: var(--danger-800);
  }

  &__error-chevron {
    @apply tw-shrink-0 tw-ml-2;
    color: var(--danger-400);
  }

  &__error-details-wrapper {
    @apply tw-overflow-hidden;
    transition: max-height 0.25s ease;
  }

  &__error-details {
    @apply tw-relative tw-rounded tw-overflow-hidden;
    margin: 0 12px 8px;
    background: var(--neutrals-50);
    border: 1px solid var(--neutrals-200);
  }

  &__error-details-text {
    @apply tw-text-[11px] tw-leading-relaxed tw-p-3 tw-pr-9;
    @apply tw-whitespace-pre-wrap tw-break-words tw-overflow-y-auto;
    @apply tw-m-0;
    max-height: 120px;
    color: var(--neutrals-700);
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
  }

  &__error-copy {
    @apply tw-absolute tw-top-2 tw-right-2 tw-p-1 tw-rounded;
    @apply tw-border-0 tw-cursor-pointer;
    background: var(--neutrals-100);
    color: var(--neutrals-500);
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover {
      color: var(--neutrals-800);
      background: var(--neutrals-200);
    }
  }

  // ── Unsaved changes banner ────────────────────────────────────────
  &__unsaved {
    @apply tw-flex tw-items-center tw-relative;
    @apply tw-py-[6px] tw-pl-3 tw-pr-3;
    background: var(--warning-50);
    border-bottom: 1px solid color-mix(in srgb, var(--warning-200) 60%, transparent);
  }

  &__unsaved-accent {
    @apply tw-absolute tw-left-0 tw-top-0 tw-bottom-0;
    width: 3px;
    background: var(--warning-500);
  }

  &__unsaved-icon {
    @apply tw-shrink-0 tw-mr-2;
    color: var(--warning-600);
  }

  &__unsaved-text {
    @apply tw-flex-1 tw-min-w-0 tw-text-xs tw-font-medium tw-leading-snug tw-line-clamp-1;
    color: var(--warning-800);
  }
}
</style>
