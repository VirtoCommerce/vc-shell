<template>
  <Field
    v-if="computedProperty.dictionary && !computedProperty.multivalue"
    v-slot="{ errorMessage, errors }"
    :label="computedProperty.displayName"
    :name="computedProperty.name"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcSelect
      v-bind="$attrs"
      v-model="value"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      :required="computedProperty.required"
      :placeholder="computedProperty.placeholder"
      :options="items"
      :option-value="computedProperty.optionValue"
      :option-label="computedProperty.optionLabel"
      :disabled="disabled"
      searchable
      @search="onSearch"
      @close="onClose"
    ></VcSelect>
  </Field>
  <Field
    v-else-if="
      computedProperty.valueType === 'ShortText' && computedProperty.multivalue && !computedProperty.dictionary
    "
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :model-value="value"
    :label="computedProperty.displayName"
    :rules="computedProperty.rules"
  >
    <VcMultivalue
      v-bind="$attrs"
      v-model="value"
      :name="computedProperty.name"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      :required="computedProperty.required"
      placeholder="Add value"
      :disabled="disabled"
    ></VcMultivalue>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'ShortText' && computedProperty.multivalue && computedProperty.dictionary"
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :label="computedProperty.displayName"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcMultivalue
      v-bind="$attrs"
      v-model="value"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      :required="computedProperty.required"
      placeholder="Add value"
      :disabled="disabled"
      :options="items"
      option-label="alias"
      option-value="id"
      :multivalue="computedProperty.multivalue"
      @search="onSearch"
      @close="onClose"
    ></VcMultivalue>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'ShortText'"
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :label="computedProperty.displayName"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcInput
      v-bind="$attrs"
      v-model="value"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      clearable
      :required="computedProperty.required"
      :placeholder="computedProperty.displayName || 'Add value'"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'Number' && computedProperty.multivalue"
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :model-value="value"
    :label="computedProperty.displayName"
    :rules="computedProperty.rules"
  >
    <VcMultivalue
      v-bind="$attrs"
      v-model="value"
      :label="computedProperty.displayName"
      :required="computedProperty.required"
      placeholder="Add value"
      :disabled="disabled"
      type="number"
      :error="!!errors.length"
      :error-message="errorMessage"
      :options="items"
    ></VcMultivalue>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'Integer' && computedProperty.multivalue"
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :model-value="value"
    :label="computedProperty.displayName"
    :rules="computedProperty.rules"
  >
    <VcMultivalue
      v-bind="$attrs"
      v-model="value"
      :label="computedProperty.displayName"
      :required="computedProperty.required"
      placeholder="Add value"
      :disabled="disabled"
      type="number"
      :error="!!errors.length"
      :error-message="errorMessage"
      :options="items"
    ></VcMultivalue>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'Number'"
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :label="computedProperty.displayName"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcInput
      v-bind="$attrs"
      v-model="value"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      clearable
      type="number"
      :required="computedProperty.required"
      :placeholder="computedProperty.placeholder"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'Integer'"
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :label="computedProperty.displayName"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcInput
      v-bind="$attrs"
      v-model="value"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      clearable
      type="number"
      step="1"
      :required="computedProperty.required"
      :placeholder="computedProperty.placeholder"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'DateTime'"
    v-slot="{ errorMessage, errors }"
    :name="computedProperty.name"
    :label="computedProperty.displayName"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcInput
      v-bind="$attrs"
      v-model="value"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      type="datetime-local"
      :required="computedProperty.required"
      :placeholder="computedProperty.placeholder"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'LongText'"
    v-slot="{ errorMessage }"
    :name="computedProperty.name"
    :label="computedProperty.displayName"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcTextarea
      v-bind="$attrs"
      v-model="value"
      :error-message="errorMessage"
      :label="computedProperty.displayName"
      :required="computedProperty.required"
      :placeholder="computedProperty.placeholder"
      :disabled="disabled"
    ></VcTextarea>
  </Field>

  <Field
    v-else-if="computedProperty.valueType === 'Boolean'"
    v-slot="{ errorMessage }"
    :name="computedProperty.name"
    :label="computedProperty.displayName"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <VcCheckbox
      v-bind="$attrs"
      v-model="value"
      :error-message="errorMessage"
      :required="computedProperty.required"
      :disabled="disabled"
      :name="computedProperty.name"
    >
      {{ computedProperty.displayName }}
    </VcCheckbox>
  </Field>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T">
import { ref, onMounted, computed } from "vue";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";
import { VcSelect, VcInput, VcTextarea, VcCheckbox } from "./../../";

type IValidationRules = {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
};

const props = withDefaults(
  defineProps<{
    property: T;
    modelValue: any;
    optionsGetter: (property: T, keyword?: string) => Promise<unknown[]> | unknown[];
    required: boolean;
    multivalue?: boolean;
    valueType: string;
    dictionary?: boolean;
    name: string;
    optionsValue?: string;
    optionsLabel?: string;
    displayNames?: {
      name?: string;
      languageCode?: string;
    }[];
    rules?: {
      min: number;
      max: number;
      regex: string;
    };
    disabled?: boolean;
    placeholder?: string;
  }>(),
  {
    optionsValue: "id",
    optionsLabel: "alias",
    disabled: false,
  }
);

const emit = defineEmits<{
  "update:model-value": [data: { readonly property: T; readonly value: any; readonly dictionary?: any[] }];
}>();

const { locale, te, t } = useI18n({ useScope: "global" });

const items = ref([]);

const computedProperty = computed(() => {
  const rules: IValidationRules = {};
  if (props.required) {
    rules["required"] = true;
  }
  if (props.rules?.min) {
    rules["min"] = Number(props.rules.min);
  }
  if (props.rules?.max) {
    rules["max"] = Number(props.rules.max);
  }
  if (props.rules?.regex) {
    rules["regex"] = new RegExp(props.rules.regex);
  }

  const propertyDisplayName =
    props.displayNames?.find((displayName) => displayName.languageCode?.startsWith(locale.value as string))?.name ||
    props.name;
  const propertyDisplayNameLocalized =
    propertyDisplayName && te(propertyDisplayName.toUpperCase())
      ? t(propertyDisplayName.toUpperCase())
      : propertyDisplayName;

  return {
    rules,
    valueType: props.valueType,
    dictionary: props.dictionary || false,
    multivalue: props.multivalue || false,
    name: props.name,
    displayName: propertyDisplayNameLocalized, //|| setting?.displayName || setting?.defaultValue,
    optionValue: props.optionsValue,
    optionLabel: props.optionsLabel,
    required: props.required,
    placeholder: props.placeholder || propertyDisplayNameLocalized,
  };
});

const value = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:model-value", { property: props.property, value: newValue, dictionary: items.value });
  },
});

onMounted(async () => {
  if (props.optionsGetter) {
    items.value = await props.optionsGetter(props.property);
  }
});

async function onSearch(keyword: string) {
  if (props.optionsGetter) {
    items.value = await props.optionsGetter(props.property, keyword);
  }
}

async function onClose() {
  if (props.optionsGetter) {
    items.value = await props.optionsGetter(props.property);
  }
}
</script>
