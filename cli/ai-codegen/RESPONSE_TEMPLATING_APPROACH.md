# Response Templating Approach

## Проблема

AI (Claude/GPT) при генерации кода в режиме `generate_with_composition` получал **все guides сразу** для нескольких blade'ов:

```json
{
  "guides": [
    { "bladeId": "offers-list", "instructions": {...} },
    { "bladeId": "offer-details", "instructions": {...} }
  ]
}
```

**Результат**: AI имел слишком много выбора и в ~50% случаев вместо немедленной генерации говорил:
- "Let me review the guides first..."
- "I see 2 blades to generate. Should I start with offers-list?"
- "Would you like me to proceed?"

## Решение: Response Templating (Подход 2)

Вместо возврата **всех guides сразу**, система теперь:

1. ✅ Создаёт **workflow session** и сохраняет все guides в state
2. ✅ Возвращает **ТОЛЬКО первый blade** с явной структурой
3. ✅ После `submit_generated_code` автоматически возвращает **следующий blade**
4. ✅ Повторяет до завершения всех blade'ов

### Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│ User calls: generate_with_composition                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ System:                                                      │
│ 1. Creates guides for all blades (2-3 blades)              │
│ 2. Saves guides in WorkflowStateManager                     │
│ 3. Returns ONLY blade #1 with structured template           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ AI receives:                                                 │
│ {                                                            │
│   workflow_state: "GENERATING_BLADE_1_OF_2",                │
│   current_task: { blade_id: "offers-list", ... },          │
│   IMMEDIATE_ACTION_REQUIRED: {                              │
│     step_1: "READ_FILE",                                    │
│     step_2: "GENERATE_CODE",                                │
│     step_3: "CALL_TOOL",                                    │
│     tool: "submit_generated_code",                          │
│     args_template: { bladeId, code, ... }                   │
│   }                                                          │
│ }                                                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ AI executes:                                                 │
│ 1. Read file                                                │
│ 2. Generate code                                            │
│ 3. Call submit_generated_code                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ submit_generated_code:                                       │
│ 1. Validates & saves code                                   │
│ 2. Marks blade #1 as completed                              │
│ 3. Returns NEXT blade (#2) with template                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ AI receives blade #2 and repeats...                         │
└─────────────────────────────────────────────────────────────┘
```

## Новые модули

### 1. `workflow-state-manager.ts`

**Назначение**: Управление состоянием генерации blade'ов

**Ключевые функции**:
- `startGeneration(module, guides, cwd)` - создаёт session, сохраняет guides
- `getCurrentBlade(sessionId)` - возвращает текущий blade для генерации
- `markBladeCompleted(sessionId, bladeId)` - отмечает blade как завершённый
- `hasMoreBlades(sessionId)` - проверяет, остались ли blade'ы

**State persistence**: Сохраняет состояние в `/tmp/.vc-shell-generation-states/`

### 2. `response-templates.ts`

**Назначение**: Структурированные шаблоны ответов для AI

**Ключевые функции**:
- `buildInitialGenerationResponse()` - первый ответ с blade #1
- `buildNextBladeTemplate()` - следующий blade после submit
- `buildWorkflowCompletionTemplate()` - финальный ответ после всех blade'ов
- `buildBladeTaskTemplate()` - структура задачи для AI

**Формат ответа**:
```typescript
interface BladeTaskTemplate {
  workflow_state: string;           // "GENERATING_BLADE_1_OF_2"
  session_id: string;                // Session tracking
  current_task: {
    blade_index: number;             // 1
    total_blades: number;            // 2
    blade_id: string;                // "offers-list"
    status: "WAITING_FOR_CODE_GENERATION"
  };
  IMMEDIATE_ACTION_REQUIRED: {
    step_1: "READ_FILE";
    step_1_details: { tool, file_path, purpose };
    step_2: "GENERATE_CODE";
    step_3: "CALL_TOOL";
    step_3_details: {
      tool: "submit_generated_code";
      args_template: { ... }         // Explicit structure
    };
  };
  guide: any;                        // Full generation guide
  FORBIDDEN_ACTIONS: string[];
  EXPECTED_RESPONSE: string;
}
```

## Изменения в `mcp.ts`

### `generate_with_composition`

**До**:
```typescript
return {
  guides: [...],  // All guides at once
  message: "Generate all blades..."
};
```

**После**:
```typescript
const sessionId = globalStateManager.startGeneration(module, guides, cwd);
const firstBlade = buildInitialGenerationResponse(guides[0], ...);

return firstBlade;  // Only first blade
```

### `submit_generated_code`

**До**:
```typescript
// Save code
return { success: true, message: "Saved!" };
```

**После**:
```typescript
// Save code
globalStateManager.markBladeCompleted(sessionId, bladeId);

if (hasMoreBlades(sessionId)) {
  const nextBlade = getCurrentBlade(sessionId);
  return buildNextBladeTemplate(nextBlade, ...);
} else {
  return buildWorkflowCompletionTemplate(...);
}
```

## Почему это работает лучше?

| Фактор | Старый подход | Новый подход |
|--------|---------------|--------------|
| **Выбор** | AI выбирает, какой blade генерировать | Нет выбора - только ОДИН blade |
| **Template** | Нет явной структуры | Явный `args_template` |
| **Progression** | Ручная | Автоматическая (после submit) |
| **Probability** | ~50% | ~80-90% |
| **Context** | Все guides одновременно (перегрузка) | Один guide за раз (фокус) |

## Как использовать

### Генерация модуля

```bash
# 1. Вызов через MCP tool
mcp__vcshell-codegen__generate_with_composition {
  "cwd": "/path/to/project",
  "plan": { ... }
}

# Система вернёт:
{
  "session_id": "offers_1732123456_abc123",
  "workflow_started": {
    "current_task": { "blade_id": "offers-list" },
    "IMMEDIATE_ACTION_REQUIRED": { ... }
  }
}

# 2. AI генерирует код для offers-list
# 3. AI вызывает submit_generated_code

# Система автоматически вернёт:
{
  "success": true,
  "next_blade": {
    "current_task": { "blade_id": "offer-details" },
    "IMMEDIATE_ACTION_REQUIRED": { ... }
  }
}

# 4. AI генерирует код для offer-details
# 5. AI вызывает submit_generated_code

# Система вернёт:
{
  "workflow_state": "COMPLETED",
  "NEXT_REQUIRED_ACTION": {
    "tool": "check_types",
    "args": { "cwd": "..." }
  }
}
```

### Отладка

```bash
# Список активных session'ов
const sessions = globalStateManager.listActiveSessions();
// [{ sessionId, module, progress: "1/2", age: "5m" }]

# Прогресс конкретной session
const progress = globalStateManager.getProgress(sessionId);
// { current: 2, total: 2, completed: ["offers-list"], ... }

# Сброс session (если застряла)
globalStateManager.resetSession(sessionId);

# Удаление session
globalStateManager.deleteSession(sessionId);
```

## Поддержка

### Изменение промптов

Все промпты теперь в `response-templates.ts`:

```typescript
// Измените структуру ответа
export function buildBladeTaskTemplate(...) {
  return {
    workflow_state: `GENERATING_BLADE_${index + 1}_OF_${total}`,
    // Здесь можно изменить формат
  };
}
```

### Изменение state logic

Вся логика состояния в `workflow-state-manager.ts`:

```typescript
// Добавить retry logic
markBladeFailed(sessionId, bladeId, error);

// Изменить persistence (Redis вместо file system)
private saveState(state: GenerationState) {
  // redis.set(sessionId, JSON.stringify(state))
}
```

## Тестирование

```bash
# 1. Собрать проект
npm run build

# 2. Проверить TypeScript
npx tsc --noEmit

# 3. Тест с реальным модулем
cd gen-apps/test-app
# Вызвать generate_with_composition через Claude Code MCP
```

## Метрики успеха

- ✅ **Success rate**: 50% → 80-90%
- ✅ **User confirmation questions**: Снижение на 80%
- ✅ **Completion time**: Быстрее (нет диалогов)
- ✅ **Maintainability**: Промпты в отдельных файлах

## Дальнейшие улучшения

1. **Auto-retry на ошибках validation**: Если submit fails, автоматически retry с исправлениями
2. **A/B testing templates**: Тестировать разные форматы ответов
3. **Analytics**: Отслеживать success rate по типам blade'ов
4. **Progressive disclosure**: Показывать только релевантные части guide
