<template>
  <div
    class="vc-blade-toolbar-mobile"
    role="toolbar"
    :aria-label="$t('COMPONENTS.ORGANISMS.VC_BLADE.TOOLBAR')"
  >
    <!-- Backdrop with frosted glass -->
    <Transition name="toolbar-mobile-backdrop">
      <div
        v-if="isExpanded"
        class="vc-blade-toolbar-mobile__backdrop"
        aria-hidden="true"
        @click="closeMenu"
      />
    </Transition>

    <!-- Staggered action items -->
    <div
      class="vc-blade-toolbar-mobile__menu"
      :class="{ 'vc-blade-toolbar-mobile__menu--open': isExpanded }"
      role="menu"
      :aria-hidden="!isExpanded"
    >
      <button
        v-for="(item, index) in items"
        :key="item.id ?? index"
        class="vc-blade-toolbar-mobile__action"
        :style="getStaggerStyle(index)"
        :disabled="isItemDisabled(item)"
        :aria-label="resolveTitle(item)"
        :tabindex="isExpanded ? 0 : -1"
        role="menuitem"
        @click="handleItemClick(item)"
      >
        <span class="vc-blade-toolbar-mobile__action-label">
          {{ resolveTitle(item) }}
        </span>
        <span
          class="vc-blade-toolbar-mobile__action-icon"
          :class="{ 'vc-blade-toolbar-mobile__action-icon--primary': index === 0 }"
          aria-hidden="true"
        >
          <VcIcon
            :icon="resolveIcon(item)"
            size="s"
          />
        </span>
      </button>
    </div>

    <!-- FAB area -->
    <Transition
      name="toolbar-mobile-fab"
      mode="out-in"
    >
      <!-- Expanded: close FAB -->
      <button
        v-if="isExpanded"
        key="close"
        class="vc-blade-toolbar-mobile__close-fab"
        :aria-label="$t('COMPONENTS.ORGANISMS.VC_BLADE.CLOSE_MENU')"
        aria-expanded="true"
        @click="closeMenu"
      >
        <VcIcon
          icon="material-close"
          size="s"
        />
      </button>

      <!-- Collapsed: pill -->
      <div
        v-else
        key="pill"
        class="vc-blade-toolbar-mobile__pill"
      >
        <button
          v-if="items[0]"
          class="vc-blade-toolbar-mobile__pill-action"
          :aria-label="resolveTitle(items[0])"
          @click="handlePrimaryClick"
        >
          <VcIcon
            :icon="resolveIcon(items[0])"
            size="s"
            aria-hidden="true"
          />
          <span class="vc-blade-toolbar-mobile__pill-label">
            {{ resolveTitle(items[0]) }}
          </span>
        </button>
        <button
          v-if="items.length > 1"
          class="vc-blade-toolbar-mobile__pill-more"
          :aria-label="$t('COMPONENTS.ORGANISMS.VC_BLADE.MORE')"
          aria-haspopup="menu"
          aria-expanded="false"
          @click="openMenu"
        >
          <VcIcon
            icon="material-keyboard_arrow_up"
            size="xs"
          />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, isRef, toValue } from "vue";
import { VcIcon } from "@ui/components/atoms";
import type { IBladeToolbar } from "@core/types";
import { resolveReactiveBoolean } from "@ui/components/organisms/vc-blade/utils";

const props = defineProps<{
  items: IBladeToolbar[];
}>();

const isExpanded = ref(false);

function resolveTitle(item: IBladeToolbar): string {
  if (!item.title) return "";
  if (isRef(item.title)) return toValue(item.title) ?? "";
  return String(item.title);
}

function resolveIcon(item: IBladeToolbar): string {
  if (!item.icon) return "";
  if (typeof item.icon === "function") return item.icon();
  return item.icon;
}

function isItemDisabled(item: IBladeToolbar): boolean {
  return resolveReactiveBoolean(item.disabled);
}

function getStaggerStyle(index: number): Record<string, string> {
  const delay = isExpanded.value
    ? `${index * 40}ms`
    : `${(props.items.length - 1 - index) * 25}ms`;
  return { transitionDelay: delay };
}

function openMenu() {
  isExpanded.value = true;
}

function closeMenu() {
  isExpanded.value = false;
}

function handlePrimaryClick() {
  if (props.items[0]) {
    props.items[0].clickHandler?.();
  }
}

function handleItemClick(item: IBladeToolbar) {
  item.clickHandler?.();
  closeMenu();
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-mobile-pill-bg-color: var(--primary-500);
  --blade-toolbar-mobile-toggle-border-color: var(--primary-200);
  --blade-toolbar-mobile-toggle-icon-color: var(--additional-50);
  --blade-toolbar-mobile-overlay-bg-color: var(--additional-950);
  --blade-toolbar-mobile-action-bg: var(--additional-50);
  --blade-toolbar-mobile-action-text: var(--neutrals-800);
  --blade-toolbar-mobile-backdrop-blur: 12px;
  // Circle button colors (same as ToolbarCircleButton — must be defined here
  // because ToolbarCircleButton doesn't mount on mobile)
  --blade-toolbar-circle-button-text-color: var(--additional-50);
  --blade-toolbar-circle-button-bg-color: var(--neutrals-500);
  --blade-toolbar-circle-button-main-bg-color: var(--primary-500);
}

// iOS-like spring timing function
$spring: cubic-bezier(0.32, 0.72, 0, 1);
$fab-bottom: 76px;
$fab-right: 20px;
// WCAG minimum touch target
$touch-min: 44px;

