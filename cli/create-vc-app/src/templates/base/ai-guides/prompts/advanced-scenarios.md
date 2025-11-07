# Advanced Scenarios

Complex customization patterns and advanced use cases for VC Shell applications.

## When to Use This

Use these prompts for:
- Complex forms with dynamic fields
- Master-detail relationships
- Multi-step wizards
- Advanced validation
- File uploads with processing
- Real-time updates
- Complex business logic

---

## Scenario 1: Dynamic Form Fields

**Use Case:** Form fields change based on other field values

**Prompt for AI:**
```
Create a product details blade where form fields change dynamically.

Requirements:
- Product type field (select: Physical, Digital, Service)
- When "Physical" selected, show:
  - Weight (number)
  - Dimensions (length x width x height)
  - Shipping required (checkbox)
- When "Digital" selected, show:
  - Download URL (text)
  - File size (number)
  - License key (text, auto-generated)
- When "Service" selected, show:
  - Duration (number, hours)
  - Service location (select: On-site, Remote, Hybrid)
  - Required skills (multivalue)

All conditional fields should appear/disappear smoothly.
Use computed properties to control visibility.
```

**Expected Implementation:**
```typescript
const productType = ref<'physical' | 'digital' | 'service'>('physical');

const showPhysicalFields = computed(() => productType.value === 'physical');
const showDigitalFields = computed(() => productType.value === 'digital');
const showServiceFields = computed(() => productType.value === 'service');
```

```vue
<Field name="productType">
  <VcSelect
    v-model="productType"
    :options="['Physical', 'Digital', 'Service']"
  />
</Field>

<!-- Physical fields -->
<template v-if="showPhysicalFields">
  <Field name="weight">
    <VcInput v-model="item.weight" type="number" />
  </Field>
  <!-- ... more physical fields -->
</template>

<!-- Digital fields -->
<template v-if="showDigitalFields">
  <Field name="downloadUrl">
    <VcInput v-model="item.downloadUrl" />
  </Field>
  <!-- ... more digital fields -->
</template>
```

---

## Scenario 2: Master-Detail Relationship

**Use Case:** Edit item with related items (e.g., Order with Order Items)

**Prompt for AI:**
```
Create an order management system with master-detail relationship.

Master (Order):
- Order number
- Customer
- Order date
- Status
- Notes

Detail (Order Items) - editable table:
- Product (select from products list)
- Quantity (number)
- Unit price (currency, auto-filled from product)
- Discount (percentage)
- Total (calculated: quantity × price × (1 - discount))
- Actions: Remove item

Features:
- Add item button (opens product selector)
- Remove item button (with confirmation)
- Subtotal (sum of all item totals)
- Tax (10% of subtotal)
- Shipping cost (manual entry)
- Grand total (subtotal + tax + shipping)
- All totals auto-calculate on any change
- Validate: at least one item required
- Validate: quantity > 0
```

**Expected Implementation:**
```typescript
// Order items array
const items = ref<OrderItem[]>([]);

// Calculated totals
const subtotal = computed(() => 
  items.value.reduce((sum, item) => {
    const discount = item.discount || 0;
    return sum + (item.quantity * item.unitPrice * (1 - discount / 100));
  }, 0)
);

const tax = computed(() => subtotal.value * 0.1);

const grandTotal = computed(() => 
  subtotal.value + tax.value + (order.value.shipping || 0)
);

// Add item
const addItem = (product: Product) => {
  items.value.push({
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitPrice: product.price,
    discount: 0
  });
};

// Remove item
const removeItem = (index: number) => {
  items.value.splice(index, 1);
};

// Watch for changes and update order
watch([subtotal, tax, grandTotal], () => {
  order.value.subtotal = subtotal.value;
  order.value.tax = tax.value;
  order.value.total = grandTotal.value;
});
```

---

## Scenario 3: Multi-Step Wizard

**Use Case:** Complex form split into steps

