<template>
  <div
    class="vc-input2"
    :class="[
      `vc-input2_${type}`,
      {
        'vc-input2_clearable': clearable,
        'vc-input2_error': error,
        'vc-input2_disabled': disabled,
        'tw-pb-[20px]': error || hint,
      },
    ]"
  >
    <!-- Input label -->
    <VcLabel v-if="label" class="tw-mb-2" :required="required">
      <span>{{ label }}</span>
      <template v-if="tooltip" v-slot:tooltip>{{ tooltip }}</template>
    </VcLabel>

    <div class="tw-flex tw-flex-nowrap tw-items-start">
      <div class="tw-relative tw-flex tw-flex-auto tw-text-left">
        <div
          class="tw-flex tw-items-center tw-flex-nowrap tw-pr-3"
          v-if="$slots['prepend']"
        >
          <slot name="prepend"></slot>
        </div>
        <div
          class="tw-flex tw-flex-col tw-flex-nowrap tw-flex-auto tw-relative"
        >
          <div class="vc-input2__field-wrapper">
            <div class="tw-flex tw-flex-nowrap tw-flex-auto tw-h-full">
              <div
                class="tw-flex tw-items-center tw-flex-nowrap tw-pr-3"
                v-if="$slots['prepend-inner']"
              >
                <slot name="prepend-inner"></slot>
              </div>
              <div class="vc-input2__field">
                <div
                  class="tw-flex tw-items-center tw-flex-wrap tw-pr-3 tw-pointer-events-none"
                  v-if="prefix"
                >
                  {{ prefix }}
                </div>
                <slot
                  name="control"
                  :editable="disabled"
                  :focused="autofocus"
                  :modelValue="temp"
                  :emitValue="onInput"
                >
                  <input
                    :placeholder="placeholder"
                    :type="internalType"
                    v-model="temp"
                    :disabled="disabled"
                    @input="onInput"
                    ref="inputRef"
                    :name="name"
                    :maxlength="maxlength"
                    :autofocus="autofocus"
                    :max="maxDate"
                  />
                </slot>
                <div
                  class="tw-flex tw-items-center tw-flex-wrap tw-pl-3 tw-pointer-events-none"
                  v-if="suffix"
                >
                  {{ suffix }}
                </div>
                <div
                  v-if="
                    clearable && modelValue && !disabled && type !== 'password'
                  "
                  class="vc-input2__clear"
                  @click="onReset"
                >
                  <VcIcon size="s" icon="fas fa-times"></VcIcon>
                </div>

                <div
                  class="vc-input__showhide"
                  v-if="type === 'password' && internalType === 'password'"
                  @click="internalType = 'text'"
                >
                  <VcIcon size="s" icon="fas fa-eye-slash"></VcIcon>
                </div>

                <div
                  class="vc-input__showhide"
                  v-if="type === 'password' && internalType === 'text'"
                  @click="internalType = 'password'"
                >
                  <VcIcon size="s" icon="fas fa-eye"></VcIcon>
                </div>
              </div>

              <div
                class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
                v-if="$slots['append-inner']"
              >
                <slot name="append-inner"></slot>
              </div>
              <div
                class="tw-flex tw-items-center tw-flex-nowrap tw-pl-3"
                v-if="loading"
              >
                <VcIcon
                  icon="fas fa-spinner tw-animate-spin"
                  class="tw-text-[var(--input-clear-color)]"
                  size="m"
                ></VcIcon>
              </div>
            </div>
          </div>
          <div
            class="tw-absolute tw-translate-y-full tw-left-0 tw-right-0 tw-bottom-0 tw-min-h-[20px]"
          >
            <Transition name="slide-up" mode="out-in">
              <div v-if="error">
                <slot name="error">
                  <VcHint class="vc-input2__error" v-if="errorMessage">
                    {{ errorMessage }}
                  </VcHint>
                </slot>
              </div>
              <div v-else>
                <slot name="hint">
                  <VcHint class="vc-input2__desc" v-if="hint">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, unref, watch } from "vue";
