# VcVideo

An embedded video player that renders an iframe for external video sources (YouTube, Vimeo, etc.) with an optional label and tooltip. Shows a placeholder icon when no source is provided.

## When to Use

- Embed product or tutorial videos in blade detail views
- Display instructional content alongside form fields
- When NOT to use: native HTML5 video playback from local files (use a plain `<video>` element)

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

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `source` | `string` | -- | Embed URL for the video (e.g., YouTube embed link) |
| `label` | `string` | -- | Label text displayed above the video |
| `tooltip` | `string` | -- | Tooltip text shown on the label's info icon |

## Common Patterns

### Video with Label and Tooltip

```vue
<VcVideo
  source="https://www.youtube.com/embed/dQw4w9WgXcQ"
  label="Setup Guide"
  tooltip="This video walks through the initial configuration steps"
/>
```

### Placeholder When Source Is Missing

When `source` is not provided, VcVideo renders a centered film icon placeholder instead of a blank space.

```vue
<VcVideo label="Video Not Available" />
```

## CSS Custom Properties

| Variable | Default | Description |
|---|---|---|
| `--video-icon-color` | `var(--neutrals-400)` | Placeholder icon color |
| `--video-placeholder-bg` | `var(--neutrals-100)` | Placeholder background |
| `--video-border-radius` | `6px` | Container corner radius |
| `--video-border-color` | `var(--neutrals-200)` | Container border color |

## Accessibility

- The iframe uses the `title` attribute (set to `label` or "Video") for screen readers
- `sandbox` attribute restricts iframe capabilities to `allow-scripts allow-same-origin allow-presentation allow-popups`
- `loading="lazy"` defers iframe load until visible
- Placeholder state uses `role="img"` with `aria-label="No video source"`

## Related Components

- [VcLabel](../vc-label/) -- used internally for the label with tooltip
- [VcIcon](../vc-icon/) -- renders the placeholder film icon
