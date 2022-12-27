<template>
  <div
    class="vc-select tw-box-border"
    :class="{
      'vc-select_opened': isOpened,
      'vc-select_error': error,
      'vc-select_disabled': readonly,
      'tw-pb-[20px]': error || hint,
    }"
  >
    <!-- Select label -->
    <VcLabel v-if="label" class="tw-mb-2" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Select field -->
    <div class="tw-flex tw-flex-nowrap tw-items-start" ref="inputFieldWrapRef">
      <div class="tw-relative tw-flex tw-flex-auto tw-text-left tw-max-w-full">
        <div
          class="tw-flex tw-items-center tw-flex-nowrap tw-pr-3"
          v-if="$slots['prepend']"
        >
          <slot name="prepend"></slot>
        </div>
        <div class="tw-relative tw-flex tw-flex-auto tw-overflow-x-clip">
          <div
            class="tw-truncate vc-select__field-wrapper tw-relative tw-box-border tw-border tw-border-solid tw-border-[color:var(--select-border-color)] tw-rounded-[var(--select-border-radius)] tw-bg-[color:var(--select-background-color)] tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-items-stretch"
          >
            <div
              ref="dropdownToggleRef"
              class="tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-relative"
            >
              <div
                class="tw-flex tw-flex-nowrap tw-flex-auto tw-h-full tw-px-3"
              >
                <div
                  class="tw-flex tw-items-center tw-flex-nowrap tw-pr-3"
                  v-if="$slots['prepend-inner']"
                >
                  <slot name="prepend-inner"></slot>
                </div>
                <div
                  class="tw-flex tw-flex-nowrap tw-flex-auto tw-h-full tw-truncate"
                >
                  <div
                    class="tw-flex tw-items-center tw-flex-wrap tw-pr-3 tw-pointer-events-none"
                    v-if="prefix"
                  >
                    {{ prefix }}
                  </div>
                  <div
                    class="tw-w-full tw-appearance-none tw-border-none tw-outline-none tw-min-h-[var(--select-height)] tw-flex tw-items-center tw-w-full tw-box-border tw-box-border tw-cursor-pointer invalid:tw-text-[color:var(--select-placeholder-color)] tw-truncate"
                    @click.stop="toggleDropdown"
                  >
                    <div v-if="!hasValue" class="tw-text-[#a5a5a5]">
                      {{ placeholder }}
                    </div>
                    <template
                      v-else-if="
                        selectedScope && selectedScope.length && hasValue
                      "
                    >
                      <template v-if="$slots['option']">
                        <slot
                          name="option"
                          v-for="(item, i) in selectedScope"
                          v-bind="item"
                          :key="i"
                        >
                        </slot>
                      </template>
                      <template v-else-if="$slots['selected-item']">
                        <slot
                          name="selected-item"
                          v-for="(item, i) in selectedScope"
                          v-bind="item"
                          :key="i"
                        ></slot>
                      </template>
                      <template v-else>
                        <!--                            <div  v-for="(item, i) in innerValuesArr"-->
                        <!--                                  class="tw-border tw-border-solid tw-border-[color:var(&#45;&#45;multivalue-border-color)] tw-rounded-[var(&#45;&#45;multivalue-border-radius)] tw-bg-[color:var(&#45;&#45;multivalue-background-color)] tw-items-center tw-flex tw-flex-wrap"-->
                        <!--                                  v-bind="item"-->
                        <!--                                  :key="i">-->
                        <!--                                {{ item }}-->
                        <!--                            </div>-->

                        <div class="tw-flex tw-flex-wrap gap-1 py-1">
                          <div
                            v-for="(item, i) in selectedScope"
                            v-bind="item"
                            :key="i"
                            class="tw-flex tw-items-center"
                          >
                            <template v-if="useChips && multiple">
                              <div
                                class="tw-bg-[#fbfdfe] tw-border tw-border-solid tw-border-[color:#bdd1df] tw-rounded-[2px] tw-flex tw-items-center tw-h-[28px] tw-box-border tw-px-2"
                              >
                                <span>{{
                                  getEmittingOptionValue(item.opt)
                                }}</span>
                                <VcIcon
                                  v-if="!readonly"
                                  class="tw-text-[#a9bfd2] tw-ml-2 tw-cursor-pointer hover:tw-text-[color:var(--select-clear-color-hover)]"
                                  icon="fas fa-times"
                                  size="s"
                                  @click.stop="removeAtIndex(item.index)"
                                ></VcIcon>
                              </div>
                            </template>
                            <template v-else-if="!useChips && !multiple">
                              {{ getEmittingOptionValue(item.opt) }}
                            </template>
                          </div>
                          <template v-if="!useChips && multiple">
                            {{ selectedString }}
                          </template>
                        </div>
                      </template>
                    </template>
                  </div>
                  <div
                    class="tw-flex tw-items-center tw-flex-wrap tw-pl-3 tw-pointer-events-none"
                    v-if="suffix"
                  >
                    {{ suffix }}
                  </div>
                  <div
                    v-if="clearable && hasValue && !readonly"
                    class="tw-cursor-pointer tw-flex tw-items-center tw-pl-3 tw-text-[color:var(--select-clear-color)] hover:tw-text-[color:var(--select-clear-color-hover)]"
                    @click="onReset"
                  >
                    <VcIcon size="s" icon="fas fa-times"></VcIcon>
                  </div>
                </div>
                <div
                  class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
                  v-if="$slots['append-inner']"
                >
                  <slot name="append-inner"></slot>
                </div>
                <!-- Loading-->
                <div
                  class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3 tw-text-[color:var(--select-clear-color)]"
                  v-if="loading"
                >
                  <VcIcon
                    icon="fas fa-spinner tw-animate-spin"
                    size="m"
                  ></VcIcon>
                </div>
                <!-- Select chevron-->
                <div
                  class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
                  v-if="!readonly"
                >
                  <div
                    class="vc-select__chevron tw-cursor-pointer tw-flex-nowrap tw-text-[color:var(--select-chevron-color)] hover:tw-text-[color:var(--select-chevron-color-hover)]"
                    @click.stop="toggleDropdown"
                  >
                    <VcIcon size="s" icon="fas fa-chevron-down"></VcIcon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="tw-absolute tw-translate-y-full tw-left-0 tw-right-0 tw-bottom-0 tw-min-h-[20px]"
          >
            <Transition name="slide-up" mode="out-in">
              <div v-if="error">
                <slot name="error">
                  <VcHint
                    class="tw-mt-1 tw-text-[color:var(--select-border-color-error)]"
                    v-if="errorMessage"
                  >
                    {{ errorMessage }}
                  </VcHint>
                </slot>
              </div>
              <div v-else>
                <slot name="hint">
                  <VcHint
                    class="tw-text-[color:var(--select-placeholder-color)] tw-mt-1 tw-break-words tw-p-0"
                    v-if="hint"
                  >
                    {{ hint }}
                  </VcHint>
                </slot>
              </div>
            </Transition>
          </div>
        </div>

        <div
          class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
          v-if="$slots['append']"
        >
          <slot name="append"></slot>
        </div>
      </div>
      <teleport to="#app">
        <div
          v-if="isOpened"
          class="tw-flex tw-flex-col tw-box-border tw-max-h-[300px] tw-h-full tw-z-10 tw-overflow-hidden tw-absolute tw-bg-[color:var(--select-background-color)] tw-border tw-border-solid tw-border-[color:var(--select-border-color)] tw-border-t-[color:var(--select-background-color)] tw-rounded-b-[var(--select-border-radius)] tw-p-2"
          ref="dropdownRef"
          v-click-outside="closeDropdown"
        >
          <input
            v-if="searchable"
            ref="searchRef"
            class="tw-w-full tw-box-border tw-border tw-border-solid tw-border-[#eaecf2] tw-rounded-[4px] tw-h-[32px] tw-leading-[32px] tw-outline-none tw-mb-3 tw-px-2"
            @input="onInput"
          />

          <VcContainer :no-padding="true">
            <div
              v-if="!(options && options.length)"
              class="tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center"
            >
              <slot name="no-options">
                <span class="tw-m-4 tw-text-xl tw-font-medium">No options</span>
              </slot>
            </div>
            <div
              v-else
              class="tw-flex tw-items-center tw-min-h-[36px] tw-my-1 tw-box-border tw-px-2 tw-rounded-[3px] tw-cursor-pointer hover:tw-bg-[#eff7fc]"
              v-for="(item, i) in optionScope"
              :key="i"
              @click="item.toggleOption(item.opt)"
              :class="{ 'tw-bg-[#eff7fc]': item.selected }"
            >
              <slot name="option" v-bind="item">{{ item.label }}</slot>
            </div>
            <span ref="el"></span>
          </VcContainer>
        </div>
      </teleport>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, ref, computed, watch } from "vue";
