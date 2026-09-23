---
title: Focus targets
category: composables
group: utilities
internal: true
---

# Focus targets

Where focus goes after a context change, and which code puts it there. A transition that leaves focus on `<body>` makes the next Tab restart at the top of the document, which fails WCAG 2.4.3 Focus Order — so every transition below has a named target, and none of them may end on `<body>`.

Two kinds of move appear in the table, and the difference decides what you should expect to see:

- **Repair** — `focusIfLoose(getTarget)` moves focus only when nothing meaningful holds it. If the user clicked a row, or the view autofocused a field, focus stays where it is. A repair that declines is correct behaviour, not a miss.
- **Handoff** — a deliberate `focus()` call, used when the element the user was on stops existing. It moves focus even though something held it, because that something is about to be unmounted.

## Targets per transition

| Transition                                                                  | Target                                                                       | Kind    | Implemented in                                                                                                                                                                                                           |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sign-in, and any route change                                               | the shell workspace (`.vc-app__workspace`, `tabindex="-1"`)                  | repair  | `vc-app.vue` — `watch(route.fullPath)`, plus a `watch(workspaceRef)` because sign-in is not a route change this component can observe                                                                                    |
| Sign-out                                                                    | the unauthenticated layout root                                              | repair  | `vc-auth-layout.vue` — `onMounted`                                                                                                                                                                                       |
| Blade open                                                                  | the blade root                                                               | repair  | `vc-blade.vue` — `onMounted`                                                                                                                                                                                             |
| Maximize / Restore — header button                                          | the replacement control (`Restore` after maximize, `Maximize` after restore) | handoff | `BladeHeader.vue` — `watch(renderingState.maximized)`, `flush: "pre"`                                                                                                                                                    |
| Maximize / Restore — `mod+\` shortcut                                       | same as the header button                                                    | handoff | same watch. The shortcut dispatches outside the click handlers, so the handoff hangs off the state change rather than either entry point (VCST-5812)                                                                     |
| Maximize while focus is outside the blade (sidebar, app bar, global search) | the blade root                                                               | repair  | `vc-blade.vue` — `watch(renderingState.maximized)`. Maximizing inerts those regions, and an inert node loses focus a tick later, so `focusIsLoose` treats an element inside `[inert]` as loose (VCST-5859)               |
| Save, and any load that raises `loading`                                    | the blade root                                                               | repair  | `vc-blade.vue` — `watch(props.loading)`. The toolbar re-renders and the control the user activated can stop existing; before this, only a blade that happened to remount recovered, through the mount repair (VCST-5670) |
| First load, before content has ever rendered                                | the blade root                                                               | park    | `vc-blade.vue` — `watch(showSkeleton)`, which parks focus that was inside the blade before the skeleton replaces its controls                                                                                            |
| Popup close                                                                 | the opener, or the workspace when the opener is gone                         | repair  | `usePopup` — `focusIfLoose(() => opener ?? focusFallbackTarget())`                                                                                                                                                       |

A blade mounting inside the workspace requests focus after the workspace does, so the more specific context wins. That ordering is deliberate.

## Asserting it

Focus transitions are invisible to axe, so the story-level a11y gate proves nothing here. Perform the action, then read `document.activeElement`:

```js
document.activeElement.tagName; // must never be "BODY"
```

Pressing Tab once and checking that focus continues is a weaker check and on some paths no check at all: when the nav precedes `main` in DOM order, a genuine continuation and a restart from the document's first stop land on the same control. The absent `[active]` node is the evidence, not the next stop.

Chrome keeps the sequential-focus navigation starting point at a removed node, so Tab can still reach the right control even after focus was lost. That is engine-specific and does nothing for a screen reader — `document.activeElement` is still `BODY` and the focus ring is gone.

## Related

- `focusIfLoose`, `focusFallbackTarget` — `framework/core/utilities/focus.ts`
- VCST-5670 — the ticket this table was written for
