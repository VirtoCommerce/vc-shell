<template>
  <div
    class="vc-blade-header"
    :class="{
      'vc-blade-header--mobile': isMobile,
    }"
  >
    <slot name="prepend"></slot>

    <div class="vc-blade-header__status-container">
      <div
        v-if="!loading && typeof modified !== 'undefined'"
        ref="tooltipIconRef"
        :class="{
          'vc-blade-header__status-not-edited': !modified,
          'vc-blade-header__status-edited': modified,
        }"
        class="vc-blade-header__status"
        @mouseenter="tooltipVisible = true"
        @mouseleave="tooltipVisible = false"
      >
        <teleport :to="teleportTarget">
          <span
            v-if="tooltipVisible"
            ref="tooltipRef"
            :style="floatingStyle"
            class="vc-blade-header__tooltip"
          >
            {{
              modified
                ? $t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.UNSAVED_CHANGES")
                : $t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.NO_CHANGES")
            }}
          </span>
        </teleport>
      </div>

      <div
        v-if="loading"
        class="vc-blade-header__icon"
      >
        <VcSkeleton
          variant="circle"
          :width="24"
          :height="24"
        />
      </div>
      <div
        v-else-if="icon"
        class="vc-blade-header__icon"
      >
        <VcIcon
          :icon="icon"
          size="xxl"
        />
      </div>

      <div class="vc-blade-header__wrapper">
        <div
          v-if="loading"
          class="vc-blade-header__content vc-blade-header__content--loading"
        >
          <VcSkeleton
            variant="block"
            :width="180"
            :height="19"
          />
          <div class="tw-mt-1.5">
            <VcSkeleton
              variant="block"
              :width="120"
              :height="12"
            />
          </div>
        </div>
        <div
          v-else
          class="vc-blade-header__content"
        >
          <div
            :id="titleId"
            class="vc-blade-header__title"
            :class="{
              'vc-blade-header__title-no-subtitle': !subtitle,
            }"
          >
            {{ title }}
          </div>
          <div
            v-if="subtitle"
            class="vc-blade-header__subtitle"
          >
            {{ subtitle }}
          </div>
        </div>

        <div
          v-if="!loading && $slots['actions']"
          class="vc-blade-header__actions"
        >
          <slot name="actions"></slot>
        </div>
      </div>

      <div
        v-if="!isMobile && closable"
        ref="controlsRef"
        class="vc-blade-header__controls"
      >
        <VcTooltip
          v-if="renderingState?.maximized"
          placement="bottom"
        >
          <div
            class="vc-blade-header__button"
            role="button"
            tabindex="0"
            data-blade-expand-control
            :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE_HEADER.RESTORE')"
            :aria-keyshortcuts="expandAria"
            @click="onCollapse"
            @keydown.enter.prevent="onCollapse"
            @keydown.space.prevent="onCollapse"
          >
            <VcIcon icon="lucide-minus" />
          </div>
          <template #tooltip>
            <span class="tw-inline-flex tw-items-center tw-gap-2">
              {{ t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.RESTORE") }}
              <ShortcutKbd
                :parts="expandFmt.parts"
                :separated="!isMac"
              />
            </span>
          </template>
        </VcTooltip>
        <VcTooltip
          v-else
          placement="bottom"
        >
          <div
            class="vc-blade-header__button"
            role="button"
            tabindex="0"
            data-blade-expand-control
            :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE_HEADER.MAXIMIZE')"
            :aria-keyshortcuts="expandAria"
            @click="onExpand"
            @keydown.enter.prevent="onExpand"
            @keydown.space.prevent="onExpand"
          >
            <VcIcon icon="lucide-panel-top" />
          </div>
          <template #tooltip>
            <span class="tw-inline-flex tw-items-center tw-gap-2">
              {{ t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.MAXIMIZE") }}
              <ShortcutKbd
                :parts="expandFmt.parts"
                :separated="!isMac"
              />
            </span>
          </template>
        </VcTooltip>
        <VcTooltip placement="bottom">
          <div
            class="vc-blade-header__button"
            role="button"
            tabindex="0"
            :aria-label="t('COMPONENTS.ORGANISMS.VC_BLADE_HEADER.CLOSE')"
            :aria-keyshortcuts="escapeAria"
            @click="onClose"
            @keydown.enter.prevent="onClose"
            @keydown.space.prevent="onClose"
          >
            <VcIcon icon="lucide-x" />
          </div>
          <template #tooltip>
            <span class="tw-inline-flex tw-items-center tw-gap-2">
              {{ t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.CLOSE") }}
              <ShortcutKbd
                :parts="escapeFmt.parts"
                :separated="!isMac"
              />
            </span>
          </template>
        </VcTooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { VcSkeleton } from "@ui/components/atoms/vc-skeleton";
import { VcTooltip } from "@ui/components/atoms/vc-tooltip";
import ShortcutKbd from "@ui/components/organisms/vc-blade/_internal/toolbar/ShortcutKbd.vue";
import { ref, inject, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useResponsive } from "@framework/core/composables/useResponsive";
import { shift } from "@floating-ui/vue";
import { BladeRenderingStateKey } from "@core/blade-navigation/types";
import { useFloatingPosition, useTeleportTarget } from "@ui/composables";
import { hotkey, formatShortcut, useKeyboardShortcuts } from "@core/composables/useKeyboardShortcuts";

export interface Props {
  closable?: boolean;
  title?: string;
  subtitle?: string;
  icon?: string;
  modified?: boolean;
  /** Id to apply to the title element, for aria-labelledby linking from VcBlade */
  titleId?: string;
  /** When true, shows skeleton placeholders for icon/title/subtitle while keeping controls usable */
  loading?: boolean;
}
const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  expand: [];
  collapse: [];
}>();

const { t } = useI18n();
const { isMac } = useKeyboardShortcuts();
const escapeFmt = computed(() => formatShortcut(hotkey.escape, isMac));
const expandFmt = computed(() => formatShortcut(hotkey.mod.backslash, isMac));
const escapeAria = computed(() => escapeFmt.value.aria);
const expandAria = computed(() => expandFmt.value.aria);

const { isMobile } = useResponsive();
const renderingState = inject(BladeRenderingStateKey, undefined);
const tooltipVisible = ref(false);
const tooltipIconRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const { teleportTarget } = useTeleportTarget();
const { floatingStyle } = useFloatingPosition(tooltipIconRef, tooltipRef, {
  placement: "bottom-start",
  middleware: () => [shift()],
});

const controlsRef = ref<HTMLElement | null>(null);

/**
 * Maximize and Restore are two separate nodes swapped by `v-if`, so activating one
 * unmounts it and focus falls to `<body>` (WCAG 2.4.3). Move focus to whichever
 * control replaced it.
 *
 * This is a deliberate handoff, not a repair, so it does not use `focusIfLoose`: the
 * user pressed this control, and its replacement is where focus belongs. Waiting for
 * "focus looks lost" would be wrong twice over — at `nextTick` the old button is often
 * still focused and still in the DOM, so the check says "nothing to fix" and the
 * button disappears a frame later.
 *
 * Runs on the next animation frame rather than `nextTick`: collapsing re-lays-out the
 * blade stack, which can push the swap past the microtask queue.
 */
function keepFocusOnExpandControl(): void {
  // Skip when focus is elsewhere: a mouse user who clicked something else should not
  // have focus yanked into the header.
  if (!controlsRef.value?.contains(document.activeElement)) return;

  requestAnimationFrame(() => {
    controlsRef.value?.querySelector<HTMLElement>("[data-blade-expand-control]")?.focus();
  });
}

// Both entry points swap these two nodes: this header's control, and the
// `mod+\` shortcut, which calls `toggleMaximized` on the stack and never reaches
// the handlers below. Hooking the handoff to a handler therefore covers only one
// of them — QA found the shortcut path still dropping focus to `<body>`
// (VCST-5812) after the button path was fixed.
//
// The swap itself is the event worth reacting to, so watch the state that drives
// it. Default `pre` flush matters: this must run while the control the user
// activated is still focused and still mounted, which is what the guard inside
// `keepFocusOnExpandControl` tests.
watch(
  () => renderingState?.value?.maximized,
  () => keepFocusOnExpandControl(),
);

function onExpand(): void {
  if (props.closable) emit("expand");
}

function onCollapse(): void {
  if (props.closable) emit("collapse");
}

function onClose(): void {
  if (props.closable) {
    emit("close");
  }
}
</script>

<style lang="scss">
:root {
  --blade-header-height: 70px;
  --blade-header-mobile-height: 60px;
  --blade-header-background-color: var(--additional-50);
  --blade-header-button-color: var(--neutrals-400);
  --blade-header-button-target-size: 24px;
  --blade-header-button-color-hover: var(--neutrals-500);
  --blade-header-breadcrumbs-button-color: var(--neutrals-500);
  --blade-header-breadcrumbs-button-color-hover: var(--neutrals-700);
  --blade-header-icon-color: var(--secondary-500);
  --blade-header-title-font-size: 19px;
  --blade-header-title-color: var(--neutrals-950);
  --blade-header-subtitle-color: var(--secondary-500);
  --blade-not-edited: var(--success-400);
  --blade-edited: var(--warning-500);
  --blade-header-border-color: var(--neutrals-200);
  --blade-tooltip-background: var(--additional-50);
  --blade-tooltip-border: var(--neutrals-200);
  --blade-tooltip-text: var(--neutrals-600);
}

.vc-blade-header {
  @apply tw-shrink-0 tw-h-[var(--blade-header-height)] tw-bg-[color:var(--blade-header-background-color)] tw-flex tw-items-center tw-py-0 tw-px-6 tw-border-solid tw-border-b tw-border-b-[color:var(--blade-header-border-color)];

  &--mobile {
    @apply tw-min-h-[var(--blade-header-mobile-height)] tw-h-auto tw-py-2;

    .vc-blade-header__title {
      @apply tw-text-lg/[22px];
    }

    .vc-blade-header__wrapper {
      @apply tw-flex-col tw-items-start tw-gap-1;
    }

    .vc-blade-header__content {
      @apply tw-w-full tw-min-w-0;
    }

    .vc-blade-header__actions {
      @apply tw-flex tw-items-center tw-gap-1 tw-overflow-x-auto tw-max-w-full;
    }
  }

  &--hidden {
    @apply tw-hidden;
  }

  &__wrapper {
    @apply tw-flex tw-items-center tw-justify-between tw-grow tw-basis-0 tw-overflow-hidden;
  }

  &__actions {
    @apply tw-overflow-hidden tw-flex-shrink-0;
  }

  &__status {
    @apply tw-block tw-w-2 tw-h-2 tw-rounded-full tw-z-[var(--z-local-above)] tw-mr-[10px];
  }

  &__status-container {
    @apply tw-flex tw-flex-1 tw-flex-row tw-items-center tw-truncate;
  }

  &__status-not-edited {
    @apply tw-bg-[color:var(--blade-not-edited)] #{!important};
  }

  &__status-edited {
    @apply tw-bg-[color:var(--blade-edited)] #{!important};
  }

  &__tooltip {
    @apply tw-absolute tw-z-[var(--z-local-sticky)] tw-bg-[color:var(--blade-tooltip-background)] tw-border tw-border-solid tw-border-[color:var(--blade-tooltip-border)] tw-shadow-[1px_1px_8px_rgba(126,142,157,0.25)] tw-rounded-[3px] tw-text-[color:var(--blade-tooltip-text)] tw-font-normal tw-py-1 tw-px-2 tw-ml-4;
  }

  &__icon {
    @apply tw-text-[color:var(--blade-header-icon-color)] tw-mr-3;
  }

  &__content {
    @apply tw-overflow-hidden;
  }

  &__title {
    @apply tw-text-[color:var(--blade-header-title-color)] tw-text-xl/[23px] tw-truncate;
  }

  &__title-no-subtitle {
    @apply tw-text-[length:var(--blade-header-title-font-size)] tw-font-semibold #{!important};
  }

  &__subtitle {
    @apply tw-text-[color:var(--blade-header-subtitle-color)] tw-text-xs tw-mt-1;
  }

  &__controls {
    @apply tw-flex tw-items-center;
  }

  &__button {
    @apply tw-text-[color:var(--blade-header-button-color)] tw-ml-2.5 tw-cursor-pointer hover:tw-text-[color:var(--blade-header-button-color-hover)];
    // Without a minimum box the hit area is just the ~18px icon, under the 24px
    // WCAG 2.2 SC 2.5.8 target. Centering keeps the icon visually unchanged.
    @apply tw-flex tw-items-center tw-justify-center;
    min-width: var(--blade-header-button-target-size);
    min-height: var(--blade-header-button-target-size);
  }
}
</style>
