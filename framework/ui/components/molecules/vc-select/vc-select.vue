<template>
  <div
    class="vc-select"
    :class="{
      'vc-select_opened': isOpened,
      'vc-select_error': error,
      'vc-select_disabled': disabled,
      'vc-select_has-hint-or-error': error || hint,
      'vc-select_no-outline': !outline,
    }"
  >
    <!-- Select label -->
    <VcLabel
      v-if="label"
      class="vc-select__label"
      :required="required"
      :multilanguage="multilanguage"
      :current-language="currentLanguage"
    >
      <span>{{ label }}</span>
      <template
        v-if="tooltip"
        #tooltip
      >
        <span v-html="tooltip"></span>
      </template>
    </VcLabel>

    <!-- Select field -->
    <div class="vc-select__field-container">
      <div
        ref="dropdownToggleRef"
        class="vc-select__dropdown-toggle"
      >
        <slot
          name="control"
          :toggle-handler="toggleDropdown"
        >
          <div class="vc-select__control">
            <div
              v-if="$slots['prepend']"
              class="vc-select__prepend"
            >
              <slot name="prepend"></slot>
            </div>
            <div
              class="vc-select__field-wrapper"
              :class="{
                'vc-select__field-wrapper--default': size === 'default',
                'vc-select__field-wrapper--small': size === 'small',
              }"
            >
              <div class="vc-select__field">
                <div class="vc-select__field-inner">
                  <div class="vc-select__field-content">
                    <div
                      v-if="$slots['prepend-inner']"
                      class="vc-select__prepend-inner"
                    >
                      <slot name="prepend-inner"></slot>
                    </div>
                    <div class="vc-select__field-main">
                      <div
                        v-if="prefix"
                        class="vc-select__prefix"
                      >
                        {{ prefix }}
                      </div>
                      <div
                        data-test-id="dropdown-toggle"
                        class="vc-select__input"
                        @click.stop="toggleDropdown"
                      >
                        <div
                          v-if="!hasValue"
                          class="vc-select__placeholder"
                        >
                          <template v-if="placeholder">{{ placeholder }}</template>
                          <template v-else>{{ t("COMPONENTS.MOLECULES.VC_SELECT.CLICK_TO_SELECT") }}</template>
                        </div>
                        <template v-else-if="selectedScope && selectedScope.length && hasValue">
                          <div class="vc-select__selected">
                            <div
                              v-for="(item, i) in selectedScope"
                              :key="i"
                              class="vc-select__selected-item"
                            >
                              <template v-if="multiple">
                                <div class="vc-select__multiple-item">
                                  <template v-if="loading">
                                    <span class="vc-select__loading">{{
                                      t("COMPONENTS.MOLECULES.VC_SELECT.LOADING")
                                    }}</span>
                                  </template>
                                  <template v-else>
                                    <slot
                                      name="selected-item"
                                      v-bind="item"
                                    >
                                      <span>{{ getOptionLabel(item.opt) }}</span>
                                    </slot>
                                  </template>
                                  <VcIcon
                                    v-if="!disabled"
                                    class="vc-select__icon-remove"
                                    icon="fas fa-times"
                                    size="s"
                                    @click.stop="removeAtIndex(item.index)"
                                  ></VcIcon>
                                </div>
                              </template>
                              <template v-else-if="!multiple">
                                <template v-if="loading">
                                  <span class="vc-select__loading">{{
                                    t("COMPONENTS.MOLECULES.VC_SELECT.LOADING")
                                  }}</span>
                                </template>
                                <template v-else>
                                  <slot
                                    name="selected-item"
                                    v-bind="item"
                                  >
                                    {{
                                      loading
                                        ? t("COMPONENTS.MOLECULES.VC_SELECT.LOADING")
                                        : getEmittingOptionValue(item.opt)
                                    }}
                                  </slot>
                                </template>
                              </template>
                            </div>
                          </div>
                        </template>
                      </div>
                      <div
                        v-if="suffix"
                        class="vc-select__suffix"
                      >
                        {{ suffix }}
                      </div>
                      <div
                        v-if="clearable && hasValue && !disabled"
                        class="vc-select__clear"
                        @click="onReset"
                      >
                        <VcIcon
                          size="s"
                          icon="fas fa-times"
                        ></VcIcon>
                      </div>
                    </div>
                    <div
                      v-if="$slots['append-inner']"
                      class="vc-select__append-inner"
                    >
                      <slot name="append-inner"></slot>
                    </div>
                    <!-- Loading-->
                    <div
                      v-if="loading || listLoading"
                      class="vc-select__loading-icon"
                    >
                      <VcIcon
                        icon="fas fa-circle-notch tw-animate-spin"
                        size="m"
                      ></VcIcon>
                    </div>
                    <!-- Select chevron-->
                    <div
                      v-if="!disabled"
                      class="vc-select__chevron-container"
                      @click.stop="toggleDropdown"
                    >
                      <div class="vc-select__chevron">
                        <VcIcon
                          size="s"
                          icon="fas fa-chevron-down"
                        ></VcIcon>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="vc-select__hint-error">
                <Transition
                  name="slide-up"
                  mode="out-in"
                >
                  <div v-if="error">
                    <slot name="error">
                      <VcHint
                        v-if="errorMessage"
                        class="vc-select__error-message"
                      >
                        {{ errorMessage }}
                      </VcHint>
                    </slot>
                  </div>
                  <div v-else>
                    <slot name="hint">
                      <VcHint
                        v-if="hint"
                        class="vc-select__hint"
                      >
                        {{ hint }}
                      </VcHint>
                    </slot>
                  </div>
                </Transition>
              </div>
            </div>

            <div
              v-if="$slots['append']"
              class="vc-select__append"
            >
              <slot name="append"></slot>
            </div>
          </div>
        </slot>
      </div>

      <teleport to="body">
        <div
          v-if="isOpened"
          ref="dropdownRef"
          v-on-click-outside="[toggleDropdown, { ignore: [dropdownToggleRef] }]"
          data-test-id="dropdown"
          class="vc-select__dropdown"
          :style="dropdownStyle"
        >
          <input
            v-if="searchable"
            ref="searchRef"
            class="vc-select__search-input"
            @input="onInput"
          />

          <VcContainer
            ref="root"
            :no-padding="true"
          >
            <div v-if="listLoading"></div>
            <div
              v-else-if="!(optionsList && optionsList.length)"
              class="vc-select__no-options"
            >
              <slot name="no-options">
                <span class="vc-select__no-options-text">No options</span>
              </slot>
            </div>
            <div
              v-for="(item, i) in optionScope"
              v-else
              :key="i"
              class="vc-select__option"
              data-test-id="option"
              :class="{ 'vc-select__option--selected': item.selected }"
              @click="item.toggleOption(item.opt)"
            >
              <slot
                name="option"
                v-bind="item"
                >{{ item.label }}</slot
              >
            </div>
            <span
              v-if="hasNextPage"
              ref="el"
            ></span>
          </VcContainer>
        </div>
      </teleport>
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T, P extends { results?: T[]; totalCount?: number }">
import { ref, computed, watch, nextTick, Ref, toRefs } from "vue";
import { vOnClickOutside } from "@vueuse/components";
import * as _ from "lodash-es";
import { useIntersectionObserver } from "@vueuse/core";
import {
  useFloating,
  UseFloatingReturn,
  offset as uiOffset,
  flip,
  shift,
  autoUpdate,
  MiddlewareState,
  Placement,
} from "@floating-ui/vue";
import { VcLabel, VcContainer, VcHint, VcIcon } from "./../../";
import { useI18n } from "vue-i18n";

