# Backdrop/Overlay Consistency Plan

## Status: Ready to execute (tasks created, no work started)

## Plan file
`docs/plans/2026-03-03-backdrop-overlay-consistency.md`

## Key decisions
- **Light (white-based) overlay** is the standard for the whole project
- Global tokens go in `framework/assets/styles/theme/colors.scss`
- Pattern: `rgb(from var(...) r g b / opacity)` — already used in 5+ components
- VcSidebar must switch from dark hardcoded `rgb(15 23 42/0.38)` to light `--overlay-bg`
- ToolbarMobile must switch from `rgba(0,0,0,0.4)` to `--overlay-bg`

## 6 tasks (all pending)
1. Add global tokens to colors.scss (overlay, shadow, surface, glass)
2. Update VcSidebar → global tokens + webkit prefixes
3. Update ToolbarMobile → global tokens + frosted glass + hover
4. Wire VcPopup → global tokens (backward-compatible)
5. Wire VcAppMenu → global tokens
6. Verify: tsc + vitest

## Files to modify
- `framework/assets/styles/theme/colors.scss`
- `framework/ui/components/organisms/vc-sidebar/vc-sidebar.vue`
- `framework/ui/components/organisms/vc-blade/_internal/toolbar/ToolbarMobile.vue`
- `framework/ui/components/organisms/vc-popup/vc-popup.vue`
- `framework/ui/components/organisms/vc-app/_internal/menu/VcAppMenu.vue`
