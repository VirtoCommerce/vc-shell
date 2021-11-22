<template>
  <vc-select
    v-if="property.dictionary"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :isRequired="property.required"
    :placeholder="property.displayNames[0].name"
    :options="dictionaries[property.id]"
    keyProperty="id"
    displayProperty="alias"
    :rules="rules"
    :is-disabled="disabled"
    :name="property.name"
  ></vc-select>

  <vc-multivalue
    v-else-if="property.valueType === 'ShortText' && property.multivalue"
    :label="property.displayNames[0].name || property.name"
    :modelValue="property.values"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    placeholder="Add value"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></vc-multivalue>

  <vc-input
    v-else-if="property.valueType === 'ShortText'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></vc-input>

  <vc-multivalue
    v-else-if="property.valueType === 'Number' && property.multivalue"
    :label="property.displayNames[0].name || property.name"
    :modelValue="property.values"
    @update:modelValue="setter(property, $event)"
    type="number"
    :required="property.required"
    placeholder="Add value"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></vc-multivalue>

  <vc-input
    v-else-if="property.valueType === 'Number'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    type="number"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></vc-input>

  <vc-input
    v-else-if="property.valueType === 'Integer'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    type="number"
    step="1"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></vc-input>

  <vc-input
    v-else-if="property.valueType === 'DateTime'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    type="datetime-local"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></vc-input>

  <vc-textarea
    v-else-if="property.valueType === 'LongText'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  ></vc-textarea>

  <vc-checkbox
    v-else-if="property.valueType === 'Boolean'"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :rules="rules"
    :disabled="disabled"
    :name="property.name"
  >
    {{ property.displayNames[0].name || property.name }}
  </vc-checkbox>
</template>

<script lang="ts">
import { defineComponent } from "vue";

interface IValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: RegExp;
}

export default defineComponent({
  props: {
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
  },

  setup(props) {
    const rules: IValidationRules = {};

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

    return {
      rules,
      getLabel() {
        return (
          (props.property.displayNames as { culture: string }[]).find(
            (item) => item.culture === props.culture
          ) || props.property.name
        );
      },
    };
  },
});
</script>