export type OptionProp<T> = ((option: T) => string) | string | undefined;
type MaybeArray<T> = T | T[];
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
type ArrayElementType<T> = T extends Array<infer U> ? U : never;
type Option = T & ArrayElementType<Required<P>["results"]>;

defineSlots<{
  /**
   * Custom select control
   */
  control: (scope: { toggleHandler: () => void }) => any;
  /**
   * Prepend inner field
   */
  "prepend-inner": (props: any) => any;
  /**
   * Append to inner field
   */
  "append-inner": (props: any) => any;
  /**
   * Prepend outer field
   */
  prepend: (props: any) => any;
  /**
   * Append outer field
   */
  append: (props: any) => any;
  /**
   * What should the menu display after filtering options and none are left to be displayed
   * @param scope
   */
  "no-option": (props: any) => any;
  /**
   * Slot for errors
   */
  error: (props: any) => any;
  /**
   * Slot for hint text
   */
  hint: (props: any) => any;
  /**
   * Override default selection slot
   * @param scope
   */
  "selected-item": (scope: {
    /**
     * Selection index
     */
    index: number;
    /**
     * Selected option -- its value is taken from model
     */
    opt: Option;
    /**
     * Always true -- passed as prop
     */
    selected: boolean;
    /**
     * Remove selected option located at specific index
     * @param index Index at which to remove selection
     */
    removeAtIndex: (index: number) => void;
  }) => any;
  /**
   * Override default selection slot;
   */
  option: (scope: {
    /**
     * Option index
     */
    index: number;
    /**
     * Option -- its value is taken from 'options' prop
     */
    opt: Option;
    /**
     * Is option selected
     */
    selected: boolean;
    /**
     * Add/remove option from model
     * @param opt Option to add to model
     */
    toggleOption: (opt: any) => void;
  }) => any;
  "no-options": (props: any) => any;
}>();

