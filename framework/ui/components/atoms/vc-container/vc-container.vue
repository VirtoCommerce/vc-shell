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
          :icon="canRefresh || goingUp ? 'material-arrow_upward' : 'material-arrow_downward'"
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
      @scroll="onScroll"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, computed, shallowRef, watch, inject, Ref } from "vue";
import { VcIcon } from "./../vc-icon";

export interface Props {
  shadow?: boolean;
  noPadding?: boolean;
  usePtr?: boolean;
}

export interface Emits {
  (event: "scroll:ptr"): void;
  (event: "scroll", e: Event): void;
}

const props = defineProps<Props>();

const emit = defineEmits<Emits>();

const component = ref<HTMLElement>();
const scroll = ref(false);
const pullDist = ref(60);
const touchDiff = shallowRef(0);
let touchstartY = 0;
const refreshing = shallowRef(false);
const goingUp = shallowRef(false);
const touching = shallowRef(false);
const isMobile = inject("isMobile") as Ref<boolean>;

let resizeObserver: ResizeObserver | null = null;

const topOffset = computed(() => Math.max(0, Math.min(pullDist.value, touchDiff.value)));
const canRefresh = computed(() => touchDiff.value >= pullDist.value && !refreshing.value);

const scrollTop = () => {
  if (component.value) {
    component.value.scroll(0, 0);
  }
};

function onTouchstart(e: TouchEvent | MouseEvent) {
  if (!isMobile.value || refreshing.value || !props.usePtr || (component.value && component.value.scrollTop > 0))
    return;
  touching.value = true;
  touchstartY = "clientY" in e ? e.clientY : e.touches[0].clientY;
}

function onTouchmove(e: TouchEvent | MouseEvent) {
  if (refreshing.value || !touching.value) return;

  const touchY = "clientY" in e ? e.clientY : e.touches[0].clientY;

  if (component.value && component.value.scrollTop === 0) {
    touchDiff.value = touchY - touchstartY;
  }
}

function onTouchend() {
  if (refreshing.value) return;
  touching.value = false;

  if (canRefresh.value) {
    touchDiff.value = 0;
    refreshing.value = true;
    emit("scroll:ptr");

    refreshing.value = false;
  } else {
    touchDiff.value = 0;
  }
}

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
  --container-overscroll-icon-color: var(--secondary-600);
  --container-text-color: var(--neutrals-400);
  --container-padding: 16px;
  --container-transition-duration: 0.3s;
  --container-transition-ease: ease-out;
  --container-shadow-color: var(--additional-950);
  --container-shadow-opacity: 0.1;
  --container-shadow: 0 3px 2px rgba(var(--container-shadow-color), var(--container-shadow-opacity)) inset;
}

.vc-container {
  @apply tw-w-full tw-h-full tw-overflow-hidden tw-box-border tw-flex tw-flex-col tw-relative;

  &_shadow {
    @apply tw-shadow-[--container-shadow];
  }

  &__overscroll {
    @apply tw-absolute tw-w-full;
    transition: top var(--container-transition-duration) var(--container-transition-ease);

    &_touching {
      transition: none;
    }
  }

  &__status {
    @apply tw-flex tw-w-full tw-h-full tw-justify-center tw-items-center tw-pb-[10px];
  }

  &__overscroll-icon {
    @apply tw-text-[color:var(--container-overscroll-icon-color)];
  }

  &__overscroll span {
    @apply tw-ml-2 tw-text-sm;
    color: var(--container-text-color);
  }

  &__inner {
    @apply tw-relative tw-overflow-y-auto tw-overflow-x-hidden
    tw-flex-1;
    transition: top var(--container-transition-duration) var(--container-transition-ease);
    padding: var(--container-padding);

    &_touching {
      transition: none;
    }
  }

  &_nopadding &__inner {
    padding: 0;
  }

  &_shadow {
    @apply tw-shadow-[--container-shadow];
  }
}
</style>
