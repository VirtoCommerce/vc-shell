# .cursorrules Update Summary

## Date: 2025-11-17
## Version: 0.7.5

## Overview

Полностью обновлён `.cursorrules` файл с учётом всех текущих возможностей MCP сервера и исправлений.

---

## Ключевые изменения

### 1. ✅ Новая секция "Critical Framework API Patterns"

**Добавлено в начало файла (строки 27-137):**

Документация **РЕАЛЬНЫХ** паттернов из vendor-portal production code:

#### Blade Navigation
- ❌ **WRONG:** `closeBlade()` без индекса
- ✅ **CORRECT:** `emit("close:blade")` для текущего blade
- ⚠️ **ADVANCED:** `closeBlade(index)` только для конкретного blade

#### Opening Child Blades
- Паттерн с `openBlade()`, `onOpen()`, `onClose()`
- Reload parent list в onClose callback

#### Unsaved Changes Prevention
- ✅ `useBeforeUnload(computed(() => modified.value))`
- ❌ НЕ `window.addEventListener('beforeunload')`

#### Confirmation Dialogs
- `usePopup().showConfirmation()`
- Await pattern для асинхронных подтверждений

#### Notifications
- `notification.success()` / `notification.error()`
- Всегда с i18n: `t("COMMON.SAVE_SUCCESS")`

**Framework API Resources:**
- 5 новых MCP ресурсов с реальными примерами
- Все примеры из vendor-portal production

### 2. ✅ Улучшена секция "MCP Tools Available"

**Добавлена новая секция 0 - APP SCAFFOLDING (строки 240-265):**

```typescript
scaffold_app({
  projectName: "my-app",
  targetDirectory: "/path"
})
```

**Триггерные фразы:**
- "Create new app"
- "Create new VC-Shell application"
- "Scaffold app"
- "Initialize VC-Shell project"
- "Start new project"

**🚨 CRITICAL:** ALWAYS use this tool (NOT bash/npx)!

**Почему важно:**
- Автоматически добавляет `--skip-module-gen`
- Предотвращает интерактивные промпты
- Создаёт только базовую структуру

### 3. ✅ Обновлён список MCP Tools

**Добавлены новые инструменты:**
- `generate_with_composition` - Продвинутая генерация с выбором стратегии
- `infer_blade_logic` - Авто-вывод handlers, toolbar, state
- `get_composition_guide` - Получение composition guide для AI
- `analyze_prompt_v2` - Глубокий анализ V2 (multi-entity, workflows)
- `create_ui_plan_from_analysis_v2` - Создание UI-Plan из V2 анализа

**Всего инструментов:** 13 (было 10)

### 4. ✅ Обновлён список MCP Resources

**Добавлены Framework API Examples (строки 368-373):**
```
9.  vcshell://framework/useBladeNavigation/open-blade
10. vcshell://framework/useBladeNavigation/close-blade ← EMIT PATTERN!
11. vcshell://framework/useBeforeUnload/prevent-unload
12. vcshell://framework/usePopup/show-confirmation
13. vcshell://framework/notification/success-error
```

**Всего ресурсов:** 13 (было 8)

### 5. ✅ Улучшён Workflow - Step 0: Scaffold New Application

**Добавлены строгие правила (строки 379-422):**

**❌ NEVER use direct bash commands:**
```bash
cd /path && npx @vc-shell/create-vc-app my-app --yes
```
**This will cause interactive prompts and hang!**

**✅ ALWAYS use scaffold_app tool:**
```typescript
scaffold_app({
  projectName: "my-vendor-portal",
  targetDirectory: "/path/to/projects"
})
```

### 6. ✅ Улучшён Workflow - Step 1: Generate UI-Plan

**Добавлены V2 analysis tools (строки 456-462):**

```typescript
// 1. Analyze the prompt
analyze_prompt_v2({
  prompt: "User's full prompt here",
  module: "offers" // optional
})

// 2. Create UI-Plan from analysis
create_ui_plan_from_analysis_v2({
  analysis: { /* result from step 1 */ }
})

// 3. Validate
validate_ui_plan({
  plan: { /* generated UI-Plan */ }
})
```

### 7. ✅ Улучшён Workflow - Step 2: Generate Code

**Добавлена поддержка generate_with_composition (строки 548-556):**