const props = withDefaults(
  defineProps<{
    /**
     * Name of select
     */
    name?: string;
    /**
     * Model of the component; Must be Array if using 'multiple' prop; Use this property with a listener for 'update:modelValue' event OR use v-model directive
     */

    modelValue?: any;
    /**
     * Try to map labels of model from 'options' Array; If you are using emit-value you will probably need to use map-options to display the label text in the select field rather than the value.
     * @default true
     */
    mapOptions?: boolean;
    /**
     * Does field have validation errors?
     */
    error?: boolean;
    /**
     * Validation error message (gets displayed only if 'error' is set to 'true')
     */
    errorMessage?: string;
    /**
     * Select label
     */
    label?: string;
    /**
     * Select description (hint) text below input component
     */
    hint?: string;
    /**
     * Prefix
     */
    prefix?: string;
    /**
     * Suffix
     */
    suffix?: string;
    /**
     * Signals the user a process is in progress by displaying a spinner
     */
    loading?: boolean;
    /**
     * Appends clearable icon when a value is set;
     * When clicked, model becomes null
     */
    clearable?: boolean;
    /**
     * Put component in disabled mode
     */
    disabled?: boolean;
    /**
     * Allow multiple selection; Model must be Array
     */
    multiple?: boolean;
    /**
     * Available options that the user can select from.
     * @default []
     */
    options?: ((keyword?: string, skip?: number, ids?: string[]) => Promise<P>) | T[];
    /**
     * Property of option which holds the 'value'
     * @default id
     * @param option The current option being processed
     * @returns Value of the current option
     */
    optionValue?: OptionProp<Option>;
    /**
     * Property of option which holds the 'label'
     * @default title
     * @param option The current option being processed
     * @returns Label of the current option
     */
    optionLabel?: OptionProp<Option>;
    /**
     * Update model with the value of the selected option instead of the whole option
     */
    emitValue?: boolean;
    /**
     * Debounce the search input update with an amount of milliseconds
     * @default 500
     */
    debounce?: number | string;
    /**
     * Input placeholder text
     */
    placeholder?: string;
    /**
     * Input tooltip information
     */
    tooltip?: string;
    /**
     * Input required state
     */
    required?: boolean;
    /**
     * Input search activation
     */
    searchable?: boolean;
    multilanguage?: boolean;
    currentLanguage?: string;
    size?: "default" | "small";
    outline?: boolean;
    placement?: Placement;
    offset?:
      | {
          crossAxis?: number;
          mainAxis?: number;
        }
      | number;
  }>(),
  {
    optionValue: "id",
    optionLabel: "title",
    debounce: 500,
    clearable: true,
    name: "Field",
    emitValue: true,
    mapOptions: true,
    size: "default",
    options: (): T[] => [],
    outline: true,
    placement: "bottom",
    offset: -2,
  },
);

const emit = defineEmits<{
  /**
   * Emitted when the component needs to change the model; Is also used by v-model
   */

  "update:modelValue": [inputValue: MaybeArray<string | Option> | null];
  /**
   * Emitted when user wants to filter a value
   */
  search: [inputValue: string];
  /**
   * Emitted when the select options list is hidden
   */
  close: [];
}>();

const { t } = useI18n({ useScope: "global" });

const { modelValue, options } = toRefs(props);

const isOpened = ref(false);

const searchRef = ref();
const dropdownToggleRef = ref();
const dropdownRef = ref();
const root = ref();
const el = ref();
const listLoading = ref(false);

