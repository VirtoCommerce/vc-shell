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
      <div class="tw-items-center tw-flex tw-flex-wrap tw-flex-grow">
        <div
          v-for="(item, i) in modelValue"
          :key="`${item?.id}_${generateId()}`"
          class="vc-multivalue__field-value-wrapper"
        >
          <div
            v-if="item"
            class="vc-multivalue__field-value"
          >
            <slot
              name="selected-item"
              :value="formatValue(item)"
              :item="item"
              :remove="() => onDelete(i)"
            >
              <span class="tw-truncate">{{ formatValue(item) }}</span>
            </slot>
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
              :disabled="disabled"
              @click.stop="toggleDropdown"
              >Add +</VcButton
            >
            <teleport to="body">
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
                      name="option"
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
            class="vc-multivalue__field tw-grow tw-basis-0 tw-px-3"
            :placeholder="placeholder"
            :type="internalTypeComputed"
            :disabled="disabled"
            @keypress.enter.stop.prevent="onInput"
            @blur="onInput"
            @keydown="onKeyDown"
          />
        </template>
      </div>
      <!-- Loading-->
      <div
        v-if="loading"
        class="tw-flex tw-items-center tw-flex-nowrap tw-px-3 tw-text-[color:var(--select-clear-color)]"
      >
        <VcIcon
          icon="fas fa-circle-notch tw-animate-spin"
          size="m"
        ></VcIcon>
      </div>
    </div>

    <Transition
      name="slide-up"
      mode="out-in"
    >
      <div v-if="error">
        <slot name="error">
          <VcHint
            v-if="errorMessage"
            class="vc-multivalue__error"
          >
            {{ errorMessage }}
          </VcHint>
        </slot>
      </div>
      <div v-else>
        <slot name="hint">
          <VcHint
            v-if="hint"
            class="tw-text-[color:var(--multivalue-placeholder-color)] tw-mt-1 tw-break-words tw-p-0"
          >
            {{ hint }}
          </VcHint>
        </slot>
      </div>
    </Transition>
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends { id?: string }">
import { unref, nextTick, ref, computed } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import { useFloating, UseFloatingReturn, offset, flip, shift, autoUpdate, MiddlewareState } from "@floating-ui/vue";
import { generateId } from "../../../../core/utilities";

export interface Props<T> {
  placeholder?: string;
  modelValue?: T[];
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "number" | "integer";
  label?: string;
  tooltip?: string;
  name?: string;
  hint?: string;
  options?: T[];
  optionValue?: string;
  optionLabel?: string;
  multivalue?: boolean;
  error?: boolean;
  errorMessage?: string;
  multilanguage?: boolean;
  currentLanguage?: string;
  loading?: boolean;
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
  option: (args: { item: T }) => any;
  "selected-item": (args: { value: string | number | T[keyof T]; item: T; remove: () => void }) => any;
  hint: void;
  error: void;
}>();

const dropdownToggleRef = ref();
const dropdownRef = ref();
const root = ref();
const searchRef = ref();
const isOpened = ref(false);
const value = ref();
const internalType = ref(unref(props.type));

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

const formatValue = computed(() => {
  return (item: T) => {
    if (props.type === "number") {
      return Number(item[props.optionLabel as keyof T]).toFixed(3);
    } else if (props.type === "integer") {
      return Math.trunc(+item[props.optionLabel as keyof T]);
    } else {
      return item[props.optionLabel as keyof T];
    }
  };
});

const internalTypeComputed = computed({
  get() {
    if (internalType.value === "integer") {
      return "number";
    }
    return internalType.value;
  },
  set(value) {
    internalType.value = value;
  },
});

function onKeyDown(e: KeyboardEvent) {
  const allowedKeys = ["Backspace", "Delete", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];
  const keypressed = e.key;
  if (props.type === "integer") {
    if (!/^\d$/.test(keypressed) && !allowedKeys.includes(keypressed)) {
      e.preventDefault();
      return;
    }
  }
}

