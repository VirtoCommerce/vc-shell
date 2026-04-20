# List Composable Pattern (`use<Entity>s`)

Describes the plural composable that handles search, pagination, and sort for a list blade. Named with the **plural** entity name: `useTeamMembers`, `useCatalogItems`, `useOrders`.

Generic worked example for the plural list composable shape.

---

## Full Code Skeleton

```ts
import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import {
  SearchXxxQuery,
  SearchXxxResult,
  XxxType,
  XxxClient,
} from "../../../../api_client/<module-client-file>";
import type { SearchXxxQuery as ISearchXxxQuery } from "../../../../api_client/<module-client-file>";
import { computed, Ref, ref } from "vue";
import { useRoute } from "vue-router";

// Return type interface — always define explicitly for type safety
interface IUseXxxs {
  readonly loading: Ref<boolean>;
  readonly xxxList: Ref<XxxType[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  currentPage: Ref<number>;
  searchQuery: Ref<ISearchXxxQuery>;
  getXxxs: (query?: ISearchXxxQuery) => Promise<void>;
}

// Options interface — allows caller to configure page size and initial sort
interface IUseXxxsOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseXxxsOptions): IUseXxxs => {
  const { getApiClient } = useApiClient(XxxClient);
  const route = useRoute();   // for extracting route params (e.g., ownerId, parentId)

  const pageSize = options?.pageSize || 20;

  // Holds the initial search parameters; merged with query args on each call
  const searchQuery = ref<ISearchXxxQuery>({
    take: pageSize,
    sort: options?.sort,
  });

  // Full search result object from the API
  const searchResult = ref<SearchXxxResult>();

  // useAsync wraps the async function, providing loading state and error handling
  const { action: getXxxs, loading: getXxxsLoading } = useAsync<ISearchXxxQuery>(async (query) => {
    const client = await getApiClient();

    // Merge incoming query params into searchQuery (preserves existing values not in query)
    searchQuery.value = { ...searchQuery.value, ...query };

    // Build the command object — include any route params needed by the API
    const command = { ...searchQuery.value } as SearchXxxQuery;

    searchResult.value = await client.searchXxxs(command);
  });

  return {
    // useLoading aggregates multiple loading refs into a single boolean
    loading: useLoading(getXxxsLoading),

    // Derived from searchResult
    xxxList: computed(() => searchResult.value?.results || []),
    totalCount: computed(() => searchResult.value?.totalCount || 0),
    currentPage: computed(() => Math.floor((searchQuery.value.skip || 0) / pageSize) + 1),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 0) / pageSize)),

    // Expose searchQuery so blade can read current state (for pagination/reload)
    searchQuery,

    // Expose the action function — blade calls this to fetch/reload
    getXxxs,
  };
};
```

---

## Real Example (team module)

```ts
import { useApiClient, useAsync, useLoading } from "@vc-shell/framework";
import {
  SearchUsersQuery,
  SearchUsersResult,
  User,
  UserSecurityClient,
} from "../../../../api_client/virtocommerce.mymodule";
import type { SearchUsersQuery as ISearchUsersQuery } from "../../../../api_client/virtocommerce.mymodule";
import { computed, Ref, ref } from "vue";
import { useRoute } from "vue-router";

interface IUseTeamMembers {
  readonly loading: Ref<boolean>;
  readonly membersList: Ref<User[]>;
  readonly totalCount: Ref<number>;
  readonly pages: Ref<number>;
  currentPage: Ref<number>;
  searchQuery: Ref<ISearchUsersQuery>;
  getTeamMembers: (query?: ISearchUsersQuery) => Promise<void>;
}

interface IUseTeamMembersOptions {
  pageSize?: number;
  sort?: string;
}

export default (options?: IUseTeamMembersOptions): IUseTeamMembers => {
  const { getApiClient } = useApiClient(UserSecurityClient);
  const route = useRoute();

  const pageSize = options?.pageSize || 20;
  const searchQuery = ref<ISearchUsersQuery>({
    take: pageSize,
    sort: options?.sort,
  });

  const searchResult = ref<SearchUsersResult>();

  async function GetOwnerId(): Promise<string> {
    const result = route?.params?.ownerId as string;
    return result;
  }

  const { action: getTeamMembers, loading: getTeamMembersLoading } = useAsync<ISearchUsersQuery>(async (query) => {
    const client = await getApiClient();
    const ownerId = await GetOwnerId();
    searchQuery.value = { ...searchQuery.value, ...query };

    const command = { ...searchQuery.value, ownerId } as SearchUsersQuery;
    searchResult.value = await client.searchUsers(command);
  });

  return {
    loading: useLoading(getTeamMembersLoading),
    membersList: computed(() => searchResult.value?.results || []),
    totalCount: computed(() => searchResult.value?.totalCount || 0),
    currentPage: computed(() => Math.floor((searchQuery.value.skip || 0) / pageSize) + 1),
    pages: computed(() => Math.ceil((searchResult.value?.totalCount || 0) / pageSize)),
    searchQuery,
    getTeamMembers,
  };
};
```

