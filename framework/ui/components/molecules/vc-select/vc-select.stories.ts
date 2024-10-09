import type { Meta, StoryFn } from "@storybook/vue3";
import { VcSelect } from "./";
import { ref } from "vue";

export default {
  title: "molecules/VcSelect",
  component: VcSelect as Record<keyof typeof VcSelect, unknown>,
  args: {
    label: "Select",
    placeholder: "Select an option",
  },
  argTypes: {
    options: {
      description: `Method that is used to get select options.
      Method should be defined in the blade \`scope\` and could be:
      \n1) async method with the following arguments: (\`keyword: string\`, \`skip\`, \`ids?: string[]\`).
      \n2) any array
      \n3) composable returning array`,
      table: {
        type: {
          summary: "((keyword?: string, skip?: number, ids?: string[]) => Promise<P>) | T[]",
        },
      },
    },
    optionValue: {
      description: "Property which holds the `value`",
      control: "text",
      table: {
        type: {
          summary: "string",
        },
        defaultValue: {
          summary: "id",
        },
      },
    },
    optionLabel: {
      description: "Property which holds the `label`",
      control: "text",
      table: {
        type: {
          summary: "string",
        },
        defaultValue: {
          summary: "title",
        },
      },
    },
    debounce: {
      control: "number",
    },
    clearable: {
      description: "Whether the select is clearable or not.",
      control: "boolean",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: false,
        },
      },
    },
    emitValue: {
      description: `Update model with the value of the selected option instead of the whole option.
      \n Example:
      \nIf emitValue is \`true\` and the selected option is { id: 1, title: "Option 1" }, the model will be updated with 1.
      \nIf emitValue is \`false\`, the model will be updated with the whole option.`,
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: "true",
        },
      },
    },
    searchable: {
      description: "Whether the select is searchable or not.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: false,
        },
      },
    },
    multiple: {
      description: "Select multiple values.",
      table: {
        type: {
          summary: "boolean",
        },
        defaultValue: {
          summary: false,
        },
      },
    },
  },
} satisfies Meta<typeof VcSelect>;

export const ObjectArrayOptions: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
    ></VcSelect>`,
});

export const StringArrayOptions: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect v-bind="args" v-model="val" :options="['Option 1', 'Option 2', 'Option 3']"></VcSelect>`,
});

export const AsyncOptions: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    const getItems = async () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            results: [
              { title: "Option 1", label: "Option 1" },
              { title: "Option 2", label: "Option 2" },
              { title: "Option 3", label: "Option 3" },
            ],
            totalCount: 3,
          });
        }, 1000);
      });
    return { args, val, getItems };
  },

  template: `
      <VcSelect
        v-bind="args"
          v-model="val"
          :options="getItems"
          optionLabel="label"
          optionValue="title"
      ></VcSelect>`,
});

export const EmitValueTrueProp: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref("Option 1");
    return { args, val };
  },

  template: `
      <div>
        <VcSelect
            v-bind="args"
            v-model="val"
            :options="[
              { title: 'Option 1', label: 'Option 1 label' },
              { title: 'Option 2', label: 'Option 2 label' },
              { title: 'Option 3', label: 'Option 3 label' },
            ]"
            optionLabel="label"
            optionValue="title"
        ></VcSelect>

        <p>Selected value: {{val}}</p>
      </div>`,
});
EmitValueTrueProp.parameters = {
  docs: {
    description: {
      story: "The default emitValue === <b>true</b> returns the value of key defined in optionValue",
    },
  },
};

export const EmitValueFalseProp: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref({ title: "Option 1", label: "Option 1 label" });
    return { args, val };
  },

  template: `
      <div>
        <VcSelect
            v-bind="args"
            v-model="val"
            :emit-value="false"
            :options="[
              { title: 'Option 1', label: 'Option 1 label' },
              { title: 'Option 2', label: 'Option 2 label' },
              { title: 'Option 3', label: 'Option 3 label' },
            ]"
            optionLabel="label"
            optionValue="title"
        ></VcSelect>

        <p>Selected value: {{val}}</p>
      </div>`,
});
EmitValueFalseProp.parameters = {
  docs: {
    description: {
      story: "emitValue === <b>false</b> returns the complete object as the result",
    },
  },
};

export const MapOptionsTrueProp: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref("Option 1 title");
    return { args, val };
  },

  template: `
      <div>
        <VcSelect
            v-bind="args"
            v-model="val"
            :options="[
              { title: 'Option 1 title', label: 'Option 1 label' },
              { title: 'Option 2 title', label: 'Option 2 label' },
              { title: 'Option 3 title', label: 'Option 3 label' },
            ]"
            optionLabel="label"
            optionValue="title"
        ></VcSelect>

        <p>Selected value: {{val}}</p>
      </div>`,
});
MapOptionsTrueProp.parameters = {
  docs: {
    description: {
      story:
        "The default mapOptions === <b>true</b> maps map labels of model from 'options' Array. If you are using emit-value you will probably need to use map-options to display the label text in the select field rather than the value.",
    },
  },
};

export const MapOptionsFalseProp: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref("Option 1 title");
    return { args, val };
  },

  template: `
      <div>
        <VcSelect
            v-bind="args"
            v-model="val"
            :map-options="false"
            :options="[
              { title: 'Option 1 title', label: 'Option 1 label' },
              { title: 'Option 2 title', label: 'Option 2 label' },
              { title: 'Option 3 title', label: 'Option 3 label' },
            ]"
            optionLabel="label"
            optionValue="title"
        ></VcSelect>

        <p>Selected value: {{val}}</p>
      </div>`,
});
MapOptionsFalseProp.parameters = {
  docs: {
    description: {
      story: "mapOptions === <b>false</b> will not map labels of model from 'options' Array.",
    },
  },
};

