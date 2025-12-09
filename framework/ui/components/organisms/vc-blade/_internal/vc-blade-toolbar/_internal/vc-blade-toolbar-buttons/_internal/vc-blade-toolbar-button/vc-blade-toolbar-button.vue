<template>
  <VcTooltip
    placement="bottom"
    :offset="{
      crossAxis: 0,
      mainAxis: 0,
    }"
    :delay="1000"
  >
    <template #tooltip>{{ title }}</template>
    <div
      class="vc-blade-toolbar-button"
      :class="{
        'vc-blade-toolbar-button_disabled': disabled || isWaiting,
        'vc-blade-toolbar-button_separator-left': separator === 'left',
        'vc-blade-toolbar-button_horizontal': horizontal,
        'vc-blade-toolbar-button_circle': circle,
        'vc-blade-toolbar-button_main-action': mainAction,
      }"
      :data-test-id="id ?? 'vc-blade-toolbar-button'"
      @click="onClick"
    >
      <div
        type="button"
        class="vc-blade-toolbar-button__wrap"
      >
        <VcIcon
          class="vc-blade-toolbar-button__icon"
          :icon="icon as string"
          :size="circle ? 's' : 'm'"
        ></VcIcon>
        <div
          v-if="isExpanded || horizontal"
          class="vc-blade-toolbar-button__title"
        >
          {{ title }}
        </div>
      </div>
    </div>
  </VcTooltip>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VcIcon, VcTooltip } from "../../../../../../../../";
import { createLogger } from "../../../../../../../../../../core/utilities";

const logger = createLogger("vc-blade-toolbar-button");

export interface Props {
  isExpanded: boolean;
  icon?: string | (() => string);
  title?: string;
  disabled?: boolean;
  clickHandler?(): void;
  separator?: "left" | "right" | "both";
  id?: string;
  horizontal?: boolean;
  circle?: boolean;
  mainAction?: boolean;
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
  icon: "material-help",
  title: undefined,
  dropdownItems: () => [],
  clickHandler: undefined,
  horizontal: false,
  circle: false,
});

const emit = defineEmits<Emits>();

const isWaiting = ref(false);

async function onClick(): Promise<void> {
  logger.debug("onClick()");

  if (!props.disabled && !isWaiting.value) {
    if (props.clickHandler && typeof props.clickHandler === "function") {
      isWaiting.value = true;
      try {
        await props.clickHandler();
      } finally {
        isWaiting.value = false;
      }
    } else {
      emit("click");
    }
  }
}
</script>

<style lang="scss">
:root {
  --blade-toolbar-button-title-color: var(--neutrals-600);
  --blade-toolbar-button-title-color-hover: var(--primary-600);
  --blade-toolbar-button-title-color-disabled: var(--neutrals-400);

  --blade-toolbar-button-icon-color: var(--neutrals-700);
  --blade-toolbar-button-icon-color-hover: var(--primary-600);
  --blade-toolbar-button-icon-color-disabled: var(--neutrals-400);

  --blade-toolbar-button-background-color: trans;
  --blade-toolbar-button-background-color-hover: transparent;
  --blade-toolbar-button-background-color-disabled: transparent;

  --blade-toolbar-button-border-color: var(--neutrals-200);

  --blade-toolbar-shadow-color: var(--secondary-200);
  --blade-toolbar-shadow: 1px 1px 22px rgb(from var(--blade-toolbar-shadow-color) r g b / 20%);

  --blade-toolbar-dropdown-background-color: var(--additional-50);
  --blade-toolbar-dropdown-item-background-color: var(--additional-50);
  --blade-toolbar-dropdown-item-text-color: var(--additional-950);
}

.vc-blade-toolbar-button {
  @apply tw-px-2 tw-bg-[color:var(--blade-toolbar-button-background-color)] tw-box-border tw-cursor-pointer tw-justify-center tw-flex;

  &__wrap {
    @apply tw-inline-flex tw-flex-col tw-justify-center tw-items-center tw-relative;
  }

  &_horizontal {
    .vc-blade-toolbar-button__wrap {
      @apply tw-flex-row tw-gap-2;
    }

    .vc-blade-toolbar-button__title {
      @apply tw-mt-0 tw-ml-1;
    }
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

  &_separator-left {
    @apply tw-border-l tw-border-solid tw-border-[color:var(--blade-toolbar-button-border-color)];
  }

  &_circle {
    .vc-blade-toolbar-button__wrap {
      @apply tw-flex-row-reverse;
    }

    .vc-blade-toolbar-button__icon {
      @apply tw-w-9 tw-h-9 tw-bg-[var(--neutrals-500)] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-[var(--additional-50)];
    }

    .vc-blade-toolbar-button__title {
      @apply tw-text-[var(--additional-50)] tw-text-xs;
    }
  }

  &_main-action {
    .vc-blade-toolbar-button__icon {
      @apply tw-w-[46px] tw-h-[46px] tw-bg-[var(--primary-500)] tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-[var(--additional-50)];
    }
  }
}
</style>
