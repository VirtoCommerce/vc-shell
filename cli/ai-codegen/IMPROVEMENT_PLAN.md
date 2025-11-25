# AI-Codegen Package - Improvement Plan

## Executive Summary

После полного ревью пакета `cli/ai-codegen` и тестирования на реальном промпте offers module, выявлены критические проблемы и составлен план улучшений.

**Общая оценка:** Архитектура отличная (5-слойная система), но исполнение неполное (~70% готовности к production).

**Последнее обновление:** 2025-11-25 (Полный review с тестированием MCP workflow)

---

## Статус исправлений

| # | Проблема | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Templates не загружаются | ✅ ИСПРАВЛЕНО | `generate.ts:214-231` загружает контент для ESSENTIAL/FULL |
| 2 | UI-Plan колонки | ✅ ИСПРАВЛЕНО | Колонки приходят из analysis, передаются в plan |
| 3 | VcField вместо VcForm | ✅ ИСПРАВЛЕНО | `planner.ts:143-155` корректно обрабатывает fallback |
| 4 | discoveredComponents пустой | ✅ ИСПРАВЛЕНО | Переписан `discover.ts` с паттернами из vendor-portal |
| 5 | Rules без контента | ⚠️ ЧАСТИЧНО | Patterns загружаются, но rules всё ещё stubs |
| 6 | App detection в workflow | ✅ ИСПРАВЛЕНО | Добавлен `suggestedAction` с `scaffold_app` tool |
| 7 | Lazy Loading vs Full | ✅ РЕШЕНО | Используется Full Content Mode с ESSENTIAL/FULL levels |
| 8 | Синтезаторы не используются | ⚠️ BACKLOG | По дизайну - AI генерирует код |

---

## Оставшиеся проблемы

### 1. ✅ ИСПРАВЛЕНО: discoveredComponents всегда пустой массив

**Решение:** Переписан `src/workflows/steps/discover.ts` с использованием паттернов из реального vendor-portal:
- Добавлен mapping `FEATURE_COMPONENTS` для feature → components
- Добавлен mapping `COLUMN_TYPE_COMPONENTS` для column types → components
- Компоненты обнаруживаются на основе blade type, features, column specs, field specs
- Toolbars используют `IBladeToolbar[]`, не VcButton компоненты
- VcField только для read-only отображения, формы используют vee-validate Field

---

### 2. ✅ ИСПРАВЛЕНО: Rules интегрированы в workflow

**Решение:** Rules теперь автоматически загружаются в generate step:

1. Добавлен `RulesLoader` в `WorkflowContext` (`src/workflows/types.ts`)
2. Инициализация `RulesLoader` в `src/mcp/server.ts`
3. Загрузка applicable rules в `GenerateStepExecutor.buildGenerationGuide()`
4. Форматирование rules для AI в `formatRule()` method
5. Rules включаются в context для ESSENTIAL и FULL levels

**Файлы изменены:**
- `src/workflows/types.ts` - добавлен `rulesLoader` в WorkflowContext
- `src/mcp/server.ts` - инициализация RulesLoader
- `src/workflows/steps/generate.ts` - загрузка и форматирование rules

---

## Структурные улучшения

### 3. ✅ ИСПРАВЛЕНО: App detection с suggestedAction

**Решение:** Добавлен `SuggestedAction` interface и логика в:
- `src/utils/app-detector.ts` - возвращает `suggestedAction` для всех случаев невалидного app
- `src/mcp/handlers/workflow.ts` - передает `suggestedAction` в response с `needsApp: true`

**Новое поведение:**
```json
{
  "success": false,
  "needsApp": true,
  "message": "No valid VC-Shell app found. Create a new VC-Shell app 'my-app' in /path/to/dir",
  "suggestedAction": {
    "tool": "scaffold_app",
    "params": { "projectName": "my-app", "targetDirectory": "/path/to/dir" },
    "description": "Create a new VC-Shell app 'my-app' in /path/to/dir"
  }
}
```

---

### 4. 📝 Синтезаторы как fallback (backlog)

**Статус:** По дизайну AI генерирует код через AI_FULL strategy.

4 синтезатора существуют для потенциального COMPOSITION strategy:
- `VueSFCSynthesizer` - modify create-vc-app output
- `ComposableSynthesizer` - add features to composables
- `APIClientSynthesizer` - generate API client from schema
- `LocaleSynthesizer` - merge custom translations

**Решение:** Оставить как есть - могут быть полезны для будущего COMPOSITION mode без AI.

**Приоритет:** BACKLOG

---

## Проблемы валидации

### 5. ⚠️ CodeValidator требует расширения

**Текущий статус:** Базовая валидация работает через AST, но некоторые методы нужно дополнить.

**Файлы:**
- `src/intelligence/validators/code.ts`
- `src/intelligence/validators/ast-validator.ts`

**Что нужно улучшить:**
1. Добавить проверку всех обязательных секций Vue SFC
2. Улучшить валидацию TypeScript exports
3. Добавить проверку VC-Shell specific patterns

**Приоритет:** MEDIUM
**Оценка:** 3-4 часа

---

### 6. ⚠️ Feature validation требует расширения keywords

**Проблема:** Валидация features использует ограниченный набор keywords:

```typescript
const featureKeywords = {
  filters: ["filters", "filter"],
  multiselect: ["multiselect", "selection"],
  validation: ["validate", "rules"],
  sort: ["sort", "sortable"],
};
```

