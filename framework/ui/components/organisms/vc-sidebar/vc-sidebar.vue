<template>
  <Teleport
    :to="teleportTarget"
    defer
    :disabled="!teleport"
  >
    <div
      class="vc-sidebar"
      :style="containerStyle"
      :aria-hidden="!modelValue"
    >
      <Transition name="vc-sidebar-overlay">
        <div
          v-if="modelValue && showOverlay"
          class="vc-sidebar__overlay"
          @click="handleOverlayClick"
        />
      </Transition>

      <Transition :name="panelTransitionName">
        <aside
          v-if="modelValue"
          ref="panelEl"
          class="vc-sidebar__panel"
          :class="panelClasses"
          :style="panelStyle"
          role="dialog"
          :aria-modal="showOverlay"
          :aria-label="ariaDialogLabel"
          :aria-labelledby="ariaDialogLabelledBy"
          tabindex="-1"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Drag handle for bottom sheet -->
          <div
            v-if="dragHandle && isBottom"
            class="vc-sidebar__handle"
          >
            <div class="vc-sidebar__handle-bar" />
          </div>

          <slot
            v-if="hasHeader"
            name="header"
            :close="close"
          >
            <div class="vc-sidebar__header">
              <div class="vc-sidebar__title-wrap">
                <h3
                  v-if="title"
                  :id="titleId"
                  class="vc-sidebar__title"
                >
                  {{ title }}
                </h3>
                <p
                  v-if="subtitle"
                  class="vc-sidebar__subtitle"
                >
                  {{ subtitle }}
                </p>
              </div>

              <div class="vc-sidebar__header-actions">
                <slot
                  name="actions"
                  :close="close"
                />
                <button
                  v-if="closeButton"
                  type="button"
                  class="vc-sidebar__close"
                  :aria-label="closeAriaLabel"
                  @click="closeByReason('action')"
                >
                  <VcIcon
                    icon="material-close"
                    size="m"
                  />
                </button>
              </div>
            </div>
          </slot>

          <div class="vc-sidebar__content">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="vc-sidebar__footer"
          >
            <slot name="footer" />
          </div>
        </aside>
      </Transition>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useTeleportTarget } from "@ui/composables";

export type SidebarCloseReason = "overlay" | "escape" | "action";
export type SidebarPosition = "left" | "right" | "bottom";
export type SidebarSize = "sm" | "md" | "lg" | "full";
export type SidebarVariant = "default" | "elevated" | "minimal";

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

/**
 * Scroll lock state is stored on window via Symbol.for() so it survives HMR module reloads.
 * Without this, HMR resets the counter to 0 while sidebars remain open, causing mismatched lock/unlock.
 */
const SCROLL_LOCK_KEY = Symbol.for("vc-sidebar-scroll-lock");

interface ScrollLockState {
  counter: number;
  cachedOverflow: string;
  cachedPaddingRight: string;
}