```typescript
generate_with_composition({
  plan: plan,
  cwd: "/path/to/project",
  strategy: "auto", // or "template", "composition", "ai-full"
  dryRun: false
})
```

**Что делает автоматически:**
- Применяет framework API patterns (emit, notifications)
- Генерирует composables с mock data
- Регистрирует модуль в main.ts
- Создаёт правильную структуру файлов

### 8. ✅ Обновлена секция "Component Usage Rules"

**VcBlade (строка 685):**
```typescript
// **Use @close="$emit('close:blade')" for close handler**
```

**VcBlade Quick Reference (строка 828):**
```typescript
// `@close` event - **Use @close="$emit('close:blade')" pattern!**
```

### 9. ✅ Добавлена версия и дата

**В конце файла (строки 849-850):**
```
**Version:** 0.7.5 (Updated 2025-11-17)
**MCP Server:** @vc-shell/ai-codegen@0.7.5
```

---

## Статистика

### До обновления
- Строки: ~696
- MCP Tools: 10
- MCP Resources: 8
- Framework API Examples: 0
- Версия: не указана

### После обновления
- Строки: **851** (+155 строк)
- MCP Tools: **13** (+3 новых)
- MCP Resources: **13** (+5 новых)
- Framework API Examples: **5** (NEW!)
- Версия: **0.7.5**

---

## Ключевые улучшения

### 1. Framework API Patterns Section
- ✅ Реальные примеры из vendor-portal
- ✅ Правильное использование emit("close:blade")
- ✅ Все composables с примерами
- ✅ Ссылки на MCP resources

### 2. scaffold_app Tool Prominence
- ✅ Вынесен в отдельную секцию (№0)
- ✅ Явные триггерные фразы
- ✅ Предупреждения о bash командах
- ✅ Примеры использования

### 3. V2 Analysis Tools
- ✅ Документация analyze_prompt_v2
- ✅ Документация create_ui_plan_from_analysis_v2
- ✅ Интеграция в workflow
- ✅ Примеры использования

### 4. Component Capabilities
- ✅ Обновлённые примеры
- ✅ Semantic search
- ✅ Intent-based discovery
- ✅ Framework API integration

---

## Файлы изменены

1. **/.cursorrules** - Полностью переписан
2. **/cli/ai-codegen/src/commands/mcp.ts** - Улучшено описание scaffold_app
3. **/cli/ai-codegen/CHANGELOG.md** - Добавлена версия 0.7.5
4. **/cli/ai-codegen/package.json** - Обновлена версия до 0.7.5
5. **/cli/ai-codegen/MCP_SCAFFOLD_APP_FIX.md** - Документация исправления

---

## Что это даёт

### Для AI
1. ✅ Понимает когда использовать scaffold_app вместо bash
2. ✅ Знает правильные framework API patterns
3. ✅ Использует emit("close:blade") вместо closeBlade()
4. ✅ Знает о всех 13 MCP tools
5. ✅ Имеет доступ к 5 framework API examples

### Для пользователей
1. ✅ Нет интерактивных промптов при создании приложения
2. ✅ Правильная генерация кода с первого раза
3. ✅ Реальные production patterns из vendor-portal
4. ✅ Полная документация workflow
5. ✅ Улучшенное качество генерируемого кода

---

## Next Steps

Теперь при работе с VC-Shell AI должен:

1. ✅ При "Create new app" → Использовать `scaffold_app` tool
2. ✅ При генерации модулей → Использовать V2 analysis workflow
3. ✅ При работе с blade navigation → Использовать `emit("close:blade")`
4. ✅ При генерации кода → Применять framework API patterns
5. ✅ При проверке компонентов → Использовать capabilities discovery

---

## Testing

Чтобы протестировать обновлённые правила:

```
User: "Create new VC-Shell app called test-app"
Expected: AI вызовет scaffold_app tool, НЕ bash команду

User: "Create offers module with list and details"
Expected: AI вызовет analyze_prompt_v2 → create_ui_plan_from_analysis_v2 → generate_with_composition

User: "How to close current blade?"
Expected: AI покажет emit("close:blade") pattern из framework examples
```

---

**Status:** ✅ COMPLETE
**Version:** 0.7.5
**Date:** 2025-11-17
