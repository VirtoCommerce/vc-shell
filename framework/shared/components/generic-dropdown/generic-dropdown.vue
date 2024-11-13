<template>
  <div
    ref="referenceEl"
    class="vc-dropdown-wrapper"
  >
    <slot name="trigger"></slot>

    <teleport
      to="body"
      :disabled="!floating"
    >
      <div
        v-if="opened"
        ref="floatingEl"
        v-on-click-outside="[() => $emit('update:opened', false), { ignore: [referenceEl] }]"
        class="vc-dropdown"
        :class="{
          'vc-dropdown--mobile': $isMobile.value,
          'vc-dropdown--floating': floating,
        }"
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
              @click="() => onItemClick?.(item)"
            >
              <slot
                name="item"
                :item="item"
                :click="() => onItemClick?.(item)"
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
import { ref, computed } from "vue";
import { useFloating, shift, autoUpdate } from "@floating-ui/vue";
import { vOnClickOutside } from "@vueuse/components";

interface Props {
  opened: boolean;
  items: T[];
  emptyText?: string;
  itemText?: (item: T) => string;
  isItemActive?: (item: T) => boolean;
  onItemClick?: (item: T) => void;
  floating?: boolean;
  placement?: "bottom" | "bottom-end" | "bottom-start";
}

const props = withDefaults(defineProps<Props>(), {
  opened: false,
  items: () => [],
  floating: false,
  placement: "bottom",
});

defineEmits<{
  (e: "item:click", item: T): void;
  (e: "update:opened", opened: boolean): void;
}>();

defineSlots<{
  item: (args: { item: T; click: () => void }) => any;
  empty: () => any;
  trigger: void;
}>();

const referenceEl = ref<HTMLElement | null>(null);
const floatingEl = ref<HTMLElement | null>(null);

const floater = useFloating(referenceEl, floatingEl, {
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  middleware: [shift({ mainAxis: false })],
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
  --dropdown-text-color: var(--base-text-color, var(--neutrals-950));
  --dropdown-border-color: var(--app-bar-divider-color);
  --dropdown-hover-bg-color: var(--primary-50);
  --dropdown-divider-color: var(--base-border-color, var(--neutrals-200));
  --dropdown-divider-item-color: var(--neutrals-100);
}

.vc-dropdown {
  @apply tw-bg-[color:var(--dropdown-bg-color)] tw-rounded-b-[6px] tw-w-full
    tw-max-h-[350px] tw-overflow-hidden tw-flex tw-flex-col tw-relative;

  &--mobile {
    @apply tw-max-h-full tw-w-full;
    display: flex !important;
  }

  &--floating {
    box-shadow: var(--dropdown-shadow, 0 4px 6px -1px rgb(0 0 0 / 0.1));
  }

  &__item {
    @apply tw-truncate tw-flex tw-items-center tw-p-3 tw-text-sm tw-text-[color:var(--dropdown-text-color)] tw-w-full tw-cursor-pointer tw-border-solid tw-border-b tw-border-b-[color:var(--dropdown-divider-item-color)];
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

.vc-dropdown-wrapper {
  @apply tw-relative tw-flex tw-w-full;
}
</style>
