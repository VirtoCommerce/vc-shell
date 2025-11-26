---
id: component-VcRating-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: ["component","rating","stars","display","input"]
title: "VcRating Demo"
description: "Star rating display or input component"
componentRole: display-input
bladeContext: ["details","list"]
---

# VcRating Demo

Real-world rating display examples for product reviews, feedback, and quality indicators.

## Basic Rating Display

```vue
<template>
  <div class="tw-space-y-4">
    <div class="tw-flex tw-items-center tw-gap-3">
      <VcRating
        :value="productRating"
        :readonly="true"
      />
      <span class="tw-text-sm tw-text-[var(--neutrals-600)]">
        {{ productRating }} {{ $t("REVIEWS.OUT_OF") }} 5
      </span>
    </div>

    <div class="tw-text-sm tw-text-[var(--neutrals-500)]">
      {{ $t("REVIEWS.BASED_ON") }} {{ reviewCount }} {{ $t("REVIEWS.REVIEWS") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcRating } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const productRating = ref(4.5);
const reviewCount = ref(127);
</script>
```

## Rating with Review Form

```vue
<template>
  <VcForm @submit="submitReview">
    <div class="tw-space-y-4">
      <h3 class="tw-font-bold">{{ $t("REVIEWS.WRITE_REVIEW") }}</h3>

      <!-- Rating input -->
      <div>
        <VcLabel :required="true">
          {{ $t("REVIEWS.YOUR_RATING") }}
        </VcLabel>
        <div class="tw-flex tw-items-center tw-gap-3">
          <VcRating
            v-model="userRating"
            :readonly="false"
            size="l"
          />
          <span class="tw-text-sm tw-font-medium">
            {{ userRating ? `${userRating} ${$t("REVIEWS.STARS")}` : $t("REVIEWS.SELECT_RATING") }}
          </span>
        </div>
      </div>

      <!-- Review title -->
      <div>
        <VcLabel :required="true">
          {{ $t("REVIEWS.TITLE") }}
        </VcLabel>
        <Field v-slot="{ field, errorMessage }" name="title" :rules="requiredRule">
          <VcInput
            v-bind="field"
            :error-message="errorMessage"
            :placeholder="$t('REVIEWS.TITLE_PLACEHOLDER')"
          />
        </Field>
      </div>

      <!-- Review text -->
      <div>
        <VcLabel :required="true">
          {{ $t("REVIEWS.YOUR_REVIEW") }}
        </VcLabel>
        <Field v-slot="{ field, errorMessage }" name="review" :rules="requiredRule">
          <VcTextarea
            v-bind="field"
            :error-message="errorMessage"
            :rows="5"
            :placeholder="$t('REVIEWS.REVIEW_PLACEHOLDER')"
          />
        </Field>
      </div>

      <!-- Submit -->
      <div class="tw-flex tw-justify-end tw-gap-2">
        <VcButton outlined @click="onCancel">
          {{ $t("COMMON.CANCEL") }}
        </VcButton>
        <VcButton type="submit" variant="primary" :disabled="!userRating">
          {{ $t("REVIEWS.SUBMIT") }}
        </VcButton>
      </div>
    </div>
  </VcForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  VcLabel,
  VcRating,
  VcInput,
  VcTextarea,
  VcForm,
  VcButton,
} from "@vc-shell/framework";
import { Field } from "vee-validate";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const userRating = ref(0);

function requiredRule(value: string) {
  if (!value) return t("VALIDATION.REQUIRED");
  return true;
}

function submitReview() {
  console.log("Review submitted:", { rating: userRating.value });
}

function onCancel() {
  userRating.value = 0;
}
</script>
```

## Rating in Product Card

