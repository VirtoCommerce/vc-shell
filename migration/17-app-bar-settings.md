# 17. App Bar & Settings Menu

## App Bar Widgets

### What Changed

`toolbar` and `toolbar:prepend` slots in `VcApp` are replaced by `useAppBarWidget()`.

### Migration

**Before:**
```vue
<VcApp>
  <template #toolbar>
    <LanguageSelector />
  </template>
  <template #toolbar:prepend>
    <MyBackButton />
  </template>
</VcApp>
```

**After:**
```typescript
import { onMounted } from 'vue';
import { useAppBarWidget } from '@vc-shell/framework';

onMounted(() => {
  const { register } = useAppBarWidget();
  register({ id: 'language-selector', component: LanguageSelector, order: 100 });
  register({ id: 'back-button', component: MyBackButton, order: 10 });
});
```

## Settings Menu

### What Changed

`toolbar:user-dropdown` slot + `baseMenuItemsHandler` replaced by `useSettingsMenu()`.

### Migration

**Adding items:**
```typescript
import { useSettingsMenu } from '@vc-shell/framework';

const settingsMenu = useSettingsMenu();
settingsMenu.register({
  id: 'my-settings',
  component: MyCustomSettings,
  order: 150,
  props: { settingTitle: 'My Setting' },
});
```

**Removing default items:**
```typescript
settingsMenu.unregister('change-password');
```

## How to Find
```bash
grep -rn "toolbar:prepend\|#toolbar\|toolbar:user-dropdown\|baseMenuItemsHandler" src/ --include="*.vue"
```
