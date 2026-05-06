---
title: VcImage
category: components
group: media
---

# VcImage

An image display component with predefined sizes, aspect ratio control, and a placeholder for missing sources. Renders images as CSS backgrounds with automatic HTTPS enforcement.

::storybook id="data-display-vcimage--default"

## When to Use

- Display product thumbnails, profile avatars, or media previews
- Show images with consistent aspect ratios across a layout
- Provide clickable image tiles (e.g., gallery lightbox triggers)
- When NOT to use: for icons or symbolic graphics, use [VcIcon](../vc-icon/); for full-page hero images, use a standard `<img>` tag

## Basic Usage

```vue
<VcImage src="https://example.com/product.jpg" size="l" />
```

## Key Props

| Prop            | Type                                                            | Default          | Description                                                                                                                                        |
| --------------- | --------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src`           | `string`                                                        | —                | Image URL; shows a placeholder icon when empty                                                                                                     |
| `size`          | `"auto" \| "xxs" \| "xs" \| "s" \| "m" \| "l" \| "xl" \| "xxl"` | `"auto"`         | Predefined width                                                                                                                                   |
| `aspect`        | `"1x1" \| "16x9" \| "4x3" \| "3x2"`                             | `"1x1"`          | Aspect ratio of the container                                                                                                                      |
| `background`    | `"cover" \| "contain" \| "auto"`                                | `"cover"`        | CSS background-size mode                                                                                                                           |
| `rounded`       | `boolean`                                                       | `false`          | Applies fully rounded corners (circular on 1x1)                                                                                                    |
| `bordered`      | `boolean`                                                       | `false`          | Adds a subtle border                                                                                                                               |
| `clickable`     | `boolean`                                                       | `false`          | Makes the image interactive with cursor and click event                                                                                            |
| `emptyIcon`     | `string`                                                        | `"lucide-image"` | Icon shown when `src` is empty                                                                                                                     |
| `alt`           | `string`                                                        | —                | Accessible alt text                                                                                                                                |
| `thumbnailSize` | `ThumbnailSize`                                                 | —                | Load a thumbnail variant instead of full-size image. Values: `"sm"`, `"md"`, `"lg"`, `"64x64"`, `"128x128"`, `"168x168"`, `"216x216"`, `"348x348"` |

::storybook id="data-display-vcimage--size-variants" height="300"

## Size Reference

| Size   | Width          |
| ------ | -------------- |
| `xxs`  | 24px           |
| `xs`   | 32px           |
| `s`    | 48px           |
| `m`    | 64px           |
| `l`    | 96px           |
| `xl`   | 128px          |
| `xxl`  | 145px          |
| `auto` | 100% of parent |

## Common Patterns

### Product Thumbnail in a List

```vue
<VcImage :src="product.primaryImage" size="s" aspect="1x1" bordered :alt="product.name" />
```

### Profile Avatar

```vue
<VcImage :src="user.avatarUrl" size="m" rounded :alt="user.displayName" />
```

### Widescreen Banner

```vue
<VcImage :src="category.bannerUrl" aspect="16x9" background="cover" alt="Category banner" />
```

### Clickable Gallery Image

```vue
<VcImage :src="image.url" size="l" bordered clickable :alt="image.caption" @click="openLightbox(image)" />
```

### Empty State Placeholder

```vue
<VcImage size="xl" empty-icon="lucide-package" alt="" />
```

## Accessibility

- When `src` is present and no `clickable`, the container has `role="img"` with `aria-label` from `alt`
- Clickable images receive `role="button"`, `tabindex="0"`, and keyboard support (Enter/Space)
- Empty placeholder icon is marked `aria-hidden="true"`
- Focus ring appears on `:focus-visible` for clickable images
- HTTP URLs are automatically upgraded to HTTPS when the page is served over HTTPS

!!! tip "Use thumbnailSize for faster load times"
When displaying images in lists or grids, pass a `thumbnailSize` (e.g. `"128x128"`) to request a pre-scaled variant from the platform CDN instead of loading the full-resolution original. This significantly reduces bandwidth and speeds up initial render.

## Related Components

- [VcIcon](../vc-icon/) — for symbolic icons rather than photographic content
- [VcImageTile](../../molecules/vc-image-tile/) — combines VcImage with overlay actions for gallery use

<!-- internal:start -->

## Architecture notes

- VcImage lives in `framework/ui/components/atoms/vc-image/`.
- Images are rendered as CSS `background-image` on a `<div>` rather than an `<img>` tag; this enables `background-size: cover/contain` and preserves aspect-ratio without JS.
- HTTPS enforcement: the `src` watcher rewrites `http://` to `https://` when `window.location.protocol === 'https:'`.
- `thumbnailSize` appends a query parameter to the URL compatible with Virto Commerce image proxy: `?size=128x128`. This is a platform-specific convention.
- Aspect ratios are implemented as Tailwind aspect-ratio utility classes (`tw-aspect-square`, `tw-aspect-video`, etc.).
- Clickable mode adds `role="button"` and forwards keyboard Enter/Space to the click handler, consistent with other atom-level interactive components.

<!-- internal:end -->