const filterString = ref();

const defaultValue = ref<Option[]>([]) as Ref<Option[]>;

const optionsList = ref<Option[]>([]) as Ref<Option[]>;

const optionsTemp = ref<Option[]>([]) as Ref<Option[]>;

const totalItems = ref();

let emitValueFn;
let emitTimer: NodeJS.Timeout;
let innerValueCache: Option[];

useIntersectionObserver(
  el,
  ([{ isIntersecting }]) => {
    if (isIntersecting && hasNextPage.value) {
      onLoadMore();
    }
  },
  { threshold: 1, root: root.value?.component },
);

const popper = useFloating(dropdownToggleRef, dropdownRef, {
  placement: props.placement,
  whileElementsMounted: autoUpdate,
  middleware: [
    flip({ fallbackPlacements: ["top", "bottom"] }),
    shift({ mainAxis: false }),
    sameWidthChangeBorders(),
    uiOffset(props.offset),
  ],
}) as FloatingInstanceType;

watch(
  modelValue,
  async (newVal, oldVal) => {
    if (newVal && !oldVal) {
      const initial = optionsList.value.filter((x) => {
        if (props.modelValue && Array.isArray(props.modelValue)) {
          return _.intersection(optionsList.value, props.modelValue);
        } else if (props.modelValue && typeof props.modelValue === "object") {
          return optionsList.value.includes(props.modelValue);
        } else {
          return x[props.optionLabel as keyof Option] === props.modelValue;
        }
      });

      if (initial && initial.length) {
        defaultValue.value = initial;
      } else {
        if (props.options && typeof props.options === "function") {
          const data = await props.options(
            undefined,
            undefined,
            Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue],
          );

          if (typeof data === "object" && !Array.isArray(data) && "results" in data) {
            if (props.multiple) {
              defaultValue.value = data.results?.filter((x) =>
                props.modelValue.includes(x[props.optionValue as keyof T]),
              ) as Option[];
            } else {
              defaultValue.value = data.results?.filter(
                (x) => x[props.optionValue as keyof T] === props.modelValue,
              ) as Option[];
            }
          } else if (Array.isArray(data)) {
            defaultValue.value = data?.filter((x) => x[props.optionValue as keyof T] === props.modelValue);
          }
        } else if (props.options && Array.isArray(props.options)) {
          defaultValue.value = props.options.filter(
            (x) => x[props.optionValue as keyof T] === props.modelValue,
          ) as Option[];
        }
      }
    }
  },
  { immediate: true },
);

watch(
  isOpened,
  async (newVal) => {
    if (newVal && !optionsList.value.length) {
      if (props.options && typeof props.options === "function") {
        try {
          listLoading.value = true;
          const data = await props.options();
          optionsList.value = data.results as Option[];
          totalItems.value = data.totalCount;
        } finally {
          listLoading.value = false;
        }
      }

      optionsTemp.value = optionsList.value;
    }
  },
  { immediate: true },
);

watch(
  options,
  async (newVal) => {
    if (newVal && !optionsList.value.length && typeof props.options !== "function") {
      if (props.options && Array.isArray(props.options)) {
        optionsList.value = props.options as Option[];
      }

      optionsTemp.value = optionsList.value;
    }
  },
  { immediate: true },
);

watch(
  () => popper.isPositioned.value,
  (newVal) => {
    if (newVal) {
      popper.update();
    }
  },
);

async function onLoadMore() {
  if (props.options && typeof props.options === "function") {
    try {
      listLoading.value = true;
      const data = await props.options(filterString.value, optionsList.value.length);
      optionsList.value = _.unionBy<Option>(optionsList.value, data.results as Option[], "id");

      totalItems.value = data.totalCount;
      optionsTemp.value = optionsList.value;
    } finally {
      listLoading.value = false;
    }
  }
}

const hasNextPage = computed(() => {
  return optionsList.value.length < totalItems.value;
});

const getOptionValue = computed(() => getPropValueFn(props.optionValue, "id"));

const getOptionLabel = computed(() => getPropValueFn(props.optionLabel, "title"));

