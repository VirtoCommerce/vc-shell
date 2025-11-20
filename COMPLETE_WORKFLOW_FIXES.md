# Complete MCP Workflow Fixes Summary

Два критических исправления в MCP workflow для правильной работы AI_FULL стратегии генерации кода.

## Fix #1: submit_generated_code должен работать сразу после generate_with_composition

### Проблема
Workflow требовал обязательный `check_types` **ПЕРЕД** `submit_generated_code`, но код еще не существует!

### Решение
Изменен порядок: `submit_generated_code` → `check_types` (опционально)

**Файл:** [workflow-orchestrator.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts)

**Изменения:**
- Переставлены шаги 5 и 6 в transitions (строки 201-211)
- Обновлены stateTransitions (строки 244-253)
- Обновлены проверки качества (строки 143-153)
- Добавлены сообщения об ошибках для check_types (строки 363-368)

**Документация:** [WORKFLOW_FIX_SUBMIT_CODE.md](/Users/symbot/DEV/vc-shell/WORKFLOW_FIX_SUBMIT_CODE.md)

---

## Fix #2: Регистрация модуля и пункты меню

### Проблема
ИИ делал **две ошибки**:
1. Пытался создать `bootstrap.ts` и вручную регистрировать модуль через `registerModule()`
2. Пытался добавлять пункты меню через `addMenuItem()` в `bootstrap.ts`

### Решение
Добавлены явные инструкции в AI generation guide:
1. Регистрация модуля автоматическая в `main.ts`
2. Пункты меню определяются в workspace-блейде через `defineOptions`

**Файл:** [ai-generation-guide-builder.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/ai-generation-guide-builder.ts)

**Изменения:**
- Добавлено правило #9 про регистрацию модуля (строки 1346-1358)
- Добавлено правило #9a про пункты меню (строки 1360-1377)
- Добавлены constraints про регистрацию и меню (строки 1039-1050)
- Добавлены запреты в mustNotHave (строки 1135-1144)

**Документация:** [MODULE_REGISTRATION_FIX.md](/Users/symbot/DEV/vc-shell/MODULE_REGISTRATION_FIX.md)

---

## Правильный workflow теперь

### 1. Генерация инструкций
```typescript
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/path/to/project",
  bladeId: "offers-list",
  plan: { ... }
})
// → state = "generated"
```

### 2. ИИ пишет код
ИИ создает только:
- ✅ Blade компоненты (`*.vue`) с `defineOptions({ isWorkspace, menuItem })`
- ✅ Composables (`*.ts`)
- ✅ Module index (`index.ts`)
- ✅ Locales
- ❌ **НЕ** `bootstrap.ts`!
- ❌ **НЕ** `addMenuItem()` в bootstrap!

### 3. Отправка кода
```typescript
mcp__vcshell-codegen__submit_generated_code({
  bladeId: "offers-list",
  code: "<!-- Vue SFC code -->",
  context: { module: "offers", layout: "grid", strategy: "AI_FULL" }
})
// → state = "code_submitted"
// → Система автоматически регистрирует модуль в main.ts!
```

### 4. Проверка типов (опционально)
```typescript
mcp__vcshell-codegen__check_types({ cwd: "/path/to/project" })
// → state = "completed"
```

---

## Что изменилось для ИИ

### Раньше (неправильно):
```
1. generate_with_composition
2. check_types ← Код не существует!
3. submit_generated_code
4. ИИ пытался создать bootstrap.ts
```

### Теперь (правильно):
```
1. generate_with_composition
2. ИИ пишет код (без bootstrap.ts!)
3. submit_generated_code ← Работает сразу!
4. Система регистрирует модуль автоматически
5. check_types (опционально)
```

---

## Автоматическая регистрация модуля

Класс `ModuleRegistrar` автоматически:
1. Парсит `main.ts`
2. Добавляет `import {ModuleName}Module from "./modules/{module}"`
3. Вставляет `.use({ModuleName}Module, { router })`
4. Сохраняет файл

**Результат #1 - Регистрация модуля:**
```typescript
// main.ts (обновлен автоматически)
import OffersModule from "./modules/offers";

const app = createApp(RouterView)
  .use(VirtoShellFramework, { router, i18n })
  .use(OffersModule, { router })  // ← Добавлено системой
  .use(router);
```

**Результат #2 - Пункт меню:**
```vue
<!-- src/modules/offers/pages/offers-list.vue -->
<script setup lang="ts">
defineOptions({
  name: "OffersList",
  url: "/offers",
  isWorkspace: true,  // ← Workspace blade
  menuItem: {         // ← Пункт меню определяется ЗДЕСЬ
    title: "OFFERS.MENU.TITLE",
    icon: "fas fa-tags",
    priority: 10,
  },
});
</script>
```

---

## Когда используется bootstrap.ts

`bootstrap.ts` создается **ТОЛЬКО вручную** для:
- ✅ Dashboard widgets (registerDashboardWidget)
- ✅ Кастомная инициализация приложения

**НЕ** для регистрации модулей!

---

## Проверка работы

После исправлений ИИ должен:
1. ✅ Получить инструкции из `generate_with_composition`
2. ✅ Написать Vue SFC код
3. ✅ Отправить через `submit_generated_code` (работает сразу!)
4. ✅ Система автоматически регистрирует модуль
5. ✅ Опционально запустить `check_types`

ИИ НЕ должен:
1. ❌ Пытаться запустить `check_types` перед `submit_generated_code`
2. ❌ Создавать `bootstrap.ts` для регистрации модуля
3. ❌ Использовать `registerModule()` или `addMenuItem()` в bootstrap.ts
4. ❌ Модифицировать `main.ts` вручную
5. ❌ Забывать `isWorkspace: true` и `menuItem` в главном блейде

---

## Измененные файлы

### Workflow fix:
- [workflow-orchestrator.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts)

### Registration fix:
- [ai-generation-guide-builder.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/ai-generation-guide-builder.ts)

### Existing automation:
- [module-registrar.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/module-registrar.ts) - Уже работал правильно
- [unified-generator.ts](/Users/symbot/DEV/vc-shell/cli/ai-codegen/src/core/unified-generator.ts) - Уже вызывал ModuleRegistrar

---

## Сборка

Пакет пересобран с исправлениями:
```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
yarn build
```

Все исправления включены в сборку `dist/` и готовы к использованию.