function getScrollLockState(): ScrollLockState | null {
  if (typeof window === "undefined") {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  if (!win[SCROLL_LOCK_KEY]) {
    win[SCROLL_LOCK_KEY] = { counter: 0, cachedOverflow: "", cachedPaddingRight: "" };
  }

  return win[SCROLL_LOCK_KEY];
}

function acquireBodyScrollLock() {
  const state = getScrollLockState();

  if (!state || typeof document === "undefined") {
    return;
  }

  if (state.counter === 0) {
    const { body, documentElement } = document;
    state.cachedOverflow = body.style.overflow;
    state.cachedPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }

  state.counter += 1;
}

function releaseBodyScrollLock() {
  const state = getScrollLockState();

  if (!state || typeof document === "undefined" || state.counter === 0) {
    return;
  }

  state.counter -= 1;

  if (state.counter === 0) {
    const { body } = document;
    body.style.overflow = state.cachedOverflow;
    body.style.paddingRight = state.cachedPaddingRight;
  }
}

export interface Props {
  modelValue: boolean;
  position?: SidebarPosition;
  size?: SidebarSize;
  variant?: SidebarVariant;
  width?: number | string;
  height?: number | string;
  showOverlay?: boolean;
  closeOnOverlay?: boolean;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  lockScroll?: boolean;
  returnFocus?: boolean;
  autoFocus?: boolean;
  teleport?: boolean;
  teleportTo?: string | HTMLElement;
  title?: string;
  subtitle?: string;
  ariaLabel?: string;
  closeAriaLabel?: string;
  closeButton?: boolean;
  inset?: boolean;
  zIndex?: number;
  /** Enable swipe-to-dismiss gesture (only for position="bottom") */
  draggable?: boolean;
  /** Show iOS-style drag handle bar at top of panel */
  dragHandle?: boolean;
  /** Fraction of panel height user must swipe to trigger close (0-1) */
  closeThreshold?: number;
}

const props = withDefaults(defineProps<Props>(), {
  position: "right",
  size: "sm",
  variant: "default",
  width: undefined,
  height: undefined,
  showOverlay: true,
  closeOnOverlay: true,
  closeOnEscape: true,
  trapFocus: true,
  lockScroll: true,
  returnFocus: true,
  autoFocus: true,
  teleport: true,
  title: "",
  subtitle: "",
  ariaLabel: "",
  closeAriaLabel: "Close sidebar",
  closeButton: true,
  inset: true,
  zIndex: 10_000,
  draggable: false,
  dragHandle: false,
  closeThreshold: 0.3,
});

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "close", reason: SidebarCloseReason): void;
}>();

defineSlots<{
  default?: () => unknown;
  header?: (args: { close: () => void }) => unknown;
  actions?: (args: { close: () => void }) => unknown;
  footer?: () => unknown;
}>();

const slots = useSlots();
const panelEl = ref<HTMLElement | null>(null);
const sideEffectsActive = ref(false);
const lastFocusedElement = ref<HTMLElement | null>(null);

const { teleportTarget } = useTeleportTarget({
  to: computed(() => props.teleportTo),
});

const uid = Math.round(Math.random() * 100_000);
const titleId = `vc-sidebar-title-${uid}`;

const panelWidths: Record<SidebarSize, string> = {
  sm: "300px",
  md: "380px",
  lg: "520px",
  full: "100vw",
};

const panelHeights: Record<SidebarSize, string> = {
  sm: "40dvh",
  md: "56dvh",
  lg: "72dvh",
  full: "100dvh",
};

const normalizedWidth = computed(() => (typeof props.width === "number" ? `${props.width}px` : props.width));
const normalizedHeight = computed(() => (typeof props.height === "number" ? `${props.height}px` : props.height));

const hasHeader = computed(() => !!props.title || props.closeButton || !!slots.header);
const hasFooter = computed(() => !!slots.footer);

const isBottom = computed(() => props.position === "bottom");
const isFullSize = computed(() => props.size === "full");
const panelTransitionName = computed(() => {
  if (props.position === "left") {
    return "vc-sidebar-panel-left";
  }

  if (props.position === "bottom") {
    return "vc-sidebar-panel-bottom";
  }

  return "vc-sidebar-panel-right";
});

const panelStyle = computed(() => {
  if (isBottom.value) {
    return {
      height: normalizedHeight.value ?? panelHeights[props.size],
    };
  }

  return {
    width: normalizedWidth.value ?? panelWidths[props.size],
  };
});

const containerStyle = computed(() => ({
  zIndex: props.zIndex,
}));

const panelClasses = computed(() => [
  `vc-sidebar__panel--${props.position}`,
  `vc-sidebar__panel--${props.variant}`,
  `vc-sidebar__panel--size-${props.size}`,
  {
    "vc-sidebar__panel--with-header": hasHeader.value,
    "vc-sidebar__panel--with-footer": hasFooter.value,
    "vc-sidebar__panel--inset": props.inset && !isFullSize.value,
    "vc-sidebar__panel--draggable": props.draggable && isBottom.value,
  },
]);

const ariaDialogLabel = computed(() => props.ariaLabel || undefined);
const ariaDialogLabelledBy = computed(() => (props.ariaLabel || !props.title ? undefined : titleId));

function closeByReason(reason: SidebarCloseReason) {
  emit("update:modelValue", false);
  emit("close", reason);
}

function close() {
  closeByReason("action");
}

function open() {
  emit("update:modelValue", true);
}

