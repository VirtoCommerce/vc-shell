# Полный список исправлений AI MCP Code Generation

Все критические исправления для правильной работы AI_FULL стратегии генерации кода через MCP.

## Обзор проблем

ИИ делал **четыре типа ошибок** при генерации кода:

1. ❌ Не мог отправить код сразу после генерации (workflow блокировал)
2. ❌ Пытался создать `bootstrap.ts` для регистрации модуля
3. ❌ Пытался добавлять пункты меню через `addMenuItem()` в bootstrap.ts
4. ❌ Использовал manual `window.onbeforeunload` и `confirm()` вместо framework composables

## Fix #1: Workflow Order - submit_generated_code перед check_types

### Проблема
Workflow требовал `check_types` **ПЕРЕД** `submit_generated_code`, но файлов с кодом еще не существует!

```
❌ НЕПРАВИЛЬНЫЙ порядок:
1. generate_with_composition → state: "generated"
2. check_types ← Код не существует!
3. submit_generated_code
```

### Решение
Переставлены шаги в [workflow-orchestrator.ts](cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts):

```typescript
// Step 5: Code submission (RIGHT AFTER generation)
submit_generated_code: {
  allowedFrom: ["generated", "code_submitted"],
  nextState: "code_submitted",
},

// Step 6: Type checking (OPTIONAL after code submission)
check_types: {
  allowedFrom: ["code_submitted", "completed"],
  nextState: "completed",
},
```

**Результат:**
```
✅ ПРАВИЛЬНЫЙ порядок:
1. generate_with_composition → state: "generated"
2. submit_generated_code → state: "code_submitted" ✅ Работает сразу!
3. check_types (опционально) → state: "completed"
```

**Файлы:** [workflow-orchestrator.ts:201-211](cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts#L201-L211)
**Документация:** [WORKFLOW_FIX_SUBMIT_CODE.md](WORKFLOW_FIX_SUBMIT_CODE.md)

---

## Fix #2: Module Registration - автоматическая регистрация в main.ts

### Проблема
ИИ пытался создать `bootstrap.ts` и вручную регистрировать модуль:

```typescript
// ❌ НЕПРАВИЛЬНО: ИИ пытался это делать
export function bootstrap(app: App) {
  registerModule(OffersModule);
}
```

### Решение
Добавлено правило #9 в [ai-generation-guide-builder.ts](cli/ai-codegen/src/core/ai-generation-guide-builder.ts):

```typescript
## 9. MAIN.TS REGISTRATION (MANDATORY - AI_FULL ONLY)
⚠️ **FOR AI_FULL STRATEGY**: Module registration is AUTOMATED by the system.
✅ **DO NOT** tell AI to modify bootstrap.ts or use registerModule()
✅ System automatically adds to main.ts:
```typescript
import {ModuleName}Module from "./modules/{module}";

const app = createApp(RouterView)
  .use(VirtoShellFramework, { router, i18n })
  .use({ModuleName}Module, { router })  // ← Automatically added
  .use(router);
```

**Как работает:**
1. ИИ создает blade компоненты и module index
2. ИИ отправляет код через `submit_generated_code`
3. **Система автоматически** вызывает `ModuleRegistrar`
4. `ModuleRegistrar` парсит `main.ts` и добавляет `.use(ModuleName, { router })`

**Файлы:** [ai-generation-guide-builder.ts:1346-1358](cli/ai-codegen/src/core/ai-generation-guide-builder.ts#L1346-L1358)
**Документация:** [MODULE_REGISTRATION_FIX.md](MODULE_REGISTRATION_FIX.md)

---

## Fix #3: Menu Items - defineOptions в workspace blade

### Проблема
ИИ пытался добавлять пункты меню через `addMenuItem()` в bootstrap.ts:

```typescript
// ❌ НЕПРАВИЛЬНО: ИИ пытался это делать
export function bootstrap(app: App) {
  addMenuItem({
    title: "Offers",
    icon: "fas fa-tags",
    url: "/offers",
  });
}
```

### Решение
Добавлено правило #9a в [ai-generation-guide-builder.ts](cli/ai-codegen/src/core/ai-generation-guide-builder.ts):

```typescript
## 9a. MENU ITEMS (MANDATORY - WORKSPACE BLADES)
⚠️ **CRITICAL**: Menu items are defined in workspace blade's `defineOptions`, NOT in bootstrap.ts!
```

**Правильный паттерн:**

```vue
<!-- ✅ ПРАВИЛЬНО: src/modules/offers/pages/offers-list.vue -->
<script setup lang="ts">
defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,  // ← ОБЯЗАТЕЛЬНО для workspace blade!
  menuItem: {         // ← Пункт меню определяется ЗДЕСЬ
    title: "OFFERS.MENU.TITLE",
    icon: "fas fa-tags",
    priority: 10,
  },
});
</script>
```

**Почему так:**
- Framework автоматически регистрирует пункты меню из workspace-блейдов
- `isWorkspace: true` указывает, что это главный блейд модуля
- Все в одном месте - проще поддерживать

**Файлы:** [ai-generation-guide-builder.ts:1360-1377](cli/ai-codegen/src/core/ai-generation-guide-builder.ts#L1360-L1377)
**Документация:** [MODULE_REGISTRATION_FIX.md](MODULE_REGISTRATION_FIX.md)

---

## Fix #4: Framework Composables - useBeforeUnload и onBeforeClose

### Проблема #4a: Browser Unload Prevention
ИИ использовал manual `window.onbeforeunload`:

```typescript
// ❌ НЕПРАВИЛЬНО: Manual window.onbeforeunload
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

