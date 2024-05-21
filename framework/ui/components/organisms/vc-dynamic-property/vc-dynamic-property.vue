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
        :option-value="multilanguage ? 'value' : 'alias'"
        :multivalue="computedProperty.multivalue"
        :loading="loading"
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
        option-label="value"
        option-value="value"
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
        type="integer"
        :error="!!errors.length"
        :error-message="errorMessage"
        option-label="value"
        option-value="value"
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
        type="integer"
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
        :current-language="currentLanguage"
      ></VcTextarea
    ></template>
    <template v-else-if="computedProperty.valueType === 'Boolean'">
      <VcSwitch
        v-bind="$attrs"
        v-model="value"
        :error-message="errorMessage"
        :required="computedProperty.required"
        :disabled="disabled"
        :name="computedProperty.name"
        :label="computedProperty.displayName"
      >
      </VcSwitch>
    </template>
  </Field>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup generic="T extends { [x: string]: any; id?: string }">
import { ref, onMounted, computed, Ref, watch } from "vue";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";
import { VcSelect, VcInput, VcTextarea, VcSwitch } from "./../../";
import * as _ from "lodash-es";

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
    optionsGetter: (
      propertyId: string,
      keyword?: string,
      locale?: string,
    ) => Promise<any[] | undefined> | any[] | undefined;
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
  "update:model-value": [data: { readonly value: any; readonly dictionary?: any[]; readonly locale?: string }];
}>();

const { locale, te, t } = useI18n({ useScope: "global" });

const items: Ref<any[]> = ref([]);
const loading = ref(false);
const initialOptions = ref<any[]>([]);
const internalProperty = ref(props.property) as Ref<typeof props.property>;
const internalModel = ref(props.modelValue) as Ref<typeof props.modelValue>;

watch(
  () => props.property,
  (newVal) => {
    internalProperty.value = _.cloneDeep(newVal);
  },
  {
    deep: true,
    immediate: true,
  },
);

watch(
  () => props.modelValue,
  (newVal) => {
    internalModel.value = _.cloneDeep(newVal);
  },
  {
    deep: true,
    immediate: true,
  },
);

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
    key: props.multilanguage ? internalProperty.value.id + "_" + props.currentLanguage : internalProperty.value.id,
    displayName: propertyDisplayNameLocalized,
    optionValue: props.optionsValue,
    optionLabel: optionLabelField,
    required: props.required,
    placeholder: props.placeholder || propertyDisplayNameLocalized,
  };
});

const value = computed({
  get() {
    return internalModel.value;
  },
  set(newValue) {
    emit("update:model-value", {
      value: newValue,
      dictionary: items.value,
      locale: props.currentLanguage,
    });
  },
});

onMounted(async () => {
  await getOptions();
  initialOptions.value = items.value;
});

async function getOptions(keyword: string | undefined = undefined) {
  if (props.optionsGetter && internalProperty.value.dictionary && internalProperty.value.id) {
    try {
      loading.value = true;
      const res = await props.optionsGetter(internalProperty.value.id, keyword, props.currentLanguage);

      if (res) {
        items.value = res;
      }
    } finally {
      loading.value = false;
    }
  }
}

async function onSearch(keyword: string) {
  getOptions(keyword);
}

async function onClose() {
  if (initialOptions.value.length) {
    items.value = initialOptions.value;
  }
}
</script>