function handleOverlayClick() {
  if (!props.closeOnOverlay) {
    return;
  }

  closeByReason("overlay");
}

// --- Swipe-to-dismiss gesture (bottom position only) ---
const touchStartY = ref(0);
const isDragging = ref(false);

function handleTouchStart(event: TouchEvent) {
  if (!props.draggable || !isBottom.value) return;
  touchStartY.value = event.touches[0].clientY;
  isDragging.value = true;
}

function handleTouchMove(event: TouchEvent) {
  if (!isDragging.value || !panelEl.value) return;

  const delta = event.touches[0].clientY - touchStartY.value;

  // Only allow dragging downward (positive delta)
  if (delta > 0) {
    panelEl.value.style.transform = `translateY(${delta}px)`;
    panelEl.value.style.transition = "none";
  }
}

function handleTouchEnd(event: TouchEvent) {
  if (!isDragging.value || !panelEl.value) return;
  isDragging.value = false;

  const delta = event.changedTouches[0].clientY - touchStartY.value;
  const panelHeight = panelEl.value.offsetHeight;
  const threshold = panelHeight * props.closeThreshold;

  if (delta > threshold) {
    // Animate out then close
    panelEl.value.style.transition = "transform 0.2s ease";
    panelEl.value.style.transform = `translateY(${panelHeight}px)`;
    setTimeout(() => {
      closeByReason("action");
    }, 200);
  } else {
    // Snap back
    panelEl.value.style.transition = "transform 0.2s ease";
    panelEl.value.style.transform = "";
    setTimeout(() => {
      if (panelEl.value) {
        panelEl.value.style.transition = "";
      }
    }, 200);
  }
}

