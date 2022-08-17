<template>
  <VcSelect
    v-if="
      (property.dictionary || property.isDictionary) && !property.multivalue
    "
    :label="handleDisplayName || property.displayName"
    :modelValue="getter(property, true)"
    @update:modelValue="setter(property, $event, items)"
    :isRequired="property.required"
    :placeholder="handleDisplayName || property.defaultValue"
    :options="items"
    keyProperty="id"
    :displayProperty="handleDisplayProperty"
    :rules="rules"
    :is-disabled="disabled"
    :name="property.displayName || property.name"
    :isSearchable="true"
    @search="onSearch"
    @close="onClose"
  ></VcSelect>

  <VcMultivalue
    v-else-if="
      property.valueType === 'ShortText' &&
      property.multivalue &&
      !(property.dictionary || property.isDictionary)
    "
    :label="handleDisplayName"
    :modelValue="property.values"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    placeholder="Add value"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcMultivalue>

  <VcMultivalue
    v-else-if="
      property.valueType === 'ShortText' &&
      property.multivalue &&
      (property.dictionary || property.isDictionary)
    "
    :label="handleDisplayName"
    :modelValue="property.values"
    @update:modelValue="setter(property, $event, items)"
    :required="property.required"
    placeholder="Add value"
    :multivalue="property.multivalue"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
    :options="items"
    keyProperty="id"
    displayProperty="alias"
    @search="onSearch"
    @close="onClose"
  ></VcMultivalue>

  <VcInput
    v-else-if="property.valueType === 'ShortText'"
    :label="handleDisplayName || property.displayName"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    :required="property.required"
    :placeholder="handleDisplayName || 'Add value'"
    :rules="rules"
    :disabled="disabled"
    :name="property.displayName || property.name"
  ></VcInput>

  <VcMultivalue
    v-else-if="property.valueType === 'Number' && property.multivalue"
    :label="handleDisplayName"
    :modelValue="property.values"
    @update:modelValue="setter(property, $event)"
    type="number"
    :required="property.required"
    placeholder="Add value"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcMultivalue>

  <VcInput
    v-else-if="property.valueType === 'Number'"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    type="number"
    :required="property.required"
    :placeholder="handleDisplayName || property.defaultValue"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcInput>

  <VcInput
    v-else-if="property.valueType === 'Integer'"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    type="number"
    step="1"
    :required="property.required"
    :placeholder="handleDisplayName || property.defaultValue"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcInput>

  <VcInput
    v-else-if="property.valueType === 'DateTime'"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    type="datetime-local"
    :required="property.required"
    :placeholder="handleDisplayName || property.defaultValue"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcInput>

  <VcTextarea
    v-else-if="property.valueType === 'LongText'"
    :label="handleDisplayName"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :placeholder="handleDisplayName || property.defaultValue"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcTextarea>

  <VcCheckbox
    v-else-if="property.valueType === 'Boolean'"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :rules="rules"
    :disabled="disabled"
    :name="property.displayName || property.name"
  >
    {{ handleDisplayName || property.displayName }}
  </VcCheckbox>

  <VcEditor
    v-else-if="property.valueType === 'Html'"
    :label="handleDisplayName || property.displayName"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :placeholder="handleDisplayName || 'Add value'"
    :rules="rules"
    :disabled="disabled"
    :name="property.displayName || property.name"
  >
  </VcEditor>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "@virtoshell/core";
interface IValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
}

interface IDisplayName {
  languageCode: string;
  name?: string;
}

const props = defineProps({
  property: {
    type: Object,
    default: () => ({}),
  },

  dictionaries: {
    type: Object,
    default: () => ({}),
  },

  getter: {
    type: Function,
  },

  optionsGetter: {
    type: Function,
  },

  setter: {
    type: Function,
  },

  culture: {
    type: String,
    default: "en-US",
  },

  disabled: {
    type: Boolean,
    default: false,
  },
});

const { locale, te, t } = useI18n();

const rules: IValidationRules = {};
const items = ref([]);
const handleDisplayProperty = computed(() => {
  return items.value?.some((x: { alias: string }) => x.alias)
    ? "alias"
    : "name";
});
const handleDisplayName = computed(() => {
  let localized: string;
  const isLocaleExists = props.property.displayNames?.find((x: IDisplayName) =>
    x.languageCode
      ?.toLowerCase()
      .startsWith((locale.value as string)?.toLowerCase())
  );
  if (isLocaleExists && isLocaleExists.name) {
    localized = isLocaleExists.name;
  } else {
    const fallback = props.property.displayNames?.find((x: IDisplayName) =>
      x.languageCode?.toLowerCase().includes(props.culture?.toLowerCase())
    );
    localized =
      fallback && fallback?.name ? fallback.name : props.property.name;
  }

  return localized && te(localized.toUpperCase())
    ? t(localized.toUpperCase())
    : localized;
});

onMounted(async () => {
  if (props.optionsGetter) {
    items.value = await props.optionsGetter(props.property);
  }
});

if (props.property.required) {
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
