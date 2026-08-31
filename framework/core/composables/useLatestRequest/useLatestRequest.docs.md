---
title: useLatestRequest
category: composables
group: utilities
---

# useLatestRequest

Latest-wins sequencing for overlapping async work: lets a caller drop a response
that a newer request already superseded.

`useAsync` covers loading state, error state and error notifications, but it has
no notion of a superseded call — a slow earlier response can overwrite a newer
one. This composable fills that gap.

## When to Use

- A search field that fires a request per keystroke, where the slowest response must not win
- A master/detail pair, where clicking row A then row B must not leave A's details on screen
- Any load that can still be in flight when its blade closes
- When NOT to use: for a single request with no concurrent sibling — plain `useAsync` is enough

!!! note "Discards, does not cancel"
On its own, the superseded request still completes and its result is thrown away.
To also save the round trip, hand the client a signal and abort it when a newer
request supersedes the last:

```typescript
const controller = new AbortController();
const { getApiClient } = useApiClient(SearchClient, { signal: controller.signal });
```

The two compose rather than replace each other: aborting stops a request still in
flight, and `isCurrent()` still guards a response that came back before the newer
request started.

## Quick Start

```typescript
import { useLatestRequest } from "@vc-shell/framework";

const search = useLatestRequest();
const items = ref([]);

async function load(criteria) {
  const request = search.begin();
  try {
    const result = await client.search(criteria);
    if (!request.isCurrent()) return; // a newer search already won
    items.value = result;
  } finally {
    request.complete();
  }
}
```

Two rules make it correct:

1. Check `isCurrent()` **after** the await and before writing any state.
2. Call `complete()` in a `finally`, so a throwing request still releases `pending`.

## API Reference

### Returns

| Member       | Type                     | Description                                                                       |
| ------------ | ------------------------ | --------------------------------------------------------------------------------- |
| `begin`      | `() => LatestRequest`    | Starts a request and supersedes any earlier one                                   |
| `invalidate` | `() => void`             | Supersedes the in-flight request without starting a new one                       |
| `dispose`    | `() => void`             | Permanently supersedes everything. Runs automatically when the owning scope stops |
| `pending`    | `Readonly<Ref<boolean>>` | `true` while the newest request is still running                                  |

### `LatestRequest`

| Member      | Type            | Description                                                                        |
| ----------- | --------------- | ---------------------------------------------------------------------------------- |
| `isCurrent` | `() => boolean` | `false` once a newer request started, or after `invalidate()` / `dispose()`        |
| `complete`  | `() => void`    | Marks this request finished. Idempotent; only the current request clears `pending` |

## Features

### `pending` tracks the newest request only

A superseded request finishing does **not** clear `pending` — the newer one is
still running, and clearing there would hide the spinner while the screen is
still waiting for data.

### Automatic disposal

When called inside a component or effect scope, the tracker disposes itself when
that scope stops, so a response landing after its blade closed can never write
into a dead scope. Call `dispose()` by hand only outside a scope.

## Recipes

### Driving a spinner

```typescript
const details = useLatestRequest();
// `pending` is a ref, so watch it, render it, or hand it to useLoading.
const loading = details.pending;
```

### Dropping a request on selection change

```typescript
watch(selectedId, () => {
  // Nothing new starts yet; whatever is in flight stops being current.
  details.invalidate();
});
```

## Common Mistakes

**Wrong: checking before the await**

```typescript
const request = search.begin();
if (!request.isCurrent()) return; // always true here — nothing has superseded it yet
const result = await client.search(criteria);
items.value = result; // still overwrites newer data
```

**Right: checking after**

```typescript
const request = search.begin();
const result = await client.search(criteria);
if (!request.isCurrent()) return;
items.value = result;
```

**Wrong: completing only on success**

```typescript
const request = search.begin();
const result = await client.search(criteria); // throws → pending stays true forever
request.complete();
```

**Right: completing in `finally`**

```typescript
const request = search.begin();
try {
  const result = await client.search(criteria);
  if (!request.isCurrent()) return;
  items.value = result;
} finally {
  request.complete();
}
```

## Related

- [useAsync](./useAsync.md) — loading state, error state and error notifications for a single call
- [useLoading](./useLoading.md) — aggregates several loading flags
