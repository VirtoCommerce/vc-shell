---
title: VcVideo
category: components
group: media
---

# VcVideo

An embedded video player that renders an iframe for external video sources (YouTube, Vimeo, etc.) with an optional label and tooltip. When no source URL is provided, the component displays a centered film icon placeholder instead of a blank space, giving users a clear visual cue that a video can be attached.

::storybook id="data-display-vcvideo--default"

## When to Use

- Embed product or tutorial videos in blade detail views
- Display instructional content alongside form fields
- Show a placeholder for an optional video field that has not been filled yet
- When NOT to use: native HTML5 video playback from local files (use a plain `<video>` element); audio-only content (use an `<audio>` element)

## Basic Usage

```vue
<template>
  <VcVideo
    source="https://www.youtube.com/embed/PeXX-V-dwpA"
    label="Product Overview"
  />
</template>

<script setup lang="ts">
import { VcVideo } from "@vc-shell/framework";
</script>
```

## Key Props

| Prop                | Type     | Default | Description                                                                                 |
| ------------------- | -------- | ------- | ------------------------------------------------------------------------------------------- |
| `source`            | `string` | --      | Embed URL for the video (e.g., YouTube embed link)                                          |
| `label`             | `string` | --      | Label text displayed above the video                                                        |
| `tooltip`           | `string` | --      | Tooltip text shown on the label's info icon                                                 |
| `additionalSandbox` | `string` | --      | Extra space-separated iframe sandbox tokens appended to the resolved sandbox (see Security) |

::storybook id="data-display-vcvideo--with-tooltip" height="400"

## Events

| Event   | Payload | Description                                                  |
| ------- | ------- | ------------------------------------------------------------ |
| `click` | --      | Declared public emit. Currently the template never fires it. |

## Common Patterns

### Video with Label and Tooltip

```vue
<VcVideo source="https://www.youtube.com/embed/dQw4w9WgXcQ" label="Setup Guide" tooltip="This video walks through the initial configuration steps" />
```

### Placeholder When Source Is Missing

When `source` is not provided, VcVideo renders a centered film icon placeholder instead of a blank space.

```vue
<VcVideo label="Video Not Available" />
```

### Conditional Video in a Product Blade

```vue
<template>
  <VcBlade title="Product Details">
    <VcInput
      label="Video URL"
      v-model="product.videoUrl"
      placeholder="https://youtube.com/embed/..."
    />
    <VcVideo
      :source="product.videoUrl"
      label="Product Video"
      tooltip="Paste a YouTube or Vimeo embed URL above"
    />
  </VcBlade>
</template>
```

## Recipe: Side-by-Side Video and Description

```vue
<template>
  <VcRow class="tw-gap-4">
    <VcCol :size="1">
      <VcVideo
        :source="tutorial.embedUrl"
        :label="tutorial.title"
      />
    </VcCol>
    <VcCol :size="1">
      <h3 class="tw-font-medium tw-mb-2">{{ tutorial.title }}</h3>
      <p class="tw-text-sm tw-text-gray-600">{{ tutorial.description }}</p>
      <VcHint>Duration: {{ tutorial.duration }}</VcHint>
    </VcCol>
  </VcRow>
</template>
```

## CSS Custom Properties

| Variable                 | Default               | Description             |
| ------------------------ | --------------------- | ----------------------- |
| `--video-icon-color`     | `var(--neutrals-400)` | Placeholder icon color  |
| `--video-placeholder-bg` | `var(--neutrals-100)` | Placeholder background  |
| `--video-border-radius`  | `6px`                 | Container corner radius |
| `--video-border-color`   | `var(--neutrals-200)` | Container border color  |

## Tips

