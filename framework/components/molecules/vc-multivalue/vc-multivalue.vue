<template>
  <div
    class="vc-multivalue"
    :class="[
      `vc-multivalue_${type}`,
      {
        'vc-multivalue_opened': isOpened,
        'vc-multivalue_error': errorMessage,
        'vc-multivalue_disabled': disabled,
      },
    ]"
  >
    <!-- Input label -->
    <VcLabel v-if="label" class="mb-2" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <!-- Input field -->
    <div class="vc-multivalue__field-wrapper" ref="inputFieldWrapRef">
      <div
        v-for="(item, i) in modelValue"
        :key="item.id"
        class="vc-multivalue__field-value-wrapper"
      >
        <div class="vc-multivalue__field-value">
          <span
            class="truncate"
            :title="
              type === 'number' ? Number(item.value).toFixed(3) : item.value
            "
            >{{
              type === "number" ? Number(item.value).toFixed(3) : item.value
            }}</span
          >
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
        <div
          ref="dropdownToggleRef"
          class="vc-multivalue__field vc-multivalue__field_dictionary grow basis-0 p-2"
        >
          <VcButton small @click.stop="toggleDropdown">Add +</VcButton>
          <teleport to="#app">
            <div
              v-if="isOpened"
              class="vc-multivalue__dropdown"
              ref="dropdownRef"
              v-click-outside="closeDropdown"
            >
              <input
                ref="search"
                class="vc-multivalue__search"
                @input="onSearch"
              />

              <VcContainer :no-padding="true">
                <div
                  class="vc-multivalue__item"
                  v-for="(item, i) in slicedDictionary"
                  :key="i"
                  @click="onItemSelect(item)"
                >
                  <slot name="item" :item="item">{{
                    item[displayProperty]
                  }}</slot>
                </div>
              </VcContainer>
            </div>
          </teleport>
        </div>
      </template>
      <template v-else>
        <input
          class="vc-multivalue__field grow basis-0 pl-3"
          :placeholder="placeholder"
          :type="type"
          :value="value"
          :disabled="disabled"
          @keypress.enter="onInput"
        />
      </template>
    </div>

    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-multivalue__error mt-1">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { unref, getCurrentInstance, nextTick, ref, computed } from "vue";

import { useField } from "vee-validate";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import { IValidationRules } from "../../../core/types";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import { createPopper, Instance, State } from "@popperjs/core";
import { clickOutside as vClickOutside } from "../../../core/directives";

