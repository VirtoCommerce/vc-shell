import type { Meta, StoryObj } from "@storybook/vue3-vite";

import VcAuthLayout from "./vc-auth-layout.vue";

/**
 * `VcAuthLayout` is a centered authentication page layout used for login, registration,
 * password reset, and other auth flows.
 *
 * It provides:
 * - Full-page centered layout with configurable background
 * - Logo with fade-in loading animation
 * - Card container with title/subtitle header
 * - Default slot for form content
 * - Footer slot for terms/privacy links
 * - Optional version display from route meta
 *
 * The component uses `useRouter()` internally to read `appVersion` from route meta.
 */
const meta = {
  title: "Layout/VcAuthLayout",
  component: VcAuthLayout,
  tags: ["autodocs"],
  argTypes: {
    logo: {
      description: "Path or URL to the logo image displayed above the card",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    logoAlt: {
      description: "Accessible alt text for the logo image",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '"Logo"' },
        category: "Appearance",
      },
    },
    title: {
      description: "Main heading displayed inside the card",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Data",
      },
    },
    subtitle: {
      description: "Subheading displayed below the title inside the card",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Data",
      },
    },
    background: {
      description: "Background image URL for full-page background. Image is preloaded to avoid pop-in",
      control: "text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    bgColor: {
      description: "Page background color override (CSS color value)",
      control: "color",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
        category: "Appearance",
      },
    },
    default: {
      description: "Form content slot (fields, buttons, SSO providers, error messages)",
      table: { category: "Slots" },
    },
    footer: {
      description: "Below-card area for terms of service, privacy policy links, etc.",
      table: { category: "Slots" },
    },
  },
  args: {
    title: "Sign In",
    subtitle: "Enter your credentials to continue",
    logoAlt: "Company Logo",
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A full-page centered authentication layout for login, registration, and password recovery screens.

Features:
- Centered card with max-width constraint (420px)
- Logo with fade-in animation on load
- Background image preloading to prevent pop-in
- Custom background color support
- Footer area for legal links
- App version display from route meta

## Usage

\`\`\`vue
<VcAuthLayout
  logo="/logo.svg"
  title="Sign In"
  subtitle="Welcome back"
>
  <form @submit.prevent="handleLogin">
    <VcInput v-model="email" label="Email" />
    <VcInput v-model="password" label="Password" type="password" />
    <button type="submit">Sign In</button>
  </form>
  <template #footer>
    <a href="/terms">Terms of Service</a>
  </template>
</VcAuthLayout>
\`\`\`
        `,
      },
    },
  },
  decorators: [
    // Provide a mock router since VcAuthLayout calls useRouter()
    (story) => ({
      components: { story },
      template: '<div style="height: 100vh;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof VcAuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic sign-in layout with title, subtitle, and form fields.
 */
export const Default: Story = {
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <form @submit.prevent class="tw-flex tw-flex-col tw-gap-4">
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Email
            <input
              type="email"
              placeholder="user@example.com"
              class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm"
            />
          </label>
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Password
            <input
              type="password"
              placeholder="Enter password"
              class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm"
            />
          </label>
          <button
            type="submit"
            class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm"
          >
            Sign In
          </button>
        </form>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Standard sign-in form with email and password fields inside the auth layout card.",
      },
    },
  },
};

/**
 * Layout with title only, no subtitle.
 */
export const TitleOnly: Story = {
  args: {
    title: "Create Account",
    subtitle: undefined,
  },
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <form @submit.prevent class="tw-flex tw-flex-col tw-gap-4">
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Full Name
            <input type="text" placeholder="Jane Doe" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Email
            <input type="email" placeholder="jane@example.com" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Password
            <input type="password" placeholder="Create a password" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <button type="submit" class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Create Account
          </button>
        </form>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "When only `title` is provided without `subtitle`, the header displays the title alone.",
      },
    },
  },
};

/**
 * Layout with no header (no title or subtitle).
 */
export const NoHeader: Story = {
  args: {
    title: undefined,
    subtitle: undefined,
  },
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <div class="tw-text-center tw-flex tw-flex-col tw-gap-4">
          <p class="tw-text-sm tw-text-[var(--neutrals-500)] tw-m-0">Check your email for a password reset link.</p>
          <button class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Back to Sign In
          </button>
        </div>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "When neither `title` nor `subtitle` is provided, the header section is hidden entirely, leaving only the content area.",
      },
    },
  },
};

/**
 * Layout with footer slot for legal links.
 */
export const WithFooter: Story = {
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <form @submit.prevent class="tw-flex tw-flex-col tw-gap-4">
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Email
            <input type="email" placeholder="user@example.com" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Password
            <input type="password" placeholder="Enter password" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <button type="submit" class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Sign In
          </button>
        </form>
        <template #footer>
          <p class="tw-m-0">
            By signing in, you agree to our
            <a href="#" class="tw-text-[var(--primary-500)] tw-underline">Terms of Service</a>
            and
            <a href="#" class="tw-text-[var(--primary-500)] tw-underline">Privacy Policy</a>.
          </p>
        </template>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The `#footer` slot renders below the card and is ideal for terms of service, privacy policy links, or other legal notices.",
      },
    },
  },
};

