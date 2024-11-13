<template>
  <div class="app-bar-button">
    <VcTooltip
      placement="bottom"
      :offset="{ crossAxis: 0, mainAxis: -10 }"
      :delay="1000"
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
    </VcTooltip>

    <div
      v-if="isDropdownVisible"
      v-on-click-outside="[
        () => {
          isDropdownVisible = false;
        },
        { ignore: [referenceButton] },
      ]"
      class="app-bar-button__dropdown"
    >
      <Teleport to="#vc-app-bar__menu-dropdowns">
        <div class="app-bar-button__menu-dropdowns">
          <slot
            name="dropdown-content"
            :opened="isDropdownVisible"
            :toggle="toggleNotificationsDrop"
          ></slot>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { vOnClickOutside } from "@vueuse/components";
// import { useFloating, shift, autoUpdate } from "@floating-ui/vue";

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

// const floater = useFloating(referenceButton, null, {
//   placement: props.position,
//   whileElementsMounted: autoUpdate,
//   middleware: [shift({ mainAxis: false })],
// });

// const floatingDropStyle = computed(() => {
//   return {
//     top: `${floater.y.value ?? 0}px`,
//     left: `${floater.x.value ?? 0}px`,
//   };
// });

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
  @apply tw-relative tw-flex;

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
    @apply tw-flex tw-text-left tw-w-full tw-box-border tw-relative;
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
