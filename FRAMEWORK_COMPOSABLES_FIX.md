# Framework Composables & Hooks Fix

## Проблема

ИИ использовал устаревшие паттерны вместо правильных composables и hooks из `@vc-shell/framework`:

1. **Manual `window.onbeforeunload`** вместо `useBeforeUnload()`
2. **Manual `confirm()` в onClose** вместо `onBeforeClose()` hook

## Неправильные паттерны (что делал ИИ)

### 1. Browser Unload Prevention - НЕПРАВИЛЬНО

```typescript
// ❌ НЕПРАВИЛЬНО: Manual window.onbeforeunload
import { watch } from 'vue';

const modified = ref(false);

// ❌ Watching и manual установка window.onbeforeunload
watch(modified, (isModified) => {
  if (isModified) {
    window.onbeforeunload = () => t("COMMON.UNSAVED_CHANGES");
  } else {
    window.onbeforeunload = null;
  }
});
```

**Проблемы:**
- Не очищается при unmount → memory leaks
- Не интегрируется с blade navigation
- Требует manual управление
- Может конфликтовать с другими blade

### 2. Blade Close Confirmation - НЕПРАВИЛЬНО

```typescript
// ❌ НЕПРАВИЛЬНО: Manual confirm в close handler
function onClose() {
  if (modified.value) {
    const confirmed = confirm(t("COMMON.UNSAVED_CHANGES"));
    if (!confirmed) return;
  }
  emit("close:blade");
}
```

**Проблемы:**
- `confirm()` - синхронный, блокирует UI
- Плохой UX (native browser dialog)
- Не async, нельзя сделать сложную логику
- Не интегрируется с blade navigation hooks

## Правильные паттерны (как должно быть)

### 1. Browser Unload Prevention - ПРАВИЛЬНО

```typescript
// ✅ ПРАВИЛЬНО: useBeforeUnload composable
import { ref } from 'vue';
import { useBeforeUnload } from '@vc-shell/framework';

const modified = ref(false);

// ✅ Просто передаем ref - framework делает всё остальное
useBeforeUnload(modified);

// Когда modified.value = true:
// - Framework показывает browser confirmation при refresh/close
// - Автоматически очищается при unmount
// - Работает с blade navigation
```

**Преимущества:**
- ✅ Автоматическая очистка при unmount
- ✅ Интеграция с blade system
- ✅ Нет memory leaks
- ✅ Простой API - передай ref

**Важно:** Передавайте `ref` напрямую, НЕ функцию!
```typescript
// ✅ Правильно
useBeforeUnload(modified);

// ❌ Неправильно
useBeforeUnload(() => modified.value);
```

### 2. Blade Close Confirmation - ПРАВИЛЬНО

```typescript
// ✅ ПРАВИЛЬНО: onBeforeClose hook
import { ref } from 'vue';
import { onBeforeClose } from '@vc-shell/framework';
import { usePopup } from '@vc-shell/framework';

const { showConfirmation } = usePopup();
const modified = ref(false);
const loading = ref(false);

onBeforeClose(async () => {
  // Если есть несохраненные изменения и не идет загрузка
  if (modified.value && !loading.value) {
    // showConfirmation возвращает Promise<boolean>
    return await showConfirmation(t("COMMON.UNSAVED_CHANGES"));
  }

  // Если вернуть undefined/true - blade закроется
  // Если вернуть false - blade НЕ закроется
});

// ❌ НЕ нужно emit('close:blade') - framework делает это автоматически!
```

**Преимущества:**
- ✅ Async confirmation - можно делать API calls
- ✅ Красивый UI (VcModal) вместо browser confirm
- ✅ Интеграция с blade navigation
- ✅ Поддержка i18n
- ✅ Можно добавить сложную логику

**Полный пример details blade:**
```vue
<template>
  <VcBlade
    v-loading="loading"
    :title="title"
    :toolbar-items="bladeToolbar"
    @close="$emit('close:blade')"
  >
    <VcForm v-model="entity">
      <!-- Form fields -->
    </VcForm>
  </VcBlade>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { onBeforeClose, useBeforeUnload } from '@vc-shell/framework';
import { usePopup } from '@vc-shell/framework';

const { t } = useI18n({ useScope: 'global' });
const { showConfirmation } = usePopup();

const entity = ref({ name: '', description: '' });
const modified = ref(false);
const loading = ref(false);

// ✅ Prevent browser refresh/close
useBeforeUnload(modified);

// ✅ Prevent blade close
onBeforeClose(async () => {
  if (modified.value && !loading.value) {
    return await showConfirmation(t("COMMON.UNSAVED_CHANGES"));
  }
});

// Track modifications
watch(entity, () => {
  modified.value = true;
}, { deep: true });

// After save, reset modified flag
async function save() {
  loading.value = true;
  try {
    await saveEntity(entity.value);
    modified.value = false; // ← Reset flag
  } finally {
    loading.value = false;
  }
}
</script>
```

## Решение

### Файл: `cli/ai-codegen/src/core/ai-generation-guide-builder.ts`

