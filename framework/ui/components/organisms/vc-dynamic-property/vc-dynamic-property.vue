<template>
  <Field
    v-slot="{ errorMessage, errors }"
    :key="computedProperty.key"
    :label="computedProperty.displayName"
    :name="computedProperty.name"
    :model-value="value"
    :rules="computedProperty.rules"
  >
    <template v-if="computedProperty.dictionary && !computedProperty.multivalue">
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
        :multilanguage="multilanguage"
        :current-language="currentLanguage"
        :loading="loading"
        @search="onSearch"
        @close="onClose"
      ></VcSelect>
    </template>
    <template
      v-else-if="
        computedProperty.valueType === 'ShortText' && computedProperty.multivalue && !computedProperty.dictionary
      "
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
        :multilanguage="multilanguage"
        :current-language="currentLanguage"
      ></VcMultivalue>
    </template>
    <template
      v-else-if="
        computedProperty.valueType === 'ShortText' && computedProperty.multivalue && computedProperty.dictionary
      "
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
        :multilanguage="multilanguage"
        :current-language="currentLanguage"
        :options="items"
        :option-label="multilanguage ? 'value' : 'alias'"
        option-value="id"
        :multivalue="computedProperty.multivalue"
        @search="onSearch"
        @close="onClose"
      ></VcMultivalue>
    </template>
    <template v-else-if="computedProperty.valueType === 'ShortText'">
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
        :multilanguage="multilanguage"
        :current-language="currentLanguage"
        :loading="loading"
      ></VcInput>
    </template>
    <template v-else-if="computedProperty.valueType === 'Number' && computedProperty.multivalue">
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
    </template>
    <template v-else-if="computedProperty.valueType === 'Integer' && computedProperty.multivalue">
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
    </template>
    <template v-else-if="computedProperty.valueType === 'Number'">
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
        :loading="loading"
      ></VcInput>
    </template>
    <template v-else-if="computedProperty.valueType === 'Integer'">
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
        :loading="loading"
      ></VcInput>
    </template>
    <template v-else-if="computedProperty.valueType === 'DateTime'">
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
        :loading="loading"
      ></VcInput
    ></template>
    <template v-else-if="computedProperty.valueType === 'LongText'">
      <VcTextarea
        v-bind="$attrs"
        v-model="value"
        :error-message="errorMessage"
        :label="computedProperty.displayName"
        :required="computedProperty.required"
        :placeholder="computedProperty.placeholder"
        :disabled="disabled"
        :multilanguage="multilanguage"
        :current-language="currentLanguage"
      ></VcTextarea
    ></template>
    <template v-else-if="computedProperty.valueType === 'Boolean'">
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
    </template>
  </Field>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends { [x: string]: any; id?: string }">
import { ref, onMounted, computed, Ref } from "vue";
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
    optionsGetter: (property: T, keyword?: string, locale?: string) => Promise<any[]> | any[];
    required: boolean;
    multivalue?: boolean;
    multilanguage?: boolean;
    currentLanguage?: string;
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
      min?: number;
      max?: number;
      regex?: string;
    };
    disabled?: boolean;
    placeholder?: string;
  }>(),
  {
    optionsValue: "id",
    optionsLabel: "value",
    disabled: false,
  },
);

const emit = defineEmits<{
  "update:model-value": [
    data: { readonly property: T; readonly value: any; readonly dictionary?: any[]; readonly locale?: string },
  ];
}>();

const { locale, te, t } = useI18n({ useScope: "global" });

const items: Ref<any[]> = ref([]);
const loading = ref(false);

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

  const optionLabelField = props.multilanguage ? "value" : "alias";

  return {
    rules,
    valueType: props.valueType,
    dictionary: props.dictionary || false,
    multivalue: props.multivalue || false,
    name: props.multilanguage ? props.name + "_" + props.currentLanguage : props.name,
    key: props.multilanguage ? props.property.id + "_" + props.currentLanguage : props.property.id,
    displayName: propertyDisplayNameLocalized,
    optionValue: props.optionsValue,
    optionLabel: optionLabelField,
    required: props.required,
    placeholder: props.placeholder || propertyDisplayNameLocalized,
  };
});

const value = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    emit("update:model-value", {
      property: props.property,
      value: newValue,
      dictionary: items.value,
      locale: props.currentLanguage,
    });
  },
});

onMounted(async () => {
  await getOptions();
});

async function getOptions(keyword: string | undefined = undefined) {
  if (props.optionsGetter) {
    try {
      loading.value = true;
      items.value = await props.optionsGetter(props.property, keyword, props.currentLanguage);
    } finally {
      loading.value = false;
    }
  }
}

async function onSearch(keyword: string) {
  getOptions(keyword);
}

async function onClose() {
  getOptions();
}
</script>
