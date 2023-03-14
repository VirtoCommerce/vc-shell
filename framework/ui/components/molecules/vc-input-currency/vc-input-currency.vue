<template>
  <VcSelect
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :searchable="true"
    :autofocus="true"
    :debounce="debounce"
    :label="label"
    :required="required"
    :model-value="option"
    @update:modelValue="$emit('update:option', $event)"
  >
    <template v-slot:control="{ toggleHandler }">
      <VcInput
        :placeholder="placeholder"
        :model-value="modelValue"
        :hint="hint"
        :clearable="clearable"
        :prefix="prefix"
        :suffix="suffix"
        :name="name"
        :loading="loading"
        :disabled="disabled"
        :autofocus="autofocus"
        :error="error"
        :error-message="errorMessage"
        :maxlength="maxlength"
        :tooltip="tooltip"
        class="tw-w-full"
        @update:modelValue="$emit('update:modelValue', +$event)"
      >
        <template v-slot:append-inner>
          <slot
            name="button"
            :toggleHandler="toggleHandler"
          >
            <button
              class="tw-text-[#43b0e6] tw-not-italic tw-font-medium tw-text-[13px] tw-leading-[20px] tw-cursor-pointer"
              @click.stop.prevent="toggleHandler"
            >
              {{ option }}
            </button>
          </slot>
        </template>
        <template v-slot:control="{ placeholder }">
          <input
            type="text"
            ref="inputRef"
            :placeholder="placeholder"
          />
        </template>
      </VcInput>
    </template>
  </VcSelect>
</template>

<script lang="ts" setup>
import { inputCurrencyEmits, inputCurrencyProps } from "./vc-input-currency-model";
import { useCurrencyInput, CurrencyDisplay } from "vue-currency-input";
import { watch } from "vue";

const props = defineProps({...inputCurrencyProps});

defineEmits({...inputCurrencyEmits});

const { inputRef, setOptions } = useCurrencyInput({
  locale: navigator.language,
  currency: props.option || "USD",
  autoSign: false,
  currencyDisplay: CurrencyDisplay.hidden,
  hideGroupingSeparatorOnFocus: false,
});

// Change currency settings
watch(
  () => props.option,
  (newVal) => {
    setOptions({
      locale: navigator.language,
      currency: newVal,
      autoSign: false,
      currencyDisplay: CurrencyDisplay.hidden,
      hideGroupingSeparatorOnFocus: false,
    });
  }
);
</script>
