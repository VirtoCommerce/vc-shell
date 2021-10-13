<template>
  <div
    :class="[
      'vc-container',
      {
        'vc-container_shadow': shadow && scroll,
        'vc-container_nopadding': noPadding,
      },
    ]"
    @touchstart="touchStart"
    @touchmove="touchMove"
    @touchend="touchEnd"
    @touchcancel="touchCancel"
  >
    <div ref="component" class="vc-container__inner">
      <div
        class="vc-container__overscroll"
        :class="{ 'vc-container__overscroll_passed': isThresholdPassed }"
        v-if="isOverscrollVisible"
        :style="`height: ${offsetY}px`"
      >
        <vc-icon
          icon="fas fa-spinner"
          size="l"
          class="vc-container__overscroll-icon"
        ></vc-icon>
      </div>
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

    noPadding: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["scroll:ptr", "scroll:infinite"],

  setup(_props, { emit }) {
    const component = ref<HTMLElement | null>(null);
    const scroll = ref(false);
    const isOverscrollVisible = ref(false);
    const isThresholdPassed = ref(false);
    const startY = ref(0);
    const offsetY = ref(0);

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

    const scrollTop = () => {
      if (component.value) {
        component.value.scroll(0, 0);
      }
    };

    return {
      scroll,
      component,
      scrollTop,
      isOverscrollVisible,
      isThresholdPassed,
      offsetY,

      touchStart(e: TouchEvent): void {
        startY.value = e.touches[0].clientY;
      },

      touchMove(e: TouchEvent): void {
        const delta = startY.value - e.touches[0].clientY;
        if (delta < 0 && delta > -50 && component.value?.scrollTop === 0) {
          e.preventDefault();
          isOverscrollVisible.value = true;
          offsetY.value = -delta;
          isThresholdPassed.value = Math.abs(offsetY.value) > 40;
        }
      },

      touchEnd(): void {
        if (isThresholdPassed.value) {
          emit("scroll:ptr");
        }
        isOverscrollVisible.value = false;
        offsetY.value = 0;
      },

      touchCancel(): void {
        isOverscrollVisible.value = false;
        offsetY.value = 0;
      },
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
  flex-direction: column;
  position: relative;

  &_shadow {
    box-shadow: var(--container-scroll-shadow);
  }

  &__overscroll {
    position: relative;
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;

    &-icon {
      color: #a1c0d4;
      animation: infinite 2s linear spin;
    }

    &_passed &-icon {
      color: #43b0e6;
    }
  }

  &__inner {
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;
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

  &_nopadding &__inner {
    padding: 0;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
