import type { Meta, StoryFn } from "@storybook/vue3";
import { VcApp } from "./";
import { usePopup } from "../../../..";
import { VcPopup } from "..";
import { useMenuService } from "../../../../core/composables/useMenuService";

export default {
  title: "organisms/VcApp",
  component: VcApp,
  args: {
    isReady: true,
    version: "0.0.100",
    title: "VC-Shell Application",
    logo: "images/main-logo.svg",
  },
  decorators: [
    () => ({
      template: `
      <div
        class="tw-h-[600px]"
        style="--app-bar-divider-color: #ffffff;">
        <story/>
      </div>`,
    }),
  ],
} satisfies Meta<typeof VcApp>;

export const Primary: StoryFn<typeof VcApp> = (args) => ({
  components: { VcApp },
  setup() {
    const { addMenuItem } = useMenuService();

    addMenuItem({
      title: "SHELL.MENU.DASHBOARD",
      icon: "fas fa-home",
      priority: 0,
      url: "/",
    });
    return { args };
  },
  template: `
  <vc-app v-bind="args"></vc-app>
`,
});

export const CustomAppSwitcherSlot: StoryFn<typeof VcApp> = (args) => ({
  components: { VcApp },
  setup() {
    return { args };
  },
  template: `
  <vc-app v-bind="args">
    <template #app-switcher>
      <VcButton>Custom App Switcher</VcButton>
    </template>
  </vc-app>
`,
});

CustomAppSwitcherSlot.parameters = {
  docs: {
    description: {
      story: "You could use the `app-switcher` slot to customize the app switcher or to remove it.",
    },
  },
};

export const CustomToolbarSlot: StoryFn<typeof VcApp> = (args) => ({
  components: { VcApp },
  setup() {
    return { args };
  },
  template: `
  <vc-app v-bind="args">
    <template #toolbar="{
      LanguageSelector,
      UserDropdownButton,
      NotificationDropdown
    }">
      <div class="tw-flex tw-items-center tw-space-x-4">
        <component :is="LanguageSelector" />
        <component :is="UserDropdownButton" />
        <component :is="NotificationDropdown" />

        <VcButton>Custom Toolbar</VcButton>
      </div>
    </template>
  </vc-app>
`,
});

CustomToolbarSlot.parameters = {
  docs: {
    description: {
      story: "You could use the `toolbar` slot to customize the toolbar or to remove it.",
    },
  },
};

export const CustomToolbarPrependSlot: StoryFn<typeof VcApp> = (args) => ({
  components: { VcApp },
  setup() {
    return { args };
  },
  template: `
  <vc-app v-bind="args">
    <template #toolbar:prepend>
      <VcButton>Custom Toolbar Prepend</VcButton>
    </template>
  </vc-app>
`,
});

CustomToolbarPrependSlot.parameters = {
  docs: {
    description: {
      story: "You could use the `toolbar:prepend` slot to prepend content to the toolbar.",
    },
  },
};

export const CustomToolbarLanguageSelectorSlot: StoryFn<typeof VcApp> = (args) => ({
  components: { VcApp },
  setup() {
    const { open } = usePopup({
      component: VcPopup,
      props: {
        title: "Select a language",
      },
      slots: {
        content: "Lorem ipsum dolor",
      },
    });
    return { args, open };
  },
  template: `
  <vc-app v-bind="args">
    <template #toolbar:language-selector>
      <VcButton @click="open">Click me!</VcButton>
    </template>
  </vc-app>
`,
});

CustomToolbarLanguageSelectorSlot.parameters = {
  docs: {
    description: {
      story: "You could use the `toolbar:language-selector` slot to customize the language selector or to remove it.",
    },
  },
};

export const CustomNotificationsDropdownSlot: StoryFn<typeof VcApp> = (args) => ({
  components: { VcApp },
  setup() {
    const { open } = usePopup({
      component: VcPopup,
      props: {
        title: "Notifications",
      },
      slots: {
        content: "Lorem ipsum dolor",
      },
    });
    return { args, open };
  },
  template: `
  <vc-app v-bind="args">
    <template #toolbar:notifications-dropdown>
      <VcButton @click="open">Click me!</VcButton>
    </template>
  </vc-app>
`,
});

CustomNotificationsDropdownSlot.parameters = {
  docs: {
    description: {
      story:
        "You could use the `toolbar:notifications-dropdown` slot to customize the notifications dropdown or to remove it.",
    },
  },
};

export const CustomUserDropdownButtonSlot: StoryFn<typeof VcApp> = (args) => ({
  components: { VcApp },
  setup() {
    const { open } = usePopup({
      component: VcPopup,
      props: {
        title: "User",
      },
      slots: {
        content: "Lorem ipsum dolor",
      },
    });
    return { args, open };
  },
  template: `
  <vc-app v-bind="args">
    <template #toolbar:user-dropdown>
      <VcButton @click="open">Click me!</VcButton>
    </template>
  </vc-app>
`,
});

CustomUserDropdownButtonSlot.parameters = {
  docs: {
    description: {
      story: "You could use the `toolbar:user-dropdown` slot to customize the user dropdown button or to remove it.",
    },
  },
};
