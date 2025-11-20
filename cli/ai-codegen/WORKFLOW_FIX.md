# Workflow Fix: analyze_prompt_v2 Behavior

## Проблема

Оркестратор блокировал `create_ui_plan_from_analysis_v2` после вызова `analyze_prompt_v2`, что приводило к ошибкам:

```
User calls: start_module_workflow
  → Returns analysis instructions

AI calls: analyze_prompt_v2
  → Returns instructions (но state меняется на "analyzed")

AI calls: create_ui_plan_from_analysis_v2
  → ❌ BLOCKED: "UI-Plan already created"
     (потому что state уже "analyzed" → "planned")
```

## Решение

### Изменение 1: `analyze_prompt_v2` НЕ меняет состояние

**До:**
```typescript
analyze_prompt_v2: {
  allowedFrom: ["init"],
  nextState: "analyzed",  // ❌ Менял состояние
}
```

**После:**
```typescript
analyze_prompt_v2: {
  allowedFrom: ["init"],
  nextState: "init",  // ✅ Остается в init, только возвращает инструкции
}
```

### Изменение 2: `create_ui_plan_from_analysis_v2` может работать из `init`

**До:**
```typescript
create_ui_plan_from_analysis_v2: {
  allowedFrom: ["analyzed"],  // ❌ Требовал analyzed
  nextState: "planned",
}
```

**После:**
```typescript
create_ui_plan_from_analysis_v2: {
  allowedFrom: ["init", "analyzed"],  // ✅ Может работать из init с inline анализом
  nextState: "planned",
}
```

### Изменение 3: Убрана блокировка для init в create_ui_plan

**До:**
```typescript
create_ui_plan_from_analysis_v2: {
  init: "Cannot create UI-Plan without analysis...",  // ❌ Блокировал
  planned: "UI-Plan already created...",
}
```

**После:**
```typescript
create_ui_plan_from_analysis_v2: {
  // init убран - теперь разрешен
  planned: "UI-Plan already created...",
}
```

## Правильное использование

### Вариант 1: Прямой вызов с inline анализом (рекомендуется)

```typescript
// ИИ сразу создает анализ и передает в create_ui_plan_from_analysis_v2
const analysis = {
  moduleName: "offers",
  entities: [...]
};

create_ui_plan_from_analysis_v2({ analysis })
// ✅ Работает из state: init → planned
```

### Вариант 2: Через analyze_prompt_v2 (для получения инструкций)

```typescript
// Шаг 1: Получить инструкции (state остается init)
const instructions = analyze_prompt_v2({ prompt: "..." })
// State: init (не меняется)

// Шаг 2: ИИ создает анализ вручную по инструкциям
const analysis = { /* JSON созданный вручную */ };

// Шаг 3: Передать анализ
create_ui_plan_from_analysis_v2({ analysis })
// State: init → planned
```

### Вариант 3: Guided workflow (автоматический)

```typescript
// start_module_workflow уже включает инструкции для анализа
start_module_workflow({ prompt: "...", cwd: "..." })

// Возвращает инструкции для step 1 (анализ)
// ИИ должен сразу создать analysis JSON и передать в:
create_ui_plan_from_analysis_v2({ analysis })
```

## Роль analyze_prompt_v2

**⚠️ ВАЖНО:** `analyze_prompt_v2` это **helper инструмент**, который:

1. ✅ Возвращает **инструкции** для глубокого анализа
2. ✅ Возвращает **JSON Schema** для валидации
3. ✅ Дает **примеры** анализа
4. ❌ **НЕ выполняет** анализ сам
5. ❌ **НЕ меняет** состояние workflow

Это **документация** для ИИ, а не функция анализа!

## Workflow States