import { VcIcon, VcLabel, VcContainer } from "@/ui/components";
import { clickOutside as vClickOutside } from "@/core/directives";
import { createPopper, Instance, State } from "@popperjs/core";
import { VcSelectEmits, VcSelectProps } from "./vc-select-new-model";
import { isEqual } from "lodash-es";
import { useIntersectionObserver } from "@vueuse/core";

const props = withDefaults(defineProps<VcSelectProps>(), {
  optionValue: "id",
  optionLabel: "title",
  filterDebounce: 500,
  clearable: true,
  name: "Field",
  searchable: false,
  required: false,
  autofocus: true,
});
const emit = defineEmits<VcSelectEmits>();

const isOpened = ref(false);

const searchRef = ref();
const popper = ref<Instance>();
const dropdownToggleRef = ref();
const dropdownRef = ref();
const inputFieldWrapRef = ref();
const el = ref();

let emitValueFn;
let emitTimer;
let innerValueCache;

useIntersectionObserver(
  el,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      emit("scroll");
    }
  },
  { threshold: 0.5 }
);

const getOptionValue = computed(() =>
  getPropValueFn(props.optionValue, "value")
);

const getOptionLabel = computed(() =>
  getPropValueFn(props.optionLabel, "label")
);

const innerValue = computed(() => {
  const mapNull = props.mapOptions === true && props.multiple !== true;

  const val =
    props.modelValue !== undefined &&
    (props.modelValue !== null || mapNull === true)
      ? props.multiple === true && Array.isArray(props.modelValue)
        ? props.modelValue
        : [props.modelValue]
      : [];

  if (props.mapOptions === true && Array.isArray(props.options) === true) {
    const cache =
      props.mapOptions === true && innerValueCache !== undefined
        ? innerValueCache
        : [];

    const values = val.map((v) => getOption(v, cache));

    return props.modelValue === null && mapNull === true
      ? values.filter((v) => v !== null)
      : values;
  }

  return val;
});

