<template>
  <div class="vc-dropdown">
    <div
      v-if="$slots.trigger"
      ref="referenceEl"
      class="vc-dropdown__trigger"
      role="button"
      tabindex="0"
      :aria-controls="panelId"
      :aria-expanded="isOpen"
      :aria-haspopup="role"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <slot
        name="trigger"
        :is-active="isOpen"
        :toggle="toggle"
        :open="open"
        :close="close"
      />
    </div>

    <Teleport
      :to="teleportTarget"
      defer
      :disabled="!shouldTeleport"
    >
      <div
        v-if="isOpen"
        :id="panelId"
        ref="floatingEl"
        v-on-click-outside="outsideClickBinding"
        class="vc-dropdown__dropdown"
        :style="{
          maxHeight: normalizedMaxHeight,
          ...panelStyle,
        }"
        :class="panelClasses"
        :role="role"
        :aria-activedescendant="activeDescendantId"
        tabindex="-1"
        @keydown="onPanelKeydown"
      >
        <div class="vc-dropdown__content">
          <slot
            name="items-container"
            :items="items"
            :close="close"
          >
            <div
              v-if="items.length"
              class="vc-dropdown__items-container"
            >
              <div
                v-for="(item, index) in items"
                :id="itemId(index)"
                :key="itemKey(item, index)"
                class="vc-dropdown__item"
                :class="{
                  'vc-dropdown__item--mobile': isMobile,
                  'vc-dropdown__item--active': isItemActive?.(item),
                  'vc-dropdown__item--focused': focusedIndex === index,
                }"
                :role="itemRole"
                :aria-selected="role === 'listbox' ? !!isItemActive?.(item) : undefined"
                @click="selectItem(item, index)"
              >
                <slot
                  name="item"
                  :item="item"
                  :click="() => selectItem(item, index)"
                >
                  {{ itemText?.(item) }}
                </slot>
              </div>
            </div>
            <div
              v-else
              class="vc-dropdown__empty"
            >
              <slot name="empty">
                {{ emptyText }}
              </slot>
            </div>
          </slot>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup generic="T">
import { computed, getCurrentInstance, inject, nextTick, onBeforeUnmount, ref, watch, type Ref } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { useFloatingPosition, type FloatingOffset, useTeleportTarget } from "../../../composables";
import type { Placement } from "@floating-ui/vue";

export type DropdownRole = "menu" | "listbox";
export type DropdownCloseReason = "outside" | "escape" | "action";

export interface Props<T> {
  modelValue?: boolean;
  items?: T[];
  emptyText?: string;
  itemText?: (item: T) => string;
  isItemActive?: (item: T) => boolean;
  itemKey?: (item: T, index: number) => string | number;
  floating?: boolean;
  teleport?: boolean;
  teleportTo?: string | HTMLElement;
  placement?: Placement;
  variant?: "default" | "secondary";
  offset?: FloatingOffset;
  maxHeight?: number | string;
  role?: DropdownRole;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  closeOnSelect?: boolean;
  autoFocusPanel?: boolean;
  zIndex?: number;
}

const props = withDefaults(defineProps<Props<T>>(), {
  modelValue: false,
  items: () => [],
  emptyText: "",
  floating: false,
  placement: "bottom",
  variant: "default",
  maxHeight: 300,
  offset: () => ({
    mainAxis: 0,
    crossAxis: 0,
  }),
  role: "menu",
  closeOnClickOutside: true,
  closeOnEscape: true,
  closeOnSelect: false,
  autoFocusPanel: true,
  zIndex: 10000,
});

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
  (event: "item-click", item: T): void;
  (event: "open"): void;
  (event: "close", reason: DropdownCloseReason): void;
}>();

defineSlots<{
  item?: (args: { item: T; click: () => void }) => unknown;
  empty?: () => unknown;
  trigger?: (args: { isActive: boolean; toggle: () => void; open: () => void; close: () => void }) => unknown;
  "items-container"?: (args: { items: T[]; close: () => void }) => unknown;
}>();

