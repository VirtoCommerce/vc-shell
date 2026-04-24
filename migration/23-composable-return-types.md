# 23. Composable Return Type Aliases

## What Changed

All composable return type aliases have been renamed to follow a consistent `Use*Return` convention:

| Old (deprecated) | New |
|---|---|
| `IUsePermissions` | `UsePermissionsReturn` |
| `IAppUserAPI` | `UseUserReturn` |
| `IUseAssets` | `UseAssetsReturn` |
| `IUseAppInsights` | `UseAppInsightsReturn` |
| `IUseFunctions` | `UseFunctionsReturn` |
| `IUseTheme` | `UseThemeReturn` |
| `IUseLanguages` | `UseLanguagesReturn` |
| `INotifications` | `UseNotificationsReturn` |
| `IUseErrorHandler` | `UseErrorHandlerReturn` |
| `IUseDynamicProperties` | `UseDynamicPropertiesReturn` |
| `IUseBreadcrumbs` | `UseBreadcrumbsReturn` |
| `IBladeRegistry` | `UseBladeRegistryReturn` |
| `IUseSettings` | `UseSettingsReturn` |
| `IUserManagementAPI` | `UseUserManagementReturn` |
| `UseConnectionStatus` | `UseConnectionStatusReturn` |
| `SidebarStateReturn` | `UseSidebarStateReturn` |
| `UseAsync` | `UseAsyncReturn` |
| `UseApiClient` | `UseApiClientReturn` |
| `AccordionProps` | `VcAccordionProps` |
| `AccordionEmits` | `VcAccordionEmits` |

Generic type parameters are preserved (e.g., `UseAsync<Payload, Result>` → `UseAsyncReturn<Payload, Result>`).

> **Note:** Injection key renames (`BladeInstance` → `BladeInstanceKey`, etc.) are a separate change covered in [guide 21](./21-injection-keys.md) and automated by the `remove-deprecated-aliases` CLI transform.

### Component Type Renames

The last two rows above (`AccordionProps` → `VcAccordionProps`, `AccordionEmits` → `VcAccordionEmits`) are not composable return types — they are the `Props` / `Emits` interfaces of the `VcAccordion` component. They are included in this guide because they share the same `remove-deprecated-aliases` codemod and both old names remain re-exported with `@deprecated` annotations from `framework/ui/components/molecules/vc-accordion/index.ts`:

```diff
-import type { AccordionProps, AccordionEmits } from "@vc-shell/framework";
+import type { VcAccordionProps, VcAccordionEmits } from "@vc-shell/framework";
```

The `Vc` prefix brings these types in line with the rest of the framework's component-type naming convention (`VcButtonProps`, `VcInputProps`, etc.). The underlying shape of both interfaces is unchanged — this is a pure rename.

`AccordionItemProps` / `AccordionItemEmits` (for the internal `VcAccordionItem` sub-component) are **not** renamed in this release and remain available under their current names.

## Backward Compatibility

Old aliases are re-exported with `@deprecated` JSDoc annotations. Your code compiles but IDE shows deprecation warnings.

## Migration

```diff
-import type { IUsePermissions, UseAsync } from "@vc-shell/framework";
+import type { UsePermissionsReturn, UseAsyncReturn } from "@vc-shell/framework";

-const permissions: IUsePermissions = usePermissions();
+const permissions: UsePermissionsReturn = usePermissions();
```

## How to Find

```bash
grep -rn "IUsePermissions\|IAppUserAPI\|IUseAssets\|IUseAppInsights\|IUseFunctions\|IUseTheme\|IUseLanguages\|INotifications\b\|IUseErrorHandler\|IUseDynamicProperties\|IUseBreadcrumbs\|IBladeRegistry\|IUseSettings\|IUserManagementAPI\|UseConnectionStatus\b\|SidebarStateReturn\b\|UseAsync\b\|UseApiClient\b\|AccordionProps\b\|AccordionEmits\b" src/
```

## Automated Migration

```bash
npx vc-shell-migrate --transform composable-return-types
```
