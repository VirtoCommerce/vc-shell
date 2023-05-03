<template>
  <div
    class="vc-blade-toolbar-button"
    :class="{ 'vc-blade-toolbar-button_disabled': disabled || isWaiting }"
    @click="onClick"
    :title="title as string"
  >
    <div ref="dropButtonRef">
      <div
        class="vc-blade-toolbar-button__wrap"
        ref="bladeDropToggle"
      >
        <VcIcon
          class="vc-blade-toolbar-button__icon"
          :icon="icon as string"
          size="m"
        ></VcIcon>
        <div
          v-if="isExpanded"
          class="vc-blade-toolbar-button__title"
        >
          {{ title }}
        </div>
      </div>
      <teleport to="#app">
        <div
          class="vc-blade-toolbar-button__dropdown"
          v-if="isDropActive"
          ref="bladeDropRef"
          :style="dropStyle"
        >
          <div
            class="vc-blade-toolbar-button__dropdown-item"
            v-for="(item, i) in dropdownItems"
            :key="i"
            @click="handleDropItemClick(item)"
          >
            <VcIcon
              :icon="item.icon"
              class="vc-blade-toolbar-button__dropdown-item-icon"
            />
            {{ item.title }}
          </div>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, nextTick } from "vue";

export default defineComponent({
  inheritAttrs: false,
});
</script>

<script lang="ts" setup>
import { VcIcon } from "./../../../../../../";
import { offset, computePosition, ComputePositionReturn } from "@floating-ui/vue";
import { IBladeDropdownItem } from "./../../../../../../../../core/types";

export interface Props {
  isExpanded: boolean;
  icon?: string | (() => string);
  title?: string | unknown;
  options?: Record<string, unknown>;
  disabled?: boolean;
  dropdownItems?: IBladeDropdownItem[];
  clickHandler?(): void;
}

export interface Emits {
  (event: "click"): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isExpanded: true,
  icon: "fas fa-question-circle",
  title: undefined,
  dropdownItems: () => [],
  clickHandler: undefined,
});

const emit = defineEmits<Emits>();

const popper = ref<ComputePositionReturn>();
const isWaiting = ref(false);
const isDropActive = ref(false);
const bladeDropToggle = ref();
const dropButtonRef = ref();
const bladeDropRef = ref();

const dropStyle = computed(() => ({
  top: `${popper.value?.y ?? 0}px`,
  left: `${popper.value?.x ?? 0}px`,
}));

async function onClick(): Promise<void> {
  console.debug("vc-blade-toolbar-item#onClick()");

  if (!props.disabled && !isWaiting.value) {
    if (props.clickHandler && typeof props.clickHandler === "function") {
      isWaiting.value = true;
      try {
        await props.clickHandler();
      } finally {
        isWaiting.value = false;
      }
    } else if (props.dropdownItems?.length) {
      toggleDropdown();
    } else {
      emit("click");
    }
  }
}

function toggleDropdown() {
  if (props.dropdownItems?.length) {
    if (isDropActive.value) {
      isDropActive.value = false;
    } else {
      isDropActive.value = true;

      nextTick(() => {
        computePosition(bladeDropToggle.value, bladeDropRef.value, {
          placement: "bottom",
          middleware: [offset(10)],
        }).then((item) => (popper.value = item));
      });
    }
  }
}

function handleDropItemClick(item: IBladeDropdownItem) {
  if (item.clickHandler && typeof item.clickHandler === "function") {
    item.clickHandler();
    toggleDropdown();
  }
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-button-title-color: #465769;
  --blade-toolbar-button-title-color-hover: #465769;
  --blade-toolbar-button-title-color-disabled: #9fa2a6;

  --blade-toolbar-button-icon-color: #319ed4;
  --blade-toolbar-button-icon-color-hover: #257fad;
  --blade-toolbar-button-icon-color-disabled: #d2d4d7;

  --blade-toolbar-button-background-color: var(--blade-toolbar-background-color);
  --blade-toolbar-button-background-color-hover: var(--blade-toolbar-background-color);
  --blade-toolbar-button-background-color-disabled: var(--blade-toolbar-background-color);
}

.vc-blade-toolbar-button {
  @apply tw-px-2 tw-bg-[color:var(--blade-toolbar-button-background-color)] tw-box-border tw-cursor-pointer;

  &__wrap {
    @apply tw-inline-flex tw-flex-col tw-justify-center tw-items-center tw-relative;
  }

  &__title {
    @apply tw-text-sm tw-whitespace-nowrap tw-mt-1 tw-text-[color:var(--blade-toolbar-button-title-color)];
  }

  &__icon {
    @apply tw-text-[color:var(--blade-toolbar-button-icon-color)];
  }

  &__dropdown {
    @apply tw-absolute tw-bg-white tw-z-[9999] tw-shadow-[1px_1px_22px_rgba(126,142,157,0.2)];
  }

  &__dropdown-item {
    @apply tw-p-3 tw-text-lg tw-text-black tw-border-l tw-border-solid
    tw-border-l-[#eef0f2] tw-border-b tw-border-b-[#eef0f2]
    tw-bg-white tw-cursor-pointer tw-flex tw-flex-row tw-items-center
    hover:tw-bg-[#eff7fc];
  }

  &__dropdown-item-icon {
    @apply tw-text-[#a9bfd2] tw-mr-2;
  }

  &:hover {
    @apply tw-bg-[color:var(--blade-toolbar-button-background-color-hover)];

    .vc-blade-toolbar-button__title {
      @apply tw-text-[color:var(--blade-toolbar-button-title-color-hover)];
    }

    .vc-blade-toolbar-button__icon {
      @apply tw-text-[color:var(--blade-toolbar-button-icon-color-hover)];
    }
  }

  &_disabled,
  &_disabled:hover {
    @apply tw-bg-[color:var(--blade-toolbar-button-background-color-disabled)] tw-cursor-default;

    .vc-blade-toolbar-button__title {
      @apply tw-text-[color:var(--blade-toolbar-button-title-color-disabled)];
    }

    .vc-blade-toolbar-button__icon {
      @apply tw-text-[color:var(--blade-toolbar-button-icon-color-disabled)];
    }
  }
}
</style>
