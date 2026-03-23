# VcVideo

An embedded video player that renders an iframe for external video sources (YouTube, Vimeo, etc.) with an optional label and tooltip. When no source URL is provided, the component displays a centered film icon placeholder instead of a blank space, giving users a clear visual cue that a video can be attached.

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

### Conditional Video in a Product Blade

```vue
<template>
  <VcBlade title="Product Details">
    <VcInput label="Video URL" v-model="product.videoUrl" placeholder="https://youtube.com/embed/..." />
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

| Variable | Default | Description |
|---|---|---|
| `--video-icon-color` | `var(--neutrals-400)` | Placeholder icon color |
| `--video-placeholder-bg` | `var(--neutrals-100)` | Placeholder background |
| `--video-border-radius` | `6px` | Container corner radius |
| `--video-border-color` | `var(--neutrals-200)` | Container border color |

## Tips

- Always use the **embed** URL format, not the standard watch URL. For YouTube, use `https://www.youtube.com/embed/VIDEO_ID` instead of `https://www.youtube.com/watch?v=VIDEO_ID`.
- The iframe has `loading="lazy"`, so videos below the fold are not loaded until the user scrolls to them. This keeps initial page load fast.
- The `sandbox` attribute restricts iframe capabilities to `allow-scripts allow-same-origin allow-presentation allow-popups` for security. If your video host requires additional permissions, you may need a custom wrapper.
- The iframe renders at a fixed height of 300px. To customize the height, override the iframe styles via a scoped CSS rule targeting `.vc-video__container iframe`.
- The placeholder has a height of 200px so the layout does not collapse when no source is provided.

## Accessibility

- The iframe uses the `title` attribute (set to `label` or "Video") for screen readers
- `sandbox` attribute restricts iframe capabilities to `allow-scripts allow-same-origin allow-presentation allow-popups`
- `loading="lazy"` defers iframe load until visible
- Placeholder state uses `role="img"` with `aria-label="No video source"`

## Related Components

- [VcLabel](../vc-label/) -- used internally for the label with tooltip
- [VcIcon](../vc-icon/) -- renders the placeholder film icon
- [VcRow](../vc-row/) / [VcCol](../vc-col/) -- layout primitives for placing video alongside other content