const instance = getCurrentInstance();
const uid = instance?.uid ?? Math.round(Math.random() * 10_000);
const panelId = `vc-dropdown-${uid}`;

const isMobile = inject<Ref<boolean>>("isMobile", ref(false));

const referenceEl = ref<HTMLElement | null>(null);
const floatingEl = ref<HTMLElement | null>(null);
const focusedIndex = ref(-1);

const { teleportTarget } = useTeleportTarget({
  to: computed(() => props.teleportTo),
});

const shouldTeleport = computed(() => props.teleport ?? props.floating);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit("update:modelValue", value),
});

const { x, y, resolvedPlacement, resolvedStrategy } = useFloatingPosition(referenceEl, floatingEl, {
  placement: computed(() => props.placement),
  strategy: computed(() => (props.floating ? "fixed" : "absolute")),
  offset: computed(() => props.offset),
  autoUpdate: computed(() => props.floating),
});

const panelClasses = computed(() => [
  {
    "vc-dropdown__dropdown--mobile": isMobile.value,
    "vc-dropdown__dropdown--floating": props.floating,
  },
  `vc-dropdown__dropdown--${props.variant}`,
  `vc-dropdown__dropdown--${resolvedPlacement.value}`,
]);

const panelStyle = computed(() => {
  if (!props.floating) {
    return {};
  }

  return {
    position: resolvedStrategy.value as "fixed" | "absolute",
    top: `${y.value ?? 0}px`,
    left: `${x.value ?? 0}px`,
    zIndex: props.zIndex,
    width: "max-content",
  };
});

const normalizedMaxHeight = computed(() => {
  if (!props.maxHeight) {
    return "";
  }

  return typeof props.maxHeight === "number" ? `${props.maxHeight}px` : props.maxHeight;
});

const itemRole = computed(() => (props.role === "listbox" ? "option" : "menuitem"));

const activeDescendantId = computed(() => {
  if (focusedIndex.value < 0 || focusedIndex.value >= props.items.length) {
    return undefined;
  }

  return itemId(focusedIndex.value);
});

const outsideClickBinding: [() => void, { ignore: Array<Ref<HTMLElement | null>> }] = [
  () => {
    if (props.closeOnClickOutside) {
      closeByReason("outside");
    }
  },
  { ignore: [referenceEl] },
];

function syncFocusedIndex() {
  if (!props.items.length) {
    focusedIndex.value = -1;
    return;
  }

  const activeIndex = props.isItemActive ? props.items.findIndex((item) => props.isItemActive?.(item)) : -1;
  focusedIndex.value = activeIndex >= 0 ? activeIndex : 0;
}

function itemId(index: number) {
  return `${panelId}-item-${index}`;
}

function itemKey(item: T, index: number) {
  return props.itemKey ? props.itemKey(item, index) : index;
}

function open() {
  if (isOpen.value) {
    return;
  }

  isOpen.value = true;
  emit("open");
}

function close() {
  closeByReason("action");
}

function closeByReason(reason: DropdownCloseReason) {
  if (!isOpen.value) {
    return;
  }

  isOpen.value = false;
  emit("close", reason);
}

function toggle() {
  if (isOpen.value) {
    closeByReason("action");
  } else {
    open();
  }
}

function selectItem(item: T, index: number) {
  focusedIndex.value = index;
  emit("item-click", item);

  if (props.closeOnSelect) {
    closeByReason("action");
  }
}

function moveFocus(nextIndex: number) {
  const total = props.items.length;

  if (!total) {
    focusedIndex.value = -1;
    return;
  }

  const normalizedIndex = ((nextIndex % total) + total) % total;
  focusedIndex.value = normalizedIndex;
}

function onPanelKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    return;
  }

  switch (event.key) {
    case "ArrowDown": {
      event.preventDefault();
      moveFocus(focusedIndex.value + 1);
      break;
    }
    case "ArrowUp": {
      event.preventDefault();
      moveFocus(focusedIndex.value - 1);
      break;
    }
    case "Home": {
      event.preventDefault();
      moveFocus(0);
      break;
    }
    case "End": {
      event.preventDefault();
      moveFocus(props.items.length - 1);
      break;
    }
    case "Enter":
    case " ": {
      if (focusedIndex.value < 0 || focusedIndex.value >= props.items.length) {
        return;
      }

      event.preventDefault();
      selectItem(props.items[focusedIndex.value], focusedIndex.value);
      break;
    }
    case "Escape": {
      if (!props.closeOnEscape) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      closeByReason("escape");
      break;
    }
    default:
      break;
  }
}

function onDocumentEscapeKeydown(event: KeyboardEvent) {
  if (!props.closeOnEscape || !isOpen.value || event.key !== "Escape") {
    return;
  }

  closeByReason("escape");
}

watch(
  () => isOpen.value,
  async (opened) => {
    // Always remove first to prevent accumulation
    document.removeEventListener("keydown", onDocumentEscapeKeydown);

    if (opened) {
      syncFocusedIndex();

      if (props.closeOnEscape) {
        document.addEventListener("keydown", onDocumentEscapeKeydown);
      }

      if (props.autoFocusPanel) {
        await nextTick();
        floatingEl.value?.focus();
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.items,
  () => {
    if (isOpen.value) {
      syncFocusedIndex();
    }
  },
  { deep: true },
);

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onDocumentEscapeKeydown);
});
</script>

<style lang="scss">
.vc-dropdown {
  --vc-dropdown-bg-color: var(--neutrals-50);
  --vc-dropdown-text-color: var(--neutrals-950);
  --vc-dropdown-hover-bg-color: var(--primary-50);
  --vc-dropdown-divider-color: var(--neutrals-200);
  --vc-dropdown-divider-item-color: var(--neutrals-100);
  --vc-dropdown-bg-color-light: var(--additional-50);
  --vc-dropdown-divider-item-color-light: var(--neutrals-200);

  @apply tw-relative tw-flex tw-w-full tw-h-full;

  &__trigger {
    @apply tw-flex tw-items-center tw-justify-center;

    &:focus-visible {
      @apply tw-outline-none tw-ring-2 tw-ring-[color:var(--primary-500)] tw-ring-offset-1;
    }
  }

  &__dropdown {
    @apply tw-rounded-[6px] tw-w-full tw-overflow-auto tw-flex tw-flex-col tw-relative;

    &:focus {
      outline: none;
    }

    &--mobile {
      @apply tw-w-full;
      display: flex !important;
    }

    &--floating {
      box-shadow:
        0px 2px 10px 0px rgb(0 0 0 / 0.1),
        0px 14px 25px -5px rgb(0 0 0 / 0.1);
    }

    &--secondary {
      @apply tw-bg-[color:var(--vc-dropdown-bg-color-light)];

      .vc-dropdown__item {
        @apply tw-border-b-[color:var(--vc-dropdown-divider-item-color-light)];
      }
    }

    &--default {
      @apply tw-bg-[color:var(--vc-dropdown-bg-color)];

      .vc-dropdown__item {
        @apply tw-border-b-[color:var(--vc-dropdown-divider-item-color)];
      }
    }
  }

  &__content {
    @apply tw-w-full tw-h-full;
  }

  &__items-container {
    @apply tw-overflow-y-auto;
  }

  &__item {
    @apply tw-truncate tw-flex tw-items-center tw-text-sm tw-text-[color:var(--vc-dropdown-text-color)] tw-w-full tw-cursor-pointer tw-border-solid tw-border-b;
    transition: background-color 0.2s;

    &:last-of-type {
      @apply tw-border-b-0;
    }

    &:hover {
      background-color: var(--vc-dropdown-hover-bg-color);
    }

    &--active,
    &--focused {
      @apply tw-bg-[color:var(--vc-dropdown-hover-bg-color)];
    }

    &--mobile:not(:last-of-type) {
      @apply tw-border-solid tw-border-b tw-border-b-[color:var(--vc-dropdown-divider-color)];
    }
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-items-center tw-p-4 tw-text-sm;
  }
}
</style>
