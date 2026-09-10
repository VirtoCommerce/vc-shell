<template>
  <div
    ref="bladeRef"
    v-bind="rootAttrs"
    class="vc-blade"
    role="region"
    tabindex="-1"
    :class="[
      $attrs.class,
      {
        'vc-blade--mobile': isMobile,
        'vc-blade--expanded': isExpanded,
        'vc-blade--maximized': renderingState?.maximized,
      },
    ]"
    :style="{ width: typeof width === 'number' ? `${width}px` : width }"
    :aria-busy="props.loading || undefined"
    :aria-labelledby="props.title && !showSkeleton ? bladeTitleId : undefined"
    :aria-label="!props.title || showSkeleton ? $t('COMPONENTS.ORGANISMS.VC_BLADE.PANEL') : undefined"
  >
    <!-- Header zone -->
    <BladeHeader
      v-if="!(isMobile && blades.length === 1 && !$slots['actions'])"
      class="vc-blade__header"
      :closable="isClosable"
      :icon="icon"
      :title="title"
      :subtitle="subtitle"
      :modified="effectiveModified"
      :title-id="bladeTitleId"
      :loading="showSkeleton"
      @close="handleClose"
      @expand="handleExpand"
      @collapse="handleCollapse"
    >
      <template #prepend>
        <component
          :is="backButton"
          v-if="backButton && isMobile"
          class="vc-blade__back-button"
        />

        <div
          v-if="!showSkeleton && renderingState?.breadcrumbs?.length && isDesktop"
          class="vc-blade__breadcrumbs"
        >
          <VcBreadcrumbs
            :items="renderingState?.breadcrumbs"
            collapsed
          >
            <template #trigger="{ click, isActive }">
              <!-- Overriding #trigger replaces VcBreadcrumbs' own labelled button,
                   so the accessible name has to be repeated here (WCAG 4.1.2). -->
              <VcButton
                text
                icon="lucide-ellipsis-vertical"
                icon-size="xl"
                :aria-label="$t('COMPONENTS.MOLECULES.VC_BREADCRUMBS.SHOW_MORE')"
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

    <BladeStatusBanners
      v-if="!showSkeleton"
      :modified="effectiveModified"
    />

    <!-- Toolbar zone -->
    <BladeToolbar
      data-test-id="blade-toolbar"
      class="vc-blade__toolbar"
      :items="toolbarItems"
      :loading="showSkeleton"
    >
      <template #widgets-container>
        <WidgetContainer :blade-id="bladeId" />
      </template>
    </BladeToolbar>

    <!-- Content zone -->
    <div
      ref="contentRef"
      class="vc-blade__content"
      tabindex="0"
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

    <!-- Shown instead of skeletons once content exists. It blocks the pointer and
         nothing else: hiding, disabling or `inert`-ing the content would drop focus
         to <body> exactly as unmounting did. Keyboard input still reaches the form,
         so a user mid-edit is never locked out. `aria-hidden` because the blade
         itself already carries `aria-busy`. -->
    <div
      v-if="showBusyOverlay"
      class="vc-blade__busy"
      aria-hidden="true"
    />
  </div>
</template>
<script lang="ts" setup>
import {
  ref,
  inject,
  provide,
  computed,
  getCurrentInstance,
  onMounted,
  onUnmounted,
  useAttrs,
  watch,
  watchEffect,
} from "vue";
import { focusIfLoose } from "@core/utilities/focus";
import { IBladeToolbar } from "@core/types";
import { useBladeStack } from "@core/blade-navigation";
import BladeHeader from "@ui/components/organisms/vc-blade/_internal/BladeHeader.vue";
import BladeToolbar from "@ui/components/organisms/vc-blade/_internal/BladeToolbar.vue";
import BladeStatusBanners from "@ui/components/organisms/vc-blade/_internal/BladeStatusBanners.vue";
import { VcButton } from "@ui/components/atoms/vc-button";
import { VcBreadcrumbs } from "@ui/components/molecules/vc-breadcrumbs";
import { BladeBackButtonKey, BladeFormKey, BladeLoadingKey } from "@framework/injection-keys";
import WidgetContainer from "@ui/components/organisms/vc-blade/_internal/widgets/WidgetContainer.vue";
import { useBlade } from "../../../../core/composables";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { BladeDescriptorKey, BladeMaximizedKey, BladeRenderingStateKey } from "@core/blade-navigation/types";

