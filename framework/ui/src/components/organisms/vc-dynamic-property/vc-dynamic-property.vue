<template>
  <VcSelect
    v-if="
      (property.dictionary || property.isDictionary) && !property.multivalue
    "
    :label="
      (property.displayNames && property.displayNames[0].name) ||
      property.displayName ||
      property.name
    "
    :modelValue="getter(property, true)"
    @update:modelValue="setter(property, $event, items)"
    :isRequired="property.required"
    :placeholder="
      (property.displayNames && property.displayNames[0].name) ||
      property.defaultValue
    "
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
    :label="
      (property.displayNames && property.displayNames[0].name) || property.name
    "
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
    :label="
      (property.displayNames && property.displayNames[0].name) || property.name
    "
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
    :label="
      (property.displayNames && property.displayNames[0].name) ||
      property.displayName ||
      $t(property.name.toUpperCase()) ||
      property.name
    "
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    :required="property.required"
    :placeholder="
      (property.displayNames && property.displayNames[0].name) || 'Add value'
    "
    :rules="rules"
    :disabled="disabled"
    :name="property.displayName || property.name"
  ></VcInput>

  <VcMultivalue
    v-else-if="property.valueType === 'Number' && property.multivalue"
    :label="
      (property.displayNames && property.displayNames[0].name) || property.name
    "
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
    :label="
      (property.displayNames && property.displayNames[0].name) || property.name
    "
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    type="number"
    :required="property.required"
    :placeholder="
      (property.displayNames && property.displayNames[0].name) ||
      property.defaultValue
    "
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcInput>

  <VcInput
    v-else-if="property.valueType === 'Integer'"
    :label="
      (property.displayNames && property.displayNames[0].name) || property.name
    "
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    type="number"
    step="1"
    :required="property.required"
    :placeholder="
      (property.displayNames && property.displayNames[0].name) ||
      property.defaultValue
    "
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcInput>

  <VcInput
    v-else-if="property.valueType === 'DateTime'"
    :label="
      (property.displayNames && property.displayNames[0].name) || property.name
    "
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    type="datetime-local"
    :required="property.required"
    :placeholder="
      (property.displayNames && property.displayNames[0].name) ||
      property.defaultValue
    "
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></VcInput>

  <VcTextarea
    v-else-if="property.valueType === 'LongText'"
    :label="
      (property.displayNames && property.displayNames[0].name) || property.name
    "
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :placeholder="
      (property.displayNames && property.displayNames[0].name) ||
      property.defaultValue
    "
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
    {{
      (property.displayNames && property.displayNames[0].name) ||
      property.displayName ||
      $t(property.name.toUpperCase()) ||
      property.name
    }}
  </VcCheckbox>

  <VcEditor
    v-else-if="property.valueType === 'Html'"
    :label="
      (property.displayNames && property.displayNames[0].name) ||
      property.displayName ||
      property.name
    "
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :placeholder="
      (property.displayNames && property.displayNames[0].name) || 'Add value'
    "
    :rules="rules"
    :disabled="disabled"
    :name="property.displayName || property.name"
  >
  </VcEditor>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
interface IValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
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

const rules: IValidationRules = {};
const items = ref([]);
const handleDisplayProperty = computed(() => {
  return items.value.some((x: { alias: string }) => x.alias) ? "alias" : "name";
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