---

## Key Rules

### File location
Each composable lives in its own subdirectory with an `index.ts`:
```
composables/
├── useXxxs/
│   └── index.ts       ← composable implementation
└── index.ts           ← barrel: export { default as useXxxs } from "./useXxxs";
```

### Default export (not named)
The composable is a **default export** (a factory function). Named exports are the interfaces only. The barrel (`composables/index.ts`) wraps it with a named export:
```ts
export { default as useXxxs } from "./useXxxs";
```

### Type aliasing
NSwag generates classes with the same name as their interfaces. Import the class for runtime use, and import the interface type separately with an alias:
```ts
import { SearchXxxQuery, XxxClient } from "...";            // class (runtime)
import type { SearchXxxQuery as ISearchXxxQuery } from "..."; // interface (type-only)
```

### `useAsync` signature
`useAsync<TArg>(fn)` — generic `TArg` is the type of the argument passed to the action:
```ts
const { action: getXxxs, loading: getXxxsLoading } = useAsync<ISearchXxxQuery>(async (query) => {
  // query is typed as ISearchXxxQuery | undefined
});
```
`action` is the callable — invoke it as `getXxxs(query)`.

### `useLoading`
Wrap loading refs with `useLoading` for consistent boolean ref behavior:
```ts
loading: useLoading(getXxxsLoading),
```
If there are multiple async operations (e.g., search + delete), pass all loading refs:
```ts
loading: useLoading(getXxxsLoading, deleteXxxLoading),
```

### Route params
Use `useRoute()` to access route params when the API requires a parent entity ID (e.g., `ownerId`, `orderId`). Access inside the async function, not at module scope:
```ts
const route = useRoute();
// inside useAsync callback:
const parentId = route?.params?.parentId as string;
```

### No `useI18n` in composables
i18n belongs in blade components only. Composables must not import or use `useI18n`.

### `searchQuery` is mutable
The `searchQuery` ref is returned with `Ref<ISearchXxxQuery>` (not `readonly`) because the blade reads it to construct reload/pagination calls:
```ts
// In blade:
const reload = async () => {
  await getXxxs({
    ...searchQuery.value,          // preserve existing params
    skip: (currentPage.value - 1) * (searchQuery.value?.take ?? 20),
    sort: sortExpression.value,
  });
};
```

### `currentPage` computation
```ts
currentPage: computed(() => Math.floor((searchQuery.value.skip || 0) / pageSize) + 1),
```
Derived from `skip` — no separate state needed.

### `pages` computation
```ts
pages: computed(() => Math.ceil((searchResult.value?.totalCount || 0) / pageSize)),
```
Total number of pages for pagination component.

---

## Composable Without Route Params

When the API doesn't need a parent ID (module is not nested under an owner/store/etc.):

```ts
const { action: getXxxs, loading: getXxxsLoading } = useAsync<ISearchXxxQuery>(async (query) => {
  const client = await getApiClient();
  searchQuery.value = { ...searchQuery.value, ...query };
  searchResult.value = await client.searchXxxs(searchQuery.value as SearchXxxQuery);
});
```

Omit `useRoute()` entirely if no route params are needed.
