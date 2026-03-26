<template>
  <div
    ref="bladeRef"
    class="vc-blade"
    role="region"
    :class="[
      $attrs.class,
      {
        'vc-blade--mobile': isMobile,
        'vc-blade--expanded': isExpanded,
        'vc-blade--maximized': descriptor?.maximized,
      },
    ]"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
    :aria-labelledby="props.title && !showSkeleton ? bladeTitleId : undefined"
    :aria-label="!props.title || showSkeleton ? $t('COMPONENTS.ORGANISMS.VC_BLADE.PANEL') : undefined"
  >
    <!-- Header zone: v-show keeps BladeHeader mounted to avoid Teleport unmount bug -->
    <template v-if="!(isMobile && blades.length === 1 && !$slots['actions'])">
      <BladeHeaderSkeleton
        v-if="showSkeleton"
        class="vc-blade__header"
      />
      <BladeHeader
        v-show="!showSkeleton"
        class="vc-blade__header"
        :closable="isClosable"
        :icon="icon"
        :title="title"
        :subtitle="subtitle"
        :modified="modified"
        :title-id="bladeTitleId"
        @close="handleClose"
        @expand="$emit('expand')"
        @collapse="$emit('collapse')"
      >
        <template #prepend>
          <component
            :is="backButton"
            v-if="backButton && isMobile"
            class="vc-blade__back-button"
          />

          <div
            v-if="descriptor?.breadcrumbs?.length && isDesktop"
            class="vc-blade__breadcrumbs"
          >
            <VcBreadcrumbs
              :items="descriptor?.breadcrumbs"
              collapsed
            >
              <template #trigger="{ click, isActive }">
                <VcButton
                  text
                  icon="lucide-ellipsis-vertical"
                  icon-size="xl"
                  class="vc-blade__breadcrumbs-button"
                  :class="{
                    'vc-blade__breadcrumbs-button--active': isActive,
                  }"
                  @click="click"
                />
              </template>
            </VcBreadcrumbs>
          </div>
        </template>

        <template
          v-if="$slots['actions']"
          #actions
        >
          <slot name="actions"></slot>
        </template>
      </BladeHeader>
    </template>

    <BladeStatusBanners
      v-if="!showSkeleton"
      :modified="modified"
    />

    <!-- Toolbar zone -->
    <BladeToolbarSkeleton
      v-if="showSkeleton"
      class="vc-blade__toolbar"
    />
    <BladeToolbar
      v-else
      class="vc-blade__toolbar"
      :items="toolbarItems"
    >
      <template #widgets-container>
        <WidgetContainer :blade-id="bladeId" />
      </template>
    </BladeToolbar>

    <!-- Content zone -->
    <BladeContentSkeleton v-if="showSkeleton" />
    <div
      v-else
      ref="contentRef"
      class="vc-blade__content"
    >
      <div
        class="vc-blade__main"
        :class="{ 'vc-blade__main--mobile': isMobile }"
      >
        <div
          class="vc-blade__slot"
          :class="{
            'vc-blade__slot--desktop': isDesktop,
            'vc-blade__slot--mobile': isMobile,
          }"
        >
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, inject, computed, onMounted, nextTick, watch, getCurrentInstance, useAttrs, watchEffect } from "vue";
import { IBladeToolbar } from "@core/types";
import { useBladeStack } from "@core/blade-navigation";
import BladeHeader from "@ui/components/organisms/vc-blade/_internal/BladeHeader.vue";
import BladeHeaderSkeleton from "@ui/components/organisms/vc-blade/_internal/BladeHeaderSkeleton.vue";
import BladeToolbar from "@ui/components/organisms/vc-blade/_internal/BladeToolbar.vue";
import BladeToolbarSkeleton from "@ui/components/organisms/vc-blade/_internal/BladeToolbarSkeleton.vue";
import BladeContentSkeleton from "@ui/components/organisms/vc-blade/_internal/BladeContentSkeleton.vue";
import BladeStatusBanners from "@ui/components/organisms/vc-blade/_internal/BladeStatusBanners.vue";
import { VcButton } from "@ui/components/atoms/vc-button";
import { BladeBackButtonKey } from "@framework/injection-keys";
import WidgetContainer from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainer.vue";
import { useBlade } from "../../../../core/composables";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { BladeDescriptorKey } from "@core/blade-navigation/types";

export interface Props {
  icon?: string;
  title?: string;
  subtitle?: string;
  width?: number | string;
  expanded?: boolean;
  closable?: boolean;
  toolbarItems?: IBladeToolbar[];
  modified?: boolean;
  /** When true, shows skeleton placeholders for all blade zones */
  loading?: boolean;
}

export interface Emits {
  (event: "close"): void;
  (event: "expand"): void;
  (event: "collapse"): void;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  width: "30%",
  closable: true,
  toolbarItems: () => [],
  modified: undefined,
});

const instanceUid = getCurrentInstance()?.uid ?? 0;
const bladeTitleId = `blade-title-${instanceUid}`;