#### 1. Обновлены FRAMEWORK COMPOSABLES (строки 1011-1019)

```typescript
"FRAMEWORK COMPOSABLES - MUST USE CORRECT APIS:",
"- Prevent browser unload: useBeforeUnload(modifiedRef) - NEVER window.onbeforeunload!",
"- Prevent blade close: onBeforeClose(async () => { ... }) - NEVER manual confirm() in onClose!",
```

#### 2. Добавлены constraints про browser unload (строки 1040-1044)

```typescript
"⚠️ BROWSER UNLOAD PREVENTION (CRITICAL):",
"❌ NEVER use window.onbeforeunload manually - causes memory leaks and issues",
"❌ WRONG pattern: watch(modified, (val) => { window.onbeforeunload = val ? () => message : null })",
"✅ ALWAYS use: useBeforeUnload(modifiedRef) - framework handles cleanup",
"✅ CORRECT: import { useBeforeUnload } from '@vc-shell/framework'; useBeforeUnload(modified);",
```

#### 3. Добавлены constraints про blade close (строки 1046-1057)

```typescript
"⚠️ BLADE CLOSE CONFIRMATION (CRITICAL):",
"❌ NEVER use manual confirm() in onClose handler - not async and poor UX",
"❌ WRONG pattern: function onClose() { if (modified.value && !confirm('Sure?')) return; emit('close:blade'); }",
"✅ ALWAYS use: onBeforeClose hook with showConfirmation",
"✅ CORRECT pattern:",
"  import { onBeforeClose } from '@vc-shell/framework';",
"  const { showConfirmation } = usePopup();",
"  onBeforeClose(async () => {",
"    if (modified.value) {",
"      return await showConfirmation(t('COMMON.UNSAVED_CHANGES'));",
"    }",
"  });",
```

#### 4. Добавлено правило #13 в CRITICAL_PATTERN_RULES (строки 1411-1433)

```typescript
## 13. BROWSER UNLOAD PREVENTION (MANDATORY - DETAILS BLADES)
❌ NEVER use `window.onbeforeunload` manually
✅ ALWAYS use `useBeforeUnload(modifiedRef)`
```

#### 5. Добавлено правило #14 в CRITICAL_PATTERN_RULES (строки 1435-1466)

```typescript
## 14. BLADE CLOSE CONFIRMATION (MANDATORY - DETAILS BLADES)
❌ NEVER use manual `confirm()` in close handler
✅ ALWAYS use `onBeforeClose` hook with `showConfirmation`
```

#### 6. Добавлены запреты в mustNotHave (строки 1166-1173)

```typescript
"FORBIDDEN: BROWSER UNLOAD:",
"❌ window.onbeforeunload = ... - WRONG! Use useBeforeUnload(modifiedRef)",
"❌ watch(modified) setting window.onbeforeunload - Use useBeforeUnload instead",

"FORBIDDEN: BLADE CLOSE:",
"❌ Manual confirm() in onClose handler - WRONG! Use onBeforeClose hook",
"❌ function onClose() { if (!confirm()) return; emit('close:blade') } - Use onBeforeClose",
"❌ Emitting close:blade after confirmation - onBeforeClose handles it automatically",
```

## Когда использовать

### useBeforeUnload
- ✅ В **details blades** с формами
- ✅ Когда есть `modified` ref для tracking изменений
- ✅ Для prevention browser refresh/close

### onBeforeClose
- ✅ В **details blades** с формами
- ✅ Когда нужна confirmation перед закрытием blade
- ✅ Для async logic перед закрытием

### Не использовать в list blades
- ❌ List blades обычно НЕ требуют confirmation
- ❌ Нет tracking modifications в list blades
- ✅ Только в details/edit blades

## Сравнение

| Паттерн | Старый (❌) | Новый (✅) |
|---------|------------|-----------|
| Browser unload | `window.onbeforeunload` + `watch()` | `useBeforeUnload(modifiedRef)` |
| Blade close | `confirm()` в `onClose()` | `onBeforeClose(async () => ...)` |
| Confirmation UI | Native browser dialog | VcModal (framework) |
| Async support | ❌ Синхронный | ✅ Async/await |
| Cleanup | ❌ Manual | ✅ Автоматический |
| Integration | ❌ Нет | ✅ С blade navigation |
| i18n | ❌ Частичный | ✅ Полный |

## Связанные файлы

- [ai-generation-guide-builder.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/ai-generation-guide-builder.ts) - Generation guide с инструкциями
- [offers-list.vue](/Users/symbot/DEV/vc-shell/gen-apps/offers-app/src/modules/offers/pages/offers-list.vue) - Пример правильного использования

## Итого

**Правила простые:**
1. **Browser unload**: `useBeforeUnload(modified)` вместо `window.onbeforeunload`
2. **Blade close**: `onBeforeClose(async () => ...)` вместо `confirm()` в `onClose()`
3. **Details blades only**: Эти hooks только для details/edit blades
4. **Не emit close**: Framework автоматически закрывает blade если hook вернул `true`
