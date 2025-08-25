<template>
  <div class="vc-dropdown">
    <div
      v-if="$slots.trigger"
      ref="referenceEl"
      class="vc-dropdown__trigger"
    >
      <slot
        name="trigger"
        :is-active="opened"
      ></slot>
    </div>

    <teleport
      to=".vc-app"
      defer
      :disabled="!floating"
    >
      <div
        v-if="opened"
        ref="floatingEl"
        v-on-click-outside="[() => $emit('update:opened', false), { ignore: [referenceEl] }]"
        class="vc-dropdown__dropdown"
        :style="{
          maxHeight: calcHeight,
          ...floatingStyle,
        }"
        :class="dropdownClasses"
      >
        <div class="vc-dropdown__content">
          <slot
            name="items-container"
            :items="items"
            :close="() => $emit('update:opened', false)"
          >
            <div
              v-if="items && items.length"
              class="vc-dropdown__items-container"
            >
              <div
                v-for="(item, index) in items"
                :key="index"
                class="vc-dropdown__item"
                :class="{
                  'vc-dropdown__item--mobile': $isMobile.value,
                  'vc-dropdown__item--active': isItemActive?.(item),
                }"
                @click="() => $emit('item-click', item)"
              >
                <slot
                  name="item"
                  :item="item"
                  :click="() => $emit('item-click', item)"
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
    </teleport>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T">
import { ref, computed, Ref, inject } from "vue";
import { useFloating, shift, autoUpdate, offset as floatingOffset, flip } from "@floating-ui/vue";
import { vOnClickOutside } from "@vueuse/components";

export interface Props<T> {
  opened?: boolean;
  items: T[];
  emptyText?: string;
  itemText?: (item: T) => string;
  isItemActive?: (item: T) => boolean;
  floating?: boolean;
  placement?: "bottom" | "bottom-end" | "bottom-start" | "top" | "top-end" | "top-start";
  variant?: "default" | "secondary";
  offset?: {
    mainAxis?: number;
    crossAxis?: number;
  };
  maxHeight?: number | string;
}

const props = withDefaults(defineProps<Props<T>>(), {
  opened: false,
  items: () => [],
  floating: false,
  placement: "bottom",
  variant: "default",
  maxHeight: 300,
  offset: () => ({
    mainAxis: 0,
    crossAxis: 0,
  }),
});

defineEmits<{
  (e: "item-click", item: T): void;
  (e: "update:opened", opened: boolean): void;
}>();

defineSlots<{
  item?: (args: { item: T; click: () => void }) => any;
  empty?: () => any;
  trigger?: (args: { isActive: boolean }) => any;
  "items-container"?: (args: { items: T[]; close: () => void }) => any;
}>();

const isMobile = inject<Ref<boolean>>("isMobile", ref(false));

const referenceEl = ref<HTMLElement | null>(null);
const floatingEl = ref<HTMLElement | null>(null);

const { floatingStyles, placement, update, x, y } = useFloating(referenceEl, floatingEl, {
  placement: props.placement,
  whileElementsMounted: props.floating ? autoUpdate : undefined,
  middleware: [shift({ padding: 8 }), flip({ padding: 8 }), floatingOffset(props.offset)],
});

const floater = {
  placement,
  x,
  y,
};

const dropdownClasses = computed(() => {
  const placement = floater.placement.value;
  return [
    {
      "vc-dropdown__dropdown--mobile": isMobile.value,
      "vc-dropdown__dropdown--floating": props.floating,
    },
    `vc-dropdown__dropdown--${props.variant}`,
    `vc-dropdown__dropdown--${placement}`,
  ];
});

const floatingStyle = computed(() => {
  if (!props.floating) return {};

  return {
    position: "absolute" as const,
    top: `${floater.y.value ?? 0}px`,
    left: `${floater.x.value ?? 0}px`,
    zIndex: 10000,
    width: "max-content",
  };
});

const calcHeight = computed(() => {
  if (!props.maxHeight) return "";
  return typeof props.maxHeight === "number" ? `${props.maxHeight}px` : props.maxHeight;
});
</script>

<style lang="scss">
:root {
  --dropdown-bg-color: var(--neutrals-50);
  --dropdown-text-color: var(--neutrals-950);
  --dropdown-border-color: var(--app-bar-divider-color);
  --dropdown-hover-bg-color: var(--primary-50);
  --dropdown-divider-color: var(--neutrals-200);
  --dropdown-divider-item-color: var(--neutrals-100);

  --dropdown-bg-color-light: var(--additional-50);
  --dropdown-divider-item-color-light: var(--neutrals-200);
}

.vc-dropdown {
  @apply tw-relative tw-flex tw-w-full tw-h-full;

  &__trigger {
    @apply tw-flex tw-items-center tw-justify-center;
  }

  &__dropdown {
    @apply tw-rounded-[6px] tw-w-full tw-overflow-auto tw-flex tw-flex-col tw-relative;

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
      @apply tw-bg-[color:var(--dropdown-bg-color-light)];

      .vc-dropdown__item {
        @apply tw-border-b-[color:var(--dropdown-divider-item-color-light)];
      }
    }

    &--default {
      @apply tw-bg-[color:var(--dropdown-bg-color)];
      .vc-dropdown__item {
        @apply tw-border-b-[color:var(--dropdown-divider-item-color)];
      }
    }
  }

  &__content {
    @apply tw-w-full tw-h-full;
  }

  &__items-container {
    @apply tw-overflow-y-auto;
    // max-height: v-bind('typeof props.maxHeight === "number" ? `${props.maxHeight}px` : props.maxHeight');
  }

  &__item {
    @apply tw-truncate tw-flex tw-items-center tw-text-sm tw-text-[color:var(--dropdown-text-color)] tw-w-full tw-cursor-pointer tw-border-solid tw-border-b;
    transition: background-color 0.2s;

    &:last-of-type {
      @apply tw-border-b-0;
    }

    &:hover {
      background-color: var(--dropdown-hover-bg-color);
    }

    &--active {
      @apply tw-bg-[color:var(--dropdown-hover-bg-color)];
    }

    &--mobile:not(:last-of-type) {
      @apply tw-border-solid tw-border-b tw-border-b-[color:var(--dropdown-divider-color)];
    }
  }

  &__empty {
    @apply tw-flex tw-justify-center tw-items-center tw-p-4 tw-text-sm;
  }
}
</style>
