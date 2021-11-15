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
  ></vc-select>

  <vc-input
    v-else-if="property.valueType === 'ShortText'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
  ></vc-input>

  <vc-input
    v-else-if="property.valueType === 'Number'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :clearable="true"
    type="number"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
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
  ></vc-input>

  <vc-input
    v-else-if="property.valueType === 'DateTime'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    type="datetime-local"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
  ></vc-input>

  <vc-textarea
    v-else-if="property.valueType === 'LongText'"
    :label="property.displayNames[0].name || property.name"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
    :placeholder="property.displayNames[0].name"
  ></vc-textarea>

  <vc-checkbox
    v-else-if="property.valueType === 'Boolean'"
    :modelValue="getter(property)"
    @update:modelValue="setter(property, $event)"
    :required="property.required"
  >
    {{ property.displayNames[0].name || property.name }}
  </vc-checkbox>
</template>

<script lang="ts">
import { defineComponent } from "vue";

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
  },

  setup(props) {
    return {
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
