<template>
  <div
    :class="[
      'vc-container',
      {
        'vc-container_shadow': shadow && scroll,
        'vc-container_nopadding': noPadding,
      },
    ]"
  >
    <div
      ref="component"
      class="vc-container__inner"
      @scroll="onScroll"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

export interface Props {
  shadow?: boolean;
  noPadding?: boolean;
}

export interface Emits {
  (event: "scroll", e: Event): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

const component = ref<HTMLElement>();
const scroll = ref(false);

let resizeObserver: ResizeObserver | null = null;

const scrollTop = () => {
  if (component.value) {
    component.value.scroll(0, 0);
  }
};

function onScroll(e: Event) {
  emit("scroll", e);
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    scroll.value = (component.value && component.value.clientHeight < component.value.scrollHeight) as boolean;
  });

  if (component.value) {
    resizeObserver.observe(component.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});

defineExpose({
  scrollTop,
  component,
});
</script>

<style lang="scss">
:root {
  --container-padding: 16px;
  --container-shadow-color: var(--additional-950);
  --container-shadow-opacity: 0.1;
  --container-shadow: 0 3px 2px rgba(var(--container-shadow-color), var(--container-shadow-opacity)) inset;
}

.vc-container {
  @apply tw-w-full tw-h-full tw-overflow-hidden tw-box-border tw-flex tw-flex-col tw-relative;

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
