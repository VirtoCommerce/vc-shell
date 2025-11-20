# Strict Workflow Enforcement - Final Fix

## Проблемы которые были решены

### Проблема 1: Validation блокировалась из init

**Было:**
```typescript
validate_ui_plan: {
  allowedFrom: ["planned", "validated"]
}
```

ИИ не мог валидировать UI-Plan если `create_ui_plan_from_analysis_v2` вернул ошибку валидации, потому что состояние оставалось `init`.

**Стало:**
```typescript
validate_ui_plan: {
  allowedFrom: ["init", "planned", "validated"] // Теперь можно из init
}
```

### Проблема 2: ИИ пытался создавать файлы вручную

**Было:** ИИ видел ошибки workflow и пытался обойти систему, создавая файлы напрямую через Write/Edit.

**Стало:** Добавлены **СТРОГИЕ ЗАПРЕТЫ** в descriptions:

```typescript
"generate_with_composition":
  "... ❌ FORBIDDEN: NEVER create module files manually using Write/Edit tools.
   ALWAYS follow the workflow and use MCP tools. Manual file creation bypasses
   validation, patterns, and best practices."

"submit_generated_code":
  "... ❌ FORBIDDEN: NEVER write code directly to files using Write/Edit tools.
   ALWAYS use this tool to submit code. This ensures validation, type checking,
   and pattern compliance."
```

## Правильный Workflow теперь

### Вариант 1: Полный workflow (с анализом)

```
1. init → analyze_prompt_v2 → init (получить инструкции)
2. init → create_ui_plan_from_analysis_v2 → planned
3. planned → validate_and_fix_plan → validated
4. validated → generate_with_composition → generated
5. generated → submit_generated_code → code_submitted
6. code_submitted → check_types → completed
```

### Вариант 2: Прямой workflow (без analyze)

```
1. init → create_ui_plan_from_analysis_v2 (inline analysis) → planned
2. planned → validate_and_fix_plan → validated
3. validated → generate_with_composition → generated
4. generated → submit_generated_code → code_submitted
5. code_submitted → check_types → completed
```

### Вариант 3: Recovery workflow (если create_ui_plan вернул ошибку)

```
1. init → create_ui_plan_from_analysis_v2 → ❌ validation error (state: init)
2. init → validate_and_fix_plan (с тем же планом) → validated
3. validated → generate_with_composition → generated
```

## Разрешенные состояния для каждого инструмента

| Инструмент | Разрешенные состояния | Следующее состояние |
|------------|----------------------|---------------------|
| `analyze_prompt_v2` | `init` | `init` (не меняется) |
| `create_ui_plan_from_analysis_v2` | `init`, `analyzed` | `planned` |
| `validate_ui_plan` | `init`, `planned`, `validated` | `validated` |
| `validate_and_fix_plan` | `init`, `planned`, `validated` | `validated` |
| `generate_with_composition` | `validated` | `generated` |
| `submit_generated_code` | `generated`, `code_submitted` | `code_submitted` |
| `check_types` | `generated`, `code_submitted`, `completed` | `completed` |

## Примеры сценариев

### ✅ Сценарий 1: Успешный create_ui_plan

```bash
# State: init
create_ui_plan_from_analysis_v2({ analysis: {...} })
# → Success, state: planned

validate_and_fix_plan({ plan: {...} })
# → Success, state: validated

generate_with_composition({ plan: {...} })
# → Success, state: generated
```

### ✅ Сценарий 2: create_ui_plan вернул ошибку валидации

```bash
# State: init
create_ui_plan_from_analysis_v2({ analysis: {...} })
# → Error: "Generated UI-Plan failed validation"
# State: init (не изменился)

# ИИ может исправить план и валидировать напрямую
validate_and_fix_plan({ plan: {...} })
# → Success, state: validated

generate_with_composition({ plan: {...} })
# → Success, state: generated
```

### ❌ Сценарий 3: ИИ пытается создать файлы вручную (ЗАПРЕЩЕНО)

