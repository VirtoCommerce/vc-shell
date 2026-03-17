# useBladeContext (defineBladeContext / injectBladeContext)

Exposes blade-level data to descendant widgets, extensions, and nested components via provide/inject.

## When to Use

- Share blade state (current entity, loading flags) with child widgets without prop drilling
- Access parent blade data from an extension or widget component
- When NOT to use: for cross-blade communication (use `useBlade` / `useBladeContext` from `useBlade` module instead)

## Basic Usage

```typescript
// In a blade's <script setup>
import { defineBladeContext, injectBladeContext } from '@vc-shell/framework';

// Provide context (blade component)
defineBladeContext({ item, disabled, loading });

// Or with a computed for selective exposure
defineBladeContext(computed(() => ({ id: item.value?.id })));
```

```typescript
// In a widget or nested component
import { injectBladeContext } from '@vc-shell/framework';

const ctx = injectBladeContext();
const entityId = computed(() => ctx.value.id as string);
```

## API

### defineBladeContext

| Parameter | Type | Required | Description |
|---|---|---|---|
| `data` | `MaybeRefOrGetter<Record<string, unknown>>` | Yes | Plain object, ref, or getter to expose |

Returns `void`. Must be called in the blade's `<script setup>`.

### injectBladeContext

Takes no parameters. Returns `ComputedRef<Record<string, unknown>>`.

Throws `InjectionError` if no ancestor blade has called `defineBladeContext`.

## Related

- `BladeContextKey` in `framework/injection-keys.ts`
- `useBladeWidgets` -- widgets that consume blade context