const props = defineProps({
  placeholder: {
    type: String,
    default: "",
  },

  modelValue: {
    type: Array,
    default: () => [],
  },

  required: {
    type: Boolean,
    default: false,
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  type: {
    type: String,
    default: "text",
  },

  label: {
    type: String,
    default: undefined,
  },

  tooltip: {
    type: String,
    default: undefined,
  },

  name: {
    type: String,
    default: "Field",
  },

  rules: {
    type: [String, Object],
  },

  options: {
    type: Array,
    default: () => [],
  },

  keyProperty: {
    type: String,
    default: "id",
  },

  displayProperty: {
    type: String,
    default: "title",
  },

  multivalue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "search", "close"]);

const instance = getCurrentInstance();
const popper = ref<Instance>();
const dropdownToggleRef = ref();
const dropdownRef = ref();
const inputFieldWrapRef = ref();
const isOpened = ref(false);
const search = ref();

// Prepare validation rules using required and rules props combination
let internalRules = unref(props.rules) || "";
if (props.required) {
  if (typeof internalRules === "string") {
    (internalRules as string) = `required|${internalRules}`.replace(
      /(\|)+$/,
      ""
    );
  } else {
    (internalRules as IValidationRules).required = true;
  }
}

// Prepare field-level validation
const { errorMessage, handleChange, value } = useField(
  `${instance?.uid || props.name}`,
  internalRules
);

const slicedDictionary = computed(() => {
  return props.options?.filter((x) => {
    return !props.modelValue?.find(
      (item) =>
        (item as { valueId: string }).valueId === (x as { id: string }).id
    );
  });
});

// Handle input event to propertly validate value and emit changes
function onInput(e: InputEvent) {
  const newValue = (e.target as HTMLInputElement).value;
  emit("update:modelValue", [...props.modelValue, { value: newValue }]);
  handleChange("");
}

function onItemSelect(item: { [x: string]: string }) {
  emit("update:modelValue", [
    ...props.modelValue,
    { valueId: item[props.keyProperty] },
  ]);
  emit("close");
  closeDropdown();
}

// Handle event to propertly remove particular value and emit changes
function onDelete(i: number) {
  const result = unref(props.modelValue);
  result.splice(i, 1);
  emit("update:modelValue", [...result]);
}

function toggleDropdown() {
  if (!props.disabled) {
    if (isOpened.value) {
      isOpened.value = false;
      popper.value?.destroy();
      inputFieldWrapRef.value.style.borderRadius =
        "var(--select-border-radius)";
      emit("close");
    } else {
      isOpened.value = true;
      nextTick(() => {
        search?.value?.focus();
        popper.value = createPopper(
          inputFieldWrapRef.value,
          dropdownRef.value,
          {
            placement: "bottom",
            modifiers: [
              {
                name: "flip",
                options: {
                  fallbackPlacements: ["top", "bottom"],
                },
              },
              {
                name: "preventOverflow",
                options: {
                  mainAxis: false,
                },
              },
              {
                name: "sameWidthChangeBorders",
                enabled: true,
                phase: "beforeWrite",
                requires: ["computeStyles"],
                fn: ({ state }: { state: State }) => {
                  const placement = state.placement;
                  if (placement === "top") {
                    state.styles.popper.borderTop =
                      "1px solid var(--select-border-color)";
                    state.styles.popper.borderBottom =
                      "1px solid var(--select-background-color)";
                    state.styles.popper.borderRadius =
                      "var(--select-border-radius) var(--select-border-radius) 0 0";
                    inputFieldWrapRef.value.style.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";
                  } else {
                    state.styles.popper.borderBottom =
                      "1px solid var(--select-border-color)";
                    state.styles.popper.borderTop =
                      "1px solid var(--select-background-color)";
                    state.styles.popper.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";

                    if (inputFieldWrapRef.value) {
                      inputFieldWrapRef.value.style.borderRadius =
                        "var(--select-border-radius) var(--select-border-radius) 0 0";
                    }
                  }
                  state.styles.popper.width = `${state.rects.reference.width}px`;
                },
                effect: ({ state }: { state: State }) => {
                  const ref = state.elements.reference as HTMLElement;
                  const placement = state.placement;
                  if (placement === "top") {
                    state.elements.popper.style.borderTop =
                      "1px solid var(--select-border-color)";
                    state.elements.popper.style.borderBottom =
                      "1px solid var(--select-background-color)";
                    state.elements.popper.style.borderRadius =
                      "var(--select-border-radius) var(--select-border-radius) 0 0";
                    inputFieldWrapRef.value.style.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";
                  } else {
                    state.elements.popper.style.borderBottom =
                      "1px solid var(--select-border-color)";
                    state.elements.popper.style.borderTop =
                      "1px solid var(--select-background-color)";
                    state.elements.popper.style.borderRadius =
                      "0 0 var(--select-border-radius) var(--select-border-radius)";

                    if (inputFieldWrapRef.value) {
                      inputFieldWrapRef.value.style.borderRadius =
                        "var(--select-border-radius) var(--select-border-radius) 0 0";
                    }
                  }
                  state.elements.popper.style.width = `${ref.offsetWidth}px`;
                },
              },
              {
                name: "offset",
                options: {
                  offset: [0, -1],
                },
              },
            ],
          }
        );
      });
    }
  }
}

function closeDropdown() {
  isOpened.value = false;
  popper.value?.destroy();
  inputFieldWrapRef.value.style.borderRadius = "var(--select-border-radius)";
  emit("close");
}

function onSearch(event: InputEvent) {
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
  @apply overflow-hidden;

  &_date,
  &_datetime-local {
    @apply max-w-[220px];

    .vc-app_mobile & {
      @apply max-w-full;
    }
  }

  &__field-wrapper {
    @apply border border-solid
    border-[color:var(--multivalue-border-color)]
    rounded-[var(--multivalue-border-radius)]
    bg-[color:var(--multivalue-background-color)]
    items-center
    flex
    flex-wrap;
  }

  &__dropdown {
    @apply flex flex-col box-border
    max-h-[300px] z-10 overflow-hidden
    absolute bg-[color:var(--select-background-color)]
    border border-solid border-[color:var(--select-border-color)]
    border-t-[color:var(--select-background-color)]
    rounded-b-[var(--select-border-radius)]
    p-2;
  }

  &__search {
    @apply w-full box-border border border-solid border-[#eaecf2]
      rounded-[4px] h-8 leading-[32px]
      outline-none mb-3 px-2;
  }

  &__item {
    @apply flex items-center min-h-[36px] px-2 rounded-[3px] cursor-pointer hover:bg-[#eff7fc];
  }

  &_opened &__field-wrapper {
    @apply rounded-t-[var(--select-border-radius)];
  }

  &_error &__field-wrapper {
    @apply border border-solid border-[color:var(--multivalue-border-color-error)];
  }

  &__error {
    @apply text-[color:var(--multivalue-border-color-error)];
  }

  &__field {
    @apply border-none outline-none h-[var(--multivalue-height)]
      min-w-[120px] box-border placeholder:text-[color:var(--multivalue-placeholder-color)];

    &::-webkit-input-placeholder {
      @apply text-[color:var(--multivalue-placeholder-color)];
    }

    &::-moz-placeholder {
      @apply text-[color:var(--multivalue-placeholder-color)];
    }

    &::-ms-placeholder {
      @apply text-[color:var(--multivalue-placeholder-color)];
    }

    &-value-wrapper {
      @apply h-[var(--multivalue-height)] ml-2 flex items-center;
    }

    &-value {
      @apply bg-[#fbfdfe] border border-solid border-[color:#bdd1df] rounded-[2px]
        flex items-center h-[28px] box-border px-2 max-w-[150px];

      &-clear {
        @apply text-[#a9bfd2] ml-2 cursor-pointer;
      }
    }

    &_dictionary {
      @apply h-auto min-w-[auto];
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply bg-[#fafafa] text-[#424242];
  }
}
</style>
