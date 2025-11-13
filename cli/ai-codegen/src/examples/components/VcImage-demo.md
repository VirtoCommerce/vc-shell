# VcImage Demo

Real-world image examples for product images, avatars, thumbnails, and placeholders.

## Product Images with Sizes

```vue
<template>
  <div class="tw-space-y-6">
    <h3 class="tw-font-bold">{{ $t("PRODUCTS.IMAGES") }}</h3>

    <!-- Different sizes -->
    <div class="tw-flex tw-flex-wrap tw-items-end tw-gap-4">
      <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
        <VcImage
          :src="productImage"
          size="xs"
          bordered
          aspect="1x1"
        />
        <span class="tw-text-xs">XS (32px)</span>
      </div>

      <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
        <VcImage
          :src="productImage"
          size="s"
          bordered
          aspect="1x1"
        />
        <span class="tw-text-xs">S (64px)</span>
      </div>

      <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
        <VcImage
          :src="productImage"
          size="m"
          bordered
          aspect="1x1"
        />
        <span class="tw-text-xs">M (128px)</span>
      </div>

      <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
        <VcImage
          :src="productImage"
          size="l"
          bordered
          aspect="1x1"
        />
        <span class="tw-text-xs">L (192px)</span>
      </div>

      <div class="tw-flex tw-flex-col tw-items-center tw-gap-2">
        <VcImage
          :src="productImage"
          size="xl"
          bordered
          aspect="1x1"
        />
        <span class="tw-text-xs">XL (256px)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const productImage = "https://placehold.co/512x512/2196F3/FFFFFF/png?text=Product";
</script>
```

## Image Aspect Ratios

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("PRODUCTS.ASPECT_RATIOS") }}</h3>

    <div class="tw-grid tw-grid-cols-3 tw-gap-4">
      <!-- Square 1:1 -->
      <div>
        <VcImage
          :src="landscapeImage"
          size="l"
          aspect="1x1"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">1:1 (Square)</span>
      </div>

      <!-- Portrait 3:4 -->
      <div>
        <VcImage
          :src="landscapeImage"
          size="l"
          aspect="3x4"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">3:4 (Portrait)</span>
      </div>

      <!-- Landscape 16:9 -->
      <div>
        <VcImage
          :src="landscapeImage"
          size="l"
          aspect="16x9"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">16:9 (Landscape)</span>
      </div>

      <!-- Wide 21:9 -->
      <div>
        <VcImage
          :src="landscapeImage"
          size="l"
          aspect="21x9"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">21:9 (Wide)</span>
      </div>

      <!-- Thumbnail 4:3 -->
      <div>
        <VcImage
          :src="landscapeImage"
          size="l"
          aspect="4x3"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">4:3 (Thumbnail)</span>
      </div>

      <!-- Auto aspect -->
      <div>
        <VcImage
          :src="landscapeImage"
          size="l"
          aspect="auto"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">Auto</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const landscapeImage = "https://placehold.co/1920x1080/4CAF50/FFFFFF/png?text=Landscape";
</script>
```

## Images in Table

```vue
<template>
  <VcTable
    :items="products"
    :columns="columns"
    @item-click="onItemClick"
  >
    <!-- Product image column -->
    <template #item_image="{ item }">
      <VcImage
        :src="item.image"
        size="s"
        aspect="1x1"
        bordered
      />
    </template>

    <!-- Product name with thumbnail -->
    <template #item_name="{ item }">
      <div class="tw-flex tw-items-center tw-gap-3">
        <VcImage
          :src="item.image"
          size="xs"
          aspect="1x1"
          bordered
        />
        <div>
          <div class="tw-font-medium">{{ item.name }}</div>
          <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
            {{ item.sku }}
          </div>
        </div>
      </div>
    </template>

    <!-- Category with icon -->
    <template #item_category="{ item }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcImage
          :src="item.categoryIcon"
          size="xs"
          aspect="1x1"
        />
        <span>{{ item.category }}</span>
      </div>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcImage } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const products = ref([
  {
    id: "1",
    name: "Wireless Headphones",
    sku: "WH-1000",
    image: "https://placehold.co/128x128/FF5722/FFFFFF/png?text=HP",
    category: "Electronics",
    categoryIcon: "https://placehold.co/32x32/9C27B0/FFFFFF/png?text=E",
  },
  {
    id: "2",
    name: "Leather Backpack",
    sku: "LB-2050",
    image: "https://placehold.co/128x128/4CAF50/FFFFFF/png?text=BP",
    category: "Accessories",
    categoryIcon: "https://placehold.co/32x32/FF9800/FFFFFF/png?text=A",
  },
  {
    id: "3",
    name: "Smart Watch",
    sku: "SW-3020",
    image: "https://placehold.co/128x128/2196F3/FFFFFF/png?text=SW",
    category: "Electronics",
    categoryIcon: "https://placehold.co/32x32/9C27B0/FFFFFF/png?text=E",
  },
]);

