<template>
  <TransitionGroup name="banner-reveal">
    <div
      v-for="banner in sortedBanners"
      :key="banner.id"
      class="vc-blade-status-banners__banner"
      :class="`vc-blade-status-banners__banner--${banner.variant}`"
      :role="banner.variant === 'danger' || banner.variant === 'warning' ? 'alert' : 'status'"
    >
      <div class="vc-blade-status-banners__accent" />

      <!-- Error banner: collapsible with details -->
      <template v-if="banner.id === ERROR_BANNER_ID">
        <div
          class="vc-blade-status-banners__header vc-blade-status-banners__header--clickable"
          @click="toggleError"
        >
          <VcIcon
            size="s"
            :icon="banner.icon || variantIcon(banner.variant)"
            class="vc-blade-status-banners__icon"
          />
          <span class="vc-blade-status-banners__text">{{ banner.message }}</span>
          <VcIcon
            size="xs"
            :icon="isErrorExpanded ? 'lucide-chevron-up' : 'lucide-chevron-down'"
            class="vc-blade-status-banners__chevron"
          />
          <button
            v-if="banner.dismissible"
            class="vc-blade-status-banners__dismiss"
            :title="t('COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.CLOSE')"
            @click.stop="dismissBanner(banner)"
          >
            <VcIcon size="xs" icon="lucide-x" />
          </button>
        </div>
        <div
          ref="errorContentRef"
          class="vc-blade-status-banners__error-details-wrapper"
          :style="errorWrapperStyle"
        >
          <div class="vc-blade-status-banners__error-details">
            <pre class="vc-blade-status-banners__error-details-text">{{ errorDetailsText }}</pre>
            <button
              class="vc-blade-status-banners__error-copy"
              :title="t('COMPONENTS.ORGANISMS.VC_BLADE.ERROR_POPUP.COPY_ERROR')"
              @click.stop="handleCopy"
            >
              <VcIcon size="xs" :icon="copied ? 'lucide-check' : 'lucide-copy'" />
            </button>
          </div>
        </div>
      </template>

      <!-- Standard banner: message / render / action -->
      <template v-else>
        <div class="vc-blade-status-banners__header">
          <VcIcon
            size="s"
            :icon="banner.icon || variantIcon(banner.variant)"
            class="vc-blade-status-banners__icon"
          />
          <span
            v-if="banner.message && !banner.render"
            class="vc-blade-status-banners__text"
          >
            {{ banner.message }}
          </span>
          <BannerRenderSlot
            v-if="banner.render"
            :render-fn="banner.render"
            class="vc-blade-status-banners__text"
          />
          <button
            v-if="banner.action"
            class="vc-blade-status-banners__action"
            @click="banner.action.handler"
          >
            {{ banner.action.label }}
          </button>
          <button
            v-if="banner.dismissible"
            class="vc-blade-status-banners__dismiss"
            @click="dismissBanner(banner)"
          >
            <VcIcon size="xs" icon="lucide-x" />
          </button>
        </div>
      </template>
    </div>
  </TransitionGroup>
</template>

<script lang="ts" setup>
import { inject, ref, computed, watch, defineComponent, type VNode } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useCollapsible } from "@ui/composables/useCollapsible";
import { BladeDescriptorKey, BladeBannersKey, BladeStackKey } from "@core/blade-navigation/types";
import type { IBladeBanner } from "@core/blade-navigation/types";
import { useBladeError } from "./composables/useBladeError";

// ── Functional component for render() banners ─────────────────────────────
// Defined once — avoids recreating component objects on every render cycle.
const BannerRenderSlot = defineComponent({
  props: {
    renderFn: { type: Function, required: true },
  },
  setup(props) {
    return () => (props.renderFn as () => VNode)();
  },
});

interface Props {
  modified?: boolean;
}

const props = defineProps<Props>();

const descriptor = inject(BladeDescriptorKey, undefined);
const bannersRef = inject(BladeBannersKey, undefined);
const bladeStack = inject(BladeStackKey, undefined);
const { t } = useI18n({ useScope: "global" });
const { hasError, shortErrorMessage, errorDetails, copyError } = useBladeError(descriptor);

// ── Error collapsible state ───────────────────────────────────────────────
const {
  contentRef: errorContentRef,
  isExpanded: isErrorExpanded,
  wrapperStyle: errorWrapperStyle,
  toggle: toggleError,
} = useCollapsible();

const copied = ref(false);
const errorDetailsText = errorDetails;