export interface Props {
  icon?: string;
  title?: string;
  subtitle?: string;
  width?: number | string;
  /**
   * @deprecated Managed by the navigation stack — ignored inside blade navigation, where the
   * active (rightmost) blade is expanded automatically. Read the live value from `useBlade().expanded`.
   * Retained only as a standalone/Storybook fallback (when no blade context is present).
   */
  expanded?: boolean;
  /**
   * @deprecated Managed by the navigation stack — ignored inside blade navigation, where closability
   * is derived from stack position (a workspace root is not closable). Read the live value from
   * `useBlade().closable`. Retained only as a standalone/Storybook fallback (when no blade context is present).
   */
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

// Auto-detect form state from useBladeForm (if present in this blade)
const bladeForm = inject(BladeFormKey, null);

const effectiveModified = computed(() => {
  // Explicit prop takes priority (backward compatibility)
  if (props.modified !== undefined) return props.modified;
  // Auto-inject from useBladeForm (undefined if no form → indicator hidden)
  if (!bladeForm) return undefined;
  return bladeForm.isModified.value;
});

const instanceUid = getCurrentInstance()?.uid ?? 0;
const bladeTitleId = `blade-title-${instanceUid}`;
const bladeDescriptor = inject(BladeDescriptorKey, undefined);

// Same two-state treatment as VcDataTable: a skeleton for content that has never
// rendered, an overlay over content that already exists.
//
// The overlay is what makes the latch safe. Closing it early once left the blade with no
// indication at all, which is how a save came to unmount the focused control. Now an
// early close costs an overlay and nothing is unmounted, so focus survives (WCAG 2.4.3).
const hasLoadedOnce = ref(false);
let pendingLatch: number | undefined;

const cancelLatch = () => {
  if (pendingLatch === undefined) return;
  cancelAnimationFrame(pendingLatch);
  pendingLatch = undefined;
};

watch([() => Boolean(props.loading), () => bladeDescriptor?.value.param], ([loading, param], previous) => {
  // A different entity in the same blade instance has nothing rendered for it.
  if (previous?.length && param !== previous[1]) {
    cancelLatch();
    hasLoadedOnce.value = false;
  }
  if (loading || !previous?.[0]) return;

  // The falling edge alone does not mean content exists: a page that loads in two steps
  // drops `loading` between them with nothing rendered, and closing the latch there
  // showed an overlay over an empty blade instead of skeletons.
  //
  // So confirm across a frame — a new load before the browser paints keeps the latch
  // open. Measured against the running app that gap is under 8ms.
  cancelLatch();
  pendingLatch = requestAnimationFrame(() => {
    pendingLatch = undefined;
    if (!props.loading) hasLoadedOnce.value = true;
  });
});

onUnmounted(cancelLatch);

const showSkeleton = computed(() => Boolean(props.loading) && !hasLoadedOnce.value);
const showBusyOverlay = computed(() => Boolean(props.loading) && hasLoadedOnce.value);

provide(BladeLoadingKey, showSkeleton);

const _slots = defineSlots<{
  actions(): void;
  default(): void;
}>();

const emit = defineEmits<Emits>();

const { isMobile, isDesktop } = useResponsive();

// Single useBlade() call — reuse for both bladeId and context-aware features
const bladeFull = useBlade();
const { id: bladeId } = bladeFull;

// Context detection: are we inside blade navigation (VcBladeSlot)?
const hasBladeContext = !!bladeDescriptor;
const maximizedRef = inject(BladeMaximizedKey, undefined);

// Rendering state (maximized/breadcrumbs) — provided by VcBladeSlot separately
// from the immutable descriptor. Undefined when rendered standalone (Storybook).
const renderingState = inject(BladeRenderingStateKey, undefined);

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
const rootAttrs = computed(() => {
  const { class: _class, style: _style, onClose: _onClose, ...rest } = attrs;
  return rest;
});

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

function handleExpand() {
  if (maximizedRef) {
    maximizedRef.value = true;
  } else {
    emit("expand");
  }
}

function handleCollapse() {
  if (maximizedRef) {
    maximizedRef.value = false;
  } else {
    emit("collapse");
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

// Seatbelt. `loading` should mean "nothing to show yet", but a blade that raises it for
// a save unmounts the focused control and drops focus to <body>, so the next Tab restarts
// from the top (WCAG 2.4.3). Park focus on the blade so Tab resumes from here.
watch(showSkeleton, (skeleton) => {
  const root = bladeRef.value;
  if (!skeleton || !root) return;
  if (document.activeElement && root.contains(document.activeElement)) {
    root.focus({ preventScroll: true });
  }
});
// A new blade is the user's new context, but claiming focus is conditional: a click on
// a table row is a sensible place to continue from, and a blade that autofocuses a field
// keeps it. This only repairs focus dropped on `<body>`.
onMounted(() => focusIfLoose(() => bladeRef.value));

// Maximizing makes everything the blade covers inert, and an inert node loses focus.
// Nobody owned repairing that: the header only hands focus between its own two expand
// controls, so focus that started in the sidebar or app bar died with its region and
// restoring did not bring it back (VCST-5859).
//
// Repair, not seizure: focus that is still somewhere live stays put.
watch(
  () => renderingState?.value?.maximized,
  () => focusIfLoose(() => bladeRef.value),
);
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

  &__busy {
    @apply tw-absolute tw-inset-0 tw-z-10 tw-cursor-wait;
    background-color: color-mix(in srgb, var(--blade-background-color) 45%, transparent);
  }

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
    @apply tw-absolute tw-z-[var(--z-local-above)] tw-top-0 tw-bottom-0 tw-left-0 tw-shrink !important;
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

      // WCAG 2.2 SC 2.5.8: the text variant strips padding, leaving the icon's
      // own 22px as the whole target. Reuses the token PR #271 introduced for the
      // other header buttons. Only the box grows; the icon is untouched.
      min-width: var(--blade-header-button-target-size);
      min-height: var(--blade-header-button-target-size);

      &--active {
        @apply tw-text-[color:var(--blade-header-breadcrumbs-button-color-hover)] !important;
      }
    }
  }
}

.vc-app--mobile .vc-blade {
  @apply tw-m-0 tw-rounded-none;
}

// The mobile widget bar is a fixed 80px band, so the scroll viewport must end where
// it begins. `margin-bottom` and not `padding-bottom`: with an overflowing descendant
// a scroll container's end padding is partly swallowed, stranding the last rows under
// the bar at maximum scroll. Shrinking the viewport does not depend on how the content
// produces its overflow.
.vc-blade--mobile:has(.vc-widget-container-mobile) {
  .vc-blade__content {
    margin-bottom: var(--blade-toolbar-widgets-mobile-height);
  }
}
</style>
