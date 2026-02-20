<template>
  <Teleport :to="teleportTarget">
    <Transition name="vc-dropdown-panel-fade">
      <div
        v-if="show"
        ref="floatingRef"
        class="vc-dropdown-panel"
        :style="[floatingStyle, panelStyle]"
        @click.stop
      >
        <!-- Header -->
        <div
          v-if="title || $slots.header"
          class="vc-dropdown-panel__header"
        >
          <slot
            name="header"
            :close="close"
          >
            <span class="vc-dropdown-panel__title">{{ title }}</span>
            <button
              type="button"
              class="vc-dropdown-panel__close"
              aria-label="Close"
              @click="close"
            >
              <VcIcon
                icon="lucide-x"
                size="s"
              />
            </button>
          </slot>
        </div>

        <!-- Content (scrollable) -->
        <div
          class="vc-dropdown-panel__content"
          :class="{ 'vc-dropdown-panel__content--scrollable': contentScrollable }"
        >
          <slot />
        </div>

        <!-- Footer (optional) -->
        <div
          v-if="$slots.footer"
          class="vc-dropdown-panel__footer"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<script setup lang="ts">
/**
 * VcDropdownPanel - Reusable floating dropdown panel
 *
 * A Teleported floating panel positioned relative to an anchor element.
 * Features: document-level click-outside close, Escape key close, header with title + close button,
 * scrollable content, optional footer. Built on @floating-ui/vue.
 */
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";
import { offset, flip, shift, size, type Placement } from "@floating-ui/vue";
import { VcIcon } from "@ui/components/atoms";
import { useFloatingPosition, useTeleportTarget } from "@ui/composables";
import { panelAnchorRegistry } from "@ui/components/molecules/vc-dropdown-panel/panel-anchor-registry";

interface Props {
  /** Whether the panel is visible (v-model:show) */
  show: boolean;
  /** Anchor element for positioning */
  anchorRef?: HTMLElement | null;
  /** Panel header title (hidden if empty and no #header slot) */
  title?: string;
  /** Floating UI placement */
  placement?: Placement;
  /** Panel min-width */
  width?: string;
  /** Panel max-width */
  maxWidth?: string;
  /** Max panel height in pixels (clamped by viewport available height) */
  maxHeight?: number;
  /** Enable internal content scrolling for the panel body */
  contentScrollable?: boolean;
  /** Close when clicking outside */
  closeOnClickOutside?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  anchorRef: null,
  title: "",
  placement: "bottom-start",
  width: "280px",
  maxWidth: "400px",
  maxHeight: 350,
  contentScrollable: true,
  closeOnClickOutside: true,
  closeOnEscape: true,
});

const emit = defineEmits<{
  "update:show": [value: boolean];
}>();

const { teleportTarget } = useTeleportTarget();

// Floating UI positioning
const floatingRef = ref<HTMLElement | null>(null);
const registeredPanelEl = ref<HTMLElement | null>(null);
const anchorRefAsRef = computed<HTMLElement | null>(() => props.anchorRef ?? null);

const { floatingStyle } = useFloatingPosition(anchorRefAsRef, floatingRef, {
  strategy: "fixed",
  placement: computed(() => props.placement),
  middleware: computed(() => [
    offset(4),
    flip(),
    shift({ padding: 16 }),
    size({
      padding: 16,
      apply({ availableHeight, elements }) {
        Object.assign(elements.floating.style, {
          maxHeight: `${Math.min(availableHeight, props.maxHeight)}px`,
        });
      },
    }),
  ]),
});

const panelStyle = computed(() => ({
  minWidth: props.width,
  maxWidth: props.maxWidth,
}));

const close = () => {
  emit("update:show", false);
};

const registerPanel = () => {
  const panel = floatingRef.value;
  if (!panel) return;
  panelAnchorRegistry.set(panel, props.anchorRef ?? null);
  registeredPanelEl.value = panel;
};

const unregisterPanel = () => {
  if (!registeredPanelEl.value) return;
  panelAnchorRegistry.delete(registeredPanelEl.value);
  registeredPanelEl.value = null;
};