const columns = computed(() => [
  { id: "name", title: t("PRODUCTS.NAME"), sortable: true },
  { id: "category", title: t("PRODUCTS.CATEGORY") },
  { id: "image", title: t("PRODUCTS.IMAGE"), align: "center" },
]);

function onItemClick(item: any) {
  console.log("Product clicked:", item.id);
}
</script>
```

## Placeholder and Error States

```vue
<template>
  <div class="tw-space-y-6">
    <h3 class="tw-font-bold">{{ $t("IMAGES.STATES") }}</h3>

    <div class="tw-grid tw-grid-cols-3 tw-gap-4">
      <!-- Valid image -->
      <div>
        <VcImage
          :src="validImage"
          size="l"
          aspect="1x1"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">
          {{ $t("IMAGES.VALID") }}
        </span>
      </div>

      <!-- Missing image (placeholder) -->
      <div>
        <VcImage
          src=""
          size="l"
          aspect="1x1"
          bordered
          background="var(--neutrals-100)"
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">
          {{ $t("IMAGES.PLACEHOLDER") }}
        </span>
      </div>

      <!-- Error image -->
      <div>
        <VcImage
          src="https://invalid-url.com/image.jpg"
          size="l"
          aspect="1x1"
          bordered
        />
        <span class="tw-text-xs tw-mt-2 tw-block tw-text-center">
          {{ $t("IMAGES.ERROR") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcImage } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const validImage = "https://placehold.co/256x256/2196F3/FFFFFF/png?text=OK";
</script>
```

## Avatar Images

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("USER.AVATARS") }}</h3>

    <!-- User profile -->
    <div class="tw-flex tw-items-center tw-gap-4">
      <VcImage
        :src="userAvatar"
        size="l"
        aspect="1x1"
        bordered
        rounded
      />
      <div>
        <div class="tw-font-bold">{{ userName }}</div>
        <div class="tw-text-sm tw-text-[var(--neutrals-500)]">{{ userEmail }}</div>
      </div>
    </div>

    <!-- Team members list -->
    <div class="tw-space-y-3">
      <h4 class="tw-font-medium">{{ $t("TEAM.MEMBERS") }}</h4>
      <div
        v-for="member in teamMembers"
        :key="member.id"
        class="tw-flex tw-items-center tw-gap-3"
      >
        <VcImage
          :src="member.avatar"
          size="m"
          aspect="1x1"
          bordered
          rounded
        />
        <div class="tw-flex-1">
          <div class="tw-text-sm tw-font-medium">{{ member.name }}</div>
          <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
            {{ member.role }}
          </div>
        </div>
        <VcBadge
          v-if="member.online"
          is-dot
          variant="success"
        />
      </div>
    </div>

    <!-- Avatar stack -->
    <div class="tw-flex tw-items-center">
      <div
        v-for="(avatar, index) in avatarStack"
        :key="index"
        class="tw--ml-3 first:tw-ml-0"
      >
        <VcImage
          :src="avatar"
          size="m"
          aspect="1x1"
          bordered
          rounded
        />
      </div>
      <div class="tw-ml-2 tw-text-sm tw-text-[var(--neutrals-500)]">
        +{{ totalMembers - avatarStack.length }} {{ $t("TEAM.MORE") }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage, VcBadge } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const userAvatar = "https://placehold.co/192x192/9C27B0/FFFFFF/png?text=JD";
const userName = "John Doe";
const userEmail = "john@example.com";

const teamMembers = ref([
  {
    id: "1",
    name: "Alice Smith",
    role: "Admin",
    avatar: "https://placehold.co/128x128/F44336/FFFFFF/png?text=AS",
    online: true,
  },
  {
    id: "2",
    name: "Bob Johnson",
    role: "Manager",
    avatar: "https://placehold.co/128x128/4CAF50/FFFFFF/png?text=BJ",
    online: false,
  },
  {
    id: "3",
    name: "Carol White",
    role: "Support",
    avatar: "https://placehold.co/128x128/2196F3/FFFFFF/png?text=CW",
    online: true,
  },
]);

const avatarStack = [
  "https://placehold.co/128x128/FF5722/FFFFFF/png?text=U1",
  "https://placehold.co/128x128/4CAF50/FFFFFF/png?text=U2",
  "https://placehold.co/128x128/2196F3/FFFFFF/png?text=U3",
  "https://placehold.co/128x128/9C27B0/FFFFFF/png?text=U4",
];

const totalMembers = 12;
</script>
```

## Clickable Images with Gallery

```vue
<template>
  <div class="tw-space-y-4">
    <h3 class="tw-font-bold">{{ $t("PRODUCTS.GALLERY") }}</h3>

    <!-- Main image -->
    <VcImage
      :src="selectedImage"
      size="xl"
      aspect="16x9"
      bordered
      class="tw-cursor-pointer"
      @click="openLightbox"
    />

    <!-- Thumbnail strip -->
    <div class="tw-flex tw-gap-2">
      <VcImage
        v-for="(image, index) in galleryImages"
        :key="index"
        :src="image"
        size="s"
        aspect="1x1"
        bordered
        :class="[
          'tw-cursor-pointer tw-transition-opacity',
          selectedImage === image ? 'tw-opacity-100 tw-ring-2 tw-ring-[var(--primary-500)]' : 'tw-opacity-60 hover:tw-opacity-100'
        ]"
        @click="selectImage(image)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcImage } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const galleryImages = [
  "https://placehold.co/1920x1080/FF5722/FFFFFF/png?text=Image+1",
  "https://placehold.co/1920x1080/4CAF50/FFFFFF/png?text=Image+2",
  "https://placehold.co/1920x1080/2196F3/FFFFFF/png?text=Image+3",
  "https://placehold.co/1920x1080/9C27B0/FFFFFF/png?text=Image+4",
];

const selectedImage = ref(galleryImages[0]);

function selectImage(image: string) {
  selectedImage.value = image;
}

function openLightbox() {
  console.log("Open lightbox for:", selectedImage.value);
  // Open full-screen lightbox
}
</script>
```

## Key Points

### Sizes
- `xs` - 32px (avatars in lists, category icons)
- `s` - 64px (table thumbnails, small avatars)
- `m` - 128px (profile avatars, card images)
- `l` - 192px (product details, larger previews)
- `xl` - 256px (hero images, main product view)

### Aspect Ratios
- `1x1` - Square (products, avatars)
- `4x3` - Standard thumbnail
- `16x9` - Landscape (banners, hero images)
- `3x4` - Portrait
- `21x9` - Ultra-wide
- `auto` - Original aspect ratio

### Props
- `src` - Image URL
- `size` - xs, s, m, l, xl
- `aspect` - Aspect ratio
- `bordered` - Add border
- `rounded` - Round corners (for avatars)
- `background` - Background color for placeholder

### Common Use Cases

1. **Product Images**: Use bordered with 1:1 aspect
```vue
<VcImage :src="product.image" size="l" aspect="1x1" bordered />
```

2. **User Avatars**: Use rounded with bordered
```vue
<VcImage :src="user.avatar" size="m" aspect="1x1" bordered rounded />
```

3. **Table Thumbnails**: Small size with square aspect
```vue
<template #item_image="{ item }">
  <VcImage :src="item.image" size="xs" aspect="1x1" bordered />
</template>
```

4. **Gallery Images**: Clickable with selection state
```vue
<VcImage
  :src="image"
  :class="selected ? 'tw-ring-2' : 'tw-opacity-60'"
  @click="selectImage"
/>
```

### Best Practices

- Always provide `size` prop for consistent sizing
- Use `aspect` to enforce consistent ratios
- Add `bordered` for definition against backgrounds
- Use `rounded` specifically for avatars
- Handle missing images with placeholders
- Optimize image URLs for the target size
- Use appropriate aspect ratios for context
- Make gallery thumbnails clickable for preview
- Stack avatars with negative margin for compact display
- Add loading states for slow networks

