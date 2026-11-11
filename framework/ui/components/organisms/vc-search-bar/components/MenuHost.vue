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

// The longest leave transition: the sheet's slide-down
const LEAVE_MS = 400;

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
      if (mounted.value) unmountTimer = setTimeout(() => (mounted.value = false), LEAVE_MS);
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
        // header, views, fields and footer need the room
        size: "lg",
        draggable: true,
        dragHandle: true,
        closeButton: false,
        inset: false,
        title: props.title,
        ariaLabel: props.label,
      }
    : {
        show: shown.value,
        // a closing panel is still on screen for its fade; it takes no more clicks
        inert: !shown.value,
        anchorRef: props.anchor ?? null,
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
</style>