const innerValue = computed((): Option[] => {
  const mapNull = props.mapOptions === true && props.multiple !== true;

  const val =
    props.modelValue !== undefined && (props.modelValue !== null || mapNull === true)
      ? props.multiple === true && Array.isArray(props.modelValue)
        ? props.modelValue
        : [props.modelValue]
      : [];

  if (props.mapOptions === true && Array.isArray(optionsList.value) === true) {
    const cache = props.mapOptions === true && innerValueCache !== undefined ? innerValueCache : [];

    const values = val.map((v) => getOption(v, cache));

    return props.modelValue === null && mapNull === true ? values.filter((v) => v !== null) : values;
  }

  return val;
});

watch(
  innerValue,
  (val) => {
    innerValueCache = val;
  },
  { immediate: true },
);

const selectedScope = computed(
  (): {
    index: number;
    opt: Option;
    selected: boolean;
    toggleOption: (opt: Option) => void;
    removeAtIndex: (index: number) => void;
  }[] => {
    return innerValue.value.map((opt: Option, i: number) => ({
      index: i,
      opt,
      selected: true,
      toggleOption,
      removeAtIndex,
    }));
  },
);

const hasValue = computed(() => fieldValueIsFilled(innerValue.value));

const innerOptionsValue = computed(() => innerValue.value.map((opt) => getOptionValue.value(opt)));

const optionScope = computed(() => {
  return optionsList.value.map((opt, i) => {
    return {
      index: i,
      opt,
      selected: isOptionSelected(opt) === true,
      label: getOptionLabel.value(opt),
      toggleOption,
    };
  });
});

const dropdownStyle = computed(() => {
  return {
    top: `${popper.y.value ?? 0}px`,
    left: `${popper.x.value ?? 0}px`,
    ...popper.middlewareData.value.sameWidthChangeBorders,
  };
});

function getPropValueFn(propValue: OptionProp<Option>, defaultVal: OptionProp<Option>) {
  const val = propValue !== undefined ? propValue : defaultVal;

  if (typeof val === "function") {
    return val;
  } else {
    return (opt: Option) => {
      if (opt !== null && typeof opt === "object" && val && val in opt) {
        return opt[val as keyof Option];
      } else {
        return opt;
      }
    };
  }
}

function getOption(value: Option, valueCache: Option[]) {
  const fn = (opt: Option) => _.isEqual(getOptionValue.value(opt), value);
  return defaultValue.value.find(fn) || optionsList.value.find(fn) || valueCache.find(fn) || value;
}

function fieldValueIsFilled(val: Option[]) {
  return val !== undefined && val !== null && ("" + val).length > 0;
}

function getEmittingOptionValue(opt: Option) {
  return getOptionLabel.value(opt);
}

function removeAtIndex(index: number) {
  if (index > -1 && index < innerValue.value.length) {
    if (props.multiple === true) {
      const model = props.modelValue.slice();
      model.splice(index, 1);
      emit("update:modelValue", model);
    } else {
      emit("update:modelValue", null);
    }
  }
}

function isOptionSelected(opt: Option) {
  const val = getOptionValue.value(opt);

  return innerOptionsValue.value.find((v) => _.isEqual(v, val)) !== void 0;
}

function closeDropdown() {
  onDropdownClose();
  isOpened.value = false;
  emit("close");
}

const onDropdownClose = async () => {
  if (props.options && typeof props.options === "function") {
    const data = await props.options();
    optionsList.value = data.results as Option[];
    totalItems.value = data.totalCount;
  } else {
    optionsList.value = props.options as Option[];
  }
  optionsTemp.value = optionsList.value;

  filterString.value = undefined;
};

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
        data: props.outline
          ? {
              borderTop,
              borderBottom,
              borderRadius,
              width,
            }
          : {
              border: "1px solid var(--select-border-color)",
              width: "max-content",
            },
      };
    },
  };
}

function toggleOption(opt: Option) {
  if (opt === void 0) {
    return;
  }

  const optValue = getOptionValue.value(opt) as Option[];

  if (props.multiple !== true) {
    if (innerValue.value.length === 0 || _.isEqual(getOptionValue.value(innerValue.value[0]), optValue) !== true) {
      emit("update:modelValue", props.emitValue === true ? optValue : opt);
    }

    closeDropdown();
    return;
  }

  if (innerValue.value.length === 0) {
    const val = props.emitValue === true ? optValue : opt;
    emit("update:modelValue", props.multiple === true ? ([val] as Option[]) : (val as Option));
    return;
  }

  const model = props.modelValue.slice();
  const index = innerOptionsValue.value.findIndex((v) => _.isEqual(v, optValue));

  if (index > -1) {
    model.splice(index, 1);
  } else {
    const val = props.emitValue === true ? optValue : opt;
    model.push(val);
  }

  emit("update:modelValue", model);

  if (isOpened.value) {
    popper.update();
  }
}