async function handleCopy() {
  const ok = await copyError();
  if (ok) {
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

// ── System banner IDs ─────────────────────────────────────────────────────
const ERROR_BANNER_ID = "__system-error__";
const MODIFIED_BANNER_ID = "__system-modified__";

// ── Sync system error banner ──────────────────────────────────────────────
watch(
  hasError,
  (has) => {
    if (!bannersRef) return;
    const idx = bannersRef.value.findIndex((b) => b.id === ERROR_BANNER_ID);
    if (has && idx === -1) {
      bannersRef.value.push({
        id: ERROR_BANNER_ID,
        variant: "danger",
        message: shortErrorMessage.value,
        dismissible: true,
        _system: true,
      });
    } else if (has && idx !== -1) {
      // Update message in case error changed
      bannersRef.value[idx] = {
        ...bannersRef.value[idx],
        message: shortErrorMessage.value,
      };
    } else if (!has && idx !== -1) {
      bannersRef.value.splice(idx, 1);
    }
  },
  { immediate: true },
);

// ── Sync system modified banner ───────────────────────────────────────────
watch(
  () => props.modified,
  (mod) => {
    if (!bannersRef) return;
    const idx = bannersRef.value.findIndex((b) => b.id === MODIFIED_BANNER_ID);
    if (mod && idx === -1) {
      bannersRef.value.push({
        id: MODIFIED_BANNER_ID,
        variant: "warning",
        icon: "lucide-pencil",
        message: t("COMPONENTS.ORGANISMS.VC_BLADE.UNSAVED_CHANGES"),
        dismissible: false,
        _system: true,
      });
    } else if (!mod && idx !== -1) {
      bannersRef.value.splice(idx, 1);
    }
  },
  { immediate: true },
);

// ── Priority sort ─────────────────────────────────────────────────────────
const VARIANT_PRIORITY: Record<string, number> = {
  danger: 0,
  warning: 1,
  info: 2,
  success: 3,
};

const sortedBanners = computed(() => {
  if (!bannersRef) return [];
  return [...bannersRef.value].sort(
    (a, b) => (VARIANT_PRIORITY[a.variant] ?? 9) - (VARIANT_PRIORITY[b.variant] ?? 9),
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────
function variantIcon(variant: IBladeBanner["variant"]): string {
  const icons: Record<string, string> = {
    danger: "lucide-circle-alert",
    warning: "lucide-triangle-alert",
    info: "lucide-info",
    success: "lucide-circle-check",
  };
  return icons[variant] ?? "lucide-info";
}

function dismissBanner(banner: IBladeBanner) {
  if (!bannersRef) return;
  // If dismissing the error banner, clear the error source too
  if (banner.id === ERROR_BANNER_ID && descriptor && bladeStack) {
    bladeStack.clearBladeError(descriptor.value.id);
  }
  bannersRef.value = bannersRef.value.filter((b) => b.id !== banner.id);
}
</script>

<style lang="scss">
// ── Banner entrance/exit (TransitionGroup) ────────────────────────────────
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

// ── Shared banner layout ──────────────────────────────────────────────────
.vc-blade-status-banners {
  &__banner {
    @apply tw-relative tw-overflow-hidden;
    border-bottom: 1px solid transparent;
  }

  &__banner--danger {
    background: var(--danger-50);
    border-bottom-color: var(--danger-100);

    .vc-blade-status-banners__accent {
      background: var(--danger-500);
    }

    .vc-blade-status-banners__icon {
      color: var(--danger-500);
    }

    .vc-blade-status-banners__text {
      color: var(--danger-800);
    }

    .vc-blade-status-banners__chevron {
      color: var(--danger-400);
    }

    .vc-blade-status-banners__header--clickable:hover {
      background: var(--danger-100);
    }

    .vc-blade-status-banners__action {
      color: var(--danger-600);
      &:hover { color: var(--danger-800); }
    }
  }

  &__banner--warning {
    background: var(--warning-50);
    border-bottom-color: color-mix(in srgb, var(--warning-200) 60%, transparent);

    .vc-blade-status-banners__accent {
      background: var(--warning-500);
    }

    .vc-blade-status-banners__icon {
      color: var(--warning-600);
    }

    .vc-blade-status-banners__text {
      color: var(--warning-800);
    }

    .vc-blade-status-banners__action {
      color: var(--warning-600);
      &:hover { color: var(--warning-800); }
    }
  }

  &__banner--info {
    background: var(--info-50);
    border-bottom-color: color-mix(in srgb, var(--info-200) 60%, transparent);

    .vc-blade-status-banners__accent {
      background: var(--info-500);
    }

    .vc-blade-status-banners__icon {
      color: var(--info-500);
    }

    .vc-blade-status-banners__text {
      color: var(--info-800);
    }

    .vc-blade-status-banners__action {
      color: var(--info-600);
      &:hover { color: var(--info-800); }
    }
  }

  &__banner--success {
    background: var(--success-50);
    border-bottom-color: color-mix(in srgb, var(--success-200) 60%, transparent);

    .vc-blade-status-banners__accent {
      background: var(--success-500);
    }

    .vc-blade-status-banners__icon {
      color: var(--success-500);
    }

    .vc-blade-status-banners__text {
      color: var(--success-800);
    }

    .vc-blade-status-banners__action {
      color: var(--success-600);
      &:hover { color: var(--success-800); }
    }
  }

  // ── Shared structural classes ───────────────────────────────────────

  &__accent {
    @apply tw-absolute tw-left-0 tw-top-0 tw-bottom-0;
    width: 3px;
  }

  &__header {
    @apply tw-flex tw-items-center tw-select-none;
    @apply tw-py-2 tw-pl-3 tw-pr-3;
  }

  &__header--clickable {
    @apply tw-cursor-pointer;
  }

  &__icon {
    @apply tw-shrink-0 tw-mr-2;
  }

  &__text {
    @apply tw-flex-1 tw-min-w-0 tw-text-xs tw-font-medium tw-leading-snug tw-line-clamp-1;
  }

  &__chevron {
    @apply tw-shrink-0 tw-ml-2;
  }

  &__action {
    @apply tw-shrink-0 tw-ml-2 tw-text-xs tw-font-medium tw-border-0 tw-bg-transparent tw-cursor-pointer tw-underline;
    @apply tw-p-0;
  }

  &__dismiss {
    @apply tw-shrink-0 tw-ml-2 tw-p-1 tw-rounded tw-border-0 tw-cursor-pointer;
    @apply tw-bg-transparent;
    color: inherit;
    opacity: 0.5;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 1;
    }
  }

  // ── Error details (collapsible) ─────────────────────────────────────────

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
}
</style>