```vue
<template>
  <div class="tw-grid tw-grid-cols-3 tw-gap-4">
    <VcCard
      v-for="product in products"
      :key="product.id"
      class="tw-cursor-pointer hover:tw-shadow-lg tw-transition"
      @click="openProduct(product)"
    >
      <VcImage
        :src="product.image"
        size="l"
        aspect="1x1"
        class="tw-mb-3"
      />

      <div class="tw-space-y-2">
        <h3 class="tw-font-bold tw-truncate">{{ product.name }}</h3>

        <!-- Rating with count -->
        <div class="tw-flex tw-items-center tw-gap-2">
          <VcRating
            :value="product.rating"
            :readonly="true"
            size="s"
          />
          <span class="tw-text-xs tw-text-[var(--neutrals-500)]">
            ({{ product.reviewCount }})
          </span>
        </div>

        <!-- Price -->
        <div class="tw-flex tw-items-center tw-justify-between">
          <span class="tw-text-lg tw-font-bold tw-text-[var(--primary-500)]">
            ${{ product.price }}
          </span>
          <VcButton size="s" variant="primary">
            <VcIcon icon="material-add_shopping_cart" size="s" />
          </VcButton>
        </div>
      </div>
    </VcCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VcCard, VcImage, VcRating, VcButton, VcIcon } from "@vc-shell/framework";

interface Product {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  price: number;
}

const products = ref<Product[]>([
  {
    id: "1",
    name: "Wireless Headphones",
    image: "https://placehold.co/256x256/FF5722/FFFFFF/png?text=HP",
    rating: 4.5,
    reviewCount: 89,
    price: 79.99,
  },
  {
    id: "2",
    name: "Smart Watch",
    image: "https://placehold.co/256x256/2196F3/FFFFFF/png?text=SW",
    rating: 4.8,
    reviewCount: 156,
    price: 199.99,
  },
  {
    id: "3",
    name: "Leather Backpack",
    image: "https://placehold.co/256x256/4CAF50/FFFFFF/png?text=BP",
    rating: 4.2,
    reviewCount: 43,
    price: 59.99,
  },
]);

function openProduct(product: Product) {
  console.log("Open product:", product.id);
}
</script>
```

## Rating Breakdown

```vue
<template>
  <VcCard :header="$t('REVIEWS.CUSTOMER_REVIEWS')">
    <div class="tw-space-y-6">
      <!-- Overall rating -->
      <div class="tw-flex tw-items-start tw-gap-6">
        <div class="tw-text-center">
          <div class="tw-text-5xl tw-font-bold">{{ overallRating }}</div>
          <VcRating
            :value="overallRating"
            :readonly="true"
            size="l"
            class="tw-mt-2"
          />
          <div class="tw-text-sm tw-text-[var(--neutrals-500)] tw-mt-2">
            {{ totalReviews }} {{ $t("REVIEWS.REVIEWS") }}
          </div>
        </div>

        <!-- Rating breakdown -->
        <div class="tw-flex-1 tw-space-y-2">
          <div
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            class="tw-flex tw-items-center tw-gap-3"
          >
            <div class="tw-flex tw-items-center tw-gap-1 tw-w-20">
              <span class="tw-text-sm tw-font-medium">{{ star }}</span>
              <VcIcon icon="material-star" size="s" class="tw-text-[var(--warning-500)]" />
            </div>

            <!-- Progress bar -->
            <div class="tw-flex-1 tw-h-2 tw-bg-[var(--neutrals-100)] tw-rounded-full tw-overflow-hidden">
              <div
                class="tw-h-full tw-bg-[var(--warning-500)] tw-transition-all"
                :style="{ width: `${getRatingPercentage(star)}%` }"
              />
            </div>

            <span class="tw-text-sm tw-text-[var(--neutrals-600)] tw-w-12 tw-text-right">
              {{ getRatingCount(star) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Write review button -->
      <div class="tw-pt-4 tw-border-t">
        <VcButton variant="primary" class="tw-w-full" @click="writeReview">
          <VcIcon icon="material-edit" class="tw-mr-2" />
          {{ $t("REVIEWS.WRITE_REVIEW") }}
        </VcButton>
      </div>
    </div>
  </VcCard>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcCard, VcRating, VcIcon, VcButton } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const ratingDistribution = ref({
  5: 87,
  4: 45,
  3: 12,
  2: 5,
  1: 2,
});

const totalReviews = computed(() => 
  Object.values(ratingDistribution.value).reduce((sum, count) => sum + count, 0)
);

const overallRating = computed(() => {
  const totalStars = Object.entries(ratingDistribution.value)
    .reduce((sum, [stars, count]) => sum + (parseInt(stars) * count), 0);
  return (totalStars / totalReviews.value).toFixed(1);
});

function getRatingCount(star: number): number {
  return ratingDistribution.value[star as keyof typeof ratingDistribution.value] || 0;
}

function getRatingPercentage(star: number): number {
  const count = getRatingCount(star);
  return (count / totalReviews.value) * 100;
}

function writeReview() {
  console.log("Write review");
}
</script>
```

## Rating in Table