### Решение #4a: useBeforeUnload composable

Добавлено правило #13 в [ai-generation-guide-builder.ts](cli/ai-codegen/src/core/ai-generation-guide-builder.ts):

```typescript
// ✅ ПРАВИЛЬНО: useBeforeUnload composable
import { ref } from 'vue';
import { useBeforeUnload } from '@vc-shell/framework';

const modified = ref(false);

// ✅ Просто передаем ref - framework делает всё остальное
useBeforeUnload(modified);
```

**Преимущества:**
- ✅ Автоматическая очистка при unmount
- ✅ Интеграция с blade system
- ✅ Нет memory leaks
- ✅ Простой API

### Проблема #4b: Blade Close Confirmation
ИИ использовал manual `confirm()` в onClose:

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

### Решение #4b: onBeforeClose hook

Добавлено правило #14 в [ai-generation-guide-builder.ts](cli/ai-codegen/src/core/ai-generation-guide-builder.ts):

```typescript
// ✅ ПРАВИЛЬНО: onBeforeClose hook
import { ref } from 'vue';
import { onBeforeClose } from '@vc-shell/framework';
import { usePopup } from '@vc-shell/framework';

const { showConfirmation } = usePopup();
const modified = ref(false);
const loading = ref(false);

onBeforeClose(async () => {
  if (modified.value && !loading.value) {
    return await showConfirmation(t("COMMON.UNSAVED_CHANGES"));
  }
});
```

**Преимущества:**
- ✅ Async confirmation - можно делать API calls
- ✅ Красивый UI (VcModal) вместо browser confirm
- ✅ Интеграция с blade navigation
- ✅ Поддержка i18n

