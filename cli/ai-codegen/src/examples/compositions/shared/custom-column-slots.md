# Custom Column Slots Pattern

Custom rendering for VcTable columns using slots.

## Description
Provides:
- Custom cell rendering
- Status badges
- Action buttons in cells
- Image thumbnails
- Progress indicators

## Usage
Enhance VcTable columns with custom UI elements.

## Code

```vue
<VcTable
  :columns="columns"
  :items="items"
  :loading="loading"
  @item-click="onItemClick"
>
  <!-- Status badge column -->
  <template #item_status="{ item }">
    <VcBadge :variant="getStatusVariant(item.status)">
      {{ item.status }}
    </VcBadge>
  </template>

  <!-- Image thumbnail column -->
  <template #item_image="{ item }">
    <div class="tw-flex tw-items-center tw-gap-2">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="tw-w-10 tw-h-10 tw-rounded tw-object-cover"
      />
      <VcIcon v-else name="lucide-image-off" size="l" />
    </div>
  </template>

  <!-- Name with description column -->
  <template #item_name="{ item }">
    <div class="tw-flex tw-flex-col">
      <span class="tw-font-semibold">{{ item.name }}</span>
      <span class="tw-text-sm tw-text-neutral-500">{{ item.description }}</span>
    </div>
  </template>

  <!-- Price with currency column -->
  <template #item_price="{ item }">
    <span class="tw-font-mono">
      {{ formatCurrency(item.price, item.currency) }}
    </span>
  </template>

  <!-- Progress bar column -->
  <template #item_progress="{ item }">
    <div class="tw-flex tw-items-center tw-gap-2">
      <div class="tw-flex-1 tw-bg-neutral-200 tw-rounded-full tw-h-2">
        <div
          class="tw-bg-primary tw-h-2 tw-rounded-full tw-transition-all"
          :style="{ width: `${item.progress}%` }"
        />
      </div>
      <span class="tw-text-sm tw-text-neutral-600">{{ item.progress }}%</span>
    </div>
  </template>

  <!-- Date with relative time column -->
  <template #item_createdDate="{ item }">
    <div class="tw-flex tw-flex-col">
      <span>{{ formatDate(item.createdDate) }}</span>
      <span class="tw-text-xs tw-text-neutral-500">
        {{ formatRelativeTime(item.createdDate) }}
      </span>
    </div>
  </template>

  <!-- Boolean as icon column -->
  <template #item_isActive="{ item }">
    <VcIcon
      :name="item.isActive ? 'lucide-check-circle' : 'lucide-x-circle'"
      :class="item.isActive ? 'tw-text-success' : 'tw-text-danger'"
      size="l"
    />
  </template>

  <!-- Tags/chips column -->
  <template #item_tags="{ item }">
    <div class="tw-flex tw-flex-wrap tw-gap-1">
      <VcChip v-for="tag in item.tags" :key="tag" size="sm">
        {{ tag }}
      </VcChip>
    </div>
  </template>

  <!-- Actions column (prevent row click) -->
  <template #item_actions="{ item }">
    <div class="tw-flex tw-gap-2" @click.stop>
      <VcButton size="xs" @click="editItem(item)">
        Edit
      </VcButton>
      <VcButton size="xs" variant="danger" @click="deleteItem(item.id)">
        Delete
      </VcButton>
    </div>
  </template>

  <!-- Link column -->
  <template #item_url="{ item }">
    <a
      v-if="item.url"
      :href="item.url"
      target="_blank"
      class="tw-text-primary hover:tw-underline"
      @click.stop
    >
      {{ item.url }}
      <VcIcon name="lucide-external-link" size="s" class="tw-ml-1" />
    </a>
  </template>

  <!-- User avatar with name column -->
  <template #item_assignedTo="{ item }">
    <div v-if="item.assignedTo" class="tw-flex tw-items-center tw-gap-2">
      <VcAvatar
        :src="item.assignedTo.avatarUrl"
        :name="item.assignedTo.name"
        size="sm"
      />
      <span>{{ item.assignedTo.name }}</span>
    </div>
  </template>
</VcTable>
```

```typescript
import { VcBadge, VcIcon, VcButton, VcChip, VcAvatar } from "@vc-shell/framework";

// Helper functions
function getStatusVariant(status: string): "success" | "warning" | "danger" | "info" {
  const variants: Record<string, "success" | "warning" | "danger" | "info"> = {
    active: "success",
    pending: "warning",
    inactive: "danger",
    draft: "info",
  };
  return variants[status.toLowerCase()] || "info";
}

function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

function formatRelativeTime(date: string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diff = new Date(date).getTime() - Date.now();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(days) < 1) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return rtf.format(hours, "hours");
  }

  return rtf.format(days, "days");
}

async function editItem(item: any) {
  // Open edit blade
}

async function deleteItem(id: string) {
  // Confirm and delete
}
```

```typescript
// Column definitions
const columns = ref<ITableColumns[]>([
  { id: "image", title: "", width: "60px", alwaysVisible: true },
  { id: "name", title: "Name", sortable: true },
  { id: "status", title: "Status", width: "120px" },
  { id: "price", title: "Price", sortable: true, width: "120px" },
  { id: "progress", title: "Progress", width: "200px" },
  { id: "tags", title: "Tags", width: "200px" },
  { id: "isActive", title: "Active", width: "80px" },
  { id: "createdDate", title: "Created", sortable: true, width: "150px" },
  { id: "assignedTo", title: "Assigned To", width: "180px" },
  { id: "actions", title: "", width: "150px", alwaysVisible: true },
]);
```
