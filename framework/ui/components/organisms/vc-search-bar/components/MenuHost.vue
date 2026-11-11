<template>
  <component
    :is="host"
    v-bind="hostProps"
    @update:model-value="!$event && emit('close')"
    @update:show="!$event && emit('close')"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { VcPopover } from "@ui/components/molecules";
import { VcSidebar } from "@ui/components/organisms/vc-sidebar";

const props = defineProps<{
  /** Phone: bottom sheet instead of a popover */
  sheet: boolean;
  anchor?: HTMLElement | null;
  title?: string;
  closeOnOutside?: boolean;
  /** Popover: a fixed width and its placement */
  width?: string;
  placement?: "bottom-start" | "bottom-end";
  /** The label of a dialog without a title */
  label?: string;
}>();
const emit = defineEmits<{ close: [] }>();

const host = computed<Component>(() => (props.sheet ? VcSidebar : VcPopover));
const hostProps = computed<Record<string, unknown>>(() =>
  props.sheet
    ? {
        modelValue: true,
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
        show: true,
        anchorRef: props.anchor ?? null,
        title: props.title,
        closeOnClickOutside: props.closeOnOutside ?? true,
        placement: props.placement ?? "bottom-start",
        width: props.width ?? "280px",
        maxWidth: props.width ?? "360px",
        // a fixed-width panel lays out and scrolls its own body
        ...(props.width ? { contentScrollable: false, maxHeight: 640 } : {}),
        // a titled popover (a chip editor, "+N") is a dialog named by its title
        ...(props.label || props.title ? { role: "dialog", ariaLabel: props.label ?? props.title } : {}),
      },
);
</script>
