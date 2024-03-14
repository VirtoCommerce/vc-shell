import type { Meta, StoryFn } from "@storybook/vue3";
import { VcForm } from "./";
import { VcInput } from "../vc-input";

export default {
  title: "molecules/VcForm",
  component: VcForm,
} satisfies Meta<typeof VcForm>;

export const Primary: StoryFn<typeof VcForm> = (args) => ({
  components: { VcForm, VcInput },
  setup() {
    return { args };
  },
  template: `
    <vc-form v-bind="args">
      <template #default>
        <div class="tw-flex tw-flex-col tw-gap-4">
          <vc-input label="First Name" />
          <vc-input label="Last Name" />
          <vc-input label="Email" />
        </div>
      </template>
    </vc-form>`,
});
