<template>
  <div
    class="app-bar-button"
    :class="{ 'app-bar-button--mobile': $isMobile.value }"
  >
    <VcTooltip
      :placement="position"
      :offset="{ crossAxis: 0, mainAxis: -10 }"
      :delay="1000"
      class="tw-w-full"
    >
      <template
        v-if="!isContentVisible && !!title"
        #tooltip
        >{{ title }}</template
      >
      <button
        ref="referenceButton"
        class="app-bar-button__button"
        @click.stop="toggleContent"
      >
        <div
          :class="[
            'app-bar-button__button-container',
            { 'app-bar-button__button-container--active': isContentVisible && $slots['content'] },
          ]"
        >
          <slot
            name="trigger"
            :opened="isContentVisible"
            :toggle="toggleContent"
          >
            <div class="app-bar-button__button-wrap">
              <VcIcon
                :icon="icon"
                size="xl"
              ></VcIcon>
            </div>
          </slot>
        </div>
      </button>
    </VcTooltip>
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance, onUnmounted, useSlots, Slots, h, withDirectives } from "vue";
import { useAppBarOverlay } from "./../../composables/useAppBarOverlay";
import { vOnClickOutside } from "@vueuse/components";

export interface Props {
  title?: string;
  icon?: string;
  position: "bottom" | "bottom-end" | "bottom-start";
  beforeOpen?: () => boolean;
  overlayed?: boolean;
}

export interface Emits {
  (event: "toggle", state: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  position: "bottom",
  overlayed: false,
});

const emit = defineEmits<Emits>();

defineSlots<{
  content: (props: { opened: boolean; toggle: () => void }) => void;
  trigger: void;
}>();

const isContentVisible = ref(false);
const referenceButton = ref<HTMLDivElement | null>(null);
const contentRef = ref<HTMLDivElement | null>(null);

const slots = useSlots();
const instance = getCurrentInstance();
const { showContent, hideContent } = useAppBarOverlay();

function toggleContent() {
  if (props.beforeOpen && typeof props.beforeOpen === "function" && props.beforeOpen() === false) {
    return;
  }

  isContentVisible.value = !isContentVisible.value;

  if (isContentVisible.value && slots["content"]) {
    const content = () => {
      return withDirectives(
        h(
          "div",
          {
            style: {
              height: "-webkit-fill-available",
            },
            ref: contentRef,
          },
          [
            h(slots["content"]!, {
              opened: isContentVisible.value,
              toggle: toggleContent,
            }),
          ],
        ),
        [[vOnClickOutside, [onClose, { ignore: [referenceButton, contentRef] }]]],
      );
    };

    showContent({
      id: instance?.uid?.toString() ?? "",
      content,
      overlayed: props.overlayed,
      props: {
        opened: isContentVisible.value,
        toggle: toggleContent,
      },
    });
  } else {
    hideContent();
  }

  emit("toggle", isContentVisible.value);
}

const onClose = () => {
  isContentVisible.value = false;
  hideContent();
};

onUnmounted(() => {
  if (isContentVisible.value) {
    hideContent();
  }
});
</script>

<style lang="scss">
:root {
  --app-bar-button-width: 52px;
  --app-bar-button-shadow-color: var(--additional-950);
  --app-bar-button-shadow: 0 -6px 6px var(--additional-50),
    1px 1px 22px rgb(from var(--app-bar-button-shadow-color) r g b / 7%);
  --app-bar-button-height: var(--app-bar-height);
  --app-bar-button-bg-color: var(--additional-50);
  --app-bar-button-dropdown-bg-color: var(--additional-50);
  --app-bar-button-dropdown-button-width: var(--app-bar-button-width);
  --app-bar-button-border-color: var(--accent-500);
  --app-bar-button-dropdown-button-border: var(--app-bar-button-border-color);
  --app-bar-button-dropdown-button-color: var(--app-bar-button-color);
  --app-bar-button-dropdown-button-background-color: var(--app-bar-button-background-color);
  --app-bar-button-dropdown-button-color-hover: var(--app-bar-button-color-hover);
  --app-bar-button-dropdown-button-background-color-hover: var(--app-bar-button-background-color-hover);
  --app-bar-button-mobile-bg-color: var(--neutral-500);

  --app-bar-button-dropdown-button-color-hover: var(--neutrals-100);
  --app-bar-button-dropdown-button-active-bg: var(--neutrals-200);
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
      tw-text-[color:var(--app-bar-button-dropdown-button-color)] tw-bg-[color:var(--app-bar-button-dropdown-button-background-color)]
      tw-transition-colors tw-duration-200 tw-box-border;

    &:hover:not(&--active) {
      @apply tw-bg-[color:var(--app-bar-button-dropdown-button-color-hover)];
    }

    &--active {
      @apply tw-bg-[color:var(--app-bar-button-dropdown-button-active-bg)];
    }
  }

  &__button-wrap {
    @apply tw-w-[var(--app-bar-button-dropdown-button-width)] tw-flex tw-justify-center;
  }

  &__dropdown {
    @apply tw-min-w-[100%];
  }

  &__menu-dropdowns {
    //@apply tw-w-full tw-h-full tw-border-t-[2px] tw-border-[color:var(--app-bar-button-border-color)] tw-border-solid tw-border-b-[2px] tw-border-b-[color:var(--app-bar-button-border-color)];
  }
}
</style>
