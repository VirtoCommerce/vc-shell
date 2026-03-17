# VcAuthLayout

A full-page centered authentication layout for login, registration, password reset, and other auth-related screens.

## When to Use

- Use for any authentication page: sign-in, sign-up, password reset, email verification
- Use when you need a centered card with logo, title, and form content
- When NOT to use: for in-app layouts, dashboards, or blade-based content (use blade navigation instead)

## Basic Usage

```vue
<template>
  <VcAuthLayout
    logo="/img/logo.svg"
    title="Sign In"
    subtitle="Welcome back"
  >
    <form @submit.prevent="handleLogin">
      <VcInput v-model="email" label="Email" />
      <VcInput v-model="password" label="Password" type="password" />
      <button type="submit">Sign In</button>
    </form>
    <template #footer>
      <a href="/terms">Terms of Service</a> | <a href="/privacy">Privacy Policy</a>
    </template>
  </VcAuthLayout>
</template>
```

## Key Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `string` | - | Path or URL to the logo image |
| `logoAlt` | `string` | `"Logo"` | Alt text for the logo |
| `title` | `string` | - | Card heading |
| `subtitle` | `string` | - | Card subheading |
| `background` | `string` | - | Background image URL (preloaded) |
| `bgColor` | `string` | - | Background color CSS override |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Form content (fields, buttons, SSO providers, errors) |
| `footer` | Below-card area (terms, privacy links) |

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
