<template>
  <div
    v-show="isDropdownMode || isActionsVisible || isOpen"
    class="vc-table-row-actions"
    :class="{ 'vc-table-row-actions--dropdown-mode': isDropdownMode }"
    @click.stop
  >
    <!-- Quick action buttons (first N actions) - only in inline mode -->
    <template v-if="!isDropdownMode">
      <div
        v-for="(action, idx) in quickActions"
        :key="idx"
        class="vc-table-row-actions__action"
      >
        <VcTooltip placement="top">
          <VcButton
            :variant="action.variant === 'danger' ? 'danger' : 'ghost'"
            size="icon"
            :icon="action.icon"
            icon-size="s"
            :disabled="action.disabled"
            class="vc-table-row-actions__btn"
            @click="handleActionClick(action)"
          />
          <template #tooltip>
            {{ action.title || action.name }}
          </template>
        </VcTooltip>
      </div>
    </template>

    <!-- Dropdown trigger (three dots menu) -->
    <div
      v-if="showDropdownTrigger"
      ref="referenceRef"
      class="vc-table-row-actions__overflow"
      @click.stop
    >
      <button
        ref="triggerBtnRef"
        type="button"
        class="vc-table-row-actions__btn vc-table-row-actions__btn--more"
        :title="isDropdownMode ? 'Actions' : 'More actions'"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        @click.stop.prevent="toggleDropdown"
        @keydown.down.prevent="openAndFocusFirst"
        @mousedown.stop
      >
        <VcIcon
          icon="fas fa-ellipsis-vertical"
          size="s"
        />
      </button>

      <!-- Backdrop (must be before dropdown in DOM for correct z-index stacking) -->
      <Teleport :to="teleportTarget">
        <div
          v-if="isBackdropVisible"
          class="vc-table-row-actions__backdrop"
          @click="closeDropdown"
        />
      </Teleport>

      <!-- Dropdown Menu -->
      <Teleport :to="teleportTarget">
        <Transition name="dropdown">
          <div
            v-if="isOpen"
            ref="floatingRef"
            role="menu"
            class="vc-table-row-actions__dropdown"
            :style="floatingStyle"
            @click.stop
            @keydown="handleDropdownKeydown"
          >
            <div
              v-for="(action, idx) in overflowActions"
              :key="idx"
              role="menuitem"
              :tabindex="action.disabled ? -1 : 0"
              class="vc-table-row-actions__dropdown-item"
              :class="{
                'vc-table-row-actions__dropdown-item--disabled': action.disabled,
                'vc-table-row-actions__dropdown-item--danger': action.variant === 'danger',
              }"
              :aria-disabled="action.disabled || undefined"
              @click="handleActionClick(action)"
              @keydown.enter.prevent="handleActionClick(action)"
              @keydown.space.prevent="handleActionClick(action)"
            >
              <VcIcon
                v-if="action.icon"
                :icon="action.icon"
                size="s"
                class="vc-table-row-actions__dropdown-icon"
              />
              <span class="vc-table-row-actions__dropdown-text">{{ action.title || action.name }}</span>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, inject, nextTick } from "vue";
import { offset, flip, shift } from "@floating-ui/vue";
import { VcIcon, VcButton } from "@ui/components/atoms";
import type { TableAction } from "@ui/components/organisms/vc-table/types";
import { useFloatingPosition, useTeleportTarget } from "@ui/composables";

const props = withDefaults(
  defineProps<{
    /**
     * Actions to display
     */
    actions?: TableAction[];
    /**
     * Whether to show actions (controlled by parent via hover).
     * If not provided, uses tableContext to auto-detect hover state.
     */
    visible?: boolean;
    /**
     * Row index for auto-detecting hover state via tableContext.
     * Required when visible prop is not explicitly controlled.
     */
    rowIndex?: number;
    /**
     * Maximum number of quick action buttons to show.
     * Actions beyond this will go into overflow menu.
     * Only applies when mode is 'inline'.
     * @default 4
     */
    maxQuickActions?: number;
    /**
     * Display mode for actions:
     * - 'inline': Quick action buttons shown on hover, overflow in dropdown (Google Drive style)
     * - 'dropdown': All actions in dropdown menu triggered by three dots
     * @default 'inline'
     */
    mode?: "inline" | "dropdown";
  }>(),
  {
    maxQuickActions: 4,
    visible: undefined, // undefined means auto-detect from context
    mode: "inline",
  },
);

