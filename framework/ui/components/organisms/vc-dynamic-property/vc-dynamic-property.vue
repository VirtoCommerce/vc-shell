<template>
  <Field
    v-if="(property.dictionary || property.isDictionary) && !property.multivalue"
    v-slot="{ errorMessage, handleChange, errors }"
    :label="handleDisplayName || property.displayName"
    :name="property.displayName || property.name"
    :modelValue="getter(property, true)"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName || property.displayName"
      :modelValue="getter(property, true)"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e, items);
        }
      "
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :options="items"
      option-value="id"
      :option-label="handleDisplayProperty"
      :disabled="disabled"
      searchable
      @search="onSearch"
      @close="onClose"
    ></VcSelect>
  </Field>

  <Field
    v-else-if="
      property.valueType === 'ShortText' && property.multivalue && !(property.dictionary || property.isDictionary)
    "
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :modelValue="property.values"
    :label="handleDisplayName"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :modelValue="property.values"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
      :required="property.required || property.isRequired"
      placeholder="Add value"
      :disabled="disabled"
      :multiple="true"
    ></VcSelect>
  </Field>

  <Field
    v-else-if="
      property.valueType === 'ShortText' && property.multivalue && (property.dictionary || property.isDictionary)
    "
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :modelValue="property.values"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :modelValue="property.values"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e, items);
        }
      "
      :required="property.required || property.isRequired"
      placeholder="Add value"
      :disabled="disabled"
      :options="items"
      option-label="alias"
      option-value="id"
      @search="onSearch"
      @close="onClose"
      :multiple="property.multivalue"
    ></VcSelect>
  </Field>

  <Field
    v-else-if="property.valueType === 'ShortText'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.displayName || property.name"
    :label="handleDisplayName || property.displayName"
    :modelValue="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName || property.displayName"
      :modelValue="(getter(property) as string | number | Date)"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
      clearable
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || 'Add value'"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'Number' && property.multivalue"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :modelValue="property.values"
    :label="handleDisplayName"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :label="handleDisplayName"
      :modelValue="property.values"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
      type="number"
      :required="property.required || property.isRequired"
      placeholder="Add value"
      :disabled="disabled"
      :error="!!errors.length"
      :error-message="errorMessage"
      :options="items"
      option-value="id"
      :option-label="handleDisplayProperty"
      multiple
    ></VcSelect>
  </Field>

  <Field
    v-else-if="property.valueType === 'Number'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :modelValue="(getter(property) as string | number | Date)"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
      clearable
      type="number"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'Integer'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :modelValue="(getter(property) as string | number | Date)"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
      clearable
      type="number"
      step="1"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'DateTime'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :modelValue="(getter(property) as string | number | Date)"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
      type="datetime-local"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'LongText'"
    v-slot="{ errorMessage, handleChange }"
    :name="property.name"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    :rules="rules"
  >
    <VcTextarea
      v-bind="$attrs"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :modelValue="getter(property) as string"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
    ></VcTextarea>
  </Field>

  <Field
    v-else-if="property.valueType === 'Boolean'"
    v-slot="{ errorMessage, handleChange }"
    :name="property.displayName || property.name"
    :label="handleDisplayName || property.displayName"
    :modelValue="getter(property)"
    :rules="rules"
  >
    <VcCheckbox
      v-bind="$attrs"
      :error-message="errorMessage"
      :modelValue="getter(property) as boolean"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
      :required="property.required || property.isRequired"
      :disabled="disabled"
      :name="property.displayName || property.name"
    >
      {{ handleDisplayName || property.displayName }}
    </VcCheckbox>
  </Field>

  <Field
    v-else-if="property.valueType === 'Html'"
    v-slot="{ errorMessage, handleChange }"
    :name="property.displayName || property.name"
    :label="handleDisplayName || property.displayName"
    :modelValue="getter(property)"
    :rules="rules"
  >
    <VcEditor
      v-bind="$attrs"
      :label="handleDisplayName || property.displayName"
      :modelValue="(getter(property) as string | number | Date)"
      @update:modelValue="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || 'Add value'"
      :disabled="disabled"
      :name="property.displayName || property.name"
      :error-message="errorMessage"
    >
    </VcEditor>
  </Field>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "./../../../../core/composables";
import { Field } from "vee-validate";

export interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: any;
  dictionaries?: Record<string, unknown>;
  getter: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>,
    isDictionary?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Record<string, any> | string | number | boolean | Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionsGetter: (property: Record<string, any>, keyword?: string) => Promise<any[] | undefined> | any[];
  setter: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: Record<string, any> | string | number | boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dictionary?: any[]
  ) => void | undefined;
  culture?: string;
  disabled?: boolean;
}

export interface PropertyItem {
  alias: string;
}

type IValidationRules = {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
};

interface IDisplayName {
  languageCode: string;
  name?: string;
}

const props = withDefaults(defineProps<Props>(), {
  culture: "en-US",
});

const { locale, te, t } = useI18n();

const rules: IValidationRules = {};
const items = ref<PropertyItem[]>([]);
const handleDisplayProperty = computed(() => {
  return items.value?.some((x: { alias: string }) => x.alias) ? "alias" : "name";
});
const handleDisplayName = computed(() => {
  let localized: string;
  const isLocaleExists = props.property.displayNames?.find((x: IDisplayName) =>
    x.languageCode?.toLowerCase().startsWith((locale.value as string)?.toLowerCase())
  );
  if (isLocaleExists && isLocaleExists.name) {
    localized = isLocaleExists.name;
  } else {
    const fallback = props.property.displayNames?.find((x: IDisplayName) =>
      x.languageCode?.toLowerCase().includes(props.culture?.toLowerCase())
    );
    localized = fallback && fallback?.name ? fallback.name : props.property.name;
  }

  return localized && te(localized.toUpperCase()) ? t(localized.toUpperCase()) : localized;
});

onMounted(async () => {
  if (props.optionsGetter) {
    items.value = await props.optionsGetter(props.property);
  }
});

if (props.property.required || props.property.isRequired) {
  rules.required = true;
}
if (props.property.validationRule?.charCountMin) {
  rules.min = Number(props.property.validationRule.charCountMin);
}
if (props.property.validationRule?.charCountMax) {
  rules.max = Number(props.property.validationRule.charCountMax);
}
if (props.property.validationRule?.regExp) {
  rules.regex = new RegExp(props.property.validationRule?.regExp);
}

/*function getLabel() {
  return (
    (props.property.displayNames as { culture: string }[]).find(
      (item) => item.culture === props.culture
    ) || props.property.name
  );
}
 */

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