**Файлы:**
- [ai-generation-guide-builder.ts:1411-1466](cli/ai-codegen/src/core/ai-generation-guide-builder.ts#L1411-L1466)
- [ai-generation-guide-builder.ts:1040-1057](cli/ai-codegen/src/core/ai-generation-guide-builder.ts#L1040-L1057)

**Документация:** [FRAMEWORK_COMPOSABLES_FIX.md](FRAMEWORK_COMPOSABLES_FIX.md)

---

## Полный правильный workflow

### 1. Анализ промпта
```typescript
mcp__vcshell-codegen__analyze_prompt_v2({
  prompt: "Create vendor management module with list and details",
  module: "vendors"
})
```

### 2. Создание UI-Plan
```typescript
mcp__vcshell-codegen__create_ui_plan_from_analysis_v2({
  analysis: { ... }
})
```

### 3. Валидация плана
```typescript
mcp__vcshell-codegen__validate_ui_plan({
  plan: { ... }
})
```

### 4. Генерация инструкций
```typescript
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/path/to/project",
  plan: { ... }
})
// → state: "generated"
// → Возвращает guide с инструкциями
```

### 5. ИИ пишет код
ИИ создает **ТОЛЬКО**:
- ✅ Blade компоненты (`*.vue`)
  - Workspace blade с `isWorkspace: true` и `menuItem`
  - Details/edit blades с `useBeforeUnload()` и `onBeforeClose()`
- ✅ Composables (`*.ts`)
- ✅ Module index (`index.ts`)
- ✅ Locales (`*.json`)

ИИ **НЕ создает**:
- ❌ `bootstrap.ts` для регистрации модуля
- ❌ Вызовы `registerModule()` или `addMenuItem()`
- ❌ Manual `window.onbeforeunload` или `confirm()`

### 6. Отправка кода
```typescript
mcp__vcshell-codegen__submit_generated_code({
  bladeId: "vendors-list",
  code: "<!-- Vue SFC code -->",
  context: {
    module: "vendors",
    layout: "grid",
    strategy: "AI_FULL"
  }
})
// → state: "code_submitted"
// → Система автоматически:
//    1. Валидирует код
//    2. Сохраняет файлы
//    3. Регистрирует модуль в main.ts
```

### 7. Проверка типов (опционально)
```typescript
mcp__vcshell-codegen__check_types({
  cwd: "/path/to/project"
})
// → state: "completed"
```

---

## Что изменилось в инструкциях для ИИ

### Добавлены CRITICAL_PATTERN_RULES

**Rule #9: Main.ts Registration**
- Автоматическая регистрация модуля
- Запрет на создание bootstrap.ts
- Запрет на использование registerModule()

**Rule #9a: Menu Items**
- Пункты меню в defineOptions workspace blade
- Запрет на addMenuItem() в bootstrap.ts
- Обязательный isWorkspace: true

**Rule #13: Browser Unload Prevention**
- useBeforeUnload(modifiedRef) вместо window.onbeforeunload
- Примеры wrong vs correct patterns
- Автоматическая очистка

**Rule #14: Blade Close Confirmation**
- onBeforeClose hook с showConfirmation
- Async confirmation вместо sync confirm()
- Интеграция с framework

### Добавлены Constraints

```typescript
"⚠️ MODULE REGISTRATION (AI_FULL STRATEGY ONLY):",
"❌ NEVER create or modify bootstrap.ts - module registration is automated",
"❌ NEVER use registerModule() or addMenuItem() manually",
"✅ System automatically registers module in main.ts using .use(ModuleName, { router })",

"⚠️ MENU ITEMS (CRITICAL):",
"❌ NEVER add menu items in bootstrap.ts using addMenuItem()",
"✅ ALWAYS define menuItem in workspace blade's defineOptions",

"⚠️ BROWSER UNLOAD PREVENTION (CRITICAL):",
"❌ NEVER use window.onbeforeunload manually",
"✅ ALWAYS use: useBeforeUnload(modifiedRef)",

"⚠️ BLADE CLOSE CONFIRMATION (CRITICAL):",
"❌ NEVER use manual confirm() in onClose handler",
"✅ ALWAYS use: onBeforeClose hook with showConfirmation",
```

### Обновлен mustNotHave список

```typescript
"FORBIDDEN: MODULE REGISTRATION (AI_FULL ONLY):",
"❌ Creating bootstrap.ts file - Registration is automated",
"❌ Calling registerModule() function - System handles this",
"❌ Using addMenuItem() in bootstrap.ts - Menu items go in blade defineOptions",

"FORBIDDEN: MENU ITEMS:",
"❌ addMenuItem() in bootstrap.ts - WRONG! Use defineOptions menuItem in workspace blade",
"❌ Missing isWorkspace: true in main blade - Required for menu integration",

"FORBIDDEN: BROWSER UNLOAD:",
"❌ window.onbeforeunload = ... - WRONG! Use useBeforeUnload(modifiedRef)",
"❌ watch(modified) setting window.onbeforeunload - Use useBeforeUnload instead",

"FORBIDDEN: BLADE CLOSE:",
"❌ Manual confirm() in onClose handler - WRONG! Use onBeforeClose hook",
"❌ function onClose() { if (!confirm()) return; emit('close:blade') } - Use onBeforeClose",
```

---

## Измененные файлы

### Workflow
- [workflow-orchestrator.ts](cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts) - Порядок шагов, state transitions

### Generation Guide
- [ai-generation-guide-builder.ts](cli/ai-codegen/src/core/ai-generation-guide-builder.ts) - Все правила и constraints

### Automation (уже работали правильно)
- [module-registrar.ts](cli/ai-codegen/src/core/module-registrar.ts) - Автоматическая регистрация
- [unified-generator.ts](cli/ai-codegen/src/core/unified-generator.ts) - Вызов ModuleRegistrar

---

## Документация

1. [WORKFLOW_FIX_SUBMIT_CODE.md](WORKFLOW_FIX_SUBMIT_CODE.md) - Исправление порядка workflow
2. [MODULE_REGISTRATION_FIX.md](MODULE_REGISTRATION_FIX.md) - Регистрация модуля и пункты меню
3. [FRAMEWORK_COMPOSABLES_FIX.md](FRAMEWORK_COMPOSABLES_FIX.md) - Composables и hooks
4. [COMPLETE_WORKFLOW_FIXES.md](COMPLETE_WORKFLOW_FIXES.md) - Краткий обзор всех исправлений
5. **[ALL_FIXES_SUMMARY.md](ALL_FIXES_SUMMARY.md)** - Этот документ (полный справочник)

---

## Проверка работы

После всех исправлений ИИ должен:

✅ **Workflow:**
1. Получить инструкции из `generate_with_composition`
2. Написать Vue SFC код
3. Отправить через `submit_generated_code` (работает сразу!)
4. Опционально запустить `check_types`

✅ **Code Generation:**
1. Создать blade компоненты с правильными patterns
2. Использовать `defineOptions` для workspace blade с `menuItem`
3. Использовать `useBeforeUnload()` вместо window.onbeforeunload
4. Использовать `onBeforeClose()` вместо manual confirm()
5. НЕ создавать bootstrap.ts для регистрации модуля
6. НЕ использовать registerModule() или addMenuItem()

✅ **System Automation:**
1. Система автоматически регистрирует модуль в main.ts
2. Система валидирует и сохраняет код
3. Система показывает ошибки валидации если есть

---

## Итого

Все **четыре критических исправления** внесены:

1. ✅ **Workflow order** - submit_generated_code перед check_types
2. ✅ **Module registration** - автоматическая через .use() в main.ts
3. ✅ **Menu items** - в defineOptions workspace blade, не в bootstrap.ts
4. ✅ **Framework composables** - useBeforeUnload() и onBeforeClose() вместо manual patterns

Пакет пересобран:
```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
yarn build
```

Все исправления включены в сборку `dist/` и готовы к использованию в MCP сервере.
