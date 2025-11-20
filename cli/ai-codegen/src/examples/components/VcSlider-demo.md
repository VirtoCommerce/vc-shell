---
id: component-VcSlider-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: [component]
title: "VcSlider Demo"
description: "VcSlider Demo component example"
---

# VcSlider Demo

Real-world slider/carousel examples for image galleries, product showcases, and content carousels.

## Basic Image Slider

```vue
<template>
  <div class="tw-space-y-4">
    <VcLabel>
      {{ $t("PRODUCTS.IMAGES") }}
    </VcLabel>

    <VcSlider
      :items="productImages"
      :autoplay="false"
    >
      <template #item="{ item }">
        <VcImage
          :src="item.url"
          size="xl"
          aspect="16x9"
        />
      </template>
    </VcSlider>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcLabel, VcSlider, VcImage } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const productImages = ref([
  { id: "1", url: "https://placehold.co/1200x675/FF5722/FFFFFF/png?text=Image+1" },
  { id: "2", url: "https://placehold.co/1200x675/4CAF50/FFFFFF/png?text=Image+2" },
  { id: "3", url: "https://placehold.co/1200x675/2196F3/FFFFFF/png?text=Image+3" },
  { id: "4", url: "https://placehold.co/1200x675/9C27B0/FFFFFF/png?text=Image+4" },
]);
</script>
```

## Product Showcase Slider

```vue
<template>
  <div class="tw-space-y-4">
    <VcSlider
      :items="products"
      :autoplay="true"
      :interval="5000"
      :show-indicators="true"
      :show-arrows="true"
    >
      <template #item="{ item }">
        <div class="tw-relative">
          <VcImage
            :src="item.image"
            size="xl"
            aspect="16x9"
          />
          
          <!-- Product info overlay -->
          <div class="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-bg-gradient-to-t tw-from-black/80 tw-to-transparent tw-p-6 tw-text-white">
            <h3 class="tw-text-2xl tw-font-bold tw-mb-2">{{ item.name }}</h3>
            <p class="tw-text-sm tw-mb-3">{{ item.description }}</p>
            
            <div class="tw-flex tw-items-center tw-gap-4">
              <span class="tw-text-3xl tw-font-bold">${{ item.price }}</span>
              <VcButton variant="primary" @click="viewProduct(item)">
                {{ $t("COMMON.VIEW_DETAILS") }}
              </VcButton>
            </div>
          </div>
        </div>
      </template>
    </VcSlider>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider, VcImage, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
}

const products = ref<Product[]>([
  {
    id: "1",
    name: "Wireless Headphones",
    description: "Premium sound quality with active noise cancellation",
    image: "https://placehold.co/1200x675/FF5722/FFFFFF/png?text=Headphones",
    price: 199.99,
  },
  {
    id: "2",
    name: "Smart Watch",
    description: "Track your fitness and stay connected",
    image: "https://placehold.co/1200x675/2196F3/FFFFFF/png?text=Smart+Watch",
    price: 299.99,
  },
  {
    id: "3",
    name: "Laptop Pro",
    description: "Powerful performance for professionals",
    image: "https://placehold.co/1200x675/4CAF50/FFFFFF/png?text=Laptop",
    price: 1499.99,
  },
]);

function viewProduct(product: Product) {
  console.log("View product:", product.id);
}
</script>
```

## Testimonials Slider

```vue
<template>
  <VcCard :header="$t('TESTIMONIALS.TITLE')">
    <VcSlider
      :items="testimonials"
      :autoplay="true"
      :interval="7000"
      :show-indicators="true"
    >
      <template #item="{ item }">
        <div class="tw-text-center tw-py-8">
          <!-- Quote icon -->
          <VcIcon
            icon="material-format_quote"
            size="xxl"
            class="tw-text-[var(--primary-200)] tw-mb-4"
          />
          
          <!-- Review text -->
          <p class="tw-text-lg tw-text-[var(--neutrals-700)] tw-italic tw-mb-6 tw-max-w-2xl tw-mx-auto">
            "{{ item.quote }}"
          </p>

          <!-- Reviewer info -->
          <div class="tw-flex tw-flex-col tw-items-center tw-gap-3">
            <VcImage
              :src="item.avatar"
              size="l"
              aspect="1x1"
              bordered
              rounded
            />
            <div>
              <div class="tw-font-bold">{{ item.name }}</div>
              <div class="tw-text-sm tw-text-[var(--neutrals-500)]">
                {{ item.position }}, {{ item.company }}
              </div>
            </div>
            <VcRating
              :value="item.rating"
              :readonly="true"
              size="m"
            />
          </div>
        </div>
      </template>
    </VcSlider>
  </VcCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcSlider, VcIcon, VcImage, VcRating } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  position: string;
  company: string;
  avatar: string;
  rating: number;
}

const testimonials = ref<Testimonial[]>([
  {
    id: "1",
    quote: "This platform has transformed our business operations. Highly recommended!",
    name: "Sarah Johnson",
    position: "CEO",
    company: "TechCorp",
    avatar: "https://placehold.co/192x192/FF5722/FFFFFF/png?text=SJ",
    rating: 5,
  },
  {
    id: "2",
    quote: "Excellent customer support and powerful features. Couldn't be happier!",
    name: "Michael Chen",
    position: "CTO",
    company: "InnovateLabs",
    avatar: "https://placehold.co/192x192/2196F3/FFFFFF/png?text=MC",
    rating: 5,
  },
  {
    id: "3",
    quote: "The best investment we've made for our e-commerce business.",
    name: "Emily Rodriguez",
    position: "Founder",
    company: "ShopHub",
    avatar: "https://placehold.co/192x192/4CAF50/FFFFFF/png?text=ER",
    rating: 5,
  },
]);
</script>
```

