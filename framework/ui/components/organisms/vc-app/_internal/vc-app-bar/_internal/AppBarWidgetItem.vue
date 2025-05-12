<template>
  <div
    class="app-bar-button"
    :class="{ 'app-bar-button--mobile': $isMobile.value }"
  >
    <VcTooltip
      placement="bottom"
      :offset="{ crossAxis: 0, mainAxis: -10 }"
      :delay="1000"
      class="tw-w-full"
    >
      <template
        v-if="!isActive && !!title"
        #tooltip
        >{{ title }}</template
      >
      <button
        ref="referenceButton"
        class="app-bar-button__button"
        @click.stop="toggleContent"
      >
        <div :class="['app-bar-button__button-container']">
          <slot
            name="trigger"
            :is-active="isActive"
            :toggle="toggleContent"
          >
            <div class="app-bar-button__button-wrap">
              <VcIcon
                :icon="icon"
                size="xl"
                :class="['app-bar-button__icon', { 'app-bar-button__icon--active': isActive }]"
              ></VcIcon>
            </div>
          </slot>
        </div>
      </button>
    </VcTooltip>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, computed, onMounted, type Component } from "vue";
import { useAppBarWidgets } from "./../composables/useAppBarWidgets";

export interface Props {
  title?: string;
  icon?: string | Component;
  beforeOpen?: () => boolean;
  isOpened?: boolean;
  widgetId?: string;
}

export interface Emits {
  (event: "toggle", state: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

defineSlots<{
  content: (props: { opened: boolean; toggle: () => void }) => any;
  trigger: (props: { isActive: boolean; toggle: () => void }) => any;
}>();

const { toggleWidget, currentWidget } = useAppBarWidgets();
const referenceButton = ref<HTMLDivElement | null>(null);

// Check if the current widget is active
const isActive = computed(() => (props.widgetId ? currentWidget.value?.id === props.widgetId : false));

function toggleContent() {
  if (props.beforeOpen && typeof props.beforeOpen === "function" && props.beforeOpen() === false) {
    return;
  }

  if (props.widgetId) {
    toggleWidget(props.widgetId);
    emit("toggle", isActive.value);
  }
}

onMounted(() => {
  if (props.isOpened && props.widgetId) {
    toggleWidget(props.widgetId);
  }
});
</script>

<style lang="scss">
:root {
  --app-bar-button-width: 52px;
  --app-bar-button-shadow-color: var(--additional-950);
  --app-bar-button-shadow:
    0 -6px 6px var(--additional-50), 1px 1px 22px rgb(from var(--app-bar-button-shadow-color) r g b / 7%);
  --app-bar-button-height: var(--app-bar-height);
  --app-bar-button-bg-color: var(--additional-50);
  --app-bar-button-dropdown-bg-color: var(--additional-50);
  --app-bar-button-dropdown-button-width: var(--app-bar-button-width);
  --app-bar-button-border-color: var(--accent-500);
  --app-bar-button-dropdown-button-border: var(--app-bar-button-border-color);

  --app-bar-button-dropdown-button-background-color: var(--app-bar-button-background-color);

  --app-bar-button-dropdown-button-background-color-hover: var(--app-bar-button-background-color-hover);
  --app-bar-button-mobile-bg-color: var(--neutral-500);

  --app-bar-button-dropdown-button-text-color: var(--neutrals-500);
  --app-bar-button-dropdown-button-active-text-color: var(--primary-500);
  --app-bar-button-border-width: 2px;
}

.app-bar-button {
  @apply tw-relative tw-flex tw-h-[var(--app-bar-height)];

  &--mobile {
    @apply tw-h-[var(--app-bar-mobile-height)];
  }

  &::after {
    content: "";
    @apply tw-absolute tw-left-0 tw-bottom-0 tw-w-full
        tw-border-b-[2px]
        tw-border-[color:var(--app-bar-button-border-color)]
        tw-opacity-0 tw-transition-opacity tw-duration-200 tw-z-[2];
  }

  &:hover::after {
    @apply tw-opacity-100;
  }

  &__button {
    @apply tw-flex tw-text-left tw-w-full tw-box-border tw-relative tw-w-[var(--app-bar-button-width)];
  }

  &__button-container {
    @apply tw-w-full tw-relative tw-h-full tw-flex tw-items-center tw-justify-center
     tw-cursor-pointer
      tw-text-[color:var(--app-bar-button-dropdown-button-text-color)] tw-bg-[color:var(--app-bar-button-dropdown-button-background-color)]
      tw-transition-colors tw-duration-200 tw-box-border;
  }

  &__button-wrap {
    @apply tw-w-[var(--app-bar-button-dropdown-button-width)] tw-flex tw-justify-center;
  }

  &__icon {
    @apply tw-text-[color:var(--app-bar-button-dropdown-button-text-color)] tw-transition-colors tw-duration-300 tw-ease-in-out;

    &--active {
      @apply tw-text-[color:var(--app-bar-button-dropdown-button-active-text-color)];
    }
  }

  &__dropdown {
    @apply tw-min-w-[100%];
  }

  &__menu-dropdowns {
    //@apply tw-w-full tw-h-full tw-border-t-[2px] tw-border-[color:var(--app-bar-button-border-color)] tw-border-solid tw-border-b-[2px] tw-border-b-[color:var(--app-bar-button-border-color)];
  }
}
</style>