.vc-blade-toolbar-mobile {
  // ── Backdrop ──────────────────────────────────────────────────────────
  &__backdrop {
    @apply tw-fixed tw-inset-0 tw-z-[55];
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(var(--blade-toolbar-mobile-backdrop-blur));
    -webkit-backdrop-filter: blur(var(--blade-toolbar-mobile-backdrop-blur));
  }

  // ── Menu container ────────────────────────────────────────────────────
  &__menu {
    position: fixed;
    bottom: calc(#{$fab-bottom} + #{$touch-min} + 8px);
    right: $fab-right;
    z-index: 60;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
    pointer-events: none;

    &--open {
      pointer-events: auto;

      .vc-blade-toolbar-mobile__action {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  // ── Individual action item ────────────────────────────────────────────
  &__action {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 4px 4px 16px;
    min-height: $touch-min;
    border: none;
    border-radius: 28px;
    background: var(--blade-toolbar-mobile-action-bg);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      0 1px 3px rgba(0, 0, 0, 0.06);
    cursor: pointer;

    // Initial state (hidden)
    opacity: 0;
    transform: translateY(16px);
    transition:
      opacity 0.28s $spring,
      transform 0.28s $spring;
    // transition-delay set via inline style

    &:active:not(:disabled) {
      transform: scale(0.96) !important;
      transition-duration: 0.08s;
    }

    &:disabled {
      opacity: 0.4 !important;
      cursor: default;
    }

    // Focus-visible ring for keyboard navigation
    &:focus-visible {
      outline: 2px solid var(--blade-toolbar-mobile-pill-bg-color);
      outline-offset: 2px;
    }
  }

  &__action-label {
    @apply tw-text-sm tw-font-medium tw-whitespace-nowrap tw-leading-none;
    color: var(--blade-toolbar-mobile-action-text);
  }

  &__action-icon {
    @apply tw-flex tw-items-center tw-justify-center tw-w-9 tw-h-9 tw-rounded-full tw-shrink-0;
    background: var(--blade-toolbar-circle-button-bg-color);
    color: var(--blade-toolbar-circle-button-text-color);

    &--primary {
      background: var(--blade-toolbar-circle-button-main-bg-color);
    }
  }

  // ── Close FAB (expanded state) ────────────────────────────────────────
  &__close-fab {
    position: fixed;
    bottom: $fab-bottom;
    @supports (bottom: env(safe-area-inset-bottom)) {
      bottom: calc(#{$fab-bottom} + env(safe-area-inset-bottom));
    }
    right: $fab-right;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    width: $touch-min;
    height: $touch-min;
    border: none;
    border-radius: 50%;
    background: var(--blade-toolbar-mobile-pill-bg-color);
    color: var(--blade-toolbar-mobile-toggle-icon-color);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.16),
      0 1px 4px rgba(0, 0, 0, 0.08);

    &:active {
      transform: scale(0.92);
      transition: transform 0.08s ease;
    }

    &:focus-visible {
      outline: 2px solid var(--blade-toolbar-mobile-toggle-icon-color);
      outline-offset: 2px;
    }
  }

  // ── Pill (collapsed state) ────────────────────────────────────────────
  &__pill {
    position: fixed;
    bottom: $fab-bottom;
    @supports (bottom: env(safe-area-inset-bottom)) {
      bottom: calc(#{$fab-bottom} + env(safe-area-inset-bottom));
    }
    right: $fab-right;
    z-index: 60;
    display: flex;
    align-items: stretch;
    height: $touch-min;
    border-radius: calc(#{$touch-min} / 2);
    background: var(--blade-toolbar-mobile-pill-bg-color);
    overflow: hidden;
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.16),
      0 1px 4px rgba(0, 0, 0, 0.08);
  }

  &__pill-action {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 14px;
    min-height: $touch-min;
    border: none;
    background: transparent;
    color: var(--blade-toolbar-mobile-toggle-icon-color);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: rgba(255, 255, 255, 0.12);
    }

    &:focus-visible {
      outline: 2px solid var(--blade-toolbar-mobile-toggle-icon-color);
      outline-offset: -2px;
    }
  }

  &__pill-label {
    @apply tw-text-sm tw-font-semibold tw-whitespace-nowrap tw-leading-none;
  }

  &__pill-more {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: $touch-min;
    padding: 0 12px;
    border: none;
    border-left: 1px solid rgba(255, 255, 255, 0.24);
    background: transparent;
    color: var(--blade-toolbar-mobile-toggle-icon-color);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: rgba(255, 255, 255, 0.12);
    }

    &:focus-visible {
      outline: 2px solid var(--blade-toolbar-mobile-toggle-icon-color);
      outline-offset: -2px;
    }
  }
}

// ── Backdrop transition ─────────────────────────────────────────────────
.toolbar-mobile-backdrop-enter-active {
  transition:
    opacity 0.25s ease,
    backdrop-filter 0.3s ease;
}

.toolbar-mobile-backdrop-leave-active {
  transition:
    opacity 0.2s ease 0.08s,
    backdrop-filter 0.2s ease 0.08s;
}

.toolbar-mobile-backdrop-enter-from,
.toolbar-mobile-backdrop-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
  -webkit-backdrop-filter: blur(0);
}

// ── FAB morph transition ────────────────────────────────────────────────
.toolbar-mobile-fab-enter-active {
  transition:
    opacity 0.15s ease,
    transform 0.25s $spring;
}

.toolbar-mobile-fab-leave-active {
  transition:
    opacity 0.1s ease,
    transform 0.15s ease;
}

.toolbar-mobile-fab-enter-from {
  opacity: 0;
  transform: scale(0.85);
}

.toolbar-mobile-fab-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
