# VcIcon Component

The `VcIcon` component is a versatile and flexible icon component that provides unified access to multiple icon libraries:

- Material Symbols
- Bootstrap Icons
- Lucide Icons
- Font Awesome (legacy support)
- Custom SVG Icons

## Features

- **Unified API** for all icon types
- **Consistent sizing** across different icon libraries
- **Automatic icon detection** based on prefix
- **Color variants** for status indicators
- **Customizable sizing** via props or CSS
- **Container support** for consistent spacing
- **SVG icon support** with customizable parameters

## Basic Usage

```vue
<template>
  <!-- Material Icon -->
  <VcIcon icon="material-home" />
  
  <!-- Bootstrap Icon -->
  <VcIcon icon="bi-house" />
  
  <!-- Lucide Icon -->
  <VcIcon icon="lucide-home" />
  
  <!-- Font Awesome Icon -->
  <VcIcon icon="fas fa-home" />
  
  <!-- Custom SVG Component -->
  <VcIcon :icon="HomeIcon" />
  
  <!-- External SVG Icon -->
  <VcIcon icon="svg:/assets/icons/home.svg" />
</template>

<script setup lang="ts">
import { HomeIcon } from 'lucide-vue-next';
import { VcIcon } from '@framework/ui/components/atoms/vc-icon';
</script>
```

## Icon Sizing

The component provides predefined sizes that are consistent across all icon types:

```vue
<template>
  <VcIcon icon="material-home" size="xs" /> <!-- 12px -->
  <VcIcon icon="material-home" size="s" />  <!-- 14px -->
  <VcIcon icon="material-home" size="m" />  <!-- 18px (default) -->
  <VcIcon icon="material-home" size="l" />  <!-- 20px -->
  <VcIcon icon="material-home" size="xl" /> <!-- 22px -->
  <VcIcon icon="material-home" size="xxl" /> <!-- 30px -->
  <VcIcon icon="material-home" size="xxxl" /> <!-- 64px -->
  
  <!-- Custom size (in pixels) -->
  <VcIcon icon="material-home" :customSize="42" />
</template>
```

## Color Variants

Use the `variant` prop to apply predefined colors for status indicators:

```vue
<template>
  <VcIcon icon="material-check_circle" variant="success" /> <!-- Success (green) -->
  <VcIcon icon="material-warning" variant="warning" /> <!-- Warning (yellow) -->
  <VcIcon icon="material-error" variant="danger" /> <!-- Danger (red) -->
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string \| Component` | `"fas fa-square-full"` | The icon to display. Can be a string identifier or a component instance |
| `size` | `"xs" \| "s" \| "m" \| "l" \| "xl" \| "xxl" \| "xxxl"` | `"m"` | Predefined size of the icon |
| `variant` | `"warning" \| "danger" \| "success"` | `undefined` | Color variant for status indication |
| `useContainer` | `boolean` | `true` | Whether to wrap the icon in a container for consistent spacing |
| `customSize` | `number` | `undefined` | Custom size in pixels (overrides `size` prop) |
| `basePath` | `string` | `"/assets/icons"` | Base path for SVG icons (only for SVG icons) |

## Size Normalization

The component automatically normalizes icon sizes across different libraries, ensuring they appear visually consistent when using the same size prop.

This normalization is achieved through scaling factors for each icon library:

- **Font Awesome** (base reference): 1.0
- **Material Icons**: 1.3
- **Bootstrap Icons**: 0.95
- **Lucide Icons**: 1

These scaling factors provide a consistent experience regardless of the icon library used.

## Icon Detection

The component automatically detects the icon type based on the icon name:

- Strings starting with `material-` → Material Symbols
- Strings starting with `bi-` → Bootstrap Icons
- Strings starting with `lucide-` → Lucide Icons
- Strings starting with `fa-` or containing `fa-` → Font Awesome
- Strings starting with `svg:` → SVG files
- Component instances → Custom components

## Styling Icons with CSS

The `VcIcon` component supports inheriting size from CSS styles. This allows you to control the icon size through CSS styles applied to the parent element or directly to the icon component.

### Examples of CSS Styling

```vue
<template>
  <!-- Setting size through parent element -->
  <div class="custom-icon-parent">
    <VcIcon icon="fas fa-star" />
  </div>

  <!-- Inline styles -->
  <div style="font-size: 32px;">
    <VcIcon icon="material-home" />
  </div>

  <!-- Direct styling -->
  <VcIcon 
    icon="bi-heart" 
    class="custom-icon"
  />

  <!-- Styling with hover effects -->
  <VcIcon 
    icon="lucide-settings" 
    class="hover-icon"
  />
</template>

<style>
.custom-icon-parent {
  font-size: 24px; /* Icon will inherit this size */
}

.custom-icon {
  font-size: 40px;
  color: #f03e3e;
}

.hover-icon {
  font-size: 24px;
  transition: all 0.3s ease;
}

.hover-icon:hover {
  font-size: 32px;
  color: #4dabf7;
}
</style>
```

### Size Priority

The icon size is determined in the following order of priority:

1. `customSize` prop (highest priority)
2. External CSS styles (font-size applied to the icon)
3. Preset size via the `size` prop (lowest priority)

This allows flexible configuration of icon sizes in various usage contexts.

## Library-Specific Features

### Material Symbols

Material Symbols support additional customization properties:

```vue
<template>
  <!-- Different icon types -->
  <VcIcon 
    icon="material-settings" 
    material-icon-type="outlined" 
  />
  <VcIcon 
    icon="material-settings" 
    material-icon-type="rounded" 
  />
  <VcIcon 
    icon="material-settings" 
    material-icon-type="sharp" 
  />
  
  <!-- Fill variations -->
  <VcIcon 
    icon="material-favorite" 
    :material-icon-fill="0" 
  />
  <VcIcon 
    icon="material-favorite" 
    :material-icon-fill="0.5" 
  />
  <VcIcon 
    icon="material-favorite" 
    :material-icon-fill="1" 
  />
  
  <!-- Weight variations -->
  <VcIcon 
    icon="material-favorite" 
    :material-icon-weight="100" 
  />
  <VcIcon 
    icon="material-favorite" 
    :material-icon-weight="400" 
  />
  <VcIcon 
    icon="material-favorite" 
    :material-icon-weight="700" 
  />
</template>
```

### Using SVG Icons

You can use SVG icons with the `svg:` prefix:

```vue
<template>
  <!-- Using path relative to basePath -->
  <VcIcon icon="svg:menu.svg" />
  
  <!-- Using absolute path -->
  <VcIcon icon="svg:/assets/icons/cart.svg" />
  
  <!-- With custom base path -->
  <VcIcon icon="svg:star.svg" basePath="/custom/icons/path" />
  
  <!-- With stroke width -->
  <VcIcon icon="svg:circle.svg" :stroke-width="1.5" />
</template>
```

By default, SVG icons are looked up in `/assets/icons`, but this path can be changed using the `basePath` parameter.

## Container Support

The component can wrap icons in a container for consistent spacing:

```vue
<template>
  <!-- With container (default) -->
  <VcIcon icon="material-home" />
  
  <!-- Without container -->
  <VcIcon icon="material-home" :use-container="false" />
</template>
```


## Best Practices

1. Use the prefixed syntax (`material-`, `bi-`, `lucide-`, etc.) for all icons
2. Use the same `size` prop across different icon types for visual consistency
3. Use the container feature for consistent spacing in complex layouts
4. Leverage CSS styling for dynamic effects like hover states
