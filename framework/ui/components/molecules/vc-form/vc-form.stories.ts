import type { Meta, StoryObj } from "@storybook/vue3";
import { VcForm } from "./";
import { VcInput } from "../vc-input";
import { VcButton } from "../../atoms/vc-button";
import { ref } from "vue";

/**
 * `VcForm` is a component that provides a standard form container with consistent styling and behavior.
 */
const meta = {
  title: "molecules/VcForm",
  component: VcForm,
  tags: ["autodocs"],
  argTypes: {
    default: {
      description: "Form content",
      control: "text",
      table: {
        type: { summary: "VNode[]" },
        category: "slots",
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
The VcForm component serves as a container for form elements, providing:

- Standard HTML form behavior
- Consistent styling across the application
- The ability to group form controls together
- Event handling for form submission

Use this component whenever you need to collect user input through a form.
        `,
      },
    },
  },
} satisfies Meta<typeof VcForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic form with input fields
 */
export const Basic: Story = {
  render: (args) => ({
    components: { VcForm, VcInput },
    setup() {
      return { args };
    },
    template: `
      <vc-form v-bind="args" @submit.prevent="$event => console.log('Form submitted', $event)">
        <div class="tw-flex tw-flex-col tw-gap-4">
          <vc-input label="First Name" />
          <vc-input label="Last Name" />
          <vc-input label="Email" />
        </div>
      </vc-form>
    `,
  }),
};

/**
 * Form with submit button and validation
 */
export const WithSubmitButton: Story = {
  render: (args) => ({
    components: { VcForm, VcInput, VcButton },
    setup() {
      const firstName = ref("");
      const lastName = ref("");
      const email = ref("");

      const handleSubmit = (event: Event) => {
        event.preventDefault();
        console.log("Form submitted", {
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
        });
      };

      return { args, firstName, lastName, email, handleSubmit };
    },
    template: `
      <vc-form v-bind="args" @submit="handleSubmit">
        <div class="tw-flex tw-flex-col tw-gap-4">
          <vc-input v-model="firstName" label="First Name" required />
          <vc-input v-model="lastName" label="Last Name" required />
          <vc-input v-model="email" label="Email" type="email" required />

          <div class="tw-mt-4">
            <vc-button type="submit">Submit</vc-button>
          </div>
        </div>
      </vc-form>
    `,
  }),
};

/**
 * Form with fieldset grouping
 */
export const WithFieldsets: Story = {
  render: (args) => ({
    components: { VcForm, VcInput, VcButton },
    setup() {
      return { args };
    },
    template: `
      <vc-form v-bind="args" @submit.prevent="$event => console.log('Form submitted', $event)">
        <div class="tw-flex tw-flex-col tw-gap-6">
          <fieldset class="tw-border tw-border-gray-300 tw-rounded tw-p-4">
            <legend class="tw-font-medium tw-px-2">Personal Information</legend>
            <div class="tw-flex tw-flex-col tw-gap-4">
              <vc-input label="First Name" />
              <vc-input label="Last Name" />
            </div>
          </fieldset>

          <fieldset class="tw-border tw-border-gray-300 tw-rounded tw-p-4">
            <legend class="tw-font-medium tw-px-2">Contact Information</legend>
            <div class="tw-flex tw-flex-col tw-gap-4">
              <vc-input label="Email" type="email" />
              <vc-input label="Phone" type="tel" />
            </div>
          </fieldset>

          <div class="tw-mt-2">
            <vc-button type="submit">Submit</vc-button>
          </div>
        </div>
      </vc-form>
    `,
  }),
};

/**
 * Form with horizontal layout
 */
export const HorizontalLayout: Story = {
  render: (args) => ({
    components: { VcForm, VcInput, VcButton },
    setup() {
      return { args };
    },
    template: `
      <vc-form v-bind="args" @submit.prevent="$event => console.log('Form submitted', $event)">
        <div class="tw-flex tw-flex-col tw-gap-4">
          <div class="tw-flex tw-gap-4">
            <vc-input label="First Name" class="tw-w-1/2" />
            <vc-input label="Last Name" class="tw-w-1/2" />
          </div>
          <div class="tw-flex tw-gap-4">
            <vc-input label="Email" type="email" class="tw-w-1/2" />
            <vc-input label="Phone" type="tel" class="tw-w-1/2" />
          </div>
          <div class="tw-mt-4">
            <vc-button type="submit">Submit</vc-button>
          </div>
        </div>
      </vc-form>
    `,
  }),
};