watch(
  innerValue,
  (val) => {
    innerValueCache = val;
  },
  { immediate: true }
);

const selectedString = computed(() =>
  innerValue.value.map((opt) => getEmittingOptionValue(opt)).join(", ")
);

const selectedScope = computed(() => {
  return innerValue.value.map((opt, i) => ({
    index: i,
    opt,
    selected: true,
    toggleOption,
    removeAtIndex,
  }));
});

const hasValue = computed(() => fieldValueIsFilled(innerValue.value));

const innerOptionsValue = computed(() =>
  innerValue.value.map((opt) => getOptionValue.value(opt))
);

const optionScope = computed(() => {
  return props.options.map((opt, i) => {
    return {
      index: i,
      opt,
      selected: isOptionSelected(opt) === true,
      label: getOptionLabel.value(opt),
      toggleOption,
    };
  });
});

function getPropValueFn(propValue, defaultVal) {
  const val = propValue !== undefined ? propValue : defaultVal;

  return typeof val === "function"
    ? val
    : (opt) =>
        opt !== null && typeof opt === "object" && val in opt ? opt[val] : opt;
}

function getOption(value, valueCache) {
  const fn = (opt) => isEqual(getOptionValue.value(opt), value);
  return props.options.find(fn) || valueCache.find(fn) || value;
}

