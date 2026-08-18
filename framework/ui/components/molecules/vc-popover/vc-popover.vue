<template>
  <Teleport :to="teleportTarget">
    <Transition name="vc-popover-fade">
      <div
        v-if="show"
        ref="floatingRef"
        class="vc-popover"
        :style="[floatingStyle, panelStyle]"
        :role="role"
        :aria-label="ariaLabel"
        @click.stop
      >
        <!-- Header -->
        <div
          v-if="title || $slots.header"
          class="vc-popover__header"
        >
          <slot
            name="header"
            :close="close"
          >
            <span class="vc-popover__title">{{ title }}</span>
            <button
              type="button"
              class="vc-popover__close"
              :aria-label="$t('COMPONENTS.CONTROLS.CLOSE')"
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
          class="vc-popover__content"
          :class="{ 'vc-popover__content--scrollable': contentScrollable }"
          :tabindex="contentScrollable ? 0 : undefined"
        >
          <slot />
        </div>

        <!-- Footer (optional) -->
        <div
          v-if="$slots.footer"
          class="vc-popover__footer"
        >
          <slot name="footer" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * VcPopover - Reusable anchored floating panel (popover)
 *
 * A Teleported floating panel positioned relative to an anchor element.
 * Features: document-level click-outside close, Escape key close, header with title + close button,
 * scrollable content, optional footer. Built on @floating-ui/vue.
 */
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";
import { offset, flip, shift, size, type Placement, type ReferenceElement } from "@floating-ui/vue";
import { VcIcon } from "@ui/components/atoms";
import { useFloatingPosition, useTeleportTarget } from "@ui/composables";
import { panelAnchorRegistry } from "@ui/components/molecules/vc-popover/panel-anchor-registry";

defineOptions({ name: "VcPopover" });

interface Props {
  /** Whether the panel is visible (v-model:show) */
  show: boolean;
  /** Anchor for positioning — accepts an HTMLElement or a floating-ui VirtualElement (`{ getBoundingClientRect, contextElement? }`). Use a VirtualElement when the underlying DOM root can swap dynamically (e.g. wrapping a component whose root element changes via v-if). */
  anchorRef?: ReferenceElement | null;
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
  /** Optional semantic role for consumers that present a dialog-like panel */
  role?: string;
  /** Accessible name used with the optional semantic role */
  ariaLabel?: string;
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
const anchorRefAsRef = computed<ReferenceElement | null>(() => props.anchorRef ?? null);

// Resolve the underlying DOM anchor for click-outside checks and the child-panel registry.
// For an HTMLElement, that's the element itself; for a VirtualElement, use its `contextElement`.
const anchorEl = computed<Element | null>(() => {
  const a = props.anchorRef;
  if (!a) return null;
  if (a instanceof Element) return a;
  return (a as { contextElement?: Element }).contextElement ?? null;
});

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
  panelAnchorRegistry.set(panel, anchorEl.value);
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
  if (anchorEl.value?.contains(target)) {
    return;
  }
  // Handle nested panels (e.g. sub-menus teleported outside this panel).
  // If the click is inside another .vc-popover that does NOT contain
  // our anchor, it's a "child" panel (its anchor lives inside us) — don't close.
  // If that panel DOES contain our anchor, it's a parent/sibling — close as usual.
  const enclosingPanel = target.closest?.(".vc-popover");
  if (enclosingPanel && floatingRef.value && enclosingPanel !== floatingRef.value) {
    const enclosingAnchor = panelAnchorRegistry.get(enclosingPanel);
    const clickedInsideChildPanel = Boolean(enclosingAnchor && floatingRef.value.contains(enclosingAnchor));
    if (clickedInsideChildPanel) {
      return;
    }
  }
  // Handle teleported child dropdowns (e.g. VcSelect dropdown inside this panel).
  // VcSelect teleports its dropdown to <body>, so it's outside our DOM tree.
  // We identify ownership via the ARIA contract: the dropdown has id="listboxId"
  // and the trigger inside our panel has aria-controls="listboxId".
  const selectDropdown = target.closest?.(".vc-select__dropdown");
  if (selectDropdown && floatingRef.value) {
    const listboxId = selectDropdown.getAttribute("id");
    if (listboxId && floatingRef.value.querySelector(`[aria-controls="${listboxId}"]`)) {
      return;
    }
  }
  close();
};

// Escape key handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.show) {
    e.preventDefault();
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

watch(anchorEl, (el) => {
  if (registeredPanelEl.value) {
    panelAnchorRegistry.set(registeredPanelEl.value, el);
  }
});

onBeforeUnmount(() => {
  unregisterPanel();
  document.removeEventListener("pointerdown", handlePointerDownOutside);
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({ close });
</script>

<style lang="scss">
:root {
  --vc-popover-bg: var(--additional-50);
  --vc-popover-border-color: var(--neutrals-200);
  --vc-popover-border-radius: 6px;
  --vc-popover-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  --vc-popover-title-color: var(--neutrals-900);
  --vc-popover-close-color: var(--neutrals-400);
  --vc-popover-close-hover-color: var(--neutrals-600);
  --vc-popover-footer-bg: var(--neutrals-50);
}

.vc-popover {
  z-index: var(--z-critical-floating-panel);
  @apply tw-overflow-hidden tw-flex tw-flex-col;
  @apply tw-border tw-border-solid;
  background-color: var(--vc-popover-bg);
  border-color: var(--vc-popover-border-color);
  border-radius: var(--vc-popover-border-radius);
  box-shadow: var(--vc-popover-shadow);

  &__header {
    @apply tw-flex tw-items-center tw-justify-between;
    @apply tw-px-4 tw-py-3;
    @apply tw-border-b tw-border-solid;
    border-color: var(--vc-popover-border-color);
  }

  &__title {
    @apply tw-font-semibold tw-text-sm;
    color: var(--vc-popover-title-color);
  }

  &__close {
    @apply tw-p-1 tw-bg-transparent tw-border-none tw-cursor-pointer;
    @apply tw-transition-colors tw-duration-150;
    color: var(--vc-popover-close-color);
    border-radius: var(--vc-popover-border-radius);

    &:hover {
      color: var(--vc-popover-close-hover-color);
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
    border-color: var(--vc-popover-border-color);
    background-color: var(--vc-popover-footer-bg);
    border-bottom-left-radius: var(--vc-popover-border-radius);
    border-bottom-right-radius: var(--vc-popover-border-radius);
  }
}

// Panel transition
.vc-popover-fade-enter-active {
  transition:
    opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

.vc-popover-fade-leave-active {
  transition:
    opacity 0.12s ease-in,
    transform 0.12s ease-in;
}

.vc-popover-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.vc-popover-fade-leave-to {
  opacity: 0;
  transform: translateY(-2px) scale(0.99);
}
</style>
