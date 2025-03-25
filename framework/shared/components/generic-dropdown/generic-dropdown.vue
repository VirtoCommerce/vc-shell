<template>
  <div class="vc-dropdown">
    <div
      ref="referenceEl"
      class="vc-dropdown__trigger"
    >
      <slot
        name="trigger"
        :is-active="opened"
      ></slot>
    </div>

    <teleport
      to="body"
      :disabled="!floating"
    >
      <div
        v-if="opened"
        ref="floatingEl"
        v-on-click-outside="[() => $emit('update:opened', false), { ignore: [referenceEl] }]"
        class="vc-dropdown__dropdown"
        :class="dropdownClasses"
        :style="floatingStyle"
      >
        <VcContainer
          :no-padding="true"
          @click.stop
        >
          <VcCol v-if="items && items.length">
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
          </VcCol>
          <div
            v-else
            class="vc-dropdown__empty"
          >
            <slot name="empty">
              {{ emptyText }}
            </slot>
          </div>
        </VcContainer>
      </div>
    </teleport>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T">
import { VcCol, VcContainer } from "../../../ui/components";
import { ref, computed, Ref, inject } from "vue";
import { useFloating, shift, autoUpdate } from "@floating-ui/vue";
import { vOnClickOutside } from "@vueuse/components";

export interface Props<T> {
  opened?: boolean;
  items: T[];
  emptyText?: string;
  itemText?: (item: T) => string;
  isItemActive?: (item: T) => boolean;
  floating?: boolean;
  placement?: "bottom" | "bottom-end" | "bottom-start" | "top" | "top-end" | "top-start";
  variant?: "default" | "light";
}

const props = withDefaults(defineProps<Props<T>>(), {
  opened: true,
  items: () => [],
  floating: false,
  placement: "bottom",
  variant: "default",
});

defineEmits<{
  (e: "item-click", item: T): void;
  (e: "update:opened", opened: boolean): void;
}>();

defineSlots<{
  item: (args: { item: T; click: () => void }) => any;
  empty: () => any;
  trigger: (args: { isActive: boolean }) => any;
}>();

const isMobile = inject("isMobile") as Ref<boolean>;

const referenceEl = ref<HTMLElement | null>(null);
const floatingEl = ref<HTMLElement | null>(null);

const floater = useFloating(referenceEl, floatingEl, {
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  middleware: [shift({ mainAxis: false })],
});

const dropdownClasses = computed(() => {
  const placement = floater.placement.value;
  return [
    {
      "vc-dropdown__dropdown--mobile": isMobile.value,
      "vc-dropdown__dropdown--floating": props.floating,
      "vc-dropdown__dropdown--top": placement?.startsWith("top"),
    },
    `vc-dropdown__dropdown--${props.variant}`,
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
    @apply tw-rounded-[6px] tw-w-full tw-overflow-hidden tw-flex tw-flex-col tw-relative tw-h-max;

    &--top {
      @apply tw-rounded-t-[6px] tw-rounded-b-none;
    }

    &:not(&--top) {
      @apply tw-rounded-t-none tw-rounded-b-[6px];
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

    &--light {
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

  &__item {
    @apply tw-truncate tw-flex tw-items-center tw-p-3 tw-text-sm tw-text-[color:var(--dropdown-text-color)] tw-w-full tw-cursor-pointer tw-border-solid tw-border-b;
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