function fieldValueIsFilled(val) {
  return val !== undefined && val !== null && ("" + val).length > 0;
}

function getEmittingOptionValue(opt) {
  return props.emitValue === true
    ? getOptionLabel.value(opt)
    : getOptionValue.value(opt);
}

function removeAtIndex(index) {
  if (index > -1 && index < innerValue.value.length) {
    if (props.multiple === true) {
      const model = props.modelValue.slice();
      emit("remove", { index, value: model.splice(index, 1)[0] });
      emit("update:modelValue", model);
    } else {
      emit("update:modelValue", null);
    }
  }
}

function isOptionSelected(opt) {
  const val = getOptionValue.value(opt);
  return innerOptionsValue.value.find((v) => isEqual(v, val)) !== void 0;
}

function closeDropdown() {
  isOpened.value = false;
  popper.value?.destroy();
  inputFieldWrapRef.value.style.borderRadius = "var(--select-border-radius)";
  emit("close");
}

async function toggleDropdown() {
  if (!props.readonly) {
    if (isOpened.value) {
      closeDropdown();
    } else {
      isOpened.value = true;
      await nextTick(() => {
        searchRef?.value?.focus();
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

function toggleOption(opt: { [x: string]: string }) {
  if (opt === void 0) {
    return;
  }

  const optValue = getOptionValue.value(opt);

  if (props.multiple !== true) {
    if (
      innerValue.value.length === 0 ||
      isEqual(getOptionValue.value(innerValue.value[0]), optValue) !== true
    ) {
      emit("update:modelValue", props.emitValue === true ? optValue : opt);
      isOpened.value = false;
    }
    return;
  }

  if (innerValue.value.length === 0) {
    const val = props.emitValue === true ? optValue : opt;
    emit("add", { index: 0, value: val });
    emit("update:modelValue", props.multiple === true ? [val] : val);
    return;
  }

  const model = props.modelValue.slice();
  const index = innerOptionsValue.value.findIndex((v) => isEqual(v, optValue));

  if (index > -1) {
    emit("remove", { index, value: model.splice(index, 1)[0] });
  } else {
    const val = props.emitValue === true ? optValue : opt;

    emit("add", { index: model.length, value: val });
    model.push(val);
  }

  emit("update:modelValue", model);

  if (isOpened.value) {
    popper.value.update();
  }
}

function onInput(e: Event) {
  if (!e || !e.target) {
    return;
  }

  const newValue = (e.target as HTMLInputElement).value;
  emitValue(newValue);
}

function emitValue(val) {
  emitValueFn = () => {
    emit("filter", val);
    emitValueFn = undefined;
  };

  if (props.filterDebounce !== undefined) {
    clearTimeout(emitTimer);
    emitTimer = setTimeout(emitValueFn, +props.filterDebounce);
  } else {
    emitValueFn();
  }
}

function onReset() {
  emit("update:modelValue", null);
  emit("click:clear", props.modelValue);
}

defineExpose({
  removeAtIndex,
  toggleOption,
  isOptionSelected,
  getEmittingOptionValue,
  getOptionValue,
  getOptionLabel,
});
</script>

<style lang="scss">
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
  --select-clear-color: #43b0e6;
  --select-clear-color-hover: #319ed4;
}

.vc-select {
  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[color:var(--select-background-color-disabled)] tw-text-[#424242];
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--select-border-color-error)];
  }

  &_disabled &__field {
    @apply tw-cursor-auto;
  }

  &_opened &__chevron {
    @apply tw-rotate-180;
  }

  &_opened &__field-wrapper {
    @apply tw-rounded-t-[var(--select-border-radius)];
  }
}
</style>