- Always use the **embed** URL format, not the standard watch URL. For YouTube, use `https://www.youtube.com/embed/VIDEO_ID` instead of `https://www.youtube.com/watch?v=VIDEO_ID`.
- The iframe has `loading="lazy"`, so videos below the fold are not loaded until the user scrolls to them. This keeps initial page load fast.
- The `sandbox` attribute is resolved from the `source`: `allow-scripts allow-presentation` for any host, plus `allow-same-origin` when the source points at a known video host (YouTube, Vimeo). If your host needs more, append tokens via `additionalSandbox` — see the Security section below.
- The iframe sets a fixed `allow` permissions policy (`accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture`) plus `allowfullscreen`, so embedded players can autoplay, go fullscreen, and use picture-in-picture. These are not configurable per-instance.
- The iframe renders at a fixed height of 300px. To customize the height, override the iframe styles via a scoped CSS rule targeting `.vc-video__container iframe`.
- The placeholder has a height of 200px so the layout does not collapse when no source is provided.

## Accessibility

- The iframe uses the `title` attribute (set to `label` or "Video") for screen readers
- `sandbox` is resolved per source: `allow-scripts allow-presentation` always, plus `allow-same-origin` for known video hosts
- `loading="lazy"` defers iframe load until visible
- Placeholder state uses `role="img"` with `aria-label="No video source"`

## Security

The iframe `sandbox` is resolved from the `source`, not fixed:

| Source                                                                                          | Resolved sandbox                                     |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Known video host (youtube.com, youtube-nocookie.com, youtu.be, vimeo.com, and their subdomains) | `allow-scripts allow-presentation allow-same-origin` |
| Any other host                                                                                  | `allow-scripts allow-presentation`                   |
| Relative or malformed URL                                                                       | `allow-scripts allow-presentation`                   |

Mainstream players need their own origin to start up: without `allow-same-origin` the framed document gets an opaque origin and YouTube's bootstrap throws on storage access before it can build the player. Restricting that token to an allowlist keeps playback working without loosening the sandbox for arbitrary sources.

To add capabilities a specific host needs, pass them through `additionalSandbox`:

```vue
<!-- Some embeds need popups for auth flows -->
<VcVideo source="https://example.com/embed" additional-sandbox="allow-popups" />
```

!!! danger "Never add `allow-same-origin` for a source on your own origin"
`allow-same-origin` combined with `allow-scripts` is only dangerous when the framed document shares the host page's origin — then its script can reach `parent.document` and remove the sandbox attribute. For a cross-origin video host the Same-Origin Policy already blocks that, which is why the allowlist above is safe. `VcVideo` renders whatever `source` you pass, so never add the token via `additionalSandbox` for user-supplied URLs or for assets served from the app's own origin.

!!! warning "Always use embed URLs, not watch URLs"
YouTube watch URLs (`youtube.com/watch?v=...`) will be blocked by the browser's frame policy. Always convert to the embed format (`youtube.com/embed/VIDEO_ID`). Vimeo similarly requires `player.vimeo.com/video/VIDEO_ID`.

## Related Components

- [VcLabel](../vc-label/) -- used internally for the label with tooltip
- [VcIcon](../vc-icon/) -- renders the placeholder film icon
- [VcRow](../vc-row/) / [VcCol](../vc-col/) -- layout primitives for placing video alongside other content

<!-- internal:start -->

## Architecture notes

- VcVideo lives in `framework/ui/components/atoms/vc-video/`.
- The component is a thin wrapper around a native `<iframe>` — no custom video controls are implemented.
- The `sandbox` attribute is computed from a base (`allow-scripts allow-presentation`), plus `allow-same-origin` when `isTrustedEmbedHost(source)` matches `TRUSTED_EMBED_HOSTS`, plus any `additionalSandbox` tokens, deduped. Host matching is exact or on a dot boundary, so `evil-youtube.com` does not match; an unparseable URL falls back to the strict base — see the Security section.
- The label is rendered via `VcLabel` (internal atom) with the `tooltip` prop forwarded as the VcLabel tooltip slot content.
- Placeholder state (`source` is falsy) swaps the iframe for a `<div>` with `role="img"` containing a `VcIcon` with `lucide-film`.

<!-- internal:end -->
