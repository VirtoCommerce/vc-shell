# useGlobalSearch Composable

The `useGlobalSearch` composable provides access to the Global Search Service, allowing components to manage search functionality across the application, particularly for blade-based interfaces.

## Overview

The `useGlobalSearch` composable is a core utility for managing search visibility and query state in VC-Shell applications. It's particularly useful for controlling search UI in blade components and handling mobile-specific search behavior.

## API Reference

### Return Value

The `useGlobalSearch` composable returns the global search state object with the following properties and methods:

```typescript
interface GlobalSearchState {
  isSearchVisible: Ref<Record<string, boolean>>;  // Tracks search visibility by blade ID
  searchQuery: Ref<Record<string, string>>;       // Stores search queries by blade ID
  toggleSearch: (bladeId: string) => void;        // Toggles search visibility for a blade
  setSearchQuery: (bladeId: string, query: string) => void;  // Sets the search query for a blade
  closeSearch: (bladeId: string) => void;         // Closes search for a specific blade
}
```

### Methods

#### toggleSearch

Toggles search visibility for a specific blade.

```typescript
toggleSearch(bladeId: string): void
```

- `bladeId`: The ID of the blade to toggle search visibility for

#### setSearchQuery

Sets the search query for a specific blade.

```typescript
setSearchQuery(bladeId: string, query: string): void
```

- `bladeId`: The ID of the blade
- `query`: The search query string

#### closeSearch

Explicitly closes search for a specific blade.

```typescript
closeSearch(bladeId: string): void
```

- `bladeId`: The ID of the blade to close search for

### Properties

#### isSearchVisible

A reactive reference to an object that tracks search visibility state for each blade by ID.

```typescript
isSearchVisible: Ref<Record<string, boolean>>
```

#### searchQuery

A reactive reference to an object that stores search queries for each blade by ID.

```typescript
searchQuery: Ref<Record<string, string>>
```

## Usage

### Basic Usage in a Component

```typescript
import { useGlobalSearch } from '@vc-shell/framework';
import { computed, inject } from 'vue';

export default {
  setup() {
    // Get the blade ID (typically injected in blade components)
    const blade = inject('BladeInstance');
    const bladeId = computed(() => blade.value?.id || 'fallback-id');
    
    // Get global search functionality
    const globalSearch = useGlobalSearch();
    
    // Determine if search should be shown
    const isSearchVisible = computed(() => {
      return globalSearch.isSearchVisible.value[bladeId.value] || false;
    });
    
    // Function to toggle search
    function toggleSearch() {
      globalSearch.toggleSearch(bladeId.value);
    }
    
    // Function to update search query
    function updateSearchQuery(query) {
      globalSearch.setSearchQuery(bladeId.value, query);
    }
    
    return {
      isSearchVisible,
      toggleSearch,
      updateSearchQuery
    };
  }
}
```

### Table Component with Search

```vue
<template>
  <div class="data-table-component">
    <!-- Search Input -->
    <div v-if="shouldShowSearch" class="search-container">
      <input 
        type="text" 
        v-model="searchInput" 
        placeholder="Search..." 
        @input="handleSearchInput"
      />
    </div>
    
    <!-- Table Content -->
    <table>
      <!-- Table structure -->
    </table>
    
    <!-- Mobile Search Button -->
    <button 
      v-if="isMobile" 
      class="mobile-search-button"
      @click="toggleSearch"
    >
      Search
    </button>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch } from 'vue';
import { useGlobalSearch } from '@vc-shell/framework';

// Get mobile state
const isMobile = inject('isMobile', ref(false));

// Get blade and global search
const blade = inject('BladeInstance');
const bladeId = computed(() => blade.value?.id || 'fallback-id');
const globalSearch = useGlobalSearch();

// Track search input
const searchInput = ref('');

// Determine if search should be visible
const shouldShowSearch = computed(() => {
  if (!isMobile.value) return true;
  return globalSearch.isSearchVisible.value[bladeId.value];
});

// Watch for changes in the global search query
watch(() => globalSearch.searchQuery.value[bladeId.value], (newQuery) => {
  if (newQuery !== undefined) {
    searchInput.value = newQuery;
  }
});

// Toggle search visibility
function toggleSearch() {
  globalSearch.toggleSearch(bladeId.value);
}

// Handle search input changes
function handleSearchInput() {
  globalSearch.setSearchQuery(bladeId.value, searchInput.value);
  // Additional search logic
}
</script>
```

### Mobile Search Button Implementation

```typescript
import { useGlobalSearch } from '@vc-shell/framework';
import { useAppBarMobileButtons } from '@vc-shell/framework';
import { computed, onMounted, onBeforeUnmount } from 'vue';

export default {
  setup() {
    const bladeId = computed(() => 'your-blade-id');
    const globalSearch = useGlobalSearch();
    const { register: registerMobileButton, unregister: unregisterMobileButton } = useAppBarMobileButtons();
    
    // Register a search button in the mobile app bar
    onMounted(() => {
      registerMobileButton({
        id: "global-search",
        icon: "search-icon",
        onClick: () => {
          globalSearch.toggleSearch(bladeId.value);
        },
        onClose: () => {
          globalSearch.closeSearch(bladeId.value);
        },
        isVisible: computed(() => true), // Button visibility logic
        order: 5, // Order in the mobile button list
      });
    });
    
    // Cleanup when component is unmounted
    onBeforeUnmount(() => {
      if (globalSearch.isSearchVisible.value[bladeId.value]) {
        globalSearch.closeSearch(bladeId.value);
      }
      unregisterMobileButton("global-search");
    });
  }
}
```

## Provider Function

In addition to the `useGlobalSearch` composable, there's a provider function to initialize the global search service in your application:

```typescript
import { provideGlobalSearch } from '@vc-shell/framework';

export default {
  setup() {
    // Create and provide the global search service to the component tree
    const globalSearchService = provideGlobalSearch();
    
    // Now child components can use useGlobalSearch()
    
    return {};
  }
}
```

## Best Practices

1. **Blade-Specific Search**: Always associate search state with specific blade IDs to ensure each blade can have independent search visibility.

2. **Mobile Considerations**: Implement different search behavior for mobile versus desktop views, using the isMobile flag.

3. **Cleanup**: Always close search and unregister any associated UI elements when components unmount.

4. **Search Toggling**: Use the toggleSearch method for buttons that need to both open and close search, rather than implementing toggle logic yourself.

5. **Default Visibility**: In desktop views, typically keep search visible by default, only using toggle behavior on mobile.

## Related Resources

- [Global Search Service](../../services/global-search-service/global-search-service.md) - Documentation for the underlying service
- [Blade Navigation](../navigation.md) - Information about the blade navigation system 
