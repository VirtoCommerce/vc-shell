<template>
  <div
    class="vc-scrollable-container"
    role="region"
    aria-label="Scrollable content"
  >
    <div
      class="vc-scrollable-container__arrow"
      :class="{ 'vc-scrollable-container__arrow--hidden': !canScrollUp }"
      aria-hidden="true"
      @pointerenter="startScroll('up')"
      @pointerleave="stopScroll"
    >
      <slot name="arrow-up">
        <VcIcon
          icon="lucide-chevron-up"
          size="xs"
        />
      </slot>
    </div>

    <div
      ref="viewportRef"
      class="vc-scrollable-container__viewport"
      tabindex="0"
      @scroll="updateScrollState"
      @keydown.up.prevent="scrollByKey('up')"
      @keydown.down.prevent="scrollByKey('down')"
    >
      <slot />
    </div>

    <div
      class="vc-scrollable-container__arrow"
      :class="{ 'vc-scrollable-container__arrow--hidden': !canScrollDown }"
      aria-hidden="true"
      @pointerenter="startScroll('down')"
      @pointerleave="stopScroll"
    >
      <slot name="arrow-down">
        <VcIcon
          icon="lucide-chevron-down"
          size="xs"
        />
      </slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VcIcon } from "@ui/components/atoms/vc-icon";
import { useScrollArrows, type UseScrollArrowsOptions } from "@ui/composables";

const props = withDefaults(
  defineProps<{
    speed?: number;
  }>(),
  {
    speed: undefined,
  },
);

const viewportRef = ref<HTMLElement | null>(null);

const options: UseScrollArrowsOptions = {};
if (props.speed !== undefined) {
  options.speed = props.speed;
}

const SCROLL_STEP = 40;

const { canScrollUp, canScrollDown, startScroll, stopScroll, updateScrollState } =
  useScrollArrows(viewportRef, options);

function scrollByKey(direction: "up" | "down") {
  if (!viewportRef.value) return;
  const delta = direction === "up" ? -SCROLL_STEP : SCROLL_STEP;
  viewportRef.value.scrollBy({ top: delta, behavior: "smooth" });
}

defineExpose({
  viewportRef,
  updateScrollState,
});
</script>

<style lang="scss">
:root {
  --scroll-arrow-size: 16px;
  --scroll-arrow-color: var(--neutrals-400);
}

.vc-scrollable-container {
  @apply tw-flex tw-flex-col tw-min-h-0;

  &__arrow {
    @apply tw-flex tw-items-center tw-justify-center tw-py-1
      tw-cursor-default tw-shrink-0
      tw-transition-opacity tw-duration-150;
    color: var(--scroll-arrow-color);
    font-size: var(--scroll-arrow-size);

    &--hidden {
      @apply tw-opacity-0 tw-pointer-events-none;
    }
  }

  &__viewport {
    @apply tw-flex-grow tw-overflow-auto tw-min-h-0;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
}
</style>