## Banner Slider

```vue
<template>
  <VcSlider
    :items="banners"
    :autoplay="true"
    :interval="4000"
    :loop="true"
    :show-indicators="true"
    :show-arrows="true"
  >
    <template #item="{ item }">
      <div
        class="tw-relative tw-h-96 tw-flex tw-items-center tw-justify-center tw-text-white"
        :style="{ backgroundColor: item.bgColor }"
      >
        <!-- Banner content -->
        <div class="tw-max-w-4xl tw-text-center tw-px-6">
          <VcBadge
            v-if="item.badge"
            :content="item.badge"
            variant="success"
            size="m"
            class="tw-mb-4"
          />
          
          <h2 class="tw-text-5xl tw-font-bold tw-mb-4">{{ item.title }}</h2>
          <p class="tw-text-xl tw-mb-6">{{ item.subtitle }}</p>
          
          <div class="tw-flex tw-gap-4 tw-justify-center">
            <VcButton
              size="l"
              variant="primary"
              @click="handleAction(item.primaryAction)"
            >
              {{ item.primaryAction.text }}
            </VcButton>
            <VcButton
              v-if="item.secondaryAction"
              size="l"
              outlined
              @click="handleAction(item.secondaryAction)"
            >
              {{ item.secondaryAction.text }}
            </VcButton>
          </div>
        </div>

        <!-- Background image -->
        <div
          v-if="item.backgroundImage"
          class="tw-absolute tw-inset-0 tw-opacity-20"
          :style="{ backgroundImage: `url(${item.backgroundImage})`, backgroundSize: 'cover' }"
        />
      </div>
    </template>
  </VcSlider>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider, VcBadge, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface BannerAction {
  text: string;
  url: string;
}

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  bgColor: string;
  backgroundImage?: string;
  badge?: string;
  primaryAction: BannerAction;
  secondaryAction?: BannerAction;
}

const banners = ref<Banner[]>([
  {
    id: "1",
    title: "Summer Sale",
    subtitle: "Up to 50% off on selected items",
    bgColor: "#FF5722",
    badge: "LIMITED TIME",
    primaryAction: { text: "Shop Now", url: "/sale" },
    secondaryAction: { text: "View Catalog", url: "/catalog" },
  },
  {
    id: "2",
    title: "New Collection",
    subtitle: "Discover the latest trends",
    bgColor: "#2196F3",
    primaryAction: { text: "Explore", url: "/new" },
  },
  {
    id: "3",
    title: "Free Shipping",
    subtitle: "On orders over $50",
    bgColor: "#4CAF50",
    badge: "TODAY ONLY",
    primaryAction: { text: "Start Shopping", url: "/products" },
  },
]);

function handleAction(action: BannerAction) {
  console.log("Navigate to:", action.url);
}
</script>
```

## Thumbnail Navigation Slider

```vue
<template>
  <div class="tw-space-y-4">
    <!-- Main slider -->
    <VcSlider
      ref="mainSliderRef"
      :items="images"
      :show-indicators="false"
      :show-arrows="true"
      @change="onSlideChange"
    >
      <template #item="{ item }">
        <VcImage
          :src="item.url"
          size="xl"
          aspect="4x3"
        />
      </template>
    </VcSlider>

    <!-- Thumbnail navigation -->
    <div class="tw-flex tw-gap-2 tw-overflow-x-auto">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="tw-cursor-pointer tw-transition"
        :class="[
          currentIndex === index
            ? 'tw-ring-2 tw-ring-[var(--primary-500)]'
            : 'tw-opacity-60 hover:tw-opacity-100'
        ]"
        @click="goToSlide(index)"
      >
        <VcImage
          :src="image.url"
          size="m"
          aspect="4x3"
          bordered
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcSlider, VcImage } from "@vc-shell/framework";

const mainSliderRef = ref();
const currentIndex = ref(0);

const images = ref([
  { id: "1", url: "https://placehold.co/800x600/FF5722/FFFFFF/png?text=Image+1" },
  { id: "2", url: "https://placehold.co/800x600/4CAF50/FFFFFF/png?text=Image+2" },
  { id: "3", url: "https://placehold.co/800x600/2196F3/FFFFFF/png?text=Image+3" },
  { id: "4", url: "https://placehold.co/800x600/9C27B0/FFFFFF/png?text=Image+4" },
  { id: "5", url: "https://placehold.co/800x600/FF9800/FFFFFF/png?text=Image+5" },
]);

function onSlideChange(index: number) {
  currentIndex.value = index;
}

function goToSlide(index: number) {
  mainSliderRef.value?.goTo(index);
}
</script>
```

