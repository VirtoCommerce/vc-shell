<template>
  <div :class="['vc-container', { 'vc-container_shadow': shadow && scroll }]">
    <div ref="component" class="vc-container__inner">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";

export default defineComponent({
  name: "VcContainer",

  props: {
    shadow: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const component = ref<HTMLElement | null>(null);
    const scroll = ref(false);

    onMounted(() => {
      const observer = new ResizeObserver(() => {
        if (
          component.value &&
          component.value.clientHeight < component.value.scrollHeight
        ) {
          scroll.value = true;
        } else {
          scroll.value = false;
        }
      });

      if (component.value) {
        observer.observe(component.value);
      }
    });

    return {
      scroll,
      component,
    };
  },
});
</script>

<style lang="less">
:root {
  --container-scroll-color: #e1eff9;
  --container-scroll-color-hover: #cce4f5;
  --container-scroll-width: 8px;
  --container-scroll-padding: 8px;
  --container-scroll-shadow: 0 3px 2px rgba(0, 0, 0, 0.1) inset,
    0 -3px 2px rgba(0, 0, 0, 0.1) inset;
}

.vc-container {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  box-sizing: border-box;
  display: flex;

  &_shadow {
    box-shadow: var(--container-scroll-shadow);
  }

  &__inner {
    overflow-y: auto;
    flex: 1;
    padding: var(--container-scroll-padding);
    scrollbar-color: var(--container-scroll-color);
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: var(--container-scroll-width);
      background: transparent;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--container-scroll-color);
      border-radius: calc(var(--container-scroll-width) / 2);
      overflow: hidden;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--container-scroll-color-hover);
    }
  }
}
</style>