const emit = defineEmits<{
  /** Emitted when an action is clicked */
  action: [action: TableAction];
}>();

// Inject table context for auto-detecting hover state
const tableContext = inject<{
  selectedRowIndex: { value: number | undefined };
} | null>("tableContext", null);

const isOpen = ref(false);
const isBackdropVisible = ref(false);
const referenceRef = ref<HTMLElement | null>(null);
const floatingRef = ref<HTMLElement | null>(null);
const triggerBtnRef = ref<HTMLElement | null>(null);
const { teleportTarget } = useTeleportTarget();

// Visibility: use prop if provided, otherwise auto-detect from tableContext
const isActionsVisible = computed(() => {
  // Must have actions to show
  if (!props.actions?.length) {
    return false;
  }

  // If visible prop is explicitly set, use it
  if (props.visible !== undefined) {
    return props.visible;
  }
  // Otherwise, auto-detect from tableContext using rowIndex
  if (tableContext && props.rowIndex !== undefined) {
    return tableContext.selectedRowIndex.value === props.rowIndex;
  }
  return false;
});

// Filter hidden actions
const visibleActions = computed(() => {
  return props.actions?.filter((action) => !action.hidden) || [];
});

// Computed: is dropdown mode
const isDropdownMode = computed(() => props.mode === "dropdown");

// Split actions into quick and overflow (only for inline mode)
const quickActions = computed(() => {
  if (isDropdownMode.value) return [];
  return visibleActions.value.slice(0, props.maxQuickActions);
});

const overflowActions = computed(() => {
  if (isDropdownMode.value) return visibleActions.value;
  return visibleActions.value.slice(props.maxQuickActions);
});

// For dropdown mode: always show the trigger button
const showDropdownTrigger = computed(() => {
  return isDropdownMode.value || overflowActions.value.length > 0;
});

// Use floating-ui for dropdown positioning
const { floatingStyle } = useFloatingPosition(referenceRef, floatingRef, {
  placement: "bottom-end",
  middleware: () => [offset(4), flip(), shift({ padding: 8 })],
});

// Close dropdown when visibility changes (only in inline mode and if dropdown is NOT open)
watch(isActionsVisible, (newValue) => {
  if (!newValue && !isDropdownMode.value && !isOpen.value) {
    isBackdropVisible.value = false;
    isOpen.value = false;
  }
});

const toggleDropdown = async () => {
  if (isOpen.value) {
    // Closing
    isBackdropVisible.value = false;
    isOpen.value = false;
  } else {
    // Opening: show dropdown first, then backdrop after next tick
    isOpen.value = true;
    await nextTick();
    isBackdropVisible.value = true;
  }
};

const closeDropdown = () => {
  isBackdropVisible.value = false;
  isOpen.value = false;
  // Return focus to trigger button
  nextTick(() => {
    triggerBtnRef.value?.focus();
  });
};

const handleActionClick = (action: TableAction) => {
  if (!action.disabled) {
    emit("action", action);
    // Note: clickHandler is NOT called here because TableRowActions lacks item/index context.
    // VcDataTable's handleRowAction calls clickHandler(item, index) with proper arguments.
    closeDropdown();
  }
};

/** Focus first enabled menu item in the dropdown */
const focusFirstItem = () => {
  nextTick(() => {
    const items = floatingRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled])');
    items?.[0]?.focus();
  });
};

/** Open dropdown and focus first item (triggered by ArrowDown on trigger) */
const openAndFocusFirst = async () => {
  if (!isOpen.value) {
    isOpen.value = true;
    await nextTick();
    isBackdropVisible.value = true;
  }
  focusFirstItem();
};

/** Arrow key navigation within dropdown menu */
const handleDropdownKeydown = (event: KeyboardEvent) => {
  const items = Array.from(
    floatingRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled])') || [],
  );
  if (!items.length) return;

  const currentIndex = items.indexOf(document.activeElement as HTMLElement);

  if (event.key === "ArrowDown") {
    event.preventDefault();
    const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    items[next]?.focus();
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    items[prev]?.focus();
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeDropdown();
  } else if (event.key === "Tab") {
    // Tab should close the menu (standard menu pattern)
    closeDropdown();
  }
};

