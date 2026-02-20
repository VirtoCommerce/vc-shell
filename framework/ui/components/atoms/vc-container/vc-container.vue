<template>
  <component
    :is="ariaLabel ? 'section' : 'div'"
    :class="[
      'vc-container',
      {
        'vc-container_shadow': shadow && scroll,
        'vc-container_nopadding': noPadding,
      },
    ]"
    :aria-label="ariaLabel"
  >
    <div
      ref="component"
      class="vc-container__inner"
      @scroll="onScroll"
    >
      <slot></slot>
    </div>
  </component>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useResizeObserver } from "@vueuse/core";

export interface Props {
  shadow?: boolean;
  noPadding?: boolean;
  /** When provided, renders as <section> with this label instead of <div> */
  ariaLabel?: string;
}

export interface Emits {
  (event: "scroll", e: Event): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

const component = ref<HTMLElement>();
const scroll = ref(false);

const scrollTop = () => {
  if (component.value) {
    component.value.scroll(0, 0);
  }
};

function onScroll(e: Event) {
  emit("scroll", e);
}

useResizeObserver(component, () => {
  scroll.value = !!(component.value && component.value.clientHeight < component.value.scrollHeight);
});

defineExpose({
  scrollTop,
  component,
});
</script>

<style lang="scss">
:root {
  --container-padding: 16px;
  --container-gap: 0;
  --container-bg: transparent;
  --container-border-radius: 0;
  --container-shadow-color: var(--additional-950);
  --container-shadow-opacity: 0.1;
  --container-shadow: 0 3px 2px rgba(var(--container-shadow-color), var(--container-shadow-opacity)) inset;
}

.vc-container {
  @apply tw-w-full tw-h-full tw-overflow-hidden tw-box-border tw-flex tw-flex-col tw-relative;
  background-color: var(--container-bg);
  border-radius: var(--container-border-radius);
  gap: var(--container-gap);

  &_shadow {
    @apply tw-shadow-[--container-shadow];
  }

  &__inner {
    @apply tw-relative tw-overflow-y-auto tw-overflow-x-hidden
    tw-flex-1;
    padding: var(--container-padding);
  }

  &_nopadding &__inner {
    padding: 0;
  }
}
</style>
