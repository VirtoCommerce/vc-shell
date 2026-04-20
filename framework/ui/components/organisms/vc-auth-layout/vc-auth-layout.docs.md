# VcAuthLayout

A full-page centered authentication layout for login, registration, password reset, and other auth-related screens. VcAuthLayout renders a vertically and horizontally centered card on top of an optional background image, with a logo, title, subtitle, form content area, and a footer slot for legal links. It is the standard layout for all pre-authentication pages in VirtoCommerce admin applications.

## When to Use

- Use for any authentication page: sign-in, sign-up, password reset, email verification
- Use when you need a centered card with logo, title, and form content
- When NOT to use: for in-app layouts, dashboards, or blade-based content (use VcApp with blade navigation instead); for modal auth prompts inside the app (use VcPopup)

## Basic Usage

```vue
<template>
  <VcAuthLayout
    logo="/img/logo.svg"
    title="Sign In"
    subtitle="Welcome back"
  >
    <form @submit.prevent="handleLogin">
      <VcInput
        v-model="email"
        label="Email"
      />
      <VcInput
        v-model="password"
        label="Password"
        type="password"
      />
      <button type="submit">Sign In</button>
    </form>
    <template #footer> <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a> </template>
  </VcAuthLayout>
</template>
```

## Key Props

| Prop         | Type     | Default  | Description                      |
| ------------ | -------- | -------- | -------------------------------- |
| `logo`       | `string` | -        | Path or URL to the logo image    |
| `logoAlt`    | `string` | `"Logo"` | Alt text for the logo            |
| `title`      | `string` | -        | Card heading                     |
| `subtitle`   | `string` | -        | Card subheading                  |
| `background` | `string` | -        | Background image URL (preloaded) |
| `bgColor`    | `string` | -        | Background color CSS override    |

## Slots

| Slot      | Description                                           |
| --------- | ----------------------------------------------------- |
| `default` | Form content (fields, buttons, SSO providers, errors) |
| `footer`  | Below-card area (terms, privacy links)                |

## Features

### Background Image Preloading

When a `background` URL is provided, VcAuthLayout preloads the image before displaying it, preventing a flash of unstyled content. The image fills the viewport behind the card.

### Responsive Card

The card is centered both vertically and horizontally. On narrow viewports, it stretches to fill the available width with appropriate padding, ensuring the form remains usable on mobile devices.

### Semantic Structure

The layout uses a `<main>` element as the page landmark and an `<h2>` for the card title, providing a correct heading hierarchy for screen readers and SEO.

## Recipe: Sign-In Page with SSO

```vue
<template>
  <VcAuthLayout
    logo="/img/logo.svg"
    title="Sign In"
    subtitle="Enter your credentials or use a social provider"
    background="/img/auth-bg.jpg"
  >
    <form
      @submit.prevent="handleLogin"
      class="tw-space-y-4"
    >
      <VcInput
        v-model="email"
        label="Email"
        type="email"
        required
      />
      <VcInput
        v-model="password"
        label="Password"
        type="password"
        required
      />
      <VcButton
        type="submit"
        variant="primary"
        class="tw-w-full"
      >
        Sign In
      </VcButton>
    </form>

    <div class="tw-my-4 tw-text-center tw-text-sm tw-text-gray-500">or</div>

    <div class="tw-space-y-2">
      <VcButton
        variant="outline"
        class="tw-w-full"
        @click="loginWithGoogle"
      >
        Continue with Google
      </VcButton>
      <VcButton
        variant="outline"
        class="tw-w-full"
        @click="loginWithAzure"
      >
        Continue with Azure AD
      </VcButton>
    </div>

    <template #footer>
      <nav
        aria-label="Legal links"
        class="tw-text-sm tw-text-gray-500"
      >
        <a href="/terms">Terms</a> &middot; <a href="/privacy">Privacy</a>
      </nav>
    </template>
  </VcAuthLayout>
</template>
```

## Recipe: Password Reset Page

```vue
<template>
  <VcAuthLayout
    logo="/img/logo.svg"
    title="Reset Password"
    subtitle="Enter your email to receive a reset link"
  >
    <form
      @submit.prevent="sendResetLink"
      class="tw-space-y-4"
    >
      <VcInput
        v-model="email"
        label="Email"
        type="email"
        required
      />
      <VcBanner
        v-if="successMessage"
        variant="success"
        icon="lucide-circle-check"
      >
        {{ successMessage }}
      </VcBanner>
      <VcBanner
        v-if="errorMessage"
        variant="danger"
        icon="lucide-circle-alert"
      >
        {{ errorMessage }}
      </VcBanner>
      <VcButton
        type="submit"
        variant="primary"
        class="tw-w-full"
        :disabled="isSending"
      >
        Send Reset Link
      </VcButton>
    </form>
    <div class="tw-mt-4 tw-text-center">
      <VcLink @click="goToSignIn">Back to Sign In</VcLink>
    </div>
  </VcAuthLayout>
</template>
```

## Common Mistakes

- **Using VcAuthLayout inside VcApp** -- VcAuthLayout is a full-page layout meant to replace VcApp, not nest inside it. Your router should switch between VcAuthLayout (for auth routes) and VcApp (for authenticated routes).
- **Missing form accessibility** -- Always add `aria-required`, `autocomplete` attributes, and `<label>` associations on inputs inside the form. VcInput handles this when you use its `label` prop.
- **Forgetting the logo** -- Without a `logo` prop, the card has no branding. Always provide a logo path for a professional appearance.

## Tips

- Use `bgColor` for a solid background when you do not have a background image. Example: `bg-color="#1a1a2e"`.
- The `background` prop accepts any valid CSS image URL. For best results, use a high-resolution image (1920x1080 or larger) with some blur or overlay in the image itself to keep the card readable.
- The footer slot is ideal for legal links (Terms of Service, Privacy Policy). Wrap them in a `<nav>` with `aria-label` for accessibility.
- VcAuthLayout does not include any routing logic. Handle navigation between sign-in, sign-up, and password reset using your Vue Router configuration.

## Accessibility

- Uses semantic `<main>` element as the page landmark
- `<h2>` for the card title provides heading hierarchy
- Logo image has configurable `alt` text via `logoAlt` prop
- Form content should include `aria-required`, `autocomplete`, and proper `<label>` associations
- Footer area should use `<nav>` with `aria-label` for link groups

## Related Components

- **VcInput** - Text input fields commonly used inside auth forms
- **VcButton** - Action buttons for form submission
- **VcPopup** - Modal dialogs (for in-app auth prompts, not full-page auth)
- **VcApp** - The authenticated application shell (counterpart to VcAuthLayout)
