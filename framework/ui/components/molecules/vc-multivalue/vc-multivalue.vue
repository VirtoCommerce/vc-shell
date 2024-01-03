<template>
  <div
    class="vc-multivalue"
    :class="[
      `vc-multivalue_${type}`,
      {
        'vc-multivalue_opened': isOpened,
        'vc-multivalue_error tw-pb-[20px]': error,
        'vc-multivalue_disabled': disabled,
      },
    ]"
  >
    <!-- Input label -->
    <VcLabel
      v-if="label"
      class="tw-mb-2"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
        >{{ tooltip }}</template
      >
    </VcLabel>

    <!-- Input field -->
    <div
      ref="dropdownToggleRef"
      class="vc-multivalue__field-wrapper"
    >
      <div
        v-for="(item, i) in modelValue"
        :key="`${item?.id}_${generateId()}`"
        class="vc-multivalue__field-value-wrapper"
      >
        <div
          v-if="item"
          class="vc-multivalue__field-value"
        >
          <span class="tw-truncate">{{
            type === "number"
              ? Number(item[props.optionLabel as keyof T]).toFixed(3)
              : item[props.optionLabel as keyof T]
          }}</span>
          <VcIcon
            v-if="!disabled"
            class="vc-multivalue__field-value-clear"
            icon="fas fa-times"
            size="s"
            @click="onDelete(i)"
          ></VcIcon>
        </div>
      </div>

      <template v-if="multivalue">
        <div class="vc-multivalue__field vc-multivalue__field_dictionary tw-grow tw-basis-0 tw-p-2">
          <VcButton
            small
            @click.stop="toggleDropdown"
            >Add +</VcButton
          >
          <teleport to="#app">
            <div
              v-if="isOpened"
              ref="dropdownRef"
              v-on-click-outside="[toggleDropdown, { ignore: [dropdownToggleRef] }]"
              class="vc-multivalue__dropdown"
              :style="dropdownStyle"
            >
              <input
                ref="searchRef"
                class="vc-multivalue__search"
                @input="onSearch"
              />

              <VcContainer
                ref="root"
                :no-padding="true"
              >
                <div
                  v-for="(item, i) in slicedDictionary"
                  :key="i"
                  class="vc-multivalue__item"
                  @click="onItemSelect(item)"
                >
                  <slot
                    name="item"
                    :item="item"
                    >{{ item[optionLabel as keyof T] }}</slot
                  >
                </div>
              </VcContainer>
            </div>
          </teleport>
        </div>
      </template>
      <template v-else>
        <input
          v-model="value"
          class="vc-multivalue__field tw-grow tw-basis-0 tw-pl-3"
          :placeholder="placeholder"
          :type="type"
          :disabled="disabled"
          @keypress.enter.stop.prevent="onInput"
        />
      </template>
    </div>

    <slot
      v-if="errorMessage"
      name="error"
    >
      <VcHint class="vc-multivalue__error tw-mt-1">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends { id?: string }">
import { unref, nextTick, ref, computed } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { useFloating, UseFloatingReturn, offset, flip, shift, autoUpdate, MiddlewareState } from "@floating-ui/vue";
import { generateId } from "../../../../core/utilities";
import * as _ from "lodash-es";

export interface Props<T> {
  placeholder?: string;
  modelValue?: T[];
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "number";
  label?: string;
  tooltip?: string;
  name?: string;
  options?: T[];
  optionValue?: string;
  optionLabel?: string;
  multivalue?: boolean;
  error?: boolean;
  errorMessage?: string;
  multilanguage?: boolean;
  currentLanguage?: string;
}

export interface Emits<T> {
  (event: "update:model-value", value: T[]): void;
  (event: "close"): void;
  (event: "search", value: string): void;
}

type FloatingInstanceType = UseFloatingReturn & {
  middlewareData: {
    sameWidthChangeBorders: {
      borderTop?: string;
      borderBottom?: string;
      borderRadius?: string;
      width?: string;
    };
  };
};

const props = withDefaults(defineProps<Props<T>>(), {
  modelValue: () => [],
  type: "text",
  name: "Field",
  options: () => [],
  optionValue: "id",
  optionLabel: "title",
});

const emit = defineEmits<Emits<T>>();
defineSlots<{
  item: (args: { item: T }) => any;
  error: (props: any) => any;
}>();

const dropdownToggleRef = ref();
const dropdownRef = ref();
const root = ref();
const searchRef = ref();
const isOpened = ref(false);
const value = ref();

const popper = useFloating(dropdownToggleRef, dropdownRef, {
  placement: "bottom",
  whileElementsMounted: autoUpdate,
  middleware: [
    flip({ fallbackPlacements: ["top", "bottom"] }),
    shift({ mainAxis: false }),
    sameWidthChangeBorders(),
    offset(-2),
  ],
}) as FloatingInstanceType;

const dropdownStyle = computed(() => {
  return {
    top: `${popper.y.value ?? 0}px`,
    left: `${popper.x.value ?? 0}px`,
    ...popper.middlewareData.value.sameWidthChangeBorders,
  };
});

const slicedDictionary = computed(() => {
  return props.options?.filter((x) => {
    return !props.modelValue?.find((item) => {
      return item[props.optionValue as keyof T] === x[props.optionValue as keyof T];
    });
  });
});