const showSkeleton = computed(() => Boolean(props.loading));

const slots = defineSlots<{
  actions(): void;
  default(): void;
}>();

const emit = defineEmits<Emits>();

const { isMobile, isDesktop } = useResponsive();

// Single useBlade() call — reuse for both bladeId and context-aware features
const bladeFull = useBlade();
const { id: bladeId } = bladeFull;

// Context detection: are we inside blade navigation (VcBladeSlot)?
const hasBladeContext = !!inject(BladeDescriptorKey, undefined);

// When inside blade navigation, read from BladeDescriptor (ignoring props).
// When standalone (Storybook), fall back to props.
const isExpanded = computed(() => {
  if (hasBladeContext) return bladeFull.expanded.value;
  return props.expanded;
});

const isClosable = computed(() => {
  if (hasBladeContext) return bladeFull.closable.value;
  return props.closable;
});

const attrs = useAttrs();

function handleClose() {
  if (attrs.onClose) {
    // Legacy: blade page has @close listener on <VcBlade>
    emit("close");
  } else if (hasBladeContext) {
    // New: VcBlade closes directly via blade stack
    bladeFull.closeSelf();
  } else {
    // Standalone (Storybook): emit for argTypes action handlers
    emit("close");
  }
}

// One-time deprecation warning in dev mode
if (import.meta.env.DEV && attrs.onClose && hasBladeContext) {
  console.warn(
    "[VcBlade] @close listener is deprecated when used inside blade navigation. " +
      "VcBlade now handles close automatically. " +
      "Remove @close=\"$emit('close:blade')\" from your template.",
  );
}

const descriptor = inject(BladeDescriptorKey, undefined);

const backButton = inject(BladeBackButtonKey);

const { blades, setBladeTitle } = useBladeStack();

// Register title with BladeStack for navigation/breadcrumbs
watchEffect(() => {
  if (hasBladeContext && bladeId.value && props.title) {
    setBladeTitle(bladeId.value, props.title);
  }
});

const bladeRef = ref<HTMLElement | null>(null);
const contentRef = ref<HTMLElement | null>(null);
</script>

<style lang="scss">
:root {
  --blade-background-color: var(--additional-50);
  --blade-color-error: var(--danger-500);
  --blade-color-unsaved-changes: var(--secondary-600);
  --blade-border-color: var(--neutrals-200);
  --blade-shadow-color: var(--primary-700);
  --blade-shadow: 2px 2px 8px rgb(from var(--blade-shadow-color) r g b / 14%);
  --blade-text-color: var(--additional-50);
}

.vc-blade {
  @apply tw-relative tw-flex tw-shrink-0 tw-flex-col tw-overflow-hidden;
  @apply tw-bg-[color:var(--blade-background-color)] tw-border tw-border-solid tw-border-[--blade-border-color];
  // Use shared transition timing for synchronized animations with AI panel
  transition: width var(--app-panel-transition-duration, 0.3s)
    var(--app-panel-transition-timing, cubic-bezier(0.4, 0, 0.2, 1));

  &__back-button {
    @apply tw-mr-[14px];
    flex: none;
  }

  &--mobile {
    @apply tw-w-full !important;
  }

  &--expanded {
    @apply tw-w-full tw-shrink !important;
  }

  &--maximized {
    @apply tw-absolute tw-z-[2] tw-top-0 tw-bottom-0 tw-left-0 tw-shrink !important;
    width: -webkit-fill-available !important;
    width: -moz-available !important;
    width: stretch !important;
  }

  &__header {
    @apply tw-shrink-0;

    &--hidden {
      @apply tw-hidden;
    }
  }

  &__toolbar {
    @apply tw-shrink-0;

    &--hidden {
      @apply tw-hidden;
    }
  }

  &__content {
    @apply tw-flex-1 tw-overflow-auto;
  }

  &__main {
    @apply tw-flex tw-flex-row tw-h-full;

    &--mobile {
      @apply tw-flex-col;
    }
  }

  &__slot {
    @apply tw-flex tw-flex-auto tw-flex-col tw-relative;

    &--desktop {
      @apply tw-w-0;
    }

    &--mobile {
      @apply tw-h-0;
    }
  }

  &__breadcrumbs {
    @apply tw-mr-[10px];

    &-button {
      @apply tw-text-[color:var(--blade-header-breadcrumbs-button-color)] tw-cursor-pointer hover:tw-text-[color:var(--blade-header-breadcrumbs-button-color-hover)] !important;

      &--active {
        @apply tw-text-[color:var(--blade-header-breadcrumbs-button-color-hover)] !important;
      }
    }
  }
}

.vc-app--mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}

// When mobile widgets are visible (fixed at bottom), offset content so it isn't hidden
.vc-blade--mobile:has(.vc-widget-container-mobile) {
  .vc-blade__content {
    padding-bottom: var(--blade-toolbar-widgets-mobile-height);
  }
}
</style>
