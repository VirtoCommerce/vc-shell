# 22. platformUrl Removal

## What Changed

The `platformUrl` option in the framework install has been removed:

```diff
 app.use(VirtoShellFramework, {
   router,
-  platformUrl: "https://api.example.com",
 });
```

## Migration

Use the `APP_PLATFORM_URL` environment variable instead:

```bash
# .env.development
APP_PLATFORM_URL=https://api.example.com
```

This was already the recommended approach in v1.x (the option was marked `@deprecated`).

## How to Find
```bash
grep -rn "platformUrl" src/ --include="*.ts" --include="*.vue"
```