async function onSearch(value: string) {
  filterString.value = value;
  if (props.options && typeof props.options === "function") {
    try {
      listLoading.value = true;

      const data = await props.options(filterString.value);

      optionsList.value = data.results as Option[];
      totalItems.value = data.totalCount;
    } finally {
      listLoading.value = false;
    }
  } else {
    optionsList.value = optionsTemp.value.filter((x: Option) => {
      return (x[props.optionLabel as keyof Option] as string).toLowerCase().includes(filterString.value.toLowerCase());
    });
  }
}

function onInput(e: Event) {
  if (!e || !e.target) {
    return;
  }

  const newValue = (e.target as HTMLInputElement).value;
  emitValueFunc(newValue);
}

function emitValueFunc(val: string) {
  emitValueFn = () => {
    emit("search", val);
    onSearch(val);
    emitValueFn = undefined;
  };

  if (props.debounce !== undefined) {
    clearTimeout(emitTimer);
    emitTimer = setTimeout(emitValueFn, +props.debounce);
  } else {
    emitValueFn();
  }
}

function onReset() {
  if (props.multiple) {
    emit("update:modelValue", []);
    return;
  }
  emit("update:modelValue", null);
}
</script>

<style lang="scss">
:root {
  --select-height: 38px;
  --select-height-small: 28px;
  --select-border-radius: 3px;
  --select-border-color: var(--secondary-200);
  --select-border-color-error: var(--base-error-color, var(--danger-500));
  --select-background-color: var(--additional-50);
  --select-background-color-disabled: var(--neutrals-50);
  --select-placeholder-color: var(--neutrals-400);
  --select-chevron-color: var(--primary-500);
  --select-chevron-color-hover: var(--primary-600);
  --select-clear-color: var(--primary-500);
  --select-clear-color-hover: var(--primary-600);
  --select-disabled-field-color: var(--neutrals-700);

  --select-loading-color: var(--info-500);
  --select-option-background-color-hover: var(--accent-100);
  --select-option-background-color-selected: var(--accent-200);
  --select-border-color-input: var(--secondary-200);

  --select-search-background-color: var(--additional-50);
}