**Prompt for AI:**
```
Create a product onboarding wizard with 4 steps.

Step 1: Basic Info
- Product name (text, required)
- Category (select, required)
- Brand (text)

Step 2: Pricing
- Cost price (currency, required)
- Selling price (currency, required, must be > cost price)
- Compare at price (currency, optional)
- Margin (calculated, read-only)

Step 3: Inventory
- SKU (text, required, unique)
- Quantity (number, required, min 0)
- Track inventory (checkbox)
- Low stock alert (number, shown only if track inventory)

Step 4: Media
- Images (gallery, drag to reorder)
- Videos (file upload, mp4)
- Documents (file upload, pdf)

Navigation:
- Next button (disabled if current step invalid)
- Previous button (enabled except on step 1)
- Save draft button (available on all steps)
- Finish button (only on step 4, saves and closes)

Progress indicator at top showing: Step 1 of 4, Step 2 of 4, etc.
Validate each step before allowing next.
Show step completion status (completed, current, upcoming).
```

**Expected Implementation:**
```typescript
const currentStep = ref(1);
const totalSteps = 4;

const steps = [
  { id: 1, title: 'Basic Info', completed: false },
  { id: 2, title: 'Pricing', completed: false },
  { id: 3, title: 'Inventory', completed: false },
  { id: 4, title: 'Media', completed: false }
];

const canGoNext = computed(() => {
  switch(currentStep.value) {
    case 1:
      return !!item.value.name && !!item.value.category;
    case 2:
      return item.value.sellingPrice > item.value.costPrice;
    case 3:
      return !!item.value.sku && item.value.quantity >= 0;
    default:
      return true;
  }
});

const nextStep = () => {
  if (canGoNext.value && currentStep.value < totalSteps) {
    steps[currentStep.value - 1].completed = true;
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const saveDraft = async () => {
  item.value.status = 'draft';
  await api.save(item.value);
  notification.success('Draft saved');
};

const finish = async () => {
  item.value.status = 'active';
  await api.save(item.value);
  notification.success('Product created');
  closeBlade();
};
```

---

## Scenario 4: Advanced Validation

**Use Case:** Complex validation rules and cross-field validation

**Prompt for AI:**
```
Create a form with advanced validation rules.

Fields:
- Email (required, valid email format)
- Password (required, min 8 chars, must have uppercase, lowercase, number, special char)
- Confirm password (must match password)
- Age (required, must be 18-100)
- Phone (required, format: (XXX) XXX-XXXX)
- Website (optional, valid URL if provided)
- Start date (required)
- End date (required, must be after start date)
- Price (required, min 0, max 999999.99)
- Quantity (required, integer, min 1)

Custom validators:
- Email must not be already registered (check with API)
- Username must be unique (debounced check)
- Start and end dates cannot be on weekends

Show errors:
- Inline below field
- Summary at top of form
- Highlight invalid fields in red

Disable save button while any validation errors exist.
```

**Expected Implementation:**
```typescript
import { useForm, defineRule } from 'vee-validate';

// Custom rule: password strength
defineRule('strongPassword', (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'At least 8 characters';
  if (!/[A-Z]/.test(value)) return 'At least one uppercase';
  if (!/[a-z]/.test(value)) return 'At least one lowercase';
  if (!/[0-9]/.test(value)) return 'At least one number';
  if (!/[^A-Za-z0-9]/.test(value)) return 'At least one special character';
  return true;
});

// Custom rule: date after
defineRule('afterDate', (value: string, [target]: string[]) => {
  const valueDate = new Date(value);
  const targetDate = new Date(target);
  return valueDate > targetDate || 'Must be after start date';
});

// Custom rule: async unique check
defineRule('uniqueEmail', async (value: string) => {
  const exists = await api.checkEmailExists(value);
  return !exists || 'Email already registered';
});

const validationSchema = {
  email: { required: true, email: true, uniqueEmail: true },
  password: { required: true, strongPassword: true },
  confirmPassword: { required: true, confirmed: '@password' },
  age: { required: true, min_value: 18, max_value: 100 },
  phone: { required: true, regex: /^\(\d{3}\) \d{3}-\d{4}$/ },
  website: { url: true },
  startDate: { required: true },
  endDate: { required: true, afterDate: '@startDate' },
  price: { required: true, min_value: 0, max_value: 999999.99 },
  quantity: { required: true, integer: true, min_value: 1 }
};

const { validate, errors, isValidating } = useForm({ validationSchema });

const canSave = computed(() => 
  !isValidating.value && Object.keys(errors.value).length === 0
);
```

