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
              @click="close"
            >
              <VcIcon
                icon="fas fa-times"
                size="s"
              />
            </button>
          </slot>
        </div>

        <!-- Content (scrollable) -->
        <div class="vc-dropdown-panel__content">
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

  <!-- Click-outside overlay -->
  <Teleport :to="teleportTarget">
    <div
      v-if="show && closeOnClickOutside"
      class="vc-dropdown-panel__backdrop"
      @click="close"
    />
  </Teleport>
</template>

<script setup lang="ts">
/**
 * VcDropdownPanel - Reusable floating dropdown panel
 *
 * A Teleported floating panel positioned relative to an anchor element.
 * Features: backdrop click-outside close, Escape key close, header with title + close button,
 * scrollable content, optional footer. Built on @floating-ui/vue.
 */
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { offset, flip, shift, size, type Placement } from "@floating-ui/vue";
import { VcIcon } from "../../atoms";
import { useFloatingPosition, useTeleportTarget } from "../../../composables";

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
  /** Close when clicking outside (backdrop) */
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
  closeOnClickOutside: true,
  closeOnEscape: true,
});

const emit = defineEmits<{
  "update:show": [value: boolean];
}>();

const { teleportTarget } = useTeleportTarget();

// Floating UI positioning
const floatingRef = ref<HTMLElement | null>(null);
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
          maxHeight: `${Math.min(availableHeight, 350)}px`,
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

// Escape key handler
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && props.show) {
    close();
  }
};

watch(
  () => props.show,
  (newShow) => {
    if (props.closeOnEscape) {
      if (newShow) {
        document.addEventListener("keydown", handleKeydown);
      } else {
        document.removeEventListener("keydown", handleKeydown);
      }
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleKeydown);
});

defineExpose({ close });
</script>

<style lang="scss">
.vc-dropdown-panel {
  @apply tw-z-50;
  @apply tw-bg-[color:var(--additional-50)] tw-rounded-lg tw-shadow-lg;
  @apply tw-border tw-border-solid tw-border-[color:var(--neutrals-200)];
  @apply tw-flex tw-flex-col;

  &__backdrop {
    @apply tw-fixed tw-inset-0 tw-z-40;
  }

  &__header {
    @apply tw-flex tw-items-center tw-justify-between;
    @apply tw-px-4 tw-py-3;
    @apply tw-border-b tw-border-solid tw-border-[color:var(--neutrals-200)];
  }

  &__title {
    @apply tw-font-semibold tw-text-sm tw-text-[color:var(--neutrals-900)];
  }

  &__close {
    @apply tw-p-1 tw-rounded tw-bg-transparent tw-border-none tw-cursor-pointer;
    @apply tw-text-[color:var(--neutrals-400)] hover:tw-text-[color:var(--neutrals-600)];
    @apply tw-transition-colors tw-duration-150;
  }

  &__content {
    @apply tw-flex-1 tw-overflow-y-auto;
  }

  &__footer {
    @apply tw-flex tw-justify-end tw-gap-2;
    @apply tw-px-4 tw-py-3;
    @apply tw-border-t tw-border-solid tw-border-[color:var(--neutrals-200)];
    @apply tw-bg-[color:var(--neutrals-50)] tw-rounded-b-lg;
  }
}

// Fade transition
.vc-dropdown-panel-fade-enter-active,
.vc-dropdown-panel-fade-leave-active {
  transition: opacity 0.15s ease;
}

.vc-dropdown-panel-fade-enter-from,
.vc-dropdown-panel-fade-leave-to {
  opacity: 0;
}
</style>
