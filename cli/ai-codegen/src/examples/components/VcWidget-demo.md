---
id: component-VcWidget-demo
type: COMPONENT
complexity: SIMPLE
category: component
tags: [component]
title: "VcWidget Demo"
description: "VcWidget Demo component example"
---

# VcWidget Demo

Real-world widget examples. Base component for all custom widgets in details blades.

## Shipping Widget (from order-details.vue)

```vue
<template>
  <VcWidget
    icon="material-local_shipping"
    :title="$t('ORDERS.WIDGETS.SHIPPING.TITLE')"
    :value="shipmentCount"
    :disabled="!hasShipments"
    @click="openShipmentDetails"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface Props {
  order: {
    id: string;
    shipments: any[];
  };
}

const props = defineProps<Props>();
const { t } = useI18n();

const shipmentCount = computed(() => props.order.shipments?.length || 0);
const hasShipments = computed(() => shipmentCount.value > 0);

function openShipmentDetails() {
  if (hasShipments.value) {
    console.log("Opening shipment details for order:", props.order.id);
  }
}
</script>
```

## Payment Widget with Status Badge

```vue
<template>
  <VcWidget
    icon="material-payment"
    :title="$t('ORDERS.WIDGETS.PAYMENT.TITLE')"
    :value="paymentStatus"
    :disabled="isProcessing"
    @click="processPayment"
  />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface Props {
  order: {
    id: string;
    paymentStatus: string;
    total: number;
  };
}

interface Emits {
  (event: "process-payment", orderId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const isProcessing = ref(false);

const paymentStatus = computed(() => {
  if (props.order.paymentStatus === "paid") return "✓";
  if (props.order.paymentStatus === "pending") return "!";
  return "";
});

async function processPayment() {
  if (isProcessing.value) return;
  
  isProcessing.value = true;
  try {
    emit("process-payment", props.order.id);
  } finally {
    isProcessing.value = false;
  }
}
</script>
```

## Special Prices Widget (from offers-details.vue)

```vue
<template>
  <VcWidget
    icon="material-attach_money"
    :title="$t('OFFERS.WIDGETS.SPECIAL_PRICES.TITLE')"
    :value="priceCount"
    @click="emit('open-prices')"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface Props {
  priceLists: any[];
}

interface Emits {
  (event: "open-prices"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { t } = useI18n();

const priceCount = computed(() => props.priceLists?.length || 0);
</script>
```

## Image Gallery Widget

```vue
<template>
  <VcWidget
    icon="material-photo_library"
    :title="$t('PRODUCTS.WIDGETS.GALLERY.TITLE')"
    :value="imageCount"
    :disabled="!hasImages"
    @click="openGallery"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface Props {
  product: {
    images: Array<{ url: string; alt: string }>;
  };
}

const props = defineProps<Props>();
const { t } = useI18n();

const imageCount = computed(() => props.product.images?.length || 0);
const hasImages = computed(() => imageCount.value > 0);

function openGallery() {
  if (hasImages.value) {
    console.log("Opening gallery with", imageCount.value, "images");
  }
}
</script>
```

## Reviews Widget with Conditional Display

```vue
<template>
  <VcWidget
    icon="material-star"
    :title="$t('PRODUCTS.WIDGETS.REVIEWS.TITLE')"
    :value="reviewCount"
    @click="openReviews"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface Props {
  product: {
    reviews: Array<{
      id: string;
      rating: number;
      comment: string;
    }>;
  };
}

const props = defineProps<Props>();
const { t } = useI18n();

const reviewCount = computed(() => props.product.reviews?.length || 0);

function openReviews() {
  console.log("Opening", reviewCount.value, "reviews");
}
</script>
```

## Notes Widget with Unread Indicator

```vue
<template>
  <VcWidget
    icon="material-note"
    :title="$t('ORDERS.WIDGETS.NOTES.TITLE')"
    :value="hasUnreadNotes ? '!' : noteCount"
    @click="openNotes"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface Props {
  order: {
    notes: Array<{
      id: string;
      text: string;
      isRead: boolean;
      createdDate: string;
    }>;
  };
}

const props = defineProps<Props>();
const { t } = useI18n();

const noteCount = computed(() => props.order.notes?.length || 0);
const hasUnreadNotes = computed(() => 
  props.order.notes?.some(note => !note.isRead)
);

function openNotes() {
  console.log("Opening notes");
}
</script>
```

## Widget Registration in Details Blade (from order-details.vue)