---

## Scenario 5: File Upload with Preview

**Use Case:** Upload multiple files with preview and processing

**Prompt for AI:**
```
Create a product gallery manager with advanced file upload.

Features:
- Drag & drop files
- Multiple file selection
- Image preview (thumbnails)
- File type validation (jpg, png, webp only)
- File size limit (max 5MB per file)
- Image dimensions validation (min 800x600)
- Upload progress bar per file
- Cancel upload button
- Remove uploaded image button
- Reorder images (drag & drop)
- Set primary image (star icon)
- Edit image (crop, rotate, resize)
- Bulk actions (select multiple, delete selected)
- Total storage used indicator

Show during upload:
- Filename
- File size
- Progress percentage
- Upload speed
- Estimated time remaining

After upload:
- Thumbnail
- Filename
- File size
- Dimensions
- Actions (edit, delete, set as primary)
```

**Expected Implementation:**
```typescript
interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

const uploads = ref<UploadFile[]>([]);
const existingImages = ref<Image[]>([]);

// Handle file selection
const handleFileSelect = async (files: FileList) => {
  for (const file of Array.from(files)) {
    // Validate
    if (!validateFile(file)) continue;
    
    // Create preview
    const preview = await createPreview(file);
    
    // Add to uploads
    uploads.value.push({
      id: crypto.randomUUID(),
      file,
      preview,
      progress: 0,
      status: 'pending'
    });
  }
  
  // Start uploads
  processUploads();
};

// Validate file
const validateFile = (file: File): boolean => {
  // Type check
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    notification.error(`Invalid file type: ${file.name}`);
    return false;
  }
  
  // Size check
  if (file.size > 5 * 1024 * 1024) {
    notification.error(`File too large: ${file.name} (max 5MB)`);
    return false;
  }
  
  return true;
};

// Create preview
const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
};

// Upload files
const processUploads = async () => {
  for (const upload of uploads.value) {
    if (upload.status !== 'pending') continue;
    
    upload.status = 'uploading';
    
    try {
      const formData = new FormData();
      formData.append('file', upload.file);
      
      const result = await api.uploadImage(formData, {
        onUploadProgress: (event) => {
          upload.progress = Math.round((event.loaded / event.total) * 100);
        }
      });
      
      upload.status = 'completed';
      existingImages.value.push(result.data);
      
    } catch (error) {
      upload.status = 'error';
      upload.error = error.message;
    }
  }
};

// Reorder images
const reorderImages = (fromIndex: number, toIndex: number) => {
  const item = existingImages.value.splice(fromIndex, 1)[0];
  existingImages.value.splice(toIndex, 0, item);
};

// Set primary image
const setPrimary = (imageId: string) => {
  existingImages.value.forEach(img => {
    img.isPrimary = img.id === imageId;
  });
};
```

---

## Scenario 6: Real-Time Updates

**Use Case:** Display real-time data updates using WebSocket or polling

**Prompt for AI:**
```
Create an order monitoring dashboard with real-time updates.

Display:
- Total orders today (updates every second)
- Recent orders table (updates when new order arrives)
- Order status chart (updates when status changes)
- Active users count (live)
- Revenue today (live)

Implementation:
- Use WebSocket for real-time updates
- Fallback to polling if WebSocket unavailable
- Show connection status indicator
- Auto-reconnect on disconnect
- Smooth animations for value changes
- Flash highlight when data updates
- Sound notification for new orders (optional)
```

