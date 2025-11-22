# Route Naming Rules

## Overview

VC-Shell framework supports **only single-level routes** for blades. Multi-level routes, routes with parameters, and routes with query strings are **not supported**.

## Route Format

### Valid Format

```
/route-name
```

- Must start with `/`
- Only lowercase letters (`a-z`)
- Numbers (`0-9`)
- Hyphens (`-`) for word separation
- Single level only (one slash)

### Regular Expression

```regex
^/[a-z0-9-]+$
```

## Valid Routes ✅

```
/offers
/products
/home
/draft-pages
/pending-review
/active-users
/settings
```

## Invalid Routes ❌

### Multi-Level Routes (NOT SUPPORTED)

```
/pages/home          ❌ Multiple levels
/admin/users         ❌ Multiple levels
/offers/pending      ❌ Multiple levels
/api/v1/products     ❌ Multiple levels
```

**Why it's wrong:** VC-Shell routing only supports single-level routes. Use hyphens instead: `/pages-home`, `/admin-users`, `/offers-pending`

### Routes with Parameters (NOT SUPPORTED)

```
/offer/:id           ❌ Contains parameter
/product/:id?        ❌ Contains optional parameter
/user/:userId/edit   ❌ Contains parameter and multiple levels
```

**Why it's wrong:** Vue Router parameters are not supported. Details blades use single-level routes like `/offer` (singular).

### Routes with Query Strings (NOT SUPPORTED)

```
/offers?status=active    ❌ Contains query string
/products?*              ❌ Contains wildcard
```

**Why it's wrong:** Query parameters should be handled in code, not in route definition.

### Routes with Invalid Characters (NOT SUPPORTED)

```
/Offers              ❌ Uppercase letters
/my_offers           ❌ Underscores (use hyphens)
/offers.list         ❌ Dots
pages                ❌ Missing leading slash
```

**Why it's wrong:** Routes must use lowercase letters and hyphens only.

## Common Patterns

### List and Details Blades

```vue
<!-- List blade -->
defineOptions({
  blade: {
    name: "offers-list",
  },
  url: "/offers",
  layout: "grid",
});

<!-- Details blade -->
defineOptions({
  blade: {
    name: "offer-details",
  },
  url: "/offer",
  layout: "details",
});
```

**Note:** Use plural for lists (`/offers`) and singular for details (`/offer`).

### Status-Based Views

When you need different views for different statuses, use hyphens:

```vue
<!-- ✅ CORRECT -->
/draft-pages
/pending-pages
/active-pages
/archived-pages

<!-- ❌ WRONG -->
/pages/draft
/pages/pending
/pages/active
/pages/archived
```

### Dashboard/Home Routes

```vue
<!-- ✅ CORRECT -->
/home
/dashboard
/analytics

<!-- ❌ WRONG -->
/pages/home
/admin/dashboard
```

## Workspace Blades

Workspace blades (shown in sidebar menu) follow the same rules:

```vue
defineOptions({
  blade: {
    name: "draft-pages-list",
  },
  url: "/draft-pages",     // ✅ Single-level
  layout: "grid",
  isWorkspace: true,       // Shows in sidebar
});
```

## Module Registration

When registering module routes, all routes must be single-level:

```typescript
// ✅ CORRECT
export default [
  {
    path: "/offers",
    component: () => import("./views/offers-list.vue"),
  },
  {
    path: "/offer",
    component: () => import("./views/offer-details.vue"),
  },
  {
    path: "/draft-offers",
    component: () => import("./views/draft-offers-list.vue"),
  },
];

// ❌ WRONG
export default [
  {
    path: "/offers/list",    // ❌ Multi-level
    component: () => import("./views/offers-list.vue"),
  },
  {
    path: "/offer/:id",      // ❌ With parameter
    component: () => import("./views/offer-details.vue"),
  },
];
```

## Navigation Between Blades

When navigating from list to details, use blade API instead of route parameters:

```vue
<!-- ✅ CORRECT -->
<script setup lang="ts">
import { useBladeNavigation } from "@vc-shell/framework";
import OfferDetails from "./offer-details.vue";

const { openBlade } = useBladeNavigation();

function openDetails(offer) {
  openBlade({
    blade: markRaw(OfferDetails),
    param: offer.id,  // Pass data via param, not route
  });
}
</script>

<!-- ❌ WRONG -->
<script setup lang="ts">
// Don't use router.push with parameters
router.push(`/offer/${offer.id}`);  // ❌ NOT SUPPORTED
</script>
```

## Validation

Routes are validated at multiple levels:

1. **JSON Schema** - `ui-plan.v1.schema.json` enforces pattern `^/[a-z0-9-]+$`
2. **Zod Schema** - Runtime validation with clear error messages
3. **Validator Class** - Provides specific error messages for different violations
4. **PlannerV2** - Validates custom routes before using them, falls back to defaults
5. **Code Validator** - Checks generated code matches the plan

## Error Messages

When you violate route rules, you'll see specific error messages:

```
Route "/pages/home" has multiple levels.
Only single-level routes are supported (e.g., /offers not /pages/offers)
```

```
Route "/offer/:id" contains parameters.
Only single-level routes without parameters are supported (e.g., /offers not /offer/:id)
```

```
Route "/offers?status=active" contains query parameters or wildcards.
Only simple single-level routes are supported (e.g., /offers)
```

## Migration Guide

If you have existing multi-level routes, convert them to single-level:

| Old Route (❌)        | New Route (✅)      |
|-----------------------|---------------------|
| `/pages/home`         | `/pages-home`       |
| `/pages/draft`        | `/draft-pages`      |
| `/offers/pending`     | `/pending-offers`   |
| `/admin/users`        | `/admin-users`      |
| `/offer/:id`          | `/offer`            |
| `/product/:id/edit`   | `/product`          |

## Best Practices

1. **Use semantic names:** `/draft-pages` is better than `/pages1`
2. **Be consistent:** If you use `/draft-pages`, also use `/pending-pages`, not `/pages-pending`
3. **Keep it short:** `/offers` is better than `/offer-management-system`
4. **Use hyphens for multi-word:** `/user-groups` not `/usergroups` or `/user_groups`
5. **Plural for lists, singular for details:** `/offers` (list) and `/offer` (details)

## FAQ

**Q: Why doesn't VC-Shell support `/offer/:id` routes?**

A: VC-Shell uses a blade-based navigation system where context is passed via blade parameters, not URL parameters. This provides better UX for enterprise applications with complex navigation patterns.

**Q: How do I pass data to details blade?**

A: Use the `param` property when opening a blade:

```typescript
openBlade({
  blade: markRaw(OfferDetails),
  param: offerId,  // ✅ Pass data here
});
```

**Q: What if I need query parameters for filtering?**

A: Implement filtering in your blade component using composables or reactive state, not in the route.

**Q: Can I use route wildcards like `/offers/*`?**

A: No, wildcards are not supported. Each blade needs a specific single-level route.

## Summary

- ✅ **Allowed:** `/offers`, `/draft-pages`, `/home`
- ❌ **Forbidden:** `/pages/home`, `/offer/:id`, `/offers?filter=active`
- 🔧 **Pattern:** `^/[a-z0-9-]+$`
- 📋 **Use hyphens** for multi-word routes
- 🔀 **Pass data** via blade params, not route params