## Multi-Item Slider

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-justify-between tw-items-center">
      <h3 class="tw-font-bold">{{ $t("PRODUCTS.RELATED") }}</h3>
      
      <div class="tw-flex tw-gap-2">
        <VcButton
          size="s"
          icon="material-arrow_back"
          @click="previousSlide"
        />
        <VcButton
          size="s"
          icon="material-arrow_forward"
          @click="nextSlide"
        />
      </div>
    </div>

    <VcSlider
      ref="sliderRef"
      :items="relatedProducts"
      :items-per-view="3"
      :spacing="16"
      :show-indicators="false"
      :show-arrows="false"
    >
      <template #item="{ item }">
        <VcCard class="tw-h-full">
          <VcImage
            :src="item.image"
            size="l"
            aspect="1x1"
            class="tw-mb-3"
          />
          
          <h4 class="tw-font-medium tw-truncate tw-mb-2">{{ item.name }}</h4>
          
          <div class="tw-flex tw-items-center tw-gap-2 tw-mb-2">
            <VcRating :value="item.rating" :readonly="true" size="xs" />
            <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
              ({{ item.reviews }})
            </span>
          </div>

          <div class="tw-flex tw-items-center tw-justify-between">
            <span class="tw-font-bold tw-text-[var(--primary-500)]">
              ${{ item.price }}
            </span>
            <VcButton size="s" variant="primary">
              {{ $t("COMMON.VIEW") }}
            </VcButton>
          </div>
        </VcCard>
      </template>
    </VcSlider>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcSlider,
  VcCard,
  VcImage,
  VcRating,
  VcButton,
} from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const sliderRef = ref();

const relatedProducts = ref([
  {
    id: "1",
    name: "Product A",
    image: "https://placehold.co/256x256/FF5722/FFFFFF/png?text=A",
    rating: 4.5,
    reviews: 89,
    price: 29.99,
  },
  {
    id: "2",
    name: "Product B",
    image: "https://placehold.co/256x256/4CAF50/FFFFFF/png?text=B",
    rating: 4.8,
    reviews: 156,
    price: 39.99,
  },
  {
    id: "3",
    name: "Product C",
    image: "https://placehold.co/256x256/2196F3/FFFFFF/png?text=C",
    rating: 4.2,
    reviews: 43,
    price: 19.99,
  },
  {
    id: "4",
    name: "Product D",
    image: "https://placehold.co/256x256/9C27B0/FFFFFF/png?text=D",
    rating: 4.6,
    reviews: 72,
    price: 49.99,
  },
]);

function previousSlide() {
  sliderRef.value?.previous();
}

function nextSlide() {
  sliderRef.value?.next();
}
</script>
```

## Key Points

### Props
- `items` - Array of items to display (required)
- `autoplay` - Auto-advance slides (default: false)
- `interval` - Time between slides in ms (default: 3000)
- `loop` - Loop back to first slide (default: true)
- `show-indicators` - Show dot indicators (default: true)
- `show-arrows` - Show prev/next arrows (default: true)
- `items-per-view` - Number of items visible (default: 1)
- `spacing` - Gap between slides in px (default: 0)

### Events
- `@change` - Emitted when slide changes (index)

### Slots
- `#item` - Slide content template

### Common Use Cases

1. **Product Images**: Image gallery
```vue
<VcSlider :items="productImages">
  <template #item="{ item }">
    <VcImage :src="item.url" />
  </template>
</VcSlider>
```

2. **Hero Banners**: Marketing banners
```vue
<VcSlider :items="banners" :autoplay="true" />
```

3. **Testimonials**: Customer reviews
```vue
<VcSlider :items="testimonials" :autoplay="true" :interval="7000" />
```

4. **Related Products**: Multi-item carousel
```vue
<VcSlider :items="products" :items-per-view="3" />
```

### Best Practices

- Use autoplay sparingly (can be annoying)
- Provide pause on hover for autoplay sliders
- Show indicators for navigation context
- Use arrows for manual control
- Keep slide content concise
- Optimize images for slider (consistent size)
- Set appropriate interval (4-7 seconds)
- Use thumbnail navigation for image galleries
- Add touch/swipe support on mobile
- Limit autoplay to 3-5 slides
- Preload next slide for smooth transitions
- Pause autoplay when user interacts