function onInput(e: KeyboardEvent | FocusEvent) {
  const newValue = (e.target as HTMLInputElement).value;
  if (newValue === "" || newValue === undefined || newValue === null) {
    return;
  }
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
        borderTop = "1px solid var(--multivalue-select-border-color)";
        borderBottom = "1px solid var(--multivalue-select-background-color)";
        borderRadius = "var(--multivalue-select-border-radius) var(--multivalue-select-border-radius) 0 0";
      } else {
        borderBottom = "1px solid var(--multivalue-select-border-color)";
        borderTop = "1px solid var(--multivalue-select-background-color)";
        borderRadius = "0 0 var(--multivalue-select-border-radius) var(--multivalue-select-border-radius)";
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
  --multivalue-border-color: var(--neutrals-300);
  --multivalue-border-color-error: var(--danger-500);
  --multivalue-background-color: var(--additional-50);
  --multivalue-placeholder-color: var(--neutrals-400);

  --multivalue-select-border-radius: 3px;
  --multivalue-select-border-color: var(--neutrals-300);
  --multivalue-select-border-color-error: var(--danger-500);
  --multivalue-select-background-color: var(--additional-50);
  --multivalue-select-background-color-disabled: var(--neutrals-100);
  --multivalue-select-placeholder-color: var(--neutrals-400);
  --multivalue-select-chevron-color: var(--primary-500);
  --multivalue-select-chevron-color-hover: var(--primary-600);

  --multivalue-search-border-color: var(--neutrals-300);
  --multivalue-item-hover-background-color: var(--accent-50);
  --multivalue-hint-color: var(--danger-500);
  --multivalue-field-value-background-color: var(--additional-50);
  --multivalue-field-value-border-color: var(--primary-300);
  --multivalue-clear-icon-color: var(--secondary-500);
  --multivalue-disabled-text-color: var(--neutrals-600);
  --multivalue-disabled-background-color: var(--neutrals-100);
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
    tw-flex tw-justify-between;
  }

  &__dropdown {
    @apply tw-flex tw-flex-col tw-box-border
    tw-max-h-[300px] tw-z-10 tw-overflow-hidden
    tw-absolute tw-bg-[color:var(--multivalue-select-background-color)]
    tw-border tw-border-solid tw-border-[color:var(--multivalue-select-border-color)]
    tw-border-t-[color:var(--multivalue-select-background-color)]
    tw-rounded-b-[var(--multivalue-select-border-radius)]
    tw-p-2;
  }

  &__search {
    @apply tw-w-full tw-box-border tw-border tw-border-solid
    tw-border-[color:var(--multivalue-search-border-color)]
    tw-rounded-[4px] tw-h-8 tw-leading-[32px]
    tw-outline-none tw-mb-3 tw-px-2;
  }

  &__item {
    @apply tw-flex tw-items-center tw-min-h-[36px] tw-px-2 tw-rounded-[3px] tw-cursor-pointer hover:tw-bg-[color:var(--multivalue-item-hover-background-color)];
  }

  &_opened &__field-wrapper {
    @apply tw-rounded-t-[var(--multivalue-select-border-radius)];
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--multivalue-border-color-error)];
  }

  &__error {
    @apply tw-mt-1 [--multivalue-hint-color:var(--multivalue-hint-color)];
  }

  &__field {
    @apply tw-border-none tw-outline-none tw-min-h-[var(--multivalue-height)]
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

    &[type="number"]::-webkit-inner-spin-button,
    &[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    &-value-wrapper {
      @apply tw-min-h-[var(--multivalue-height)] tw-ml-2 tw-flex tw-items-center;
    }

    &-value {
      @apply tw-bg-[color:var(--multivalue-field-value-background-color)] tw-border tw-border-solid tw-border-[color:var(--multivalue-field-value-border-color)]
        tw-rounded-[2px] tw-flex tw-items-center tw-h-[28px] tw-box-border tw-px-2 tw-max-w-[150px];

      &-clear {
        @apply tw-text-[color:var(--multivalue-clear-icon-color)] tw-ml-2 tw-cursor-pointer;
      }
    }

    &_dictionary {
      @apply tw-h-auto tw-min-w-[auto];
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[color:var(--multivalue-disabled-background-color)] tw-text-[color:var(--multivalue-disabled-text-color)];
  }
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(5px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