.vc-select {
  &_no-outline {
    .vc-select__chevron-container {
      display: none;
    }

    .vc-select__field {
      border: none;
      background-color: transparent !important;
    }
  }

  &__container {
    @apply tw-box-border tw-w-full;
  }

  &__label {
    @apply tw-mb-2;
  }

  &__field-container {
    @apply tw-flex tw-flex-nowrap tw-items-start tw-relative;
  }

  &__dropdown-toggle {
    @apply tw-flex tw-flex-auto tw-text-left tw-max-w-full;
  }

  &__control {
    @apply tw-relative tw-flex tw-flex-auto tw-text-left tw-max-w-full;
  }

  &__prepend,
  &__append {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pr-3;
  }

  &__field-wrapper {
    @apply tw-relative tw-flex tw-flex-auto tw-overflow-x-clip tw-truncate;

    &--default {
      @apply tw-min-h-[var(--select-height)];
    }

    &--small {
      @apply tw-min-h-[var(--select-height-small)];
    }
  }

  &__field {
    @apply tw-truncate tw-relative tw-box-border tw-border tw-border-solid tw-border-[color:var(--select-border-color)] tw-rounded-sm tw-bg-[color:var(--select-background-color)] tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-items-stretch;
  }

  &__field-inner {
    @apply tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-relative;
  }

  &__field-content {
    @apply tw-flex tw-flex-nowrap tw-flex-auto tw-h-full tw-px-3;
  }

  &__prepend-inner,
  &__append-inner {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pr-3;
  }

  &__field-main {
    @apply tw-flex tw-flex-nowrap tw-flex-auto tw-h-full tw-truncate;
  }

  &__prefix,
  &__suffix {
    @apply tw-flex tw-items-center tw-flex-wrap tw-pr-3 tw-pointer-events-none tw-text-sm;
  }

  &__input {
    @apply tw-appearance-none tw-border-none tw-outline-none tw-flex tw-items-center tw-w-full tw-box-border tw-cursor-pointer invalid:tw-text-[color:var(--select-placeholder-color)] tw-truncate;

    &--default {
      @apply tw-min-h-10;
    }

    &--small {
      @apply tw-min-h-7;
    }
  }

  &__placeholder {
    @apply tw-text-[color:var(--select-placeholder-color)] tw-text-sm;
  }

  &__selected {
    @apply tw-flex tw-flex-wrap tw-gap-1 tw-py-1;
  }

  &__selected-item {
    @apply tw-flex tw-items-center tw-text-sm;
  }

  &__multiple-item {
    @apply tw-bg-[color:var(--select-option-background-color-selected)] tw-border tw-border-solid tw-border-[color:var(--select-border-color)] tw-rounded-sm tw-flex tw-items-center tw-h-7 tw-box-border tw-px-2;
  }

  &__loading {
    @apply tw-text-[color:var(--select-loading-color)];
  }

  &__icon-remove {
    @apply tw-text-[color:var(--select-clear-color)] tw-ml-2 tw-cursor-pointer hover:tw-text-[color:var(--select-clear-color-hover)];
  }

  &__clear {
    @apply tw-cursor-pointer tw-flex tw-items-center tw-pl-3 tw-text-[color:var(--select-clear-color)] hover:tw-text-[color:var(--select-clear-color-hover)];
  }

  &__loading-icon {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pl-3 tw-text-[color:var(--select-loading-color)];
  }

  &__chevron-container {
    @apply tw-flex tw-items-center tw-flex-nowrap tw-pl-3 tw-cursor-pointer;
  }

  &__chevron {
    @apply tw-flex-nowrap tw-text-[color:var(--select-chevron-color)] hover:tw-text-[color:var(--select-chevron-color-hover)];
  }

  &__hint-error {
    @apply tw-absolute tw-translate-y-full tw-left-0 tw-right-0 tw-bottom-0 tw-min-h-5;
  }

  &__error-message {
    @apply tw-mt-1 tw-text-[color:var(--select-border-color-error)];
  }

  &__hint {
    @apply tw-text-[color:var(--select-placeholder-color)] tw-mt-1 tw-break-words tw-p-0;
  }

  &__dropdown {
    @apply tw-flex tw-flex-col tw-box-border tw-max-h-72 tw-h-auto tw-z-[101] tw-overflow-hidden tw-absolute tw-bg-[color:var(--select-background-color)] tw-border tw-border-solid tw-border-[color:var(--select-border-color)] tw-border-t-[color:var(--select-background-color)] tw-rounded-b-sm tw-p-2;
  }

  &__search-input {
    @apply tw-w-full tw-box-border tw-border tw-border-solid tw-border-[color:var(--select-border-color-input)] tw-bg-[color:var(--select-search-background-color)] tw-rounded-md tw-h-8 tw-leading-8 tw-outline-none tw-mb-3 tw-px-2;
  }

  &__no-options {
    @apply tw-w-full tw-h-full tw-box-border tw-flex tw-flex-col tw-items-center tw-justify-center;
  }

  &__no-options-text {
    @apply tw-m-4 tw-text-lg tw-font-medium;
  }

  &__option {
    @apply tw-flex tw-items-center tw-min-h-9 tw-my-1 tw-box-border tw-px-2 tw-rounded-sm tw-cursor-pointer hover:tw-bg-[color:var(--select-option-background-color-hover)] tw-text-sm;

    &--selected {
      @apply tw-bg-[color:var(--select-option-background-color-selected)];
    }
  }

  &.vc-select_opened &__chevron {
    @apply tw-rotate-180;
  }

  &.vc-select_opened &__field {
    @apply tw-rounded-t-sm tw-rounded-b-none;
  }

  &.vc-select_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--select-border-color-error)];
  }

  &.vc-select_disabled &__field-wrapper,
  &.vc-select_disabled &__field,
  &.vc-select_disabled &__input {
    @apply tw-bg-[color:var(--select-background-color-disabled)] tw-text-[color:var(--select-disabled-field-color)] tw-cursor-auto;
  }

  &.vc-select_has-hint-or-error {
    @apply tw-pb-5;
  }
}
</style>