```bash
# State: validated
generate_with_composition({ plan: {...} })
# → Returns AI instructions

# ❌ ИИ НЕ ДОЛЖЕН делать:
Write({ file_path: "src/modules/offers/pages/offers-list.vue", content: "..." })
# ❌ FORBIDDEN! Должен использовать submit_generated_code

# ✅ ИИ ДОЛЖЕН делать:
submit_generated_code({ bladeId: "offers-list", code: "...", context: {...} })
# → Success, validation, saving
```

## Почему запрещено создавать файлы вручную

### 1. **Bypasses Validation**
Ручное создание файлов пропускает:
- Syntax validation
- TypeScript type checking
- Vue template validation
- Pattern compliance checks

### 2. **Bypasses Best Practices**
Пропускает:
- Naming conventions (kebab-case)
- Import optimization
- i18n usage ($t() for all text)
- Composable patterns
- Structure requirements

### 3. **No Retry Mechanism**
`submit_generated_code` дает до 3 попыток с детальным фидбеком. Ручное создание = одна попытка без фидбека.

### 4. **No Metrics**
Система не может отследить:
- Success rate
- Common errors
- Performance
- Quality metrics

## Enforcement через descriptions

Теперь **каждый** критический инструмент имеет `❌ FORBIDDEN` секцию:

```typescript
{
  name: "generate_with_composition",
  description: "... ❌ FORBIDDEN: NEVER create module files manually..."
}

{
  name: "submit_generated_code",
  description: "... ❌ FORBIDDEN: NEVER write code directly to files..."
}
```

## Debug Workflow

```bash
# Проверить текущее состояние
get_workflow_status()

# Если workflow заблокирован:
# 1. Смотрим currentStep
# 2. Смотрим recommendation
# 3. Следуем рекомендации

# Если validation не работает из planned:
# → Можно вызвать из init с plan напрямую
```

## Обновленный workflow orchestrator

### Файл: `workflow-orchestrator.ts`

**Изменения:**

1. ✅ `validate_ui_plan` и `validate_and_fix_plan` разрешены из `init`
2. ✅ Убраны блокировки для init в validation
3. ✅ Workflow может recover после ошибок validation

### Файл: `mcp.ts`

**Изменения:**

1. ✅ Добавлены `❌ FORBIDDEN` секции в descriptions
2. ✅ Явные предупреждения против ручного создания файлов

## Метрики и Мониторинг

### Разрешенные действия
- ✅ Использование MCP tools
- ✅ Следование workflow последовательности
- ✅ submit_generated_code для сохранения кода

### Запрещенные действия
- ❌ Write/Edit для создания module файлов
- ❌ Прямое создание .vue/.ts файлов
- ❌ Обход workflow validation
- ❌ Пропуск submit_generated_code

## Summary

### ✅ Что теперь работает

1. **Validation из любого состояния** - `validate_ui_plan` может исправить невалидный план из `init`
2. **Строгие запреты** - ИИ **НЕ МОЖЕТ** создавать файлы вручную (descriptions forbid it)
3. **Recovery workflow** - если `create_ui_plan` failed, можно продолжить с `validate_and_fix_plan`
4. **Clear error messages** - каждая блокировка объясняет что делать

### 📝 Ключевые правила

1. **ВСЕГДА** используйте MCP tools для генерации
2. **НИКОГДА** не создавайте файлы через Write/Edit
3. **ВСЕГДА** используйте `submit_generated_code`
4. **СЛЕДУЙТЕ** workflow sequence
5. **НЕ ПЫТАЙТЕСЬ** обойти систему

---

**Файлы обновлены:**
- ✅ `cli/ai-codegen/src/commands/mcp/workflow-orchestrator.ts`
- ✅ `cli/ai-codegen/src/commands/mcp.ts`
- ✅ `cli/ai-codegen/STRICT_WORKFLOW_ENFORCEMENT.md` (этот файл)

**Проект собран успешно. Workflow теперь строго контролируется! 🔒**
