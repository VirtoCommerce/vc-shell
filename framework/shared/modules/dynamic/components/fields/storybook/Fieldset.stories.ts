import { Meta, StoryFn } from "@storybook/vue3";
import page from "./pages/DynamicRender";
import { template, templateWithVisibilityToggle } from "./common/templates";
import { FieldsetSchema } from "../../../types";
import { SchemaBaseArgTypes } from "./common/args";
import * as _ from "lodash-es";
import { reactive, ref } from "vue";

export default {
  title: "DynamicViews/special/Fieldset",
  component: page,
  args: {
    id: "fieldsetId",
    component: "vc-fieldset",
    fields: [
      {
        id: "fieldId",
        component: "vc-input",
        label: "Input field",
        placeholder: "Enter text here",
        property: "mockedProperty",
      },
      {
        id: "fieldId2",
        component: "vc-input",
        label: "Input field 2",
        placeholder: "Enter text here",
        property: "mockedProperty2",
      },
    ],
  },
  argTypes: {
    ..._.pick(SchemaBaseArgTypes, ["id", "visibility", "horizontalSeparator"]),
    property: {
      description: `Property name to build \`fieldset\` from \`array of objects\`.
      Data can be defined in either the \`item\` or the \`scope\`.
      \nDot notation can also be used for nested properties, e.g. \`address.city\` or \`addresses[1].city\`.
      `,
      table: {
        type: {
          summary: "string",
        },
      },
    },
    component: {
      description: "Component type for field.",
      type: {
        required: true,
        name: "string",
      },
      table: {
        type: {
          summary: "vc-fieldset",
        },
        defaultValue: {
          summary: "vc-fieldset",
        },
      },
    },
    columns: {
      description: "Number of columns to display the fields in.",
      control: "number",
      table: {
        type: {
          summary: "number",
        },
        defaultValue: {
          summary: 1,
        },
      },
    },
    aspectRatio: {
      description: `Array of numbers that define the aspect ratio of each column.
      Example - If you have two columns - set to [1, 1] to make all columns equal width.
      Uses CSS flex-grow property to set the width of each column.`,
      control: "object",
      table: {
        type: {
          summary: "array",
        },
        defaultValue: {
          summary: "[1, 1]",
        },
      },
    },
    fields: {
      description: "Array of control schemas for the fields in the fieldset.",
      type: {
        required: true,
        name: "other",
        value: "ControlSchema[]",
      },
      table: {
        type: {
          summary: "ControlSchema[]",
        },
      },
    },
  },
  parameters: {
    componentSubtitle:
      "Fieldset allows displaying sets of any available controls of any nested depth. It allows arranging elements in a grid with a customizable number of columns and aspect ratio that allows to control columns width, the ability to build a grid with multiple rows based on an array of data bound to the fieldset using the property option. It also has visibility state settings.",
    docs: {
      canvas: {
        sourceState: "none",
      },
    },
  },
} satisfies Meta<FieldsetSchema>;

export const SingleColumn: StoryFn<FieldsetSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "value",
        mockedProperty2: "value2",
      },
    });
    return { args, context };
  },
  template,
});

export const TwoColumns = SingleColumn.bind({});
TwoColumns.args = {
  columns: 2,
};

export const ThreeColumns: StoryFn<FieldsetSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "value",
        mockedProperty2: "value2",
        mockedProperty3: "value3",
      },
    });
    return { args, context };
  },
  template,
});
ThreeColumns.args = {
  columns: 3,
  fields: [
    {
      id: "fieldId",
      component: "vc-input",
      label: "Input field",
      placeholder: "Enter text here",
      property: "mockedProperty",
    },
    {
      id: "fieldId2",
      component: "vc-input",
      label: "Input field 2",
      placeholder: "Enter text here",
      property: "mockedProperty2",
    },
    {
      id: "fieldId3",
      component: "vc-input",
      label: "Input field 3",
      placeholder: "Enter text here",
      property: "mockedProperty3",
    },
  ],
};

export const ThreeColumnsWithAspectRatio = ThreeColumns.bind({});
ThreeColumnsWithAspectRatio.args = {
  columns: 3,
  aspectRatio: [1, 2, 1],
  fields: [
    {
      id: "fieldId",
      component: "vc-input",
      label: "Input field",
      placeholder: "Enter text here",
      property: "mockedProperty",
    },
    {
      id: "fieldId2",
      component: "vc-input",
      label: "Input field 2",
      placeholder: "Enter text here",
      property: "mockedProperty2",
    },
    {
      id: "fieldId3",
      component: "vc-input",
      label: "Input field 3",
      placeholder: "Enter text here",
      property: "mockedProperty3",
    },
  ],
};

export const PropertyBasedFieldsetInTwoColumns: StoryFn<FieldsetSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        dataArray: [
          {
            id: 1,
            value: "value1",
            label: "Label 1",
            description: "Description 1",
          },
          {
            id: 2,
            value: "value2",
            label: "Label 2",
            description: "Description 2",
          },
          {
            id: 3,
            value: "value3",
            label: "Label 3",
            description: "Description 2",
          },
        ],
      },
    });
    return { args, context };
  },
  template,
});
PropertyBasedFieldsetInTwoColumns.args = {
  property: "dataArray",
  columns: 2,
  fields: [
    {
      id: "fieldId",
      component: "vc-input",
      label: "{label}",
      placeholder: "Enter text here",
      property: "value",
    },
    {
      id: "textareaId",
      component: "vc-textarea",
      label: "{label}",
      property: "description",
    },
  ],
};

export const NestedFieldsetsWithHorizontalSeparator: StoryFn<FieldsetSchema> = (args) => ({
  components: { page },
  setup() {
    const context = reactive({
      item: {
        mockedProperty: "value",
        mockedProperty2: "value2",
        mockedProperty3: "value3",
        mockedProperty4: "value4",
      },
    });
    return { args, context };
  },
  template,
});
NestedFieldsetsWithHorizontalSeparator.args = {
  fields: [
    {
      id: "nestedFieldsetId",
      component: "vc-fieldset",
      fields: [
        {
          id: "fieldsetId",
          component: "vc-fieldset",
          columns: 2,
          aspectRatio: [2, 1],
          horizontalSeparator: true,
          fields: [
            {
              id: "input1",
              component: "vc-input",
              label: "Input 1",
              property: "mockedProperty",
            },
            {
              id: "input2",
              component: "vc-input",
              label: "Input 2",
              property: "mockedProperty2",
            },
          ],
        },
        {
          id: "fieldsetId2",
          component: "vc-fieldset",
          columns: 2,
          aspectRatio: [1, 2],
          fields: [
            {
              id: "input1",
              component: "vc-input",
              label: "Input 1",
              property: "mockedProperty3",
            },
            {
              id: "input2",
              component: "vc-input",
              label: "Input 2",
              property: "mockedProperty4",
            },
          ],
        },
      ],
    },
  ],
};

export const WithVisibilityMethod: StoryFn<FieldsetSchema> = (args) => ({
  components: { page },
  setup() {
    const isVisible = ref(false);
    const toggle = () => {
      isVisible.value = !isVisible.value;
    };

    const context = reactive({
      item: {
        mockedProperty: "I am input field",
        mockedProperty2: "I am input field 2",
      },
      scope: {
        visibilityFn: isVisible,
      },
    });

    return { args, context, toggle };
  },
  template: templateWithVisibilityToggle,
});
WithVisibilityMethod.args = {
  visibility: { method: "visibilityFn" },
};

export const WithHorizontalSeparator = SingleColumn.bind({});
WithHorizontalSeparator.args = {
  horizontalSeparator: true,
};