**Expected Implementation:**
```typescript
import { ref, onMounted, onBeforeUnmount } from 'vue';

let websocket: WebSocket | null = null;
let reconnectTimeout: number;

const isConnected = ref(false);
const stats = ref({
  ordersToday: 0,
  activeUsers: 0,
  revenueToday: 0
});

const recentOrders = ref<Order[]>([]);

// Connect to WebSocket
const connect = () => {
  websocket = new WebSocket('wss://api.example.com/ws');
  
  websocket.onopen = () => {
    isConnected.value = true;
    console.log('WebSocket connected');
  };
  
  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleUpdate(data);
  };
  
  websocket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  websocket.onclose = () => {
    isConnected.value = false;
    console.log('WebSocket disconnected');
    
    // Auto-reconnect after 5 seconds
    reconnectTimeout = setTimeout(connect, 5000);
  };
};

// Handle incoming updates
const handleUpdate = (data: any) => {
  switch (data.type) {
    case 'stats':
      // Animate value change
      animateValue(stats.value, 'ordersToday', data.ordersToday);
      animateValue(stats.value, 'activeUsers', data.activeUsers);
      animateValue(stats.value, 'revenueToday', data.revenueToday);
      break;
      
    case 'newOrder':
      // Add to recent orders
      recentOrders.value.unshift(data.order);
      if (recentOrders.value.length > 10) {
        recentOrders.value.pop();
      }
      
      // Flash highlight
      flashHighlight(data.order.id);
      
      // Play sound
      playNotificationSound();
      break;
      
    case 'statusChange':
      // Update order status
      const order = recentOrders.value.find(o => o.id === data.orderId);
      if (order) {
        order.status = data.newStatus;
        flashHighlight(data.orderId);
      }
      break;
  }
};

// Animate value change
const animateValue = (obj: any, key: string, target: number) => {
  const start = obj[key];
  const duration = 1000; // 1 second
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    obj[key] = Math.round(start + (target - start) * progress);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
};

// Fallback to polling
const startPolling = () => {
  setInterval(async () => {
    if (!isConnected.value) {
      const data = await api.getStats();
      stats.value = data;
    }
  }, 5000);
};

// Lifecycle
onMounted(() => {
  connect();
  startPolling();
});

onBeforeUnmount(() => {
  if (websocket) {
    websocket.close();
  }
  clearTimeout(reconnectTimeout);
});
```

---

## Scenario 7: Inline Editing Table

**Use Case:** Edit table cells directly without opening form

**Prompt for AI:**
```
Create a product price management grid with inline editing.

Table columns:
- Product name (read-only)
- SKU (read-only)
- Cost price (editable, currency)
- Selling price (editable, currency)
- Margin % (calculated, read-only)
- Stock (editable, number)
- Status (editable, select: active, inactive)
- Actions (save, cancel)

Features:
- Click cell to edit (input appears)
- Press Enter to save
- Press Escape to cancel
- Click outside cell to save
- Show loading indicator while saving
- Highlight row when editing
- Validate on blur
- Show error message inline
- Undo changes button
- Bulk edit selected rows
```

**Expected Implementation:**
```typescript
const editingCell = ref<{rowId: string; field: string} | null>(null);
const originalValues = new Map();

const startEdit = (rowId: string, field: string, currentValue: any) => {
  editingCell.value = { rowId, field };
  originalValues.set(`${rowId}-${field}`, currentValue);
};

const saveEdit = async (row: any, field: string) => {
  try {
    await api.updateProduct(row.id, { [field]: row[field] });
    notification.success('Updated');
    editingCell.value = null;
    originalValues.delete(`${row.id}-${field}`);
  } catch (error) {
    notification.error('Failed to update');
  }
};

const cancelEdit = (row: any, field: string) => {
  const originalValue = originalValues.get(`${row.id}-${field}`);
  if (originalValue !== undefined) {
    row[field] = originalValue;
  }
  editingCell.value = null;
  originalValues.delete(`${row.id}-${field}`);
};

const isEditing = (rowId: string, field: string) => {
  return editingCell.value?.rowId === rowId && 
         editingCell.value?.field === field;
};
```