function onInput(e: KeyboardEvent) {
  const newValue = (e.target as HTMLInputElement).value;
  emit("update:model-value", [...props.modelValue, { [props.optionLabel]: newValue } as T]);
  value.value = undefined;
}

function onItemSelect(item: T) {
  emit("update:model-value", [...props.modelValue, item]);
  emit("close");
  closeDropdown();
}

function onDelete(i: number) {
  const result = unref(props.modelValue);
  result.splice(i, 1);
  emit("update:model-value", [...result]);
}

function sameWidthChangeBorders() {
  return {
    name: "sameWidthChangeBorders",
    fn: ({ rects, placement, x, y }: MiddlewareState) => {
      let borderTop;
      let borderBottom;
      let borderRadius;
      if (placement === "top") {
        borderTop = "1px solid var(--select-border-color)";
        borderBottom = "1px solid var(--select-background-color)";
        borderRadius = "var(--select-border-radius) var(--select-border-radius) 0 0";
      } else {
        borderBottom = "1px solid var(--select-border-color)";
        borderTop = "1px solid var(--select-background-color)";
        borderRadius = "0 0 var(--select-border-radius) var(--select-border-radius)";
      }

      const width = `${rects.reference.width}px`;

      return {
        x,
        y,
        data: {
          borderTop,
          borderBottom,
          borderRadius,
          width,
        },
      };
    },
  };
}

async function toggleDropdown() {
  if (!props.disabled) {
    if (isOpened.value) {
      closeDropdown();
    } else {
      isOpened.value = true;

      nextTick(() => {
        searchRef?.value?.focus();
      });
    }
  }
}

function closeDropdown() {
  isOpened.value = false;
  emit("close");
}

function onSearch(event: Event) {
  emit("search", (event.target as HTMLInputElement).value);
}
</script>

<style lang="scss">
:root {
  --multivalue-height: 38px;
  --multivalue-border-radius: 3px;
  --multivalue-border-color: #d3dbe9;
  --multivalue-border-color-error: #f14e4e;
  --multivalue-background-color: #ffffff;
  --multivalue-placeholder-color: #a5a5a5;

  --select-height: 38px;
  --select-border-radius: 3px;
  --select-border-color: #d3dbe9;
  --select-border-color-error: #f14e4e;
  --select-background-color: #ffffff;
  --select-background-color-disabled: #fafafa;
  --select-placeholder-color: #a5a5a5;
  --select-chevron-color: #43b0e6;
  --select-chevron-color-hover: #319ed4;
}

.vc-multivalue {
  @apply tw-overflow-hidden;

  &_date,
  &_datetime-local {
    @apply tw-max-w-[220px];

    .vc-app_mobile & {
      @apply tw-max-w-full;
    }
  }

  &__field-wrapper {
    @apply tw-border tw-border-solid
    tw-border-[color:var(--multivalue-border-color)]
    tw-rounded-[var(--multivalue-border-radius)]
    tw-bg-[color:var(--multivalue-background-color)]
    tw-items-center
    tw-flex
    tw-flex-wrap;
  }

  &__dropdown {
    @apply tw-flex tw-flex-col tw-box-border
    tw-max-h-[300px] tw-z-10 tw-overflow-hidden
    tw-absolute tw-bg-[color:var(--select-background-color)]
    tw-border tw-border-solid tw-border-[color:var(--select-border-color)]
    tw-border-t-[color:var(--select-background-color)]
    tw-rounded-b-[var(--select-border-radius)]
    tw-p-2;
  }

  &__search {
    @apply tw-w-full tw-box-border tw-border tw-border-solid tw-border-[#eaecf2]
      tw-rounded-[4px] tw-h-8 tw-leading-[32px]
      tw-outline-none tw-mb-3 tw-px-2;
  }

  &__item {
    @apply tw-flex tw-items-center tw-min-h-[36px] tw-px-2 tw-rounded-[3px] tw-cursor-pointer hover:tw-bg-[#eff7fc];
  }

  &_opened &__field-wrapper {
    @apply tw-rounded-t-[var(--select-border-radius)];
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--multivalue-border-color-error)];
  }

  &__error {
    @apply tw-text-[color:var(--multivalue-border-color-error)];
  }

  &__field {
    @apply tw-border-none tw-outline-none tw-h-[var(--multivalue-height)]
      tw-min-w-[120px] tw-box-border placeholder:tw-text-[color:var(--multivalue-placeholder-color)];

    &::-webkit-input-placeholder {
      @apply tw-text-[color:var(--multivalue-placeholder-color)];
    }

    &::-moz-placeholder {
      @apply tw-text-[color:var(--multivalue-placeholder-color)];
    }

    &::-ms-placeholder {
      @apply tw-text-[color:var(--multivalue-placeholder-color)];
    }

    &-value-wrapper {
      @apply tw-h-[var(--multivalue-height)] tw-ml-2 tw-flex tw-items-center;
    }

    &-value {
      @apply tw-bg-[#fbfdfe] tw-border tw-border-solid tw-border-[color:#bdd1df] tw-rounded-[2px]
        tw-flex tw-items-center tw-h-[28px] tw-box-border tw-px-2 tw-max-w-[150px];

      &-clear {
        @apply tw-text-[#a9bfd2] tw-ml-2 tw-cursor-pointer;
      }
    }

    &_dictionary {
      @apply tw-h-auto tw-min-w-[auto];
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[#fafafa] tw-text-[#424242];
  }
}
</style>