```vue
<template>
  <VcTable
    :items="reviews"
    :columns="columns"
  >
    <template #item_rating="{ item }">
      <div class="tw-flex tw-items-center tw-gap-2">
        <VcRating
          :value="item.rating"
          :readonly="true"
          size="s"
        />
        <span class="tw-text-sm tw-font-medium">{{ item.rating }}</span>
      </div>
    </template>

    <template #item_reviewer="{ item }">
      <div class="tw-flex tw-items-center tw-gap-3">
        <VcImage
          :src="item.avatar"
          size="xs"
          aspect="1x1"
          bordered
          rounded
        />
        <div>
          <div class="tw-font-medium">{{ item.name }}</div>
          <div class="tw-text-xs tw-text-[var(--neutrals-500)]">
            {{ item.verified ? $t("REVIEWS.VERIFIED_BUYER") : $t("REVIEWS.UNVERIFIED") }}
          </div>
        </div>
      </div>
    </template>

    <template #item_review="{ item }">
      <div class="tw-max-w-md">
        <div class="tw-font-medium tw-mb-1">{{ item.title }}</div>
        <p class="tw-text-sm tw-text-[var(--neutrals-600)] tw-line-clamp-2">
          {{ item.review }}
        </p>
      </div>
    </template>

    <template #item_date="{ item }">
      <span class="tw-text-sm tw-text-[var(--neutrals-500)]">
        {{ formatDate(item.date) }}
      </span>
    </template>
  </VcTable>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcTable, VcRating, VcImage } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface Review {
  id: string;
  rating: number;
  name: string;
  avatar: string;
  verified: boolean;
  title: string;
  review: string;
  date: Date;
}

const reviews = ref<Review[]>([
  {
    id: "1",
    rating: 5,
    name: "John Doe",
    avatar: "https://placehold.co/64x64/9C27B0/FFFFFF/png?text=JD",
    verified: true,
    title: "Amazing product!",
    review: "This product exceeded my expectations. The quality is excellent and it works perfectly.",
    date: new Date("2024-12-01"),
  },
  {
    id: "2",
    rating: 4,
    name: "Jane Smith",
    avatar: "https://placehold.co/64x64/F44336/FFFFFF/png?text=JS",
    verified: true,
    title: "Good value",
    review: "Great product for the price. Only minor issue is the packaging could be better.",
    date: new Date("2024-11-28"),
  },
]);

const columns = computed(() => [
  { id: "rating", title: t("REVIEWS.RATING"), width: "150px" },
  { id: "reviewer", title: t("REVIEWS.REVIEWER"), width: "200px" },
  { id: "review", title: t("REVIEWS.REVIEW") },
  { id: "date", title: t("REVIEWS.DATE"), width: "120px" },
]);

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
</script>
```

## Rating Sizes

```vue
<template>
  <div class="tw-space-y-6">
    <div>
      <h4 class="tw-font-medium tw-mb-2">{{ $t("REVIEWS.EXTRA_SMALL") }}</h4>
      <VcRating :value="4.5" :readonly="true" size="xs" />
    </div>

    <div>
      <h4 class="tw-font-medium tw-mb-2">{{ $t("REVIEWS.SMALL") }}</h4>
      <VcRating :value="4.5" :readonly="true" size="s" />
    </div>

    <div>
      <h4 class="tw-font-medium tw-mb-2">{{ $t("REVIEWS.MEDIUM") }}</h4>
      <VcRating :value="4.5" :readonly="true" size="m" />
    </div>

    <div>
      <h4 class="tw-font-medium tw-mb-2">{{ $t("REVIEWS.LARGE") }}</h4>
      <VcRating :value="4.5" :readonly="true" size="l" />
    </div>

    <div>
      <h4 class="tw-font-medium tw-mb-2">{{ $t("REVIEWS.EXTRA_LARGE") }}</h4>
      <VcRating :value="4.5" :readonly="true" size="xl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VcRating } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
```

## Key Points

### Props
- `value` or `v-model` - Rating value (0-5)
- `readonly` - Display only (default: true)
- `size` - xs, s, m, l, xl
- `max` - Maximum rating (default: 5)
- `precision` - Decimal precision (0.5 for half stars)

### Common Use Cases

1. **Display Rating**: Show product/service rating
```vue
<VcRating
  :value="4.5"
  :readonly="true"
/>
```

2. **Input Rating**: Let users rate
```vue
<VcRating
  v-model="userRating"
  :readonly="false"
/>
```

3. **With Review Count**: Show context
```vue
<VcRating :value="4.5" />
<span>(127 reviews)</span>
```

4. **In Cards**: Compact product cards
```vue
<VcRating :value="product.rating" size="s" />
```

### Best Practices

- Always use `readonly` for display-only ratings
- Show review count alongside rating
- Use size="s" or size="xs" in compact spaces (cards, tables)
- Support half-star precision (4.5, 3.5)
- Validate minimum rating (usually 1 star) for user input
- Show rating breakdown for detailed view
- Display "No reviews yet" for 0 rating
- Use yellow/gold color for star icons
- Add hover effect for interactive ratings
- Show rating distribution with progress bars
- Include verified buyer badges
- Sort reviews by rating, date, or helpfulness

