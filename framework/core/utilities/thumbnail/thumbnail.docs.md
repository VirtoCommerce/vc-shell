# Thumbnail URL Utility

Transforms full-size image URLs into thumbnail variants by appending size suffixes before the file extension. VirtoCommerce backend generates thumbnails automatically with these suffixes.

## When to Use

- Use in any component that displays images at a known size smaller than the original
- Reduces bandwidth and improves page load time significantly
- Especially important for image lists (tables, galleries, cards)

## Available Sizes

### Named Presets

| Preset | Use Case                                    |
| ------ | ------------------------------------------- |
| `sm`   | Small icons, table cells, avatar thumbnails |
| `md`   | Medium previews, cards                      |
| `lg`   | Large previews, hero images                 |

### Pixel Sizes

| Size      | Pixels | Use Case                     |
| --------- | ------ | ---------------------------- |
| `64x64`   | 64px   | Table cells, tiny thumbnails |
| `128x128` | 128px  | Small tiles, list items      |
| `168x168` | 168px  | Medium tiles                 |
| `216x216` | 216px  | Gallery tiles (md)           |
| `348x348` | 348px  | Large gallery tiles          |

## API

### `getThumbnailUrl(url, size?)`

Transforms an image URL by inserting a size suffix before the file extension.

```ts
import { getThumbnailUrl } from "@core/utilities/thumbnail";

getThumbnailUrl("https://cdn.example.com/photo.jpg", "sm");
// → "https://cdn.example.com/photo_sm.jpg"

getThumbnailUrl("https://cdn.example.com/photo.jpg", "128x128");
// → "https://cdn.example.com/photo_128x128.jpg"

getThumbnailUrl("https://cdn.example.com/photo.jpg");
// → "https://cdn.example.com/photo.jpg" (unchanged)

getThumbnailUrl(undefined, "sm");
// → undefined
```

**Parameters:**

- `url` — Original image URL (string or undefined)
- `size` — Thumbnail size preset or pixel dimensions (optional)

**Returns:** Transformed URL, or original URL if size not specified

### `getBestThumbnailSize(displaySize)`

Maps a CSS pixel display size to the best-fit thumbnail preset. Picks the smallest thumbnail that is >= the display size.

```ts
import { getBestThumbnailSize } from "@core/utilities/thumbnail";

getBestThumbnailSize(48); // → "64x64"
getBestThumbnailSize(96); // → "128x128"
getBestThumbnailSize(200); // → "216x216"
getBestThumbnailSize(500); // → "lg"
```

## Usage in Components

### VcImage

```vue
<VcImage :src="product.imgSrc" thumbnail-size="sm" size="s" />
```

### VcGallery

Gallery auto-maps `size` prop to thumbnail size. Override with `thumbnailSize`:

```vue
<!-- Auto: sm→128x128, md→216x216, lg→348x348 -->
<VcGallery :images="images" size="md" />

<!-- Explicit override -->
<VcGallery :images="images" thumbnail-size="128x128" />
```

Gallery preview uses `64x64` for the thumbnail strip and full-size for the main image automatically.

### VcDataTable (CellImage)

Table image cells use `sm` thumbnail by default — no action needed.

## Types

```ts
type ThumbnailPreset = "sm" | "md" | "lg";
type ThumbnailPixelSize = "64x64" | "128x128" | "168x168" | "216x216" | "348x348";
type ThumbnailSize = ThumbnailPreset | ThumbnailPixelSize;
```

## Notes

- The utility only transforms the URL — the backend must have generated the thumbnail for the URL to resolve
- If a thumbnail doesn't exist on the server, the browser will show a broken image. Ensure your asset pipeline generates all required sizes.
- The suffix is inserted before the file extension: `photo.jpg` → `photo_sm.jpg`
- URLs without a file extension are returned unchanged
- Already-suffixed URLs are not double-transformed
