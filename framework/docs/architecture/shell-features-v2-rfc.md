# Shell Features V2 RFC (Draft)

Date: 2026-02-18  
Status: Draft  
Owners: `vc-app` / shell platform

## Context

Current shell features are functional but structurally inconsistent:

1. Same behavior is often declared in multiple channels (`appBarWidgets` + `mobileButtons`).
2. Some UI behavior is outside feature contracts (for example unread notification dot in `SidebarHeader`).
3. `settings` contributions can be empty while user-menu trigger still renders.
4. `ai-agent` uses a special bootstrap path instead of the feature pipeline.
5. Feature lifecycle is setup-only (`onSetup`), with no auth/dispose hooks.

## Hard Constraint

Public API must stay unchanged:

1. Do not change exported contracts consumed from outside the framework.
2. `ShellFeature` public usage remains stable.
3. Changes are internal to shell bootstrap/composition layers.

## Goals

1. Introduce one internal declarative contribution model for shell rendering.
2. Keep external `ShellFeature` behavior unchanged.
3. Move rendering logic to placement-based internal contracts.
4. Add full lifecycle support (`onSetup`, `onAuthReady`, `onDispose`).
5. Unify notifications/settings/ai-agent flow in one internal pipeline.

## Non-goals

1. Visual redesign of shell UI.
2. Breaking changes to `VcApp` public API.
3. Introducing new externally exposed feature format in this phase.

## Internal Model (not exported)

```ts
import type { Component, MaybeRefOrGetter } from "vue";
import type { ShellContext } from "../../core/types/shell-feature";

type ShellActionPlacement = "menu-sidebar-header" | "mobile-topbar";
type ShellIndicatorPlacement = "sidebar-header-logo-dot" | "sidebar-header-burger-dot";

interface InternalShellActionContribution {
  id: string;
  placements: ShellActionPlacement[];
  icon?: string | Component;
  order?: number;
  badge?: boolean | (() => boolean);
  isVisible?: MaybeRefOrGetter<boolean>;
  component?: Component;
  props?: Record<string, unknown>;
  onClick?: () => void;
  onClose?: () => void;
}

interface InternalShellIndicatorContribution {
  id: string;
  placements: ShellIndicatorPlacement[];
  isActive: MaybeRefOrGetter<boolean>;
}

interface InternalShellUserMenuItemContribution {
  id: string;
  component: Component;
  props?: Record<string, unknown>;
  group?: string;
  order?: number;
  isVisible?: MaybeRefOrGetter<boolean>;
}

interface InternalNormalizedFeature {
  id: string;
  actions: InternalShellActionContribution[];
  indicators: InternalShellIndicatorContribution[];
  userMenuItems: InternalShellUserMenuItemContribution[];
  onSetup?: (context: ShellContext) => void;
  onAuthReady?: (context: ShellContext) => void | Promise<void>;
  onDispose?: (context: ShellContext) => void;
}
```

## Bootstrap Integration (target behavior)

1. Accept current public `ShellFeature[]`.
2. Convert each feature into `InternalNormalizedFeature` inside bootstrap (private mapping function).
3. Register normalized actions by placement:
4. `menu-sidebar-header` -> app-bar widget service.
5. `mobile-topbar` -> mobile buttons service.
6. Register normalized user-menu items into settings-menu service.
7. Register indicators into a small shell-indicators service.
8. Execute `onSetup` immediately.
9. Execute `onAuthReady` once after auth flips to `true`.
10. Execute `onDispose` on app scope disposal.

## Built-in Features Migration

1. `notificationsFeature`:
2. single internal action mapped to both placements (`menu-sidebar-header`, `mobile-topbar`).
3. internal indicator bound to unread state.

4. `settingsFeature`:
5. internally split to `preferences` and `account` contributions.
6. keep externally exported `settingsFeature` shape unchanged.

7. `ai-agent`:
8. remove bootstrap special-case and route through normalized internal feature contributions.

## Migration Plan (internal-only)

1. Add internal normalization layer in bootstrap.
2. Migrate built-in feature registration paths to normalized pipeline.
3. Move unread-dot logic from `SidebarHeader` direct notification import to indicator service state.
4. Add integration coverage for desktop/mobile and feature on/off scenarios.

## Backward Compatibility Guarantees

1. Exports used by consumers remain unchanged.
2. Existing feature IDs and ordering remain stable.
3. Existing settings menu item components render unchanged.
4. Desktop and mobile behavior remains equivalent after internal normalization.

## Validation

1. Unit tests for internal normalization mapping.
2. Integration tests for `VcApp` with default features (desktop and mobile).
3. Integration tests for feature on/off matrix (notifications/settings/ai-agent).
4. Integration test for hidden user-menu trigger when there are no visible user-menu items.

## Open Questions

1. Keep `indicator` as separate internal contribution type, or fold into action metadata?
2. Need placement-level overrides for icon/order across desktop/mobile?
3. Should visibility predicates receive runtime context (`isEmbedded`, `isAuthenticated`)?
