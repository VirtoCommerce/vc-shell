<template>
  <component
    :is="host"
    v-if="mounted"
    v-bind="hostProps"
    @update:model-value="!$event && emit('close')"
    @update:show="!$event && emit('close')"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch, type Component } from "vue";
import { VcPopover } from "@ui/components/molecules";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";

const props = defineProps<{
  open: boolean;
  /** Phone: bottom sheet instead of a popover */
  sheet: boolean;
  anchor?: HTMLElement | null;
  title?: string;
  closeOnOutside?: boolean;
  /** Popover: a fixed width and its placement */
  width?: string;
  placement?: "bottom-start" | "bottom-end";
  /** The slot lays out and scrolls its own body, so its header and footer stay in view */
  fit?: boolean;
  /** The label of a dialog without a title */
  label?: string;
}>();
const emit = defineEmits<{ close: [] }>();

// The host stays mounted for its leave transition, with some slack: VcPopover fades out in 120ms,
// the bar's sheet slides down in 420ms (set below)
const LEAVE_MS = { popover: 200, sheet: 480 };

// The popover and the sheet animate only when their flag flips on a mounted instance:
// the host mounts closed, then opens, and stays until its leave has played
const mounted = ref(false);
const shown = ref(false);
let unmountTimer: ReturnType<typeof setTimeout> | undefined;
watch(
  () => props.open,
  async (open) => {
    clearTimeout(unmountTimer);
    if (!open) {
      shown.value = false;
      if (mounted.value)
        unmountTimer = setTimeout(() => (mounted.value = false), props.sheet ? LEAVE_MS.sheet : LEAVE_MS.popover);
      return;
    }
    mounted.value = true;
    await nextTick();
    if (props.open) shown.value = true;
  },
  { immediate: true },
);
onBeforeUnmount(() => clearTimeout(unmountTimer));

const host = computed<Component>(() => (props.sheet ? VcSidebar : VcPopover));
const hostProps = computed<Record<string, unknown>>(() =>
  props.sheet
    ? {
        modelValue: shown.value,
        position: "bottom",
        // a fitted sheet (the Filters panel) takes its content's height, capped below
        ...(props.fit ? { height: "auto" } : {}),
        draggable: true,
        dragHandle: true,
        closeButton: false,
        // floating, 8px off the screen edges (the gap is set below)
        inset: true,
        title: props.title,
        ariaLabel: props.label,
      }
    : {
        show: shown.value,
        // a closing panel is still on screen for its fade; it takes no more clicks
        inert: !shown.value,
        anchorRef: props.anchor ?? null,
        offset: 6,
        title: props.title,
        closeOnClickOutside: props.closeOnOutside ?? true,
        placement: props.placement ?? "bottom-start",
        width: props.width ?? "280px",
        maxWidth: props.width ?? "360px",
        // the slot scrolls its own body; the popover only caps the height to the room below the anchor
        ...(props.fit ? { contentScrollable: false, maxHeight: 640 } : {}),
        // a titled popover (a chip editor, "+N") is a dialog named by its title
        ...(props.label || props.title ? { role: "dialog", ariaLabel: props.label ?? props.title } : {}),
      },
);
</script>

<style lang="scss">
// A fitted body fills the popover's capped height, so its own scroll area takes the overflow
.vc-popover__content:has(> .vc-search-bar__fit) {
  @apply tw-flex tw-flex-col;
}
.vc-search-bar__fit {
  @apply tw-flex tw-flex-col tw-flex-auto tw-min-h-0;
}

// The bar's popovers: every menu body the host shows is a vc-search-bar element
.vc-popover:has(> .vc-popover__content > [class*="vc-search-bar"]) {
  --vc-popover-border-radius: 12px;
  --vc-popover-border-color: var(--neutrals-200);
  --vc-popover-shadow: 0 12px 32px -8px rgb(19 32 47 / 22%), 0 2px 6px rgb(19 32 47 / 6%);
  font-size: 13px;
}

// The phone sheet: a floating card with a short grabber, over a darker overlay
.vc-sidebar:has(.vc-search-bar__panel--touch) {
  --vc-sidebar-inset-gap: 8px;
  --vc-sidebar-radius: 28px;
  --vc-sidebar-shadow: 0 10px 50px rgb(11 20 32 / 28%);
  --vc-sidebar-overlay-color: rgb(11 20 32 / 40%);

  .vc-sidebar__panel {
    max-height: calc(100dvh - 56px);
  }
  .vc-sidebar__handle {
    @apply tw-pt-2 tw-pb-0;
  }
  .vc-sidebar__handle-bar {
    width: 36px;
    height: 5px;
  }
  .vc-sidebar-panel-bottom-enter-active,
  .vc-sidebar-panel-bottom-leave-active {
    transition-duration: 420ms;
  }
}
</style>
