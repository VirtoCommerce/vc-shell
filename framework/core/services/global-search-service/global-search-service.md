# Global Search Service

## Purpose
`createGlobalSearchService` keeps search visibility state and search query text per blade.

## Source
`framework/core/services/global-search-service/index.ts`

## API

```ts
interface GlobalSearchState {
  isSearchVisible: Ref<Record<string, boolean>>;
  searchQuery: Ref<Record<string, string>>;
  toggleSearch(bladeId: string): void;
  setSearchQuery(bladeId: string, query: string): void;
  closeSearch(bladeId: string): void;
}
```

## Behavior
- State is scoped to a service instance.
- `toggleSearch` flips visibility for a blade key.
- `closeSearch` always sets visibility to `false`.
- `setSearchQuery` updates the per-blade query string.

## Usage
Use via `useGlobalSearch` / `provideGlobalSearch` composables.
