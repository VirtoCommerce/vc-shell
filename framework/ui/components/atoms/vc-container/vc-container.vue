<template>
  <div
    :class="[
      'vc-container',
      {
        'vc-container_shadow': shadow && scroll,
        'vc-container_nopadding': noPadding,
      },
    ]"
    @touchstart="onTouchstart"
    @touchmove="onTouchmove"
    @touchend="onTouchend"
  >
    <div
      :class="['vc-container__overscroll', { 'vc-container__overscroll_touching': touching }]"
      :style="{
        top: -1 * pullDist + topOffset + 'px',
        height: pullDist + 'px',
      }"
    >
      <div class="vc-container__status">
        <VcIcon
          :icon="canRefresh || goingUp ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
          class="vc-container__overscroll-icon"
        ></VcIcon>
        <span v-if="!(canRefresh || goingUp)">{{ $t("COMPONENTS.ATOMS.VC_CONTAINER.PULL_TO_REFRESH") }}</span>
        <span v-else>{{ $t("COMPONENTS.ATOMS.VC_CONTAINER.REFRESHING") }}</span>
      </div>
    </div>
    <div
      ref="component"
      class="vc-container__inner"
      :class="{
        'vc-container__inner_touching': touching,
      }"
      :style="{ top: topOffset + 'px' }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, shallowRef, watch } from "vue";
import { VcIcon } from "./../vc-icon";

export interface Props {
  shadow?: boolean;
  noPadding?: boolean;
  usePtr?: boolean;
}

export interface Emits {
  (event: "scroll:ptr"): void;
}

defineProps<Props>();

const emit = defineEmits<Emits>();

const component = ref<HTMLElement>();
const scroll = ref(false);
const pullDist = ref(60);
const touchDiff = shallowRef(0);
let touchstartY = 0;
const refreshing = shallowRef(false);
const goingUp = shallowRef(false);
const touching = shallowRef(false);

const topOffset = computed(() => Math.max(0, Math.min(pullDist.value, touchDiff.value)));
const canRefresh = computed(() => touchDiff.value >= pullDist.value && !refreshing.value);

const scrollTop = () => {
  if (component.value) {
    component.value.scroll(0, 0);
  }
};

function onTouchstart(e: TouchEvent | MouseEvent) {
  if (refreshing.value) return;
  touching.value = true;
  touchstartY = "clientY" in e ? e.clientY : e.touches[0].clientY;
}

function onTouchmove(e: TouchEvent | MouseEvent) {
  if (refreshing.value || !touching.value) return;

  const touchY = "clientY" in e ? e.clientY : e.touches[0].clientY;

  if (scroll.value) {
    touchDiff.value = touchY - touchstartY;
  }
}

function onTouchend() {
  if (refreshing.value) return;
  touching.value = false;

  if (canRefresh.value) {
    touchDiff.value = 0;
    refreshing.value = false;
    emit("scroll:ptr");
  } else {
    touchDiff.value = 0;
  }
}

onMounted(() => {
  const observer = new ResizeObserver(() => {
    scroll.value = (component.value && component.value.clientHeight < component.value.scrollHeight) as boolean;
  });

  if (component.value) {
    observer.observe(component.value);
  }
});

watch(topOffset, (newVal, oldVal) => {
  goingUp.value = newVal < oldVal;
});

defineExpose({
  scrollTop,
  component,
});
</script>

<style lang="scss">
:root {
  --container-scroll-color: #e1eff9;
  --container-scroll-color-hover: #cce4f5;
  --container-scroll-width: 8px;
  --container-scroll-padding: 8px;
  --container-scroll-shadow: 0 3px 2px rgba(0, 0, 0, 0.1) inset, 0 -3px 2px rgba(0, 0, 0, 0.1) inset;
}

.vc-container {
  @apply tw-w-full tw-h-full tw-overflow-hidden tw-box-border tw-flex tw-flex-col tw-relative;

  &_shadow {
    @apply tw-shadow-[0_3px_2px_rgba(0,0,0,0.1)_inset];
  }

  &__overscroll {
    @apply tw-absolute tw-w-full [transition:top_0.3s_ease-out];

    &_touching {
      @apply tw-transition-none;
    }
  }

  &__status {
    @apply tw-flex tw-w-full tw-h-full tw-justify-center tw-items-center tw-pb-[10px];
  }

  &__overscroll-icon {
    @apply tw-text-[color:#a1c0d4];
  }

  &__overscroll span {
    @apply tw-ml-2 tw-text-sm tw-text-gray-500;
  }

  &__inner {
    @apply tw-relative tw-overflow-y-auto tw-overflow-x-hidden
    tw-flex-1 tw-p-[var(--container-scroll-padding)]
    [transition:top_0.3s_ease-out] [scrollbar-color:var(--container-scroll-color)] [scrollbar-width:thin];

    &::-webkit-scrollbar {
      @apply tw-w-[var(--container-scroll-width)] tw-bg-transparent;
    }

    &::-webkit-scrollbar-track {
      @apply tw-bg-transparent;
    }

    &::-webkit-scrollbar-thumb {
      @apply tw-bg-[color:var(--container-scroll-color)]
      tw-rounded-[calc(var(--container-scroll-width)/2)]
      tw-overflow-x-hidden
      hover:tw-bg-[color:var(--container-scroll-color-hover)];
    }

    &_touching {
      transition: none;
    }
  }

  &_nopadding &__inner {
    @apply tw-p-0;
  }
}
</style>
