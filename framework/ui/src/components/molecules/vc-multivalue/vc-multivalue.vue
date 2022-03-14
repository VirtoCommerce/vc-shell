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
    <VcLabel v-if="label" class="vc-margin-bottom_s" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <!-- Input field -->
    <div class="vc-multivalue__field-wrapper vc-flex" ref="inputFieldWrapRef">
      <div
        v-for="(item, i) in modelValue"
        :key="item.id"
        class="vc-multivalue__field-value-wrapper"
      >
        <div class="vc-multivalue__field-value">
          <span
            class="vc-multivalue__field-value-content vc-ellipsis"
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
          class="vc-multivalue__field vc-multivalue__field_dictionary vc-flex-grow_1 vc-padding_s"
        >
          <VcButton small @click="toggleDropdown">Add +</VcButton>
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
          class="vc-multivalue__field vc-flex-grow_1 vc-padding-left_m"
          :placeholder="placeholder"
          :type="type"
          :value="value"
          :disabled="disabled"
          @keypress.enter="onInput"
        />
      </template>
    </div>

    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-multivalue__error vc-margin-top_xs">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { unref, getCurrentInstance, nextTick, ref, computed } from "vue";

import { useField } from "vee-validate";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import { IValidationRules } from "../../../typings";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import { createPopper, Instance, State } from "@popperjs/core";
import { clickOutside as vClickOutside } from "../../../directives";

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

<style lang="less">
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
  overflow: hidden;

  &_date,
  &_datetime-local {
    max-width: 220px;

    .vc-app_mobile & {
      max-width: 100%;
    }
  }

  &__field-wrapper {
    border: 1px solid var(--multivalue-border-color);
    border-radius: var(--multivalue-border-radius);
    background-color: var(--multivalue-background-color);
    align-items: center;
    display: flex;
    flex-wrap: wrap;
  }

  &__dropdown {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    max-height: 300px;
    z-index: 10;
    overflow: hidden;
    position: absolute;
    background-color: var(--select-background-color);
    border: 1px solid var(--select-border-color);
    border-top: 1px solid var(--select-background-color);
    border-radius: 0 0 var(--select-border-radius) var(--select-border-radius);
    padding: var(--padding-s);
  }

  &__search {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #eaecf2;
    border-radius: 4px;
    height: 32px;
    line-height: 32px;
    outline: none;
    margin-bottom: var(--margin-m);
    padding-left: var(--padding-s);
    padding-right: var(--padding-s);
  }

  &__item {
    display: flex;
    align-items: center;
    min-height: 36px;
    padding-left: var(--padding-s);
    padding-right: var(--padding-s);
    border-radius: 3px;
    cursor: pointer;

    &:hover {
      background-color: #eff7fc;
    }
  }

  &_opened &__field-wrapper {
    border-radius: var(--select-border-radius) var(--select-border-radius) 0 0;
  }

  &_error &__field-wrapper {
    border: 1px solid var(--multivalue-border-color-error);
  }

  &__error {
    color: var(--multivalue-border-color-error);
  }

  &__field {
    border: none;
    outline: none;
    height: var(--multivalue-height);
    min-width: 0;
    box-sizing: border-box;
    min-width: 120px;

    &::-webkit-input-placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &::-moz-placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &::-ms-placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &::placeholder {
      color: var(--multivalue-placeholder-color);
    }

    &-value-wrapper {
      height: var(--multivalue-height);
      margin-left: var(--margin-s);
      display: flex;
      align-items: center;
    }

    &-value {
      background: #fbfdfe;
      border: 1px solid #bdd1df;
      border-radius: 2px;
      display: flex;
      align-items: center;
      height: 28px;
      box-sizing: border-box;
      padding: 0 var(--padding-s);
      max-width: 150px;

      &-clear {
        color: #a9bfd2;
        margin-left: var(--margin-s);
        cursor: pointer;
      }
    }

    &_dictionary {
      height: auto;
      min-width: auto;
    }
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    background-color: #fafafa;
    color: #424242;
  }
}
</style>
