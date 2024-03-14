import { ref } from "vue";
import { VcMultivalue } from ".";
import { StoryFn, type Meta } from "@storybook/vue3";

const FIELD_TYPE = ["text", "number"];

export default {
  title: "molecules/VcMultivalue",
  component: VcMultivalue as Record<keyof typeof VcMultivalue, unknown>,
  args: {
    placeholder: "Enter a value",
    type: "text",
    label: "Multivalue Field",
    name: "multivalueField",
    options: [
      { id: "1", title: "Option 1" },
      { id: "2", title: "Option 2" },
      { id: "3", title: "Option 3" },
    ],
    optionValue: "id",
    optionLabel: "title",
    multivalue: true,
  },
  argTypes: {
    type: {
      control: "radio",
      options: FIELD_TYPE,
      table: {
        type: {
          summary: FIELD_TYPE.join(" | "),
        },
      },
    },
  },
} satisfies Meta<typeof VcMultivalue>;

const Template: StoryFn<typeof VcMultivalue> = (args) => ({
  components: { VcMultivalue } as Record<keyof typeof VcMultivalue, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `
      <vc-multivalue v-bind="args" v-model="val"></vc-multivalue>
  `,
});

export const Default = Template.bind({});

export const Error = Template.bind({});
Error.args = { errorMessage: "This is an error", error: true };

export const Disabled = Template.bind({});
Disabled.args = { disabled: true };

export const Tooltip = Template.bind({});
Tooltip.args = { tooltip: "This is a tooltip" };

export const SingleValue = Template.bind({});
SingleValue.args = {
  multivalue: false,
};

export const Hint = Template.bind({});
Hint.args = {
  hint: "This is a hint",
};

export const Required = Template.bind({});
Required.args = {
  required: true,
};

export const CustomDropdownItemSlot: StoryFn<typeof VcMultivalue> = (args) => ({
  components: { VcMultivalue } as Record<keyof typeof VcMultivalue, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `
    <vc-multivalue v-bind="args" v-model="val">
      <template #item="{ item }">
        <div>
          <h2 class="tw-font-bold">Item header</h2>
          <div>{{ item.title }}</div>
        </div>
      </template>
    </vc-multivalue>
  `,
});

export const CustomHintSlot: StoryFn<typeof VcMultivalue> = (args) => ({
  components: { VcMultivalue } as Record<keyof typeof VcMultivalue, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `
    <vc-multivalue v-bind="args" v-model="val">
      <template #hint>
        <div class="tw-text-red-500">Custom hint</div>
      </template>
    </vc-multivalue>
  `,
});

export const CustomErrorSlot: StoryFn<typeof VcMultivalue> = (args) => ({
  components: { VcMultivalue } as Record<keyof typeof VcMultivalue, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `
    <vc-multivalue v-bind="args" v-model="val" error>
      <template #error>
        <div class="tw-text-red-500">Custom error</div>
      </template>
    </vc-multivalue>
  `,
});
