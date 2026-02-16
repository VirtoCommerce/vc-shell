<template>
  <div
    ref="toggleRef"
    class="vc-select__dropdown-toggle"
  >
    <slot
      name="control"
      :toggle-handler="toggleDropdown"
      :is-opened="isOpened"
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
                    role="combobox"
                    tabindex="0"
                    :aria-expanded="isOpened"
                    aria-haspopup="listbox"
                    :aria-controls="isOpened ? listboxId : undefined"
                    :aria-labelledby="label ? labelId : undefined"
                    :aria-describedby="ariaDescribedBy"
                    :aria-invalid="error || undefined"
                    @click.stop="toggleDropdown"
                    @keydown.enter.stop="toggleDropdown"
                    @keydown.space.stop="toggleDropdown"
                    @focus="$emit('focus')"
                    @blur="$emit('blur')"
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
                            <slot
                              name="selected-item"
                              v-bind="item"
                            >
                              <div class="vc-select__multiple-item">
                                <template v-if="loading">
                                  <span class="vc-select__loading">{{
                                    t("COMPONENTS.MOLECULES.VC_SELECT.LOADING")
                                  }}</span>
                                </template>
                                <template v-else>
                                  <span>{{ getOptionLabel(item.opt) }}</span>
                                </template>
                                <VcIcon
                                  v-if="!disabled"
                                  class="vc-select__icon-remove"
                                  icon="lucide-x"
                                  size="xs"
                                  @click.stop="$emit('removeAtIndex', item.index)"
                                ></VcIcon>
                              </div>
                            </slot>
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
                    role="button"
                    aria-label="Clear selection"
                    tabindex="0"
                    @click="$emit('reset')"
                    @keydown.enter="$emit('reset')"
                    @keydown.space="$emit('reset')"
                  >
                    <VcIcon
                      size="xs"
                      icon="lucide-x"
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
                  v-if="loading || listLoading || defaultOptionLoading"
                  class="vc-select__loading-icon"
                >
                  <VcIcon
                    icon="lucide-loader-2"
                    class="tw-animate-spin"
                    size="m"
                  ></VcIcon>
                </div>
                <!-- Select chevron-->
                <div
                  v-if="!disabled"
                  class="vc-select__chevron-container"
                  role="button"
                  aria-label="Toggle dropdown"
                  tabindex="0"
                  @click.stop="toggleDropdown"
                  @keydown.enter.stop="toggleDropdown"
                  @keydown.space.stop="toggleDropdown"
                >
                  <div class="vc-select__chevron">
                    <VcIcon
                      size="s"
                      icon="lucide-chevron-down"
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
                    :id="errorId"
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
                    :id="hintId"
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
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { VcHint, VcIcon } from "./../../../";
import { useI18n } from "vue-i18n";

defineProps<{
  isOpened: boolean;
  hasValue: boolean;
  selectedScope: {
    index: number;
    opt: any;
    selected: boolean;
    toggleOption: (opt: any) => void;
    removeAtIndex: (index: number) => void;
  }[];
  multiple?: boolean;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  size?: "default" | "small";
  error?: boolean;
  errorMessage?: string;
  hint?: string;
  listLoading: boolean;
  defaultOptionLoading: boolean;
  listboxId: string;
  labelId: string;
  label?: string;
  ariaDescribedBy?: string;
  errorId: string;
  hintId: string;
  toggleDropdown: () => void;
  getOptionLabel: (opt: any) => any;
  getEmittingOptionValue: (opt: any) => any;
}>();

defineEmits<{
  focus: [];
  blur: [];
  reset: [];
  removeAtIndex: [index: number];
}>();

defineSlots<{
  control: (scope: { toggleHandler: () => void; isOpened: boolean }) => any;
  "prepend-inner": (props: any) => any;
  "append-inner": (props: any) => any;
  prepend: (props: any) => any;
  append: (props: any) => any;
  "selected-item": (scope: {
    index: number;
    opt: any;
    selected: boolean;
    removeAtIndex: (index: number) => void;
  }) => any;
  error: (props: any) => any;
  hint: (props: any) => any;
}>();

const { t } = useI18n({ useScope: "global" });

const toggleRef = ref<HTMLElement | null>(null);

defineExpose({
  toggleRef,
});
</script>
