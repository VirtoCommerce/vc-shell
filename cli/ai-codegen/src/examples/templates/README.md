# Vue SFC Templates

This directory contains production-ready Vue SFC templates for VC-Shell blade generation.

## ⚠️ CRITICAL: Templates Are Reference Only

**IMPORTANT FOR AI CODE GENERATORS:**

These templates contain comments like "Example: Import your entity's composable..." for human developers.

When AI generates code using these templates, it **MUST**:

1. **Replace ALL comment examples** with actual, working implementations
2. **Use actual module/entity names** (not placeholders like `Entity`, `YOUR_*`, `{{NAME}}`)
3. **Implement all handlers** with real logic (no empty functions like `const onSave = () => {}`)
4. **Add all required features** from UI-Plan specifications
5. **Remove all placeholder comments** and replace with working code

## ❌ Bad Example (Will Fail Validation)

```vue
<script setup lang="ts">
// TODO: Update for your entity
import useEntityList from "../composables/useEntityList";

// Empty handler - will be rejected
const onSave = () => {};

// Placeholder - will be rejected
const entity = ref<{{ENTITY_TYPE}}>();
</script>
```

**Why this fails:**
- ❌ TODO comments are forbidden (quality-metrics will detect and reject)
- ❌ Empty handlers (`() => {}`) are incomplete implementations
- ❌ Placeholders like `{{ENTITY_TYPE}}` are not allowed

## ✅ Good Example (Passes Validation)

```vue
<script setup lang="ts">
// Import offer-specific composable with actual module name
import { useOffersList } from "../composables/useOffersList";

// Working handler with complete implementation
const onSave = async () => {
  if (meta.value.valid) {
    try {
      if (offer.value.id) {
        await updateOffer({ ...offer.value, id: offer.value.id });
      } else {
        const { id, ...offerWithoutId } = offer.value;
        const created = await createOffer(offerWithoutId);
        if (created?.id) {
          emit("close:blade");
          emit("parent:call", { method: "reload" });
          return;
        }
      }
      resetModificationState();
      emit("parent:call", { method: "reload" });
      if (!props.param) {
        emit("close:blade");
      }
    } catch (error) {
      showError(t("OFFERS.ALERTS.SAVE_ERROR"));
    }
  } else {
    showError(t("OFFERS.ALERTS.NOT_VALID"));
  }
};

// Real entity type with proper interface
const offer = ref<Offer>();
</script>
```

**Why this passes:**
- ✅ Uses actual module name (`offers`, not `entities`)
- ✅ Complete save handler with error handling, navigation, and parent communication
- ✅ Proper TypeScript types (`Offer` instead of placeholder)
- ✅ Real i18n keys (`OFFERS.ALERTS.SAVE_ERROR`)
- ✅ No TODO comments, no placeholders, no empty handlers

## Validation Rules

When AI generates code from these templates, the `submit_generated_code` tool validates:

### 1. Completeness Score (≥80% required)

- All features from `context.features` must be implemented
- All columns/fields from UI-Plan must be present
- API client must be imported and used correctly
- Event handlers must have logic (not empty `{}`)

### 2. Forbidden Patterns (Zero tolerance)

```typescript
// ❌ FORBIDDEN - These will be auto-detected and rejected:

// TODO: Update import
// FIXME: Implement this later
// NOTE: TODO - handle error case

{{NAME}}
{{MODULE}}
YOUR_ENTITY_NAME
<REPLACE_THIS>

const onSave = () => {};
function handleClick() {}
const handler = async () => {};
```

### 3. Required Patterns

```typescript
// ✅ REQUIRED - AI must include:

// Real imports with actual module names
import { useOffersList } from "../composables/useOffersList";

// Implemented handlers with business logic
const onSave = async () => {
  // Validation
  if (!meta.value.valid) {
    showError(t("MODULE.ALERTS.NOT_VALID"));
    return;
  }

  // Business logic
  try {
    if (entity.value.id) {
      await updateEntity(entity.value);
    } else {
      await createEntity(entity.value);
    }
    emit("parent:call", { method: "reload" });
    emit("close:blade");
  } catch (error) {
    showError(t("MODULE.ALERTS.SAVE_ERROR"));
  }
};

// Real TypeScript interfaces
interface Offer {
  id?: string;
  name: string;
  // ... actual fields
}
```

## Template Complexity Levels

| Template | Lines | Features | Use Case |
|----------|-------|----------|----------|
| `list-simple.vue` | ~150 | Basic CRUD | Simple lists without filters |
| `list-filters.vue` | ~250 | Filters, search | Filterable entity lists |
| `list-multiselect.vue` | ~300 | Multiselect, batch ops | Bulk operations |
| `list-reorderable.vue` | ~280 | Drag-and-drop | Sortable lists |
| `details-simple.vue` | ~200 | Basic form | Simple entity editing |
| `details-validation.vue` | ~350 | Async validation | Complex validation rules |
| `details-gallery.vue` | ~400 | Image upload | Media-heavy entities |
| `details-widgets.vue` | ~300 | Widget integration | Contextual widgets |
| `details-tabs.vue` | ~450 | Multi-tab forms | Complex entities with categories |

## AI Generation Workflow

1. **Read template** matching your features and complexity
2. **Read base file** created by `create-vc-app` (has `defineOptions`, routes)
3. **Merge intelligently:**
   - Keep `defineOptions()`, `isWorkspace`, `menuItem` from base file
   - Implement features from template
   - Replace placeholder comments with working code
   - Use actual module/entity names throughout
4. **Validate before submit:**
   - No TODO/FIXME comments
   - No placeholders (`{{*}}`, `YOUR_*`, `<REPLACE_*>`)
   - No empty handlers
   - All features implemented
5. **Submit via `submit_generated_code`** - validation is automatic

## Common Mistakes

### ❌ Mistake #1: Keeping Template Comments

```typescript
// Example: Import your entity's composable
import useEntityList from "../composables/useEntityList";
```

**Why wrong:** Comment says "Example:" which implies it's not real code.

**Fix:**

```typescript
import { useOffersList } from "../composables/useOffersList";
```

### ❌ Mistake #2: Empty Handler Placeholders

```typescript
const onSave = () => {
  // TODO: Implement save logic
};
```

**Why wrong:** Empty function with TODO - both forbidden patterns.

**Fix:**

```typescript
const onSave = async () => {
  if (meta.value.valid) {
    try {
      await updateOffer(offer.value);
      emit("parent:call", { method: "reload" });
    } catch (error) {
      showError(t("OFFERS.ALERTS.SAVE_ERROR"));
    }
  }
};
```

### ❌ Mistake #3: Generic Entity Names

```typescript
interface Props {
  entity?: Entity;
}
```

**Why wrong:** `Entity` is too generic - use actual domain type.

**Fix:**

```typescript
interface Props {
  offer?: Offer;
}
```

## Summary

**For Human Developers:**
- Templates are starting points - customize for your needs
- Comments show where to make changes
- Replace generic names with your domain terms

**For AI Code Generators:**
- Templates are **reference implementations** only
- **NEVER** keep example comments or TODOs in generated code
- **ALWAYS** use actual module/entity names from UI-Plan
- **ALWAYS** implement complete working logic (no empty handlers)
- Validation is strict - incomplete code will be rejected with detailed errors