// Click-outside detection via pointerdown on document.
// Unlike a backdrop overlay, this works regardless of z-index stacking —
// clicks on high-z-index siblings (sidebar, other panels) are caught too.
const handlePointerDownOutside = (e: PointerEvent) => {
  const target = e.target as Element;
  // Click inside the floating panel — ignore
  if (floatingRef.value?.contains(target)) {
    return;
  }
  // Click on the anchor element — let parent handle the toggle
  if (props.anchorRef?.contains(target)) {
    return;
  }
  // Handle nested panels (e.g. sub-menus teleported outside this panel).
  // If the click is inside another .vc-dropdown-panel that does NOT contain
  // our anchor, it's a "child" panel (its anchor lives inside us) — don't close.
  // If that panel DOES contain our anchor, it's a parent/sibling — close as usual.
  const enclosingPanel = target.closest?.(".vc-dropdown-panel");
  if (enclosingPanel && floatingRef.value && enclosingPanel !== floatingRef.value) {
    const enclosingAnchor = panelAnchorRegistry.get(enclosingPanel);
    const clickedInsideChildPanel = Boolean(enclosingAnchor && floatingRef.value.contains(enclosingAnchor));
    if (clickedInsideChildPanel) {
      return;
    }
  }
  close();
};

// Escape key handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.show) {
    close();
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      nextTick(registerPanel);
      if (props.closeOnClickOutside) {
        document.addEventListener("pointerdown", handlePointerDownOutside);
      }
      if (props.closeOnEscape) {
        document.addEventListener("keydown", handleKeydown);
      }
    } else {
      unregisterPanel();
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      document.removeEventListener("keydown", handleKeydown);
    }
  },
  { immediate: true },
);

watch(
  () => props.anchorRef,
  (anchorRef) => {
    if (registeredPanelEl.value) {
      panelAnchorRegistry.set(registeredPanelEl.value, anchorRef ?? null);
    }
  },
);

onBeforeUnmount(() => {
  unregisterPanel();
  document.removeEventListener("pointerdown", handlePointerDownOutside);
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({ close });
</script>

<style lang="scss">
:root {
  --dropdown-panel-bg: var(--additional-50);
  --dropdown-panel-border-color: var(--neutrals-200);
  --dropdown-panel-border-radius: 6px;
  --dropdown-panel-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  --dropdown-panel-z-index: 50;
  --dropdown-panel-title-color: var(--neutrals-900);
  --dropdown-panel-close-color: var(--neutrals-400);
  --dropdown-panel-close-hover-color: var(--neutrals-600);
  --dropdown-panel-footer-bg: var(--neutrals-50);
}

.vc-dropdown-panel {
  z-index: var(--dropdown-panel-z-index);
  @apply tw-overflow-hidden tw-flex tw-flex-col;
  @apply tw-border tw-border-solid;
  background-color: var(--dropdown-panel-bg);
  border-color: var(--dropdown-panel-border-color);
  border-radius: var(--dropdown-panel-border-radius);
  box-shadow: var(--dropdown-panel-shadow);

  &__header {
    @apply tw-flex tw-items-center tw-justify-between;
    @apply tw-px-4 tw-py-3;
    @apply tw-border-b tw-border-solid;
    border-color: var(--dropdown-panel-border-color);
  }

  &__title {
    @apply tw-font-semibold tw-text-sm;
    color: var(--dropdown-panel-title-color);
  }

  &__close {
    @apply tw-p-1 tw-bg-transparent tw-border-none tw-cursor-pointer;
    @apply tw-transition-colors tw-duration-150;
    color: var(--dropdown-panel-close-color);
    border-radius: var(--dropdown-panel-border-radius);

    &:hover {
      color: var(--dropdown-panel-close-hover-color);
    }
  }

  &__content {
    @apply tw-flex-1 tw-overflow-hidden;

    &--scrollable {
      @apply tw-overflow-y-auto;
    }
  }

  &__footer {
    @apply tw-flex tw-justify-end tw-gap-2;
    @apply tw-px-4 tw-py-3;
    @apply tw-border-t tw-border-solid;
    border-color: var(--dropdown-panel-border-color);
    background-color: var(--dropdown-panel-footer-bg);
    border-bottom-left-radius: var(--dropdown-panel-border-radius);
    border-bottom-right-radius: var(--dropdown-panel-border-radius);
  }
}

// Panel transition
.vc-dropdown-panel-fade-enter-active {
  transition:
    opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.vc-dropdown-panel-fade-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.12s ease-in;
}

.vc-dropdown-panel-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.vc-dropdown-panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-2px) scale(0.99);
}
</style>