// Close on escape key (document-level fallback for when focus is outside dropdown)
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape" && isOpen.value) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style lang="scss">
.vc-table-row-actions {
  @apply tw-absolute tw-flex tw-right-0 tw-px-2 tw-items-center tw-gap-1;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: -8px 0 8px rgba(255, 255, 255, 0.9);
  z-index: 10;

  // Selected row: match selected background (class toggle, no timing issue)
  .vc-table-composition__row--selected & {
    background: var(--table-row-bg-selected);
    box-shadow: -8px 0 8px var(--table-row-bg-selected);
  }

  // Hovered clickable row: animate bg in sync with row's tw-transition-colors (150ms).
  // CSS animation (not transition) is needed because v-show toggles display:none,
  // which prevents transitions from having a "from" state.
  .vc-table-composition__row--clickable:hover & {
    animation: row-actions-bg-to-hover 150ms ease forwards;
  }
  pointer-events: auto;
  top: 50%;
  transform: translateY(-50%);

  // Dropdown mode: static positioning, always visible
  &--dropdown-mode {
    @apply tw-relative tw-px-0;
    background: transparent;
    box-shadow: none;
    top: auto;
    transform: none;
  }

  &__action {
    @apply tw-flex-shrink-0;
  }

  &__btn {
    @apply tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded tw-cursor-pointer tw-transition-colors;
    @apply tw-border-0 tw-bg-transparent;
    color: var(--table-actions-icon-color, var(--primary-500));

    &:hover:not(&--disabled) {
      background-color: var(--table-actions-bg, var(--primary-100));
      color: var(--table-actions-icon-color-hover, var(--primary-600));
    }

    &:focus-visible {
      @apply tw-outline-none tw-ring-2 tw-ring-primary-500 tw-ring-offset-1;
    }

    &--disabled {
      @apply tw-opacity-30 tw-cursor-not-allowed;
    }

    &--danger {
      color: var(--table-actions-color-danger, var(--danger-500));

      &:hover:not(.vc-table-row-actions__btn--disabled) {
        background-color: rgba(220, 38, 38, 0.1);
        color: var(--danger-600);
      }
    }

    &--more {
      color: var(--neutrals-500);
    }
  }

  &__overflow {
    @apply tw-relative tw-flex tw-items-center;
  }

  &__backdrop {
    @apply tw-fixed tw-inset-0;
    z-index: 999;
  }

  &__dropdown {
    @apply tw-bg-additional-50 tw-rounded-lg tw-shadow-lg tw-border tw-border-neutrals-200;
    @apply tw-py-1 tw-min-w-[160px];
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
  }

  &__dropdown-item {
    @apply tw-flex tw-items-center tw-gap-3 tw-px-3 tw-py-2 tw-cursor-pointer tw-transition-colors;
    @apply tw-text-sm;
    color: var(--neutrals-900);

    &:hover:not(&--disabled) {
      background-color: var(--neutrals-100);
    }

    &:focus-visible {
      @apply tw-outline-none;
      background-color: var(--neutrals-100);
    }

    &--disabled {
      @apply tw-opacity-50 tw-cursor-not-allowed;
    }

    &--danger {
      color: var(--table-actions-color-danger, var(--danger-500));

      &:hover:not(.vc-table-row-actions__dropdown-item--disabled) {
        background-color: rgba(220, 38, 38, 0.1);
      }
    }
  }

  &__dropdown-icon {
    @apply tw-flex-shrink-0;
  }

  &__dropdown-text {
    @apply tw-flex-1;
  }
}

// Dropdown animation
.dropdown-enter-active {
  transition:
    opacity 150ms ease-out,
    transform 150ms ease-out;
}

.dropdown-leave-active {
  transition:
    opacity 100ms ease-in,
    transform 100ms ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

// Syncs row-actions bg with row hover transition (150ms ease from tw-transition-colors).
// Animation works despite v-show (display:none→flex) because keyframes define their own "from" state.
@keyframes row-actions-bg-to-hover {
  from {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: -8px 0 8px rgba(255, 255, 255, 0.9);
  }
  to {
    background: var(--table-row-bg-hover);
    box-shadow: -8px 0 8px var(--table-row-bg-hover);
  }
}
</style>