```
┌──────────────────────────────────────────────────────────┐
│ init                                                     │
│  ↓                                                       │
│  ├─ analyze_prompt_v2 (опционально - только инструкции) │
│  │  └─ State: init (не меняется!)                       │
│  │                                                       │
│  └─ create_ui_plan_from_analysis_v2                     │
│     └─ State: init → planned                            │
│                                                          │
│ planned                                                  │
│  ↓                                                       │
│  └─ validate_ui_plan / validate_and_fix_plan            │
│     └─ State: planned → validated                       │
│                                                          │
│ validated                                                │
│  ↓                                                       │
│  └─ generate_with_composition                           │
│     └─ State: validated → generated                     │
│                                                          │
│ generated                                                │
│  ↓                                                       │
│  └─ submit_generated_code                               │
│     └─ State: generated → code_submitted                │
│                                                          │
│ code_submitted                                           │
│  ↓                                                       │
│  └─ check_types                                         │
│     └─ State: code_submitted → completed                │
└──────────────────────────────────────────────────────────┘
```

## Примеры сценариев

### ✅ Сценарий 1: Корректный inline анализ

```typescript
// State: init

// ИИ создает analysis на основе промпта
const analysis = {
  moduleName: "offers",
  entities: [{
    name: "offers",
    blades: [...]
  }]
};

// Вызов с analysis
create_ui_plan_from_analysis_v2({ analysis })

// State: init → planned ✅
```

### ✅ Сценарий 2: С использованием analyze_prompt_v2

```typescript
// State: init

// Получить инструкции
const { instructions, schema } = analyze_prompt_v2({
  prompt: "Create offers module"
})

// State: init (не изменился)

// ИИ читает instructions и schema, создает analysis
const analysis = createAnalysis(prompt, instructions, schema);

// Передать analysis
create_ui_plan_from_analysis_v2({ analysis })

// State: init → planned ✅
```

### ❌ Сценарий 3: Неправильное использование (старое поведение)

```typescript
// State: init

analyze_prompt_v2({ prompt: "..." })
// State: init → analyzed (СТАРОЕ поведение - больше не происходит)

create_ui_plan_from_analysis_v2({ analysis: {...} })
// ❌ BLOCKED (в старой версии)
// ✅ WORKS (в новой версии, потому что state все еще init)
```

## Проверка работы

### Тест 1: Прямой вызов

```bash
# State должен быть init
get_workflow_status()
# currentStep: "init"

# Создать UI-Plan напрямую
create_ui_plan_from_analysis_v2({ analysis: {...} })
# ✅ Success

# State должен быть planned
get_workflow_status()
# currentStep: "planned"
```

### Тест 2: С analyze_prompt_v2

```bash
# State: init
get_workflow_status()

# Получить инструкции
analyze_prompt_v2({ prompt: "..." })
# ✅ Success

# State все еще init!
get_workflow_status()
# currentStep: "init"

# Создать UI-Plan
create_ui_plan_from_analysis_v2({ analysis: {...} })
# ✅ Success

# State: planned
get_workflow_status()
# currentStep: "planned"
```

## Итог

### ✅ Что исправлено

1. `analyze_prompt_v2` больше **не меняет состояние** workflow
2. `create_ui_plan_from_analysis_v2` может работать **из init** с inline анализом
3. Убрана блокировка для `create_ui_plan_from_analysis_v2` в состоянии `init`
4. Обновлены next step suggestions

### 🎯 Правильный workflow теперь

```
1. init → analyze_prompt_v2 (опционально) → init (без изменений)
2. init → create_ui_plan_from_analysis_v2 → planned
3. planned → validate_ui_plan → validated
4. validated → generate_with_composition → generated
5. generated → submit_generated_code → code_submitted
6. code_submitted → check_types → completed
```

### 📝 Ключевые моменты

- `analyze_prompt_v2` = helper для получения инструкций
- `create_ui_plan_from_analysis_v2` = первый реальный шаг workflow
- State меняется **только** при `create_ui_plan_from_analysis_v2`, не при `analyze_prompt_v2`
- ИИ может **пропустить** `analyze_prompt_v2` и сразу создать analysis inline

## Обновленная документация

Файлы обновлены:
- ✅ `cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts`
- 📝 `cli/ai-codegen/WORKFLOW_FIX.md` (этот файл)

Проект собран успешно. Workflow теперь работает корректно! 🚀
