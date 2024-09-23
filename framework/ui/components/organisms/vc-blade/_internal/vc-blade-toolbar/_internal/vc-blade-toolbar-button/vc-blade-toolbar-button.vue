<template>
  <VcTooltip
    placement="bottom"
    :offset="{
      crossAxis: 0,
      mainAxis: 0,
    }"
  >
    <template #tooltip>{{ title }}</template>
    <div
      class="vc-blade-toolbar-button"
      :class="{
        'vc-blade-toolbar-button_disabled': disabled || isWaiting,
        'vc-blade-toolbar-button_separator-left': separator === 'left',
      }"
      :data-test-id="id ?? 'vc-blade-toolbar-button'"
      @click="onClick"
    >
      <div ref="dropButtonRef">
        <div
          ref="bladeDropToggle"
          type="button"
          class="vc-blade-toolbar-button__wrap"
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
        <teleport to="body">
          <div
            v-if="isDropActive"
            ref="bladeDropRef"
            class="vc-blade-toolbar-button__dropdown"
            :style="dropStyle"
          >
            <div
              v-for="(item, i) in dropdownItems"
              :key="i"
              class="vc-blade-toolbar-button__dropdown-item"
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
  </VcTooltip>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from "vue";
import { VcIcon, VcTooltip } from "./../../../../../../";
import { offset, computePosition, ComputePositionReturn } from "@floating-ui/vue";
import { IBladeDropdownItem } from "./../../../../../../../../core/types";

export interface Props {
  isExpanded: boolean;
  icon?: string | (() => string);
  title?: string;
  disabled?: boolean;
  dropdownItems?: IBladeDropdownItem[];
  clickHandler?(): void;
  separator?: "left" | "right" | "both";
  id?: string;
}

export interface Emits {
  (event: "click"): void;
}

defineOptions({
  inheritAttrs: false,
});

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
  --blade-toolbar-button-title-color: var(--base-text-color, var(--neutrals-950));
  --blade-toolbar-button-title-color-hover: var(--base-text-color, var(--neutrals-950));
  --blade-toolbar-button-title-color-disabled: var(--neutrals-400);

  --blade-toolbar-button-icon-color: var(--primary-500);
  --blade-toolbar-button-icon-color-hover: var(--primary-600);
  --blade-toolbar-button-icon-color-disabled: var(--neutrals-400);

  --blade-toolbar-button-background-color: var(--additional-50);
  --blade-toolbar-button-background-color-hover: var(--additional-50);
  --blade-toolbar-button-background-color-disabled: var(--additional-50);

  --blade-toolbar-button-border-color: var(--base-border-color, var(--neutrals-200));

  --blade-toolbar-shadow-color: var(--secondary-200);
  --blade-toolbar-shadow: 1px 1px 22px rgb(from var(--blade-toolbar-shadow-color) r g b / 20%);

  --blade-toolbar-dropdown-background-color: var(--additional-50);
  --blade-toolbar-dropdown-item-background-color: var(--additional-50);
  --blade-toolbar-dropdown-item-text-color: var(--additional-950);
}

.vc-blade-toolbar-button {
  @apply tw-px-2 tw-bg-[color:var(--blade-toolbar-button-background-color)] tw-box-border tw-cursor-pointer;

  &__wrap {
    @apply tw-inline-flex tw-flex-col tw-justify-center tw-items-center tw-relative;
  }

  &__title {
    @apply tw-text-xs tw-whitespace-nowrap tw-mt-1 tw-text-[color:var(--blade-toolbar-button-title-color)];
  }

  &__icon {
    @apply tw-text-[color:var(--blade-toolbar-button-icon-color)];
  }

  &__dropdown {
    @apply tw-absolute tw-bg-[color:var(--blade-toolbar-dropdown-background-color)] tw-z-[9999] [box-shadow:var(--blade-toolbar-shadow)];
  }

  &__dropdown-item {
    @apply tw-p-3 tw-text-lg tw-text-[color:var(--blade-toolbar-dropdown-item-text-color)] tw-border-l tw-border-solid
    tw-border-l-[color:var(--blade-toolbar-button-border-color)] tw-border-b
    tw-border-b-[color:var(--blade-toolbar-button-border-color)]
    tw-bg-[color:var(--blade-toolbar-dropdown-item-background-color)] tw-cursor-pointer tw-flex tw-flex-row tw-items-center
    hover:tw-bg-[color:var(--blade-toolbar-button-background-color-hover)];
  }

  &__dropdown-item-icon {
    @apply tw-text-[color:var(--blade-toolbar-button-icon-color)] tw-mr-2;
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

  &.vc-blade-toolbar-button_separator-left {
    @apply tw-border-l tw-border-solid tw-border-[color:var(--blade-toolbar-button-border-color)];
  }
}
</style>
