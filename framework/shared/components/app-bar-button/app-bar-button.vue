<template>
  <div class="app-bar-button">
    <VcTooltip
      placement="bottom"
      :offset="{ crossAxis: 0, mainAxis: -10 }"
      class="tw-w-full"
    >
      <template
        v-if="!isDropdownVisible && !!title"
        #tooltip
        >{{ title }}</template
      >
      <button
        ref="referenceButton"
        class="app-bar-button__button"
        @click.stop="toggleNotificationsDrop"
      >
        <div
          :class="[
            'app-bar-button__button-container',
            { 'app-bar-button__button-container--active': isDropdownVisible && $slots['dropdown-content'] },
          ]"
        >
          <slot
            name="button"
            :opened="isDropdownVisible"
            :toggle="toggleNotificationsDrop"
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

      <div
        v-if="isDropdownVisible"
        ref="floatingDrop"
        v-on-click-outside="[
          () => {
            isDropdownVisible = false;
          },
          { ignore: [referenceButton] },
        ]"
        :style="floatingDropStyle"
        :class="['app-bar-button__dropdown']"
      >
        <slot
          name="dropdown-content"
          :opened="isDropdownVisible"
          :toggle="toggleNotificationsDrop"
        ></slot>
      </div>
    </VcTooltip>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { useFloating, shift, autoUpdate } from "@floating-ui/vue";

export interface Props {
  title?: string;
  icon?: string;
  position: "bottom" | "bottom-end" | "bottom-start";
  beforeOpen?: () => boolean;
}

export interface Emits {
  (event: "toggle", state: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  position: "bottom",
});

const emit = defineEmits<Emits>();

defineSlots<{
  "dropdown-content": (props: { opened: boolean; toggle: () => void }) => void;
  button: void;
}>();

const isDropdownVisible = ref(false);

const referenceButton = ref<HTMLDivElement | null>(null);
const floatingDrop = ref<HTMLDivElement | null>(null);

const floater = useFloating(referenceButton, floatingDrop, {
  placement: props.position,
  whileElementsMounted: autoUpdate,
  middleware: [shift({ mainAxis: false })],
});

const floatingDropStyle = computed(() => {
  return {
    top: `${floater.y.value ?? 0}px`,
    left: `${floater.x.value ?? 0}px`,
  };
});

function toggleNotificationsDrop() {
  if (props.beforeOpen && typeof props.beforeOpen === "function" && props.beforeOpen() === false) {
    return;
  }
  isDropdownVisible.value = !isDropdownVisible.value;

  emit("toggle", isDropdownVisible.value);
}
</script>

<style lang="scss">
:root {
  --app-bar-button-shadow-color: var(--additional-950);
  --app-bar-button-shadow: 0 -6px 6px var(--additional-50),
    1px 1px 22px rgb(from var(--app-bar-button-shadow-color) r g b / 7%);
  --app-bar-button-height: var(--app-bar-height);
  --app-bar-button-bg-color: var(--additional-50);
  --app-bar-button-dropdown-bg-color: var(--additional-50);
  --app-bar-button-dropdown-button-width: var(--app-bar-button-width);
  --app-bar-button-dropdown-button-border: var(--app-bar-button-border-color);
  --app-bar-button-dropdown-button-color: var(--app-bar-button-color);
  --app-bar-button-dropdown-button-background-color: var(--app-bar-button-background-color);
  --app-bar-button-dropdown-button-color-hover: var(--app-bar-button-color-hover);
  --app-bar-button-dropdown-button-background-color-hover: var(--app-bar-button-background-color-hover);
  --app-bar-button-mobile-bg-color: var(--neutral-500);
}

.app-bar-button {
  @apply tw-relative tw-flex;

  &__button {
    @apply tw-flex tw-text-left tw-w-full;
  }

  &__button-container {
    @apply tw-w-full tw-relative tw-h-full tw-flex tw-items-center tw-justify-center
      tw-border-l tw-border-solid
      tw-border-l-[color:var(--app-bar-button-dropdown-button-border)] tw-cursor-pointer
      tw-text-[color:var(--app-bar-button-dropdown-button-color)] tw-bg-[color:var(--app-bar-button-dropdown-button-background-color)]
      tw-transition-colors tw-duration-200;

    &:hover {
      @apply tw-text-[color:var(--app-bar-button-dropdown-button-color-hover)]
        tw-bg-[color:var(--app-bar-button-dropdown-button-background-color-hover)];
    }

    &--active {
      box-shadow: var(--app-bar-button-shadow);
      clip-path: inset(0px -20px 0px -20px);
      background-color: var(--app-bar-button-dropdown-bg-color);
      z-index: 9999;
    }
  }

  &__button-wrap {
    @apply tw-w-[var(--app-bar-button-dropdown-button-width)] tw-flex tw-justify-center;
  }

  &__dropdown {
    @apply tw-absolute tw-top-[var(--app-bar-button-height)] tw-z-[10000] tw-min-w-[100%];
    box-shadow: var(--app-bar-button-shadow);
  }
}
</style>
