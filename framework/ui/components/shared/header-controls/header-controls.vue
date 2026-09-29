<template>
  <div
    ref="rootRef"
    class="vc-blade-header__controls"
  >
    <ShortcutTooltip
      v-for="control in controls"
      :key="control.key"
      v-slot="{ aria }"
      :shortcut="control.shortcut"
      :label="control.label"
    >
      <div
        class="vc-blade-header__button"
        role="button"
        tabindex="0"
        :data-blade-expand-control="control.key !== 'close' || undefined"
        :aria-label="control.label"
        :aria-keyshortcuts="aria"
        @click="control.activate"
        @keydown.enter.prevent="control.activate"
        @keydown.space.prevent="control.activate"
      >
        <VcIcon :icon="control.icon" />
      </div>
    </ShortcutTooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { ShortcutTooltip } from "@ui/components/shared/shortcut-tooltip";
import { hotkey } from "@core/composables/useKeyboardShortcuts";

const props = defineProps<{
  maximized: boolean;
}>();

const emit = defineEmits<{
  expand: [];
  collapse: [];
  close: [];
}>();

const { t } = useI18n();

const controls = computed(() => [
  props.maximized
    ? {
        key: "collapse",
        activate: () => emit("collapse"),
        icon: "lucide-minus",
        label: t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.RESTORE"),
        shortcut: hotkey.mod.backslash,
      }
    : {
        key: "expand",
        activate: () => emit("expand"),
        icon: "lucide-panel-top",
        label: t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.MAXIMIZE"),
        shortcut: hotkey.mod.backslash,
      },
  {
    key: "close",
    activate: () => emit("close"),
    icon: "lucide-x",
    label: t("COMPONENTS.ORGANISMS.VC_BLADE_HEADER.CLOSE"),
    shortcut: hotkey.escape,
  },
]);

const rootRef = ref<HTMLElement | null>(null);

/**
 * Maximize and Restore are two nodes swapped on `maximized`, so activating one unmounts it
 * and focus falls to `<body>` (WCAG 2.4.3). Move focus to whichever control replaced it.
 *
 * A deliberate handoff, not a repair, so not `focusIfLoose`: at `nextTick` the old button
 * is often still focused and mounted, so a "focus looks lost" check would decline and the
 * button would disappear a frame later.
 *
 * Runs on the next animation frame, not `nextTick`: collapsing re-lays-out the blade
 * stack, which can push the swap past the microtask queue.
 */
function keepFocusOnExpandControl(): void {
  // Skip when focus is elsewhere: a mouse user who clicked something else should not
  // have focus yanked into the header.
  if (!rootRef.value?.contains(document.activeElement)) return;

  requestAnimationFrame(() => {
    rootRef.value?.querySelector<HTMLElement>("[data-blade-expand-control]")?.focus();
  });
}

// Two entry points swap these nodes: the control itself, and the `mod+\` shortcut, which
// changes the state without reaching the click handlers (VCST-5812). So watch the state.
// Default `pre` flush matters: this must run while the activated control is still focused
// and mounted.
watch(
  () => props.maximized,
  () => keepFocusOnExpandControl(),
);
</script>

<style lang="scss">
.vc-blade-header {
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