**Решение:** Расширить список и добавить AST-based detection:
```typescript
const featureKeywords = {
  filters: ["filters", "filter", "#filters", "activeFilterCount", "stagedFilters"],
  multiselect: ["multiselect", ":multiselect", "selectedItemIds", "selection-changed"],
  pagination: ["pages", "currentPage", "pagination-click", "onPaginationClick"],
  gallery: ["VcGallery", "images", "gallery"],
  widgets: ["useWidgets", "registerWidget", "VcWidget"],
  validation: ["useForm", "Field", "rules", "validate"],
  modifications: ["useModificationTracker", "modified", "setModified"],
};
```

**Приоритет:** MEDIUM
**Оценка:** 2-3 часа

---

## Проблемы качества кода

### 7. ⚠️ Использование типа `any`

**Текущий статус:** Много использований `any` в codebase

**Решение:** Постепенно заменять на proper types или generics

**Приоритет:** LOW
**Оценка:** 4-6 часов

---

### 8. ⚠️ Unit тесты

**Текущий статус:** 3 тестовых файла существуют:
- `app-detector.spec.ts`
- `feature-detection.spec.ts`
- `planner.spec.ts`

**Решение:** Расширить покрытие тестами:
- WorkflowOrchestrator
- All StepExecutors
- Validators (AST, Code, UIPlan)
- Resolvers (Component, Feature, Template)

**Приоритет:** MEDIUM
**Оценка:** 8-10 часов

---

## Новые фичи (предложения)

### 9. 🆕 Поддержка создания widgets через workflow

**Описание:** В промпте пользователь указывает widget integration:
```
Add SpecialPricesWidget to offer details blade
```

**Текущее поведение:** Игнорируется - нужно вызывать `generate_widget` отдельно

**Предложение:**
1. Парсить widget requirements из промпта
2. Автоматически вызывать `generate_widget` после создания blade
3. Регистрировать widget в blade

**Приоритет:** LOW
**Оценка:** 4-6 часов

---

### 10. 🆕 API Client generation из OpenAPI spec

**Описание:** Вместо mocked API, позволить указать OpenAPI/Swagger spec URL

**Предложение:**
1. Добавить параметр `apiSpec: "url or path"`
2. Парсить spec и генерировать typed client
3. Использовать в composables

**Приоритет:** LOW
**Оценка:** 8-10 часов

---

## План действий (обновлённый)

### Phase 1: Завершить текущие исправления ✅ ЗАВЕРШЕНО
1. [x] Fix template/pattern content loading ✅ DONE
2. [x] Fix VcField → VcForm ✅ DONE
3. [x] Fix discoveredComponents в discover_components_and_apis handler ✅ DONE (2025-11-25)
4. [x] Улучшить app detection с suggestedAction ✅ DONE (2025-11-25)

### Phase 2: Валидация и качество ✅ ЗАВЕРШЕНО (без тестов)
1. [x] Заменить yup на vee-validate ✅ DONE (2025-11-25)
2. [x] Расширить feature validation keywords ✅ DONE (2025-11-25)
3. [x] Интегрировать rules loading в workflow ✅ DONE (2025-11-25)
4. [ ] Добавить unit тесты для критических путей (ОТЛОЖЕНО)

### Phase 3: Новые фичи (по необходимости)
1. [ ] Widget generation через workflow
2. [ ] API Client из OpenAPI spec
3. [ ] Reduce `any` usage

---

## Тестовые сценарии

После исправлений, протестировать на:

1. **Simple module:** "Create vendors module with list and details"
2. **Complex module (offers):** Full prompt from this analysis
3. **Multiple entities:** "Create orders module with orders, order-items, customers"
4. **Widget integration:** "Create dashboard with stats widget"
5. **No existing app:** "Create new app in /empty/dir and offers module"

---

## Метрики успеха (обновлённые)

- [x] Template content appears in generation guide ✅ WORKING
- [x] Correct component types (VcForm for details) ✅ WORKING
- [x] discoveredComponents contains relevant components in discover step ✅ FIXED (2025-11-25)
- [x] Patterns load with full content ✅ WORKING
- [x] App detection returns suggestedAction ✅ FIXED (2025-11-25)
- [ ] Feature validation catches missing implementations
- [x] Type checking via vue-tsc available ✅ WORKING (check_types tool)
- [ ] Full offers module generates without manual intervention

---

## Результаты тестирования (2025-11-25)

### Тест: Offers Module Workflow

**Промпт:** Complex offers module with list, details, filters, gallery, widgets

**Результаты:**

1. **analyze_prompt_v2** - ✅ Работает
   - Возвращает analysis prompt и schema
   - AI должен проанализировать и передать JSON в discover

2. **discover_components_and_apis** - ⚠️ Частично
   - `discoveredComponents: []` - пустой массив!
   - `discoveredAPIs: [4 items]` - корректно находит hooks
   - Проблема: ComponentResolver не вызывается или возвращает пустой результат

3. **create_ui_plan_from_analysis_v2** - ✅ Работает
   - Корректно создаёт plan с columns из analysis
   - VcTable для list, VcForm для details
   - Sections корректно группируют fields

4. **validate_ui_plan** - ✅ Работает
   - `valid: true`, без ошибок и warnings

5. **generate_with_composition** - ⚠️ Требует app
   - Первый вызов без app: возвращает ошибку
   - После scaffold_app: работает корректно
   - Template и patterns загружаются в context

6. **scaffold_app** - ✅ Работает
   - Создаёт offers-app в указанной директории

**Критические находки:**
- discoveredComponents всегда `[]` в discover step
- Но generate step НАХОДИТ компоненты через discoverComponents()
- Есть дублирование логики между handlers и steps

**Рекомендация:**
Синхронизировать логику component discovery между:
- `src/mcp/handlers/workflow.ts:discoverComponentsAndAPIsHandler`
- `src/workflows/steps/generate.ts:discoverComponents()`
