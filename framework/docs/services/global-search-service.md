# Global Search Service Documentation

The Global Search Service is a core component of the VC-Shell framework that provides a centralized mechanism for implementing search functionality across the application. It allows registering search providers and executing search operations with visibility control.

## Overview

The Global Search Service facilitates the implementation of search functionality throughout the application, managing search visibility states and provider registration. It's particularly useful for mobile interfaces where search views need to be toggled.

## File Path
`/framework/core/services/global-search-service.ts`

## Core Interfaces

While the complete interfaces aren't shown in the snippets, we can infer the following from usage:

```typescript
export interface IGlobalSearchService {
  isSearchVisible: Ref<Record<string, boolean>>;
  toggleSearch: (bladeId: string) => void;
  closeSearch: (bladeId: string) => void;
  // Likely additional methods for search provider registration and query execution
}
```

## Primary Features

### Search Visibility Management

The service tracks whether search functionality is visible on different blades and provides methods to toggle this visibility.

```typescript
// Toggle search visibility for a specific blade
globalSearchService.toggleSearch('blade-123');

// Explicitly close search for a blade
globalSearchService.closeSearch('blade-123');

// Check if search is visible for a blade
const isVisible = globalSearchService.isSearchVisible.value['blade-123'];
```

### Integration with Mobile UI

The service is particularly useful for controlling search visibility in mobile interfaces, where screen real estate is limited and search often needs to be toggled.

## Usage in Components

The Global Search Service is accessed through the `useGlobalSearch` composable. Here's a real-world example from the `vc-table-header` component:

```typescript
// From framework/ui/components/organisms/vc-table/_internal/vc-table-header/vc-table-header.vue
<script lang="ts" setup>
import { VNode, computed, inject, Ref, h, useSlots, onBeforeUnmount, onMounted, ref } from "vue";
import { useGlobalSearch } from "../../../../../../core/composables/useGlobalSearch";
import { useAppBarMobileButtons } from "../../../../../../core/composables/useAppBarMobileButtons";
import { SearchIcon } from "../../../../atoms/vc-icon/icons";
import { FALLBACK_BLADE_ID } from "../../../../../../core/constants";

const props = defineProps<{
  // Component props
  hasHeaderSlot: boolean;
  header: boolean;
  columnsInit: boolean;
  searchValue?: string;
  // other props...
}>();

const blade = inject(
  BladeInstance,
  computed(
    (): Partial<IBladeInstance> => ({
      navigation: {
        idx: 0,
        instance: null,
      },
    }),
  ),
);
const globalSearch = useGlobalSearch();
const isMobile = inject("isMobile") as Ref<boolean>;
const { register: registerMobileButton, unregister: unregisterMobileButton } = useAppBarMobileButtons();

const currentBladeId = computed(() => {
  return blade?.value?.id || 0;
});

// Determine if search should be shown based on mobile state and search visibility
const shouldShowSearch = computed(() => {
  if (!isMobile.value) return true;

  if (blade?.value.navigation?.idx === 0) {
    return globalSearch.isSearchVisible.value[currentBladeId.value];
  }

  return true;
});

const bladeId = computed(() => {
  return blade.value?.id || FALLBACK_BLADE_ID;
});

// Configure search button for mobile view
const searchButtonConfig = ref({
  id: "global-search",
  icon: SearchIcon,
  onClick: () => {
    globalSearch.toggleSearch(bladeId.value);
  },
  onClose: () => {
    globalSearch.closeSearch(bladeId.value);
  },
  // Button is visible only if:
  // 1. We are in the root blade (idx === 0)
  // 2. Header is available for display
  isVisible: computed(() => Boolean(blade.value?.navigation?.idx === 0 && showHeader.value)),
  order: 5,
});

// Register search button when mounted
onMounted(() => {
  if (props.hasHeaderSlot || props.header) {
    registerMobileButton(searchButtonConfig.value);
  }
});

// Close search and unregister button when unmounted
onBeforeUnmount(() => {
  if (globalSearch.isSearchVisible.value[bladeId.value]) {
    globalSearch.closeSearch(bladeId.value);
  }
  unregisterMobileButton("global-search");
});
</script>
```

This implementation displays how the Global Search Service:

1. Controls search visibility based on the current blade and mobile state
2. Integrates with mobile buttons for toggling search
3. Automatically handles cleanup when components are unmounted

## Template Integration

The search functionality is conditionally displayed based on the visibility state managed by the service:

```vue
<template>
  <Transition name="table-header">
    <div
      v-if="showHeader && shouldShowSearch"
      class="vc-table-header"
    >
      <slot
        name="header"
        :header="headerComponent"
      >
        <component :is="headerComponent" />
      </slot>
    </div>
  </Transition>
</template>
```

## Mobile Integration

The search button is registered with the App Bar Mobile Buttons Service to provide a consistent way to toggle search on mobile devices:

```typescript
// Register search button when component is mounted
onMounted(() => {
  if (props.hasHeaderSlot || props.header) {
    registerMobileButton({
      id: "global-search",
      icon: SearchIcon,
      onClick: () => {
        globalSearch.toggleSearch(bladeId.value);
      },
      onClose: () => {
        globalSearch.closeSearch(bladeId.value);
      },
      isVisible: computed(() => Boolean(blade.value?.navigation?.idx === 0 && showHeader.value)),
      order: 5,
    });
  }
});
```

## Best Practices

1. **Blade-Specific Search**: Always associate search state with specific blade IDs to ensure each blade can have independent search visibility.

2. **Mobile Considerations**: Implement different search behavior for mobile versus desktop views, using the isMobile flag.

3. **Cleanup**: Always close search and unregister any associated UI elements when components unmount.

4. **Search Toggling**: Use the toggleSearch method for buttons that need to both open and close search, rather than implementing toggle logic yourself.

5. **Default Visibility**: In desktop views, typically keep search visible by default, only using toggle behavior on mobile.

## Related Composables

- `useGlobalSearch`: Provides access to the Global Search Service within Vue components.
- `provideGlobalSearchService`: Creates and provides the Global Search Service to the component tree. 
