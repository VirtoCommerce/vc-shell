<template>
  <Field
    v-if="(property.dictionary || property.isDictionary) && !property.multivalue"
    v-slot="{ errorMessage, handleChange, errors }"
    :label="handleDisplayName || property.displayName"
    :name="property.displayName || property.name"
    :model-value="getter(property, true)"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName || property.displayName"
      :model-value="getter(property, true)"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :options="items"
      option-value="id"
      :option-label="handleDisplayProperty"
      :disabled="disabled"
      searchable
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e, items);
        }
      "
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
    :model-value="property.values"
    :label="handleDisplayName"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :model-value="property.values"
      :required="property.required || property.isRequired"
      placeholder="Add value"
      :disabled="disabled"
      option-label="alias"
      option-value="id"
      :display-label="displayedValueLabel.label"
      :display-value="displayedValueLabel.value"
      :multiple="true"
      :emit-value="false"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
    ></VcSelect>
  </Field>

  <Field
    v-else-if="
      property.valueType === 'ShortText' && property.multivalue && (property.dictionary || property.isDictionary)
    "
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :model-value="property.values"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :model-value="property.values"
      :required="property.required || property.isRequired"
      placeholder="Add value"
      :disabled="disabled"
      :options="items"
      option-label="alias"
      option-value="id"
      :display-label="displayedValueLabel.label"
      :display-value="displayedValueLabel.value"
      :multiple="property.multivalue"
      :emit-value="false"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e, items);
        }
      "
      @search="onSearch"
      @close="onClose"
    ></VcSelect>
  </Field>

  <Field
    v-else-if="property.valueType === 'ShortText'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.displayName || property.name"
    :label="handleDisplayName || property.displayName"
    :model-value="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName || property.displayName"
      :model-value="(getter(property) as string | number | Date)"
      clearable
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || 'Add value'"
      :disabled="disabled"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'Number' && property.multivalue"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :model-value="property.values"
    :label="handleDisplayName"
    :rules="rules"
  >
    <VcSelect
      v-bind="$attrs"
      :label="handleDisplayName"
      :model-value="property.values"
      :required="property.required || property.isRequired"
      placeholder="Add value"
      :disabled="disabled"
      :error="!!errors.length"
      :error-message="errorMessage"
      :options="items"
      option-value="id"
      :option-label="handleDisplayProperty"
      :display-label="displayedValueLabel.label"
      :display-value="displayedValueLabel.value"
      multiple
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
    ></VcSelect>
  </Field>

  <Field
    v-else-if="property.valueType === 'Number'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :model-value="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :model-value="(getter(property) as string | number | Date)"
      clearable
      type="number"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'Integer'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :model-value="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :model-value="(getter(property) as string | number | Date)"
      clearable
      type="number"
      step="1"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'DateTime'"
    v-slot="{ errorMessage, handleChange, errors }"
    :name="property.name"
    :label="handleDisplayName"
    :model-value="getter(property)"
    :rules="rules"
  >
    <VcInput
      v-bind="$attrs"
      :error="!!errors.length"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :model-value="(getter(property) as string | number | Date)"
      type="datetime-local"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
    ></VcInput>
  </Field>

  <Field
    v-else-if="property.valueType === 'LongText'"
    v-slot="{ errorMessage, handleChange }"
    :name="property.name"
    :label="handleDisplayName"
    :model-value="getter(property)"
    :rules="rules"
  >
    <VcTextarea
      v-bind="$attrs"
      :error-message="errorMessage"
      :label="handleDisplayName"
      :model-value="getter(property) as string"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || property.defaultValue"
      :disabled="disabled"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
    ></VcTextarea>
  </Field>

  <Field
    v-else-if="property.valueType === 'Boolean'"
    v-slot="{ errorMessage, handleChange }"
    :name="property.displayName || property.name"
    :label="handleDisplayName || property.displayName"
    :model-value="getter(property)"
    :rules="rules"
  >
    <VcCheckbox
      v-bind="$attrs"
      :error-message="errorMessage"
      :model-value="getter(property) as boolean"
      :required="property.required || property.isRequired"
      :disabled="disabled"
      :name="property.displayName || property.name"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e);
        }
      "
    >
      {{ handleDisplayName || property.displayName }}
    </VcCheckbox>
  </Field>

  <Field
    v-else-if="property.valueType === 'Html'"
    v-slot="{ errorMessage, handleChange }"
    :name="property.displayName || property.name"
    :label="handleDisplayName || property.displayName"
    :model-value="getter(property)"
    :rules="rules"
  >
    <VcCodeEditor
      v-bind="$attrs"
      :label="handleDisplayName || property.displayName"
      :model-value="(getter(property) as string | number | Date)"
      :required="property.required || property.isRequired"
      :placeholder="handleDisplayName || 'Add value'"
      :disabled="disabled"
      :name="property.displayName || property.name"
      :error-message="errorMessage"
      @update:model-value="
        (e) => {
          handleChange(e);
          setter(property, e as Record<string, unknown> | string | number | boolean);
        }
      "
    >
    </VcCodeEditor>
  </Field>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";
import { VcSelect, VcInput, VcTextarea, VcCheckbox, VcCodeEditor } from "./../../";

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
  /**
   * @description Used only with multiple selection **only** in rare cases, where we need to display selection with other value-label pair
   */
  displayedValueLabel?: {
    value: string;
    label: string;
  };
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