function getFocusableElements() {
  if (!panelEl.value) {
    return [];
  }

  return Array.from(panelEl.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute("disabled") || element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

function focusFirstFocusable() {
  const firstFocusable = getFocusableElements()[0];
  if (firstFocusable) {
    firstFocusable.focus();
    return;
  }

  panelEl.value?.focus();
}

function handleDocumentFocusIn(event: FocusEvent) {
  if (!props.modelValue || !props.trapFocus || !panelEl.value) {
    return;
  }

  if (event.target instanceof Node && !panelEl.value.contains(event.target)) {
    focusFirstFocusable();
  }
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (!props.modelValue) {
    return;
  }

  if (event.key === "Escape") {
    if (props.closeOnEscape) {
      closeByReason("escape");
    }
    return;
  }

  if (!props.trapFocus || event.key !== "Tab" || !panelEl.value) {
    return;
  }

  const focusables = getFocusableElements();
  if (!focusables.length) {
    event.preventDefault();
    panelEl.value.focus();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (active === first || !active || !panelEl.value.contains(active)) {
      event.preventDefault();
      last.focus();
    }
    return;
  }

  if (active === last) {
    event.preventDefault();
    first.focus();
  }
}

function restoreFocus() {
  if (!props.returnFocus || !lastFocusedElement.value) {
    lastFocusedElement.value = null;
    return;
  }

  const elementToFocus = lastFocusedElement.value;
  lastFocusedElement.value = null;

  nextTick(() => {
    try {
      elementToFocus.focus({ preventScroll: true });
    } catch {
      elementToFocus.focus();
    }
  });
}

function activateSideEffects() {
  if (sideEffectsActive.value || typeof document === "undefined") {
    return;
  }

  sideEffectsActive.value = true;
  lastFocusedElement.value = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  document.addEventListener("keydown", handleDocumentKeydown);
  document.addEventListener("focusin", handleDocumentFocusIn);

  if (props.lockScroll) {
    acquireBodyScrollLock();
  }

  if (props.autoFocus) {
    nextTick(() => {
      focusFirstFocusable();
    });
  }
}

function deactivateSideEffects() {
  if (!sideEffectsActive.value || typeof document === "undefined") {
    return;
  }

  sideEffectsActive.value = false;
  document.removeEventListener("keydown", handleDocumentKeydown);
  document.removeEventListener("focusin", handleDocumentFocusIn);

  if (props.lockScroll) {
    releaseBodyScrollLock();
  }

  restoreFocus();
}

watch(
  () => props.modelValue,
  (opened) => {
    if (opened) {
      // Reset any leftover drag transform when re-opening
      nextTick(() => {
        if (panelEl.value) {
          panelEl.value.style.transform = "";
          panelEl.value.style.transition = "";
        }
      });
      activateSideEffects();
      return;
    }

    deactivateSideEffects();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  deactivateSideEffects();
});

defineExpose({
  close,
  open,
});
</script>

<style lang="scss">
.vc-sidebar {
  --vc-sidebar-bg-color: var(--additional-50);
  --vc-sidebar-bg-elevated: color-mix(in srgb, var(--additional-50) 90%, white 10%);
  --vc-sidebar-title-color: var(--additional-950);
  --vc-sidebar-subtitle-color: var(--neutrals-600);
  --vc-sidebar-overlay-color: rgb(15 23 42 / 0.38);
  --vc-sidebar-close-color: var(--neutrals-600);
  --vc-sidebar-border-color: color-mix(in srgb, var(--neutrals-300) 72%, white 28%);
  --vc-sidebar-shadow: 0 24px 48px rgb(15 23 42 / 0.16), 0 8px 20px rgb(15 23 42 / 0.1);
  --vc-sidebar-radius: 16px;
  --vc-sidebar-inset-gap: 12px;
  --vc-sidebar-header-height: 72px;
  --vc-sidebar-footer-height: 72px;

  @apply tw-fixed tw-inset-0 tw-pointer-events-none;

  &__overlay {
    @apply tw-absolute tw-inset-0 tw-backdrop-blur-[4px] tw-pointer-events-auto;
    background: var(--vc-sidebar-overlay-color);
  }

  &__panel {
    @apply tw-fixed tw-flex tw-flex-col tw-pointer-events-auto tw-overflow-hidden;
    @apply tw-bg-[color:var(--vc-sidebar-bg-color)] tw-border tw-border-solid tw-border-[color:var(--vc-sidebar-border-color)];
    box-shadow: var(--vc-sidebar-shadow);
    max-width: 100vw;
    max-height: 100dvh;

    &--left {
      @apply tw-left-0 tw-top-0 tw-bottom-0;
    }

    &--right {
      @apply tw-right-0 tw-top-0 tw-bottom-0;
    }

    &--bottom {
      @apply tw-left-0 tw-right-0 tw-bottom-0 tw-top-auto;
      border-radius: var(--vc-sidebar-radius) var(--vc-sidebar-radius) 0 0;
      border-bottom-width: 0;
      max-height: 96dvh;
    }

    &--size-full {
      @apply tw-rounded-none;
      width: 100vw !important;
      height: 100dvh !important;
      inset: 0 !important;
      border-radius: 0 !important;
      border: 0;
    }

    &--default {
      background: var(--vc-sidebar-bg-color);
    }

    &--elevated {
      background: var(--vc-sidebar-bg-elevated);
      box-shadow:
        0 28px 64px rgb(15 23 42 / 0.22),
        0 10px 24px rgb(15 23 42 / 0.16);
    }

    &--minimal {
      box-shadow: 0 12px 28px rgb(15 23 42 / 0.1);
      border-color: color-mix(in srgb, var(--neutrals-200) 86%, white 14%);
    }

    &--draggable {
      touch-action: none;
    }

    &:focus {
      outline: none;
    }

    &:focus-visible {
      @apply tw-ring-2 tw-ring-primary-500 tw-ring-offset-2;
    }
  }

  &__panel {
    &--inset.vc-sidebar__panel--left {
      top: var(--vc-sidebar-inset-gap);
      bottom: var(--vc-sidebar-inset-gap);
      left: var(--vc-sidebar-inset-gap);
      border-radius: var(--vc-sidebar-radius);
    }

    &--inset.vc-sidebar__panel--right {
      top: var(--vc-sidebar-inset-gap);
      bottom: var(--vc-sidebar-inset-gap);
      right: var(--vc-sidebar-inset-gap);
      border-radius: var(--vc-sidebar-radius);
    }

    &--inset.vc-sidebar__panel--bottom {
      left: var(--vc-sidebar-inset-gap);
      right: var(--vc-sidebar-inset-gap);
      bottom: var(--vc-sidebar-inset-gap);
      border-radius: var(--vc-sidebar-radius);
      border-bottom-width: 1px;
    }
  }

  &__header {
    @apply tw-flex tw-items-center tw-justify-between tw-gap-4 tw-px-5 tw-py-4 tw-border-b tw-border-solid;
    @apply tw-border-b-[color:var(--vc-sidebar-border-color)] tw-sticky tw-top-0 tw-z-[1];
    min-height: var(--vc-sidebar-header-height);
    background: inherit;
    backdrop-filter: saturate(140%) blur(6px);
  }

  &__title-wrap {
    @apply tw-flex tw-flex-col tw-min-w-0;
  }

  &__title {
    @apply tw-text-lg tw-font-semibold tw-truncate tw-text-[color:var(--vc-sidebar-title-color)];
  }

  &__subtitle {
    @apply tw-text-sm tw-truncate tw-text-[color:var(--vc-sidebar-subtitle-color)] tw-mt-0.5;
  }

  &__header-actions {
    @apply tw-flex tw-items-center tw-gap-2 tw-shrink-0;
  }

  &__close {
    @apply tw-border-0 tw-bg-transparent tw-cursor-pointer tw-flex tw-items-center tw-justify-center;
    @apply tw-h-9 tw-w-9 tw-rounded-md tw-p-0;
    @apply tw-text-[color:var(--vc-sidebar-close-color)];

    &:hover {
      @apply tw-bg-neutrals-200;
    }

    &:focus-visible {
      @apply tw-outline-none tw-ring-2 tw-ring-primary-500 tw-ring-offset-1;
    }
  }

  &__handle {
    @apply tw-flex tw-justify-center tw-py-3 tw-cursor-grab tw-shrink-0;

    &:active {
      @apply tw-cursor-grabbing;
    }
  }

  &__handle-bar {
    @apply tw-w-[100px] tw-h-1.5 tw-rounded-full;
    background: var(--neutrals-300);
  }

  &__content {
    @apply tw-flex tw-flex-col tw-flex-1 tw-relative tw-overflow-auto;
    min-height: 0;
    padding: max(0px, env(safe-area-inset-top)) max(0px, env(safe-area-inset-right)) max(0px, env(safe-area-inset-bottom))
      max(0px, env(safe-area-inset-left));
  }

  &__footer {
    @apply tw-mt-auto tw-sticky tw-bottom-0 tw-z-[1] tw-border-t tw-border-solid tw-border-t-[color:var(--vc-sidebar-border-color)];
    min-height: var(--vc-sidebar-footer-height);
    background: inherit;
    backdrop-filter: saturate(140%) blur(6px);
  }
}

.vc-sidebar-overlay-enter-active,
.vc-sidebar-overlay-leave-active {
  transition: opacity 0.22s ease;
}

.vc-sidebar-overlay-enter-from,
.vc-sidebar-overlay-leave-to {
  opacity: 0;
}

.vc-sidebar-panel-right-enter-active,
.vc-sidebar-panel-right-leave-active,
.vc-sidebar-panel-left-enter-active,
.vc-sidebar-panel-left-leave-active {
  transition:
    transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.22s ease;
}

.vc-sidebar-panel-bottom-enter-active,
.vc-sidebar-panel-bottom-leave-active {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}

.vc-sidebar-panel-right-enter-from,
.vc-sidebar-panel-right-leave-to {
  transform: translateX(24px);
  opacity: 0;
}

.vc-sidebar-panel-left-enter-from,
.vc-sidebar-panel-left-leave-to {
  transform: translateX(-24px);
  opacity: 0;
}

.vc-sidebar-panel-bottom-enter-from,
.vc-sidebar-panel-bottom-leave-to {
  transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
  .vc-sidebar-overlay-enter-active,
  .vc-sidebar-overlay-leave-active,
  .vc-sidebar-panel-right-enter-active,
  .vc-sidebar-panel-right-leave-active,
  .vc-sidebar-panel-left-enter-active,
  .vc-sidebar-panel-left-leave-active,
  .vc-sidebar-panel-bottom-enter-active,
  .vc-sidebar-panel-bottom-leave-active {
    transition: none !important;
  }
}
</style>