```vue
<template>
  <VcTable :items="products">
    <template #item_price="{ item }">
      <div v-if="isEditing(item.id, 'price')">
        <VcInputCurrency
          v-model="item.price"
          @blur="saveEdit(item, 'price')"
          @keyup.enter="saveEdit(item, 'price')"
          @keyup.esc="cancelEdit(item, 'price')"
          autofocus
        />
      </div>
      <div 
        v-else 
        @click="startEdit(item.id, 'price', item.price)"
        class="editable-cell"
      >
        {{ formatCurrency(item.price) }}
      </div>
    </template>
  </VcTable>
</template>
```

---

## Scenario 8: Conditional Workflow

**Use Case:** Approval workflow with different paths

**Prompt for AI:**
```
Create a document approval system with conditional workflow.

Document states: Draft → Submitted → Approved/Rejected → Published

Rules:
- Author can: Create, Edit (if Draft), Submit, Cancel
- Reviewer can: Approve, Reject, Request Changes
- Admin can: Override, Publish, Archive

Workflow:
1. Author creates document (Draft)
2. Author submits for review (Submitted)
3. If approved → can publish
4. If rejected → back to Draft
5. If changes requested → back to Draft with comments
6. Admin can override any state

Show:
- Current state badge
- Available actions (buttons) based on user role and state
- History timeline (state changes, who did what, when)
- Comments thread
- Approval/rejection reason required

Implement state machine pattern.
Validate state transitions.
Send notifications on state changes.
```

**Expected Implementation:**
```typescript
type DocumentState = 'draft' | 'submitted' | 'approved' | 'rejected' | 'published' | 'archived';
type UserRole = 'author' | 'reviewer' | 'admin';

interface StateTransition {
  from: DocumentState;
  to: DocumentState;
  roles: UserRole[];
  requiresComment?: boolean;
}

const transitions: StateTransition[] = [
  { from: 'draft', to: 'submitted', roles: ['author'] },
  { from: 'submitted', to: 'approved', roles: ['reviewer', 'admin'] },
  { from: 'submitted', to: 'rejected', roles: ['reviewer', 'admin'], requiresComment: true },
  { from: 'approved', to: 'published', roles: ['author', 'admin'] },
  { from: 'rejected', to: 'draft', roles: ['author'] },
  // Admin overrides
  { from: 'draft', to: 'published', roles: ['admin'] },
  { from: 'published', to: 'archived', roles: ['admin'] }
];

const canTransition = (from: DocumentState, to: DocumentState, role: UserRole): boolean => {
  return transitions.some(t => 
    t.from === from && t.to === to && t.roles.includes(role)
  );
};

const availableActions = computed(() => {
  const currentState = document.value.state;
  const userRole = currentUser.value.role;
  
  return transitions
    .filter(t => t.from === currentState && t.roles.includes(userRole))
    .map(t => ({
      action: t.to,
      label: getActionLabel(t.to),
      requiresComment: t.requiresComment
    }));
});

const performTransition = async (targetState: DocumentState, comment?: string) => {
  if (!canTransition(document.value.state, targetState, currentUser.value.role)) {
    notification.error('Action not allowed');
    return;
  }
  
  const transition = transitions.find(t => 
    t.from === document.value.state && t.to === targetState
  );
  
  if (transition?.requiresComment && !comment) {
    notification.error('Comment required for this action');
    return;
  }
  
  try {
    await api.updateDocumentState(document.value.id, {
      newState: targetState,
      comment,
      userId: currentUser.value.id
    });
    
    document.value.state = targetState;
    
    // Add to history
    document.value.history.push({
      timestamp: new Date(),
      user: currentUser.value.name,
      action: targetState,
      comment
    });
    
    notification.success(`Document ${targetState}`);
    
  } catch (error) {
    notification.error('Failed to update state');
  }
};
```

---

## Related Documentation

- [CLI Usage](./cli-usage.md) - Generate modules
- [Quick Start Scenarios](./quick-start-scenarios.md) - Common modules
- [Complete Workflow](../guides/complete-workflow.md) - Development process
- [Troubleshooting Guide](../guides/troubleshooting.md) - Solve common issues

