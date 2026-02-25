<template>
  <!-- Error banner -->
  <Transition name="banner-reveal">
    <div
      v-if="hasError"
      class="vc-blade-status-banners__error"
      role="alert"
    >
      <div class="vc-blade-status-banners__error-accent" />

      <!-- Collapsed header row -->
      <div
        class="vc-blade-status-banners__error-header"
        @click="expanded = !expanded"
      >
        <VcIcon
          size="s"
          icon="fas fa-exclamation-circle"
          class="vc-blade-status-banners__error-icon"
        />
        <span class="vc-blade-status-banners__error-text">{{ shortErrorMessage }}</span>
        <VcIcon
          size="xs"
          :icon="expanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"
          class="vc-blade-status-banners__error-chevron"
        />
      </div>

      <!-- Expandable details -->
      <Transition name="details-expand">
        <div
          v-if="expanded"
          class="vc-blade-status-banners__error-details"
        >
          <pre class="vc-blade-status-banners__error-details-text">{{ errorDetails }}</pre>
          <button
            class="vc-blade-status-banners__error-copy"
            :title="t('COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.COPY_ERROR')"
            @click.stop="handleCopy"
          >
            <VcIcon
              size="xs"
              :icon="copied ? 'fas fa-check' : 'fas fa-copy'"
            />
          </button>
        </div>
      </Transition>
    </div>
  </Transition>

  <!-- Unsaved changes banner -->
  <Transition name="banner-reveal">
    <div
      v-if="modified"
      class="vc-blade-status-banners__unsaved"
      role="status"
    >
      <div class="vc-blade-status-banners__unsaved-accent" />
      <VcIcon
        size="s"
        icon="fas fa-pen"
        class="vc-blade-status-banners__unsaved-icon"
      />
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

const expanded = ref(false);
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
// ── Banner entrance/exit ──────────────────────────────────────────────
.banner-reveal-enter-active {
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease-out 0.05s;
}

.banner-reveal-leave-active {
  transition: max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1) 0.05s,
              opacity 0.15s ease-in;
}

.banner-reveal-enter-from,
.banner-reveal-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.banner-reveal-enter-to,
.banner-reveal-leave-from {
  max-height: 200px;
  opacity: 1;
}

// ── Details expand/collapse ───────────────────────────────────────────
.details-expand-enter-active {
  transition: max-height 0.25s ease-out, opacity 0.2s ease-out 0.05s;
}

.details-expand-leave-active {
  transition: max-height 0.2s ease-in 0.05s, opacity 0.15s ease-in;
}

.details-expand-enter-from,
.details-expand-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.details-expand-enter-to,
.details-expand-leave-from {
  max-height: 120px;
  opacity: 1;
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

  &__error-details {
    @apply tw-relative tw-mx-3 tw-mb-2 tw-rounded;
    @apply tw-overflow-hidden;
    background: var(--danger-100);
  }

  &__error-details-text {
    @apply tw-text-[11px] tw-leading-relaxed tw-p-2 tw-pr-8;
    @apply tw-whitespace-pre-wrap tw-break-words tw-overflow-y-auto;
    @apply tw-m-0;
    max-height: 100px;
    color: var(--danger-700);
    font-family: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
  }

  &__error-copy {
    @apply tw-absolute tw-top-1 tw-right-1 tw-p-1 tw-rounded;
    @apply tw-border-0 tw-cursor-pointer tw-bg-transparent;
    color: var(--danger-400);
    transition: color 0.15s ease, background-color 0.15s ease;

    &:hover {
      color: var(--danger-700);
      background: var(--danger-200);
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
