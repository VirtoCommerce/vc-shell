<template>
  <VcTooltip
    placement="bottom"
    :delay="SHOW_DELAY"
  >
    <slot :aria="format.aria" />
    <template #tooltip>
      <span class="tw-inline-flex tw-items-center tw-gap-2">
        {{ label }}
        <ShortcutKbd
          :parts="format.parts"
          :separated="!isMac"
        />
      </span>
    </template>
  </VcTooltip>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { VcTooltip } from "@ui/components/atoms/vc-tooltip";
import { ShortcutKbd } from "@ui/components/shared/shortcut-kbd";
import { formatShortcut, useKeyboardShortcuts } from "@core/composables/useKeyboardShortcuts";
import type { ShortcutDefinition } from "@core/types";

const props = defineProps<{
  shortcut: ShortcutDefinition;
  label?: string;
}>();

defineSlots<{
  /** The trigger. Bind `aria` to its `aria-keyshortcuts`. */
  default: (props: { aria: string }) => unknown;
}>();

// Don't pop up on every pass of the cursor.
const SHOW_DELAY = 500;

const { isMac } = useKeyboardShortcuts();
const format = computed(() => formatShortcut(props.shortcut, isMac));
</script>
