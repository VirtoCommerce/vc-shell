# MCP Tools Reference Guide

Полная документация по всем MCP инструментам vcshell-codegen и правильной последовательности их использования.

## 📋 Оглавление

1. [Категории инструментов](#категории-инструментов)
2. [Workflow последовательность](#workflow-последовательность)
3. [Детальное описание инструментов](#детальное-описание-инструментов)
4. [Примеры использования](#примеры-использования)

---

## Категории инструментов

### 🏗️ App Scaffolding (Независимый workflow)
Создание нового приложения - не зависит от основного workflow генерации модулей.

- `scaffold_app` - Создание нового VC-Shell приложения

### 🔄 Workflow Critical (Строгая последовательность)
Эти инструменты ДОЛЖНЫ использоваться в строгом порядке:

1. `analyze_prompt_v2` ⚠️ **ОБЯЗАТЕЛЬНЫЙ ПЕРВЫЙ ШАГ**
2. `create_ui_plan_from_analysis_v2` ⚠️ Требует анализ
3. `validate_ui_plan` или `validate_and_fix_plan`
4. `generate_with_composition` ⚠️ Требует валидированный план
5. `submit_generated_code` (опционально)
6. `check_types` (опционально)

### 🛠️ Plan Helpers (Доступны после анализа)
Вспомогательные инструменты для работы с UI-Plan:

- `infer_blade_logic` - Автоматический вывод логики blade
- `get_composition_guide` - Получение гайда по композиции паттернов

### 🔍 Discovery (Всегда доступны)
Инструменты поиска и исследования - можно использовать на любом этапе:

**Components:**
- `search_components` - Поиск компонентов
- `view_components` - Детальная информация о компонентах
- `get_component_examples` - Примеры использования компонентов
- `search_components_by_intent` - Семантический поиск компонентов
- `get_component_capabilities` - Возможности компонента

**Framework APIs:**
- `search_framework_apis` - Поиск composables/plugins
- `view_framework_apis` - Детальная информация об API
- `search_framework_by_intent` - Семантический поиск API
- `get_framework_capabilities` - Возможности framework API
- `get_framework_examples` - Примеры кода framework API

### 📊 Workflow Management (Всегда доступны)
- `get_workflow_status` - Текущий статус workflow
- `start_module_workflow` - Guided workflow (рекомендуется)

### ✅ Quality Checks (Доступны после генерации)
- `get_audit_checklist` - Чеклист проверки кода
- `check_types` - TypeScript type checking

---

## Workflow последовательность

### Полный цикл генерации модуля

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE GENERATION WORKFLOW                   │
└─────────────────────────────────────────────────────────────────┘

Step 0: OPTIONAL (создание приложения)
├─ scaffold_app
│  └─ Создает базовую структуру VC-Shell приложения
│
Step 1: ANALYZE (ОБЯЗАТЕЛЬНО!)
├─ analyze_prompt_v2 ⚠️ MANDATORY FIRST STEP
│  ├─ Глубокий анализ промпта пользователя
│  ├─ Извлечение: entities, relationships, workflows, routes, actions
│  └─ Возвращает: Comprehensive analysis JSON
│
│  🔍 Discovery tools можно использовать параллельно:
│  ├─ search_components / view_components
│  └─ search_framework_apis / view_framework_apis
│
Step 2: PLAN
├─ create_ui_plan_from_analysis_v2 ⚠️ REQUIRES ANALYSIS
│  ├─ Преобразует analysis → UI-Plan JSON
│  ├─ Поддержка: multi-entity, custom routes, workflows
│  └─ Возвращает: UI-Plan JSON
│
│  🛠️ Plan helpers доступны:
│  ├─ infer_blade_logic (вывод логики blade)
│  └─ get_composition_guide (паттерны композиции)
│
Step 3: VALIDATE
├─ validate_ui_plan или validate_and_fix_plan
│  ├─ Проверка UI-Plan против schema
│  ├─ validate_and_fix_plan: автоматические исправления
│  └─ Возвращает: validation result + fixed plan (если нужно)
│
Step 4: GENERATE
├─ generate_with_composition ⚠️ REQUIRES VALIDATED PLAN
│  ├─ Генерация AI инструкций для написания кода
│  ├─ Для одного blade: указать bladeId
│  ├─ Для всех blades: не указывать bladeId
│  └─ Возвращает: Detailed AI instructions per blade
│
│  ➡️  ИИ пишет Vue SFC код вручную по инструкциям
│
Step 5: SUBMIT (опционально)
├─ submit_generated_code
│  ├─ Валидация AI-написанного кода
│  ├─ Сохранение в файловую систему
│  ├─ До 3 попыток с детальным фидбеком
│  └─ Возвращает: validation result + saved file paths
│
Step 6: VERIFY (опционально)
├─ check_types
│  ├─ Запуск vue-tsc type checking
│  └─ Возвращает: TypeScript errors list
│
└─ get_audit_checklist
   └─ Чеклист для ручной проверки кода
```

---

## Детальное описание инструментов

### 🏗️ scaffold_app

**Категория:** App Scaffolding
**Доступность:** Всегда
**Когда использовать:** Когда пользователь просит создать новое приложение

```typescript
scaffold_app({
  projectName: "offers-app",        // kebab-case
  targetDirectory: "/path/to/parent" // опционально
})
```

**Возвращает:**
```json
{
  "success": true,
  "path": "/path/to/parent/offers-app",
  "nextSteps": ["cd offers-app", "yarn install", "yarn serve"]
}
```

---

### ⚠️ analyze_prompt_v2

**Категория:** Workflow Critical (Step 1)
**Доступность:** Только в состоянии `init`
**Обязательность:** ⚠️ **MANDATORY FIRST STEP**

**Когда использовать:**
- Первый шаг при генерации любого модуля
- ВСЕГДА перед созданием UI-Plan

```typescript
analyze_prompt_v2({
  prompt: "Create offers management module with list and details",
  module: "offers" // опционально
})
```

**Возвращает:**
```json
{
  "success": true,
  "version": "V2 (Extended)",
  "instructions": "...", // Comprehensive analysis instructions
  "schema": { /* JSON Schema for analysis result */ },
  "capabilities": {
    "multipleEntities": true,
    "customRoutes": true,
    "workflows": ["linear", "branching", "parallel"],
    "features": "40+ features supported"
  }
}
```

**Что анализирует:**
- Entities (сущности)
- Relationships (связи между сущностями)
- Workflows (процессы, если есть)
- Custom routes (специальные маршруты)
- Custom actions (специальные действия)
- Permissions (права доступа)
- Features (фичи: filters, multiselect, validation, etc.)
- Data sources (API, GraphQL, static, computed)

---

### ⚠️ create_ui_plan_from_analysis_v2

**Категория:** Workflow Critical (Step 2)
**Доступность:** Только после `analyze_prompt_v2` (состояние `analyzed`)
**Обязательность:** ⚠️ **REQUIRES ANALYSIS**

```typescript
create_ui_plan_from_analysis_v2({
  analysis: { /* result from analyze_prompt_v2 */ }
})
```

**Возвращает:**
```json
{
  "success": true,
  "version": "V2 (Extended)",
  "plan": { /* UI-Plan JSON */ },
  "validation": { "valid": true },
  "statistics": {
    "entitiesCount": 2,
    "bladesCount": 4,
    "hasWorkflow": false,
    "complexity": "moderate"
  }
}
```

**UI-Plan структура:**
```json
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "offers",
  "blades": [
    {
      "id": "offers-list",
      "route": "/offers",
      "layout": "grid",
      "title": "Offers",
      "components": [{ "type": "VcTable", "columns": [...] }],
      "features": ["filters", "multiselect"],
      "logic": {
        "state": { "loading": {"source": "composable", "reactive": true} },
        "toolbar": [{"id": "save", "icon": "fas fa-save", "action": "save()"}],
        "handlers": {"onSave": "Save handler description"}
      }
    }
  ]
}
```

---

### validate_ui_plan / validate_and_fix_plan

**Категория:** Workflow Critical (Step 3)
**Доступность:** После `create_ui_plan_from_analysis_v2` (состояние `planned` или `validated`)

**validate_ui_plan** - только валидация:
```typescript
validate_ui_plan({
  plan: { /* UI-Plan JSON */ }
})
```

**validate_and_fix_plan** - валидация + автоисправления:
```typescript
validate_and_fix_plan({
  plan: { /* UI-Plan JSON */ }
})
```

**Возвращает:**
```json
{
  "valid": true,
  "fixed": true,
  "message": "UI-Plan fixed and validated successfully",
  "plan": { /* normalized/fixed plan */ },
  "changes": [
    "Converted id → key in columns",
    "Added missing route prefix /",
    "Fixed state objects structure"
  ]
}
```

**Что проверяет:**
- Соответствие JSON Schema
- Существование компонентов в registry
- Правильность routes (должны начинаться с `/`)
- kebab-case для module/blade IDs
- Правильность features (только разрешенные)
- Структура logic/state/toolbar

**Автоисправления (validate_and_fix_plan):**
- `id` → `key` в columns
- Добавление `/` в route
- Преобразование в kebab-case
- Исправление структуры state objects

---

### ⚠️ generate_with_composition

**Категория:** Workflow Critical (Step 4)
**Доступность:** Только после валидации (состояние `validated`)
**Обязательность:** ⚠️ **REQUIRES VALIDATED PLAN**

**generate_with_composition** - для одного или всех blades:
```typescript
generate_with_composition({
  plan: { /* validated UI-Plan */ },
  cwd: "/path/to/project",
  dryRun: false,
  bladeId: "offers-list" // опционально - для одного blade, если не указан - генерирует все
})
```

**Возвращает:**
```json
{
  "success": true,
  "strategy": "AI_FULL",
  "message": "Use the generated guides to synthesize Vue code",
  "guides": [
    {
      "bladeId": "offers-list",
      "decision": {
        "strategy": "AI_FULL",
        "complexity": 5,
        "reason": "Complex blade with filters and multiselect"
      },
      "instructions": "# Detailed instructions for writing Vue SFC code..."
    }
  ]
}
```

**Стратегия AI_FULL:**
- Генерирует детальные инструкции для ИИ
- НЕ создает файлы автоматически
- ИИ должен написать Vue SFC код вручную
- Инструкции включают:
  - Структуру компонента
  - Imports
  - Template с компонентами
  - Script setup с composables
  - Patterns для features

---

### submit_generated_code

**Категория:** Workflow Critical (Step 5)
**Доступность:** После генерации (состояние `generated` или `code_submitted`)

```typescript
submit_generated_code({
  bladeId: "offers-list",
  code: "<!-- Vue SFC code -->",
  composable: {
    name: "useOffersList",
    code: "// Composable code"
  },
  context: {
    module: "offers",
    layout: "grid",
    strategy: "AI_FULL"
  },
  retry: {
    attempt: 1,
    previousErrors: []
  }
})
```

**Возвращает (success):**
```json
{
  "success": true,
  "message": "Code validated and saved successfully",
  "files": {
    "blade": "/path/to/src/modules/offers/pages/offers-list.vue",
    "composable": "/path/to/src/modules/offers/composables/useOffersList.ts"
  },
  "validation": {
    "warnings": []
  },
  "nextSteps": [
    "Run development server to test",
    "Check browser console for errors"
  ]
}
```

**Возвращает (validation errors):**
```json
{
  "success": false,
  "message": "Code validation failed (Attempt 1/3)",
  "errors": [
    {
      "type": "typescript",
      "severity": "error",
      "message": "Property 'loading' does not exist on type '...'"
    }
  ],
  "suggestions": [
    "Ensure all composables return the correct types",
    "Check that all reactive refs are properly typed"
  ],
  "retry": {
    "canRetry": true,
    "nextAttempt": 2,
    "maxAttempts": 3
  }
}
```

**Валидация:**
- Syntax (Vue template + TypeScript)
- Structure (обязательные секции)
- TypeScript types
- До 3 попыток с фидбеком
- Fallback на composition strategy после 3 неудач

---

### check_types

**Категория:** Quality Checks
**Доступность:** После генерации (состояние `generated`, `code_submitted`, `completed`)

```typescript
check_types({
  cwd: "/path/to/project",
  fix: false // auto-fix пока не реализован
})
```

**Возвращает (no errors):**
```json
{
  "success": true,
  "message": "No type errors found!",
  "errors": []
}
```

**Возвращает (with errors):**
```json
{
  "success": false,
  "message": "Found 5 type errors",
  "errors": [
    {
      "file": "src/modules/offers/pages/offers-list.vue",
      "line": 42,
      "column": 10,
      "code": "TS2339",
      "message": "Property 'loading' does not exist on type '...'"
    }
  ]
}
```

---

### infer_blade_logic

**Категория:** Plan Helpers
**Доступность:** После анализа (состояние `analyzed` и далее)

```typescript
infer_blade_logic({
  blade: {
    id: "offers-list",
    layout: "grid",
    features: ["filters", "multiselect"],
    components: [...]
  },
  merge: false // merge with existing logic
})
```

**Возвращает:**
```json
{
  "blade": { "id": "offers-list", "layout": "grid" },
  "inferred": {
    "logic": {
      "state": {
        "loading": {"source": "composable", "reactive": true},
        "items": {"source": "composable", "reactive": true},
        "selectedIds": {"source": "composable", "reactive": true}
      },
      "toolbar": [
        {"id": "add", "icon": "fas fa-plus", "action": "openDetails()"}
      ],
      "handlers": {
        "onMount": "Load initial data",
        "onSearch": "Search items by keywords"
      }
    },
    "composable": {
      "name": "useOffersList",
      "returns": ["loading", "items", "selectedIds", "loadItems", "searchItems"]
    }
  },
  "description": "List blade with filters and multiselect",
  "merged": false
}
```

**Когда использовать:**
- Когда создаете UI-Plan вручную
- Чтобы понять какая логика нужна blade
- Для автодополнения logic секции

---

### get_composition_guide

**Категория:** Plan Helpers
**Доступность:** После анализа (состояние `analyzed` и далее)

```typescript
get_composition_guide({
  type: "list",
  features: ["filters", "multiselect"],
  complexity: "moderate"
})
```

**Возвращает:**
```markdown
# Pattern Composition Guide for LIST Blade

**Type:** list
**Features:** filters, multiselect
**Complexity:** moderate

## Selected Patterns (3)

### 1. List Blade Base Pattern
Core structure for list blades with VcTable...

### 2. Filters Pattern
Implementation of advanced filters...

### 3. Multiselect Pattern
Selection management and bulk actions...

## Composition Strategy

1. Study base pattern
2. Apply feature patterns
3. Compose cohesively
4. Follow rules strictly
5. Validate thoroughly

## Rules

**Structure:** List blades must use VcBlade + VcTable
**Naming:** PascalCase for components, camelCase for composables
**i18n:** Always use $t() for all user-facing text
```

---

### Discovery Tools

#### search_components
```typescript
search_components({
  query: "table",
  limit: 20,
  offset: 0
})
```

#### view_components
```typescript
view_components({
  components: ["VcTable", "VcForm"]
})
```

#### search_components_by_intent
```typescript
search_components_by_intent({
  intent: "I need to filter items by status",
  context: "list"
})
```

#### get_component_capabilities
```typescript
get_component_capabilities({
  component: "VcTable",
  capability: "filters-slot", // опционально
  includeExamples: true
})
```

---

### Workflow Management

#### get_workflow_status
```typescript
get_workflow_status()
```

**Возвращает:**
```json
{
  "success": true,
  "workflow": {
    "currentStep": "analyzed",
    "progress": "20%",
    "nextStep": "Use create_ui_plan_from_analysis_v2...",
    "hasAnalysis": true,
    "hasPlan": false
  },
  "sequence": [
    {
      "step": 1,
      "tool": "analyze_prompt_v2",
      "status": "completed",
      "required": true,
      "description": "Deep analysis of user prompt..."
    },
    {
      "step": 2,
      "tool": "create_ui_plan_from_analysis_v2",
      "status": "current",
      "required": true
    }
  ],
  "availableToolCategories": {
    "discovery": "Always available",
    "planHelpers": "Available",
    "qualityChecks": "Blocked - requires code generation first"
  }
}
```

#### start_module_workflow
```typescript
start_module_workflow({
  prompt: "Create offers management module",
  cwd: "/path/to/project",
  module: "offers" // опционально
})
```

**Возвращает:**
```json
{
  "success": true,
  "workflow": "started",
  "step": 1,
  "stepName": "analyze_prompt_v2",
  "message": "Guided workflow started...",
  "instructions": "...", // Analysis instructions
  "schema": { /* Analysis schema */ },
  "nextSteps": [
    "1. Read the comprehensive V2 instructions",
    "2. Analyze the prompt deeply",
    "3. Return valid JSON following schema",
    "4. After analysis, call create_ui_plan_from_analysis_v2"
  ]
}
```

---

## Примеры использования

### Пример 1: Полный workflow (ручной)

```typescript
// Step 1: Analyze
const analysis = await analyze_prompt_v2({
  prompt: "Create offers management with list and details"
});

// Step 2: Create UI-Plan
const planResult = await create_ui_plan_from_analysis_v2({
  analysis: analysis.result
});

// Step 3: Validate
const validation = await validate_and_fix_plan({
  plan: planResult.plan
});

// Step 4: Generate
const guides = await generate_with_composition({
  plan: validation.plan,
  cwd: "/path/to/project"
});

// Step 5: Write code manually based on guides
// ... AI writes Vue SFC code ...

// Step 6: Submit code
const submitResult = await submit_generated_code({
  bladeId: "offers-list",
  code: vueCode,
  context: { module: "offers", layout: "grid", strategy: "AI_FULL" }
});

// Step 7: Check types
const typeCheck = await check_types({
  cwd: "/path/to/project"
});
```

### Пример 2: Guided workflow (рекомендуется)

```typescript
// One tool to rule them all
const workflow = await start_module_workflow({
  prompt: "Create offers management module",
  cwd: "/path/to/project"
});

// Follow instructions returned by workflow
// Workflow will guide through all steps automatically
```

### Пример 3: Discovery во время разработки

```typescript
// Параллельно с основным workflow

// 1. Поиск компонентов
const components = await search_components_by_intent({
  intent: "I need to upload images",
  context: "details"
});

// 2. Изучение компонента
const vcGallery = await view_components({
  components: ["VcGallery"]
});

// 3. Примеры использования
const examples = await get_component_examples({
  query: "gallery",
  component: "VcGallery"
});

// 4. Поиск framework API
const apis = await search_framework_by_intent({
  intent: "I need to close blade after save",
  context: "details"
});

// 5. Детали API
const bladeNav = await view_framework_apis({
  apis: ["useBladeNavigation"]
});
```

---

## Troubleshooting

### ❌ "Workflow violation" error

**Причина:** Попытка использовать инструмент вне последовательности

**Решение:**
```typescript
// Проверить текущий статус
const status = await get_workflow_status();

// Следовать рекомендации из status.recommendation
```

### ❌ "UI-Plan validation failed"

**Причина:** Невалидная структура UI-Plan

**Решение:**
```typescript
// Использовать auto-fix
const fixed = await validate_and_fix_plan({
  plan: invalidPlan
});

// Изучить errors и changes
console.log(fixed.errors);
console.log(fixed.changes);
```

### ❌ "Code validation failed (Attempt 3/3)"

**Причина:** AI-написанный код не прошел валидацию 3 раза

**Решение:**
- Внимательно изучить errors и suggestions
- Проверить типы в composables
- Убедиться что все imports правильные
- При необходимости переписать код заново

---

## Best Practices

### ✅ DO

1. **Всегда начинайте с `analyze_prompt_v2`**
2. **Используйте `start_module_workflow` для guided experience**
3. **Валидируйте UI-Plan перед генерацией**
4. **Используйте discovery tools параллельно**
5. **Проверяйте типы после генерации кода**

### ❌ DON'T

1. **Не пропускайте анализ промпта**
2. **Не создавайте UI-Plan вручную без анализа**
3. **Не генерируйте код без валидации плана**
4. **Не игнорируйте workflow violations**
5. **Не забывайте про type checking**

---

## Debug Mode

```bash
# Включить debug режим
DEBUG_MCP=true MCP_METRICS_FILE=/tmp/metrics.json npx @vc-shell/ai-codegen mcp

# Логи будут в stderr:
# [MCP DEBUG] Tool call: analyze_prompt_v2 { prompt: '...' }
# [MCP DEBUG] Workflow blocked: create_ui_plan at step init
# [MCP DEBUG] Starting guided workflow for: Create offers module
```

---

## Summary

### Минимальный workflow:
1. `analyze_prompt_v2`
2. `create_ui_plan_from_analysis_v2`
3. `validate_and_fix_plan`
4. `generate_with_composition`
5. Написать код вручную
6. `submit_generated_code`

### Рекомендуемый workflow:
1. `start_module_workflow` (guided)
2. Следовать инструкциям
3. Использовать discovery tools по необходимости
4. `check_types` в конце

### Always available:
- Discovery tools (search/view components and APIs)
- Workflow management (status, guided workflow)
- App scaffolding