/**
 * Layout with a custom background color.
 */
export const CustomBackgroundColor: Story = {
  args: {
    title: "Welcome",
    subtitle: "Sign in to your workspace",
    bgColor: "#1e293b",
  },
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <form @submit.prevent class="tw-flex tw-flex-col tw-gap-4">
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Email
            <input type="email" placeholder="user@example.com" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <button type="submit" class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Continue
          </button>
        </form>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "The `bgColor` prop overrides the default page background color. This allows theming the auth page to match brand guidelines.",
      },
    },
  },
};

/**
 * Password reset flow layout.
 */
export const PasswordReset: Story = {
  args: {
    title: "Reset Password",
    subtitle: "Enter your email and we'll send you a reset link",
  },
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <form @submit.prevent class="tw-flex tw-flex-col tw-gap-4">
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Email Address
            <input type="email" placeholder="user@example.com" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <button type="submit" class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Send Reset Link
          </button>
          <a href="#" class="tw-text-center tw-text-sm tw-text-[var(--primary-500)] tw-no-underline">
            Back to Sign In
          </a>
        </form>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: "Example of a password reset flow using the auth layout with appropriate title and subtitle messaging.",
      },
    },
  },
};

/**
 * Login form with SSO provider buttons.
 */
export const WithSSOProviders: Story = {
  args: {
    title: "Sign In",
    subtitle: "Choose your preferred sign-in method",
  },
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <div class="tw-flex tw-flex-col tw-gap-4">
          <button class="tw-w-full tw-py-2.5 tw-bg-white tw-text-[var(--neutrals-900)] tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm tw-flex tw-items-center tw-justify-center tw-gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/></svg>
            Continue with Google
          </button>
          <button class="tw-w-full tw-py-2.5 tw-bg-[#333] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm tw-flex tw-items-center tw-justify-center tw-gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/></svg>
            Continue with GitHub
          </button>
          <div class="tw-flex tw-items-center tw-gap-3 tw-my-1">
            <div class="tw-flex-1 tw-h-px tw-bg-[var(--neutrals-200)]"></div>
            <span class="tw-text-xs tw-text-[var(--neutrals-400)]">or</span>
            <div class="tw-flex-1 tw-h-px tw-bg-[var(--neutrals-200)]"></div>
          </div>
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Email
            <input type="email" placeholder="user@example.com" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Password
            <input type="password" placeholder="Enter password" class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm" />
          </label>
          <button type="submit" class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Sign In
          </button>
        </div>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Auth layout with SSO provider buttons (Google, GitHub) above the traditional email/password form, separated by an 'or' divider.",
      },
    },
  },
};

/**
 * Minimal layout with only content, no header or footer.
 */
export const MinimalContent: Story = {
  args: {
    title: undefined,
    subtitle: undefined,
  },
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <div class="tw-text-center tw-py-4">
          <div class="tw-text-4xl tw-mb-4">&#128274;</div>
          <h3 class="tw-text-lg tw-font-semibold tw-m-0 tw-mb-2">Session Expired</h3>
          <p class="tw-text-sm tw-text-[var(--neutrals-500)] tw-m-0 tw-mb-4">Your session has expired. Please sign in again.</p>
          <button class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Sign In Again
          </button>
        </div>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "A minimal layout with custom content and no header, useful for session-expired or confirmation screens.",
      },
    },
  },
};

/**
 * Layout accessibility: semantic HTML and screen reader support.
 */
export const Accessibility: Story = {
  args: {
    title: "Sign In",
    subtitle: "Accessible authentication form",
    logoAlt: "Acme Corporation Logo",
  },
  render: (args) => ({
    components: { VcAuthLayout },
    setup: () => ({ args }),
    template: `
      <VcAuthLayout v-bind="args">
        <form @submit.prevent class="tw-flex tw-flex-col tw-gap-4" aria-label="Sign in form">
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Email
            <input
              type="email"
              placeholder="user@example.com"
              class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm"
              aria-required="true"
              autocomplete="email"
            />
          </label>
          <label class="tw-flex tw-flex-col tw-gap-1 tw-text-sm tw-font-medium">
            Password
            <input
              type="password"
              placeholder="Enter password"
              class="tw-px-3 tw-py-2 tw-border tw-border-solid tw-border-[var(--neutrals-300)] tw-rounded-lg tw-text-sm"
              aria-required="true"
              autocomplete="current-password"
            />
          </label>
          <button type="submit" class="tw-w-full tw-py-2.5 tw-bg-[var(--primary-500)] tw-text-white tw-border-none tw-rounded-lg tw-font-medium tw-cursor-pointer tw-text-sm">
            Sign In
          </button>
        </form>
        <template #footer>
          <nav aria-label="Legal links">
            <a href="#" class="tw-text-[var(--primary-500)] tw-underline">Terms</a>
            &nbsp;|&nbsp;
            <a href="#" class="tw-text-[var(--primary-500)] tw-underline">Privacy</a>
          </nav>
        </template>
      </VcAuthLayout>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates accessible form markup with `aria-required`, `autocomplete`, `aria-label`, and semantic `<nav>` in the footer. The layout uses a `<main>` landmark element.",
      },
    },
  },
};