export const Error = ObjectArrayOptions.bind({});
Error.args = {
  error: true,
  errorMessage: "Some error message",
};

export const Tooltip = ObjectArrayOptions.bind({});
Tooltip.args = {
  tooltip: "Some tooltip",
};

export const Disabled = ObjectArrayOptions.bind({});
Disabled.args = {
  disabled: true,
};

export const SearchableInput = ObjectArrayOptions.bind({});
SearchableInput.args = {
  searchable: true,
};

export const SearchableInputCustomDebounce = SearchableInput.bind({});
SearchableInputCustomDebounce.args = {
  searchable: true,
  debounce: 2000,
};

export const Required = ObjectArrayOptions.bind({});
Required.args = {
  required: true,
};

export const MultipleSelect: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref([
      { title: "Option 1", label: "Option 1" },
      { title: "Option 2", label: "Option 2" },
    ]);
    return { args, val };
  },

  template: `
        <VcSelect
            v-bind="args"
            v-model="val"
            multiple
            :options="[
              { title: 'Option 1', label: 'Option 1' },
              { title: 'Option 2', label: 'Option 2' },
              { title: 'Option 3', label: 'Option 3' },
            ]"
            optionLabel="label"
            optionValue="title"
        ></VcSelect>`,
});

export const NotClearable: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref("Option 1");
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :clearable="false"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
    ></VcSelect>`,
});

export const Loading = ObjectArrayOptions.bind({});
Loading.args = {
  loading: true,
};

export const Prefix = ObjectArrayOptions.bind({});
Prefix.args = {
  prefix: "prefix",
};

export const Suffix = ObjectArrayOptions.bind({});
Suffix.args = {
  suffix: "suffix",
};

export const Hint = ObjectArrayOptions.bind({});
Hint.args = {
  hint: "Some hint",
};

export const CustomSelectControlSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
      customSelectControl
    >
      <template #control="scope">
        <VcButton @click="scope.toggleHandler" class="tw-w-full">Custom control</VcButton>
      </template>
    </VcSelect>`,
});
CustomSelectControlSlot.parameters = {
  docs: {
    description: {
      story: `
      "control": (scope: {
        /**
         * Toggle dropdown handler
         */
        toggleHandler: () => void;
      }) => any;`,
    },
  },
};

export const CustomPrependInnerSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
      customPrependInner
    >
      <template #prepend-inner>
        <VcButton>Action</VcButton>
      </template>
    </VcSelect>`,
});

export const CustomAppendInnerSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
      customAppendInner
    >
      <template #append-inner>
        <VcButton>Action</VcButton>
      </template>
    </VcSelect>`,
});

export const CustomPrependSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
      customPrepend
    >
      <template #prepend>
        <VcButton>Action</VcButton>
      </template>
    </VcSelect>`,
});

export const CustomAppendSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
      customAppend
    >
      <template #append>
        <VcButton>Action</VcButton>
      </template>
    </VcSelect>`,
});

export const CustomNoOptionsSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[]"
      optionLabel="label"
      optionValue="title"
      customNoOptions
    >
      <template #no-options>
        <h2 class="tw-font-bold">I'm custom slot!</h2>
        <p>Please try again later</p>
      </template>
    </VcSelect>`,
});

export const CustomErrorSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[]"
      optionLabel="label"
      optionValue="title"
      error
      customError
    >
      <template #error>
        <p class="tw-font-bold">I'm custom error message!</p>
      </template>
    </VcSelect>`,
});

export const CustomHintSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref();
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[]"
      optionLabel="label"
      optionValue="title"
      customHint
    >
      <template #hint>
        <p class="tw-font-bold">I'm custom hint message!</p>
      </template>
    </VcSelect>`,
});

export const CustomSelectedOptionSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref("Option 1");
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
    >
      <template #selected-item="{ opt }">

          <VcIcon class="tw-mr-2 tw-text-green-300" icon="fas fa-check" />
          <p>{{opt.label}}</p>

      </template>
    </VcSelect>`,
});
CustomSelectedOptionSlot.parameters = {
  docs: {
    description: {
      story: `
      "selected-item": (scope: {
        /**
         * Selection index
         */
        index: number;
        /**
         * Selected option -- its value is taken from model
         */
        opt: Option;
        /**
         * Always true -- passed as prop
         */
        selected: boolean;
        /**
         * Remove selected option located at specific index
         * @param index Index at which to remove selection
         */
        removeAtIndex: (index: number) => void;
      }) => any;`,
    },
  },
};

export const CustomListOptionSlot: StoryFn<typeof VcSelect> = (args) => ({
  components: { VcSelect } as Record<keyof typeof VcSelect, unknown>,
  setup() {
    const val = ref("Option 1");
    return { args, val };
  },
  template: `<VcSelect
    v-bind="args"
      v-model="val"
      :options="[
        { title: 'Option 1', label: 'Option 1' },
        { title: 'Option 2', label: 'Option 2' },
        { title: 'Option 3', label: 'Option 3' },
      ]"
      optionLabel="label"
      optionValue="title"
    >
      <template #option="{ opt }">
        <VcIcon class="tw-mr-2 tw-text-green-300" icon="fas fa-check" />
        <p>{{opt.label}}</p>
      </template>
    </VcSelect>`,
});
CustomListOptionSlot.parameters = {
  docs: {
    description: {
      story: `
      option: (scope: {
        /**
         * Option index
         */
        index: number;
        /**
         * Option -- its value is taken from 'options' prop
         */
        opt: Option;
        /**
         * Is option selected
         */
        selected: boolean;
        /**
         * Add/remove option from model
         * @param opt Option to add to model
         */
        toggleOption: (opt: any) => void;
      }) => any;
      `,
    },
  },
};