import { VcInputProps, VcInputEmits } from "./vc-input-new-model";

const props = withDefaults(defineProps<VcInputProps>(), {
  modelValue: null,
  clearable: false,
  required: false,
  disabled: false,
  type: "text",
  name: "Field",
  maxlength: "1024",
});

const emit = defineEmits<VcInputEmits>();

let emitTimer;
let emitValueFn;
const temp = ref();
const inputRef = ref();

const internalType = ref(unref(props.type));

const maxDate = computed(() => props.type === "date" && "9999-12-31");

watch(
  () => props.modelValue,
  () => {
    if (temp.value !== props.modelValue) {
      temp.value = props.modelValue;
    }
  }
);

// Handle input event and emit changes
function onInput(e: Event) {
  if (!e || !e.target) {
    return;
  }

  const newValue = (e.target as HTMLInputElement).value;
  emitValue(newValue);
}

function emitValue(val) {
  emitValueFn = () => {
    if (props.modelValue !== val) {
      emit("update:modelValue", val);
    }
    emitValueFn = undefined;
  };

  if (props.debounce !== undefined) {
    clearTimeout(emitTimer);
    emitTimer = setTimeout(emitValueFn, +props.debounce);
  } else {
    emitValueFn();
  }
}

// Handle input event to properly reset value and emit changes
function onReset() {
  temp.value = null;
  emit("update:modelValue", null);
}

function focus() {
  inputRef.value.focus();
}

defineExpose({
  focus,
});
</script>

<style lang="scss">
:root {
  --input-height: 38px;
  --input-border-radius: 3px;
  --input-border-color: #d3dbe9;
  --input-border-color-error: #f14e4e;
  --input-background-color: #ffffff;
  --input-placeholder-color: #a5a5a5;
  --input-clear-color: #43b0e6;
  --input-clear-color-hover: #319ed4;
}

.vc-input2 {
  @apply tw-overflow-hidden;

  &_date,
  &_datetime-local {
    .vc-app_mobile & {
      @apply tw-max-w-full;
    }
  }

  &__field-wrapper {
    @apply tw-px-3 tw-relative tw-flex tw-flex-nowrap tw-w-full tw-outline-none tw-h-[var(--input-height)] tw-min-w-0 tw-box-border tw-grow tw-border tw-border-solid tw-border-[color:var(--input-border-color)] tw-rounded-[var(--input-border-radius)] tw-bg-[color:var(--input-background-color)];
  }

  &_error &__field-wrapper {
    @apply tw-border tw-border-solid tw-border-[color:var(--input-border-color-error)];
  }

  &__error {
    @apply tw-mt-1 [--hint-color:var(--input-border-color-error)];
  }

  &__desc {
    @apply tw-text-[color:var(--input-placeholder-color)] tw-mt-1 tw-break-words tw-p-0;
  }

  &__field {
    @apply tw-w-auto tw-min-w-0 tw-max-w-full tw-relative tw-flex tw-flex-row tw-flex-auto tw-flex-nowrap [height:inherit];
    input {
      @apply tw-border-none tw-outline-none tw-h-full tw-min-w-0 tw-w-full tw-box-border tw-grow;

      &::-webkit-input-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::-moz-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::-ms-placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::placeholder {
        @apply tw-text-[color:var(--input-placeholder-color)];
      }

      &::-ms-reveal,
      &::-ms-clear {
        @apply tw-hidden;
      }
    }
  }

  &__clear {
    @apply tw-cursor-pointer tw-text-[color:var(--input-clear-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-flex tw-items-center tw-pl-3;
  }

  &__showhide {
    @apply tw-cursor-pointer tw-text-[color:var(--input-placeholder-color)] hover:tw-text-[color:var(--input-clear-color-hover)] tw-px-3 tw-flex tw-items-center;
  }

  &_disabled &__field-wrapper,
  &_disabled &__field {
    @apply tw-bg-[#fafafa] tw-text-[#424242];
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
