<template>
  <div
    class="vc-select"
    :class="{
      'vc-select_opened': isOpened,
      'vc-select_error': errorMessage,
      'vc-select_disabled': isDisabled,
    }"
  >
    <!-- Select label -->
    <VcLabel v-if="label" class="vc-margin-bottom_s" :required="isRequired">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Select field -->
    <div
      class="vc-select__field-wrapper vc-flex vc-flex-align_stretch"
      ref="inputFieldWrapRef"
    >
      <div
        class="vc-select__field vc-padding_m vc-flex vc-flex-align_center vc-fill_width"
        @click="toggleDropdown"
        ref="dropdownToggleRef"
      >
        <div v-if="!selectedItem" class="vc-select__field-placeholder">
          {{ placeholder }}
        </div>
        <slot
          v-else-if="$slots['selectedItem']"
          name="selectedItem"
          :item="selectedItem"
        ></slot>
        <slot v-else name="item" :item="selectedItem">
          {{ selectedItem[displayProperty] }}
        </slot>
      </div>

      <!-- Select chevron -->
      <div
        v-if="!isDisabled"
        class="vc-select__chevron vc-padding-horizontal_m vc-flex vc-flex-align_center"
        @click="toggleDropdown"
      >
        <VcIcon size="s" icon="fas fa-chevron-down"></VcIcon>
      </div>
      <teleport to="#app">
        <div
          v-if="isOpened"
          class="vc-select__dropdown"
          ref="dropdownRef"
          v-click-outside="closeDropdown"
        >
          <input
            v-if="isSearchable"
            ref="search"
            class="vc-select__search"
            @input="onSearch"
          />

          <VcContainer :no-padding="true">
            <div
              class="vc-select__item"
              v-for="(item, i) in options"
              :key="i"
              @click="onItemSelect(item)"
            >
              <slot name="item" :item="item">{{ item[displayProperty] }}</slot>
            </div>
          </VcContainer>
        </div>
      </teleport>
    </div>

    <slot v-if="errorMessage" name="error">
      <VcHint class="vc-select__error vc-margin-top_xs">
        {{ errorMessage }}
      </VcHint>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import {
  nextTick,
  ref,
  computed,
  watch,
  getCurrentInstance,
  onUpdated,
} from "vue";
import { useField } from "vee-validate";
import VcIcon from "../../atoms/vc-icon/vc-icon.vue";
import VcLabel from "../../atoms/vc-label/vc-label.vue";
import VcContainer from "../../atoms/vc-container/vc-container.vue";
import { createPopper, Instance, State } from "@popperjs/core";
import { clickOutside as vClickOutside } from "../../../directives";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: undefined,
  },

  placeholder: {
    type: String,
    default: "Click to select...",
  },

  options: {
    type: Array,
    default: () => [],
  },

  isRequired: {
    type: Boolean,
    default: false,
  },

  isDisabled: {
    type: Boolean,
    default: false,
  },

  isSearchable: {
    type: Boolean,
    default: false,
  },

  label: {
    type: String,
    default: undefined,
  },

  tooltip: {
    type: String,
    default: undefined,
  },

  keyProperty: {
    type: String,
    default: "id",
  },

  displayProperty: {
    type: String,
    default: "title",
  },

  initialItem: {
    type: Object,
    default: undefined,
  },

  name: {
    type: String,
    default: "Field",
  },
});

const emit = defineEmits(["update:modelValue", "change", "close", "search"]);

const instance = getCurrentInstance();
const isOpened = ref(false);
const search = ref();
const popper = ref<Instance>();
const dropdownToggleRef = ref();
const dropdownRef = ref();
const inputFieldWrapRef = ref();

const selectedItem = computed(
  () =>
    (props.options as Record<string, unknown>[])?.find(
      (item) => item[props.keyProperty] === props.modelValue
    ) || props.initialItem
);

// Prepare field-level validation
const { errorMessage, handleChange } = useField(
  `${instance?.uid || props.name}`,
  props.isRequired ? "required" : "",
  {
    initialValue: props.modelValue,
  }
);

watch(
  () => props.modelValue,
  (value) => {
    handleChange(value);
  }
);

function closeDropdown() {
  isOpened.value = false;
  popper.value?.destroy();
  emit("close");
}
function toggleDropdown() {
  if (!props.isDisabled) {
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
          dropdownToggleRef.value,
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
                  state.styles.popper.width = `${
                    state.rects.reference.width + 2
                  }px`;
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
                  state.elements.popper.style.width = `${
                    ref.offsetWidth + 2
                  }px`;
                },
              },
              {
                name: "offset",
                options: {
                  offset: [0, 0],
                },
              },
            ],
          }
        );
      });
    }
  }
}

function onItemSelect(item: { [x: string]: string }) {
  emit("update:modelValue", item[props.keyProperty]);
  emit("change", item[props.keyProperty]);
  emit("close");
  isOpened.value = false;
}
function onSearch(event: InputEvent) {
  emit("search", (event.target as HTMLInputElement).value);
}
</script>

<style lang="less">
:root {
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

.vc-select {
  box-sizing: border-box;

  &__field-wrapper {
    position: relative;
    box-sizing: border-box;
    border: 1px solid var(--select-border-color);
    border-radius: var(--select-border-radius);
    background-color: var(--select-background-color);
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    background-color: var(--select-background-color-disabled);
    color: #424242;
  }

  &_error &__field-wrapper {
    border: 1px solid var(--select-border-color-error);
  }

  &__error {
    color: var(--select-border-color-error);
  }

  &__field {
    width: 100%;
    appearance: none;
    border: none;
    outline: none;
    min-height: var(--select-height);
    box-sizing: border-box;
    cursor: pointer;

    &:invalid {
      color: var(--select-placeholder-color);
    }

    &-placeholder {
      color: #a5a5a5;
    }
  }

  &_disabled &__field {
    cursor: auto;
  }

  &__chevron {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    cursor: pointer;
    color: var(--select-chevron-color);

    &:hover {
      color: var(--select-chevron-color-hover);
    }
  }

  &_opened &__chevron {
    transform: rotate(180deg);
  }

  &_opened &__field-wrapper {
    border-radius: var(--select-border-radius) var(--select-border-radius) 0 0;
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
}
</style>