```vue
<template>
  <VcBlade
    :title="bladeTitle"
    :modified="modified"
    :toolbar-items="bladeToolbar"
  >
    <VcContainer>
      <VcForm>
        <!-- Form content -->
      </VcForm>
    </VcContainer>
  </VcBlade>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useWidgets, useBlade } from "@vc-shell/framework";
import { ShippingWidget, PaymentWidget } from "../components/widgets";
import { useOrderDetails } from "../composables";

interface Props {
  param?: string;
}

const props = defineProps<Props>();

const { blade } = useBlade();
const { registerWidget, unregisterWidget } = useWidgets();
const { order, loadOrder } = useOrderDetails();

// Widget registration function
function registerWidgets() {
  // Shipping widget
  registerWidget(
    {
      id: "ShippingWidget",
      component: ShippingWidget,
      props: {
        order: computed(() => order.value),
      },
      isVisible: computed(() => !!order.value?.shipments?.length),
    },
    blade?.value.id,
  );

  // Payment widget
  registerWidget(
    {
      id: "PaymentWidget",
      component: PaymentWidget,
      props: {
        order: computed(() => order.value),
      },
      events: {
        "process-payment": handlePaymentProcess,
      },
      isVisible: computed(() => !!props.param),
    },
    blade?.value.id,
  );
}

// ✅ CRITICAL: Register widgets BEFORE onMounted
registerWidgets();

onMounted(async () => {
  if (props.param) {
    await loadOrder(props.param);
  }
});

onBeforeUnmount(() => {
  unregisterWidget("ShippingWidget", blade?.value.id);
  unregisterWidget("PaymentWidget", blade?.value.id);
});

function handlePaymentProcess() {
  console.log("Processing payment for order:", order.value.id);
}
</script>
```

## Sync Status Widget with Loading State

```vue
<template>
  <VcWidget
    icon="material-sync"
    :title="$t('SYNC.TITLE')"
    :value="syncStatus"
    :disabled="isSyncing"
    @click="syncData"
  />
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const isSyncing = ref(false);
const lastSyncTime = ref<Date | null>(null);

const syncStatus = computed(() => {
  if (isSyncing.value) return "...";
  if (!lastSyncTime.value) return "!";
  return "✓";
});

async function syncData() {
  if (isSyncing.value) return;
  
  isSyncing.value = true;
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    lastSyncTime.value = new Date();
  } finally {
    isSyncing.value = false;
  }
}
</script>
```

## Revenue Widget with Currency Formatting

```vue
<template>
  <VcWidget
    icon="material-attach_money"
    :title="$t('REVENUE.TITLE')"
    :value="formattedRevenue"
    @click="openRevenue"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { VcWidget } from "@vc-shell/framework";
import { useI18n } from "vue-i18n";

interface Props {
  order: {
    total: number;
    currency: string;
  };
}

const props = defineProps<Props>();
const { t } = useI18n();

const formattedRevenue = computed(() => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.order.currency,
    minimumFractionDigits: 0,
  }).format(props.order.total);
});

function openRevenue() {
  console.log("Opening revenue details");
}
</script>
```

## Key Points

### Props
- `icon` - Material icon name (e.g., "material-info")
- `title` - Widget title (use i18n)
- `value` - Badge value: number, text, or status symbol (✓, !, ...)
- `disabled` - Disables widget interaction
- `isExpanded` - Expanded state
- `horizontal` - Horizontal layout

### Events
- `@click` - Emitted when widget clicked (if not disabled)

### Registration Rules
- **Register BEFORE onMounted** - Widgets must be registered before component mounts
- **Always unregister** - Clean up in `onBeforeUnmount`
- **Use computed props** - Pass reactive data using `computed()`
- **Conditional visibility** - Use `isVisible` to show/hide based on state

### Widget Structure
```
src/modules/orders/
  ├── components/
  │   └── widgets/
  │       ├── shipping-widget.vue     ← Based on VcWidget
  │       ├── payment-widget.vue      ← Based on VcWidget
  │       └── index.ts                ← Export widgets
  └── pages/
      └── order-details.vue           ← Register widgets here
```

## Common Patterns

### Basic Widget with Count
```vue
<VcWidget
  icon="material-comment"
  :title="$t('COMMENTS.TITLE')"
  :value="comments.length"
  @click="openComments"
/>
```

### Widget with Status Symbol
```vue
<VcWidget
  icon="material-check"
  title="Verification"
  :value="isVerified ? '✓' : '!'"
  @click="verify"
/>
```

### Disabled When No Data
```vue
<VcWidget
  icon="material-attachment"
  title="Attachments"
  :value="attachments.length"
  :disabled="!attachments.length"
  @click="openAttachments"
/>
```

### Widget Registration Pattern
```typescript
// 1. Import widget and composables
import { useWidgets, useBlade } from "@vc-shell/framework";
import { MyWidget } from "../components/widgets";

// 2. Get registration functions
const { registerWidget, unregisterWidget } = useWidgets();
const { blade } = useBlade();

// 3. Define registration
function registerWidgets() {
  registerWidget(
    {
      id: "MyWidget",
      component: MyWidget,
      props: { data: computed(() => myData.value) },
      isVisible: computed(() => !!props.param),
    },
    blade?.value.id,
  );
}

// 4. Register immediately (NOT in onMounted)
registerWidgets();

// 5. Cleanup on unmount
onBeforeUnmount(() => {
  unregisterWidget("MyWidget", blade?.value.id);
});
```
