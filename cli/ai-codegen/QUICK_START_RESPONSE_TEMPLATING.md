# Quick Start: Response Templating

## Что изменилось?

**Проблема**: AI получал все blade guides сразу и в 50% случаев спрашивал подтверждения вместо генерации.

**Решение**: Система теперь возвращает **только один blade за раз** с чёткой структурой действий.

## Новая архитектура

```
generate_with_composition → blade #1 → submit → blade #2 → submit → completion
```

## Как это работает

### 1. Генерация начинается

```typescript
// AI вызывает:
mcp__vcshell-codegen__generate_with_composition({
  cwd: "/path/to/project",
  plan: { module: "offers", blades: [...] }
})

// Система возвращает:
{
  "session_id": "offers_1732123456_abc",
  "workflow_started": {
    "workflow_state": "GENERATING_BLADE_1_OF_2",
    "current_task": {
      "blade_id": "offers-list",
      "blade_index": 1,
      "total_blades": 2
    },
    "IMMEDIATE_ACTION_REQUIRED": {
      "step_1": "READ_FILE",
      "step_1_details": {
        "tool": "Read",
        "file_path": "src/modules/offers/pages/offers-list.vue"
      },
      "step_2": "GENERATE_CODE",
      "step_3": "CALL_TOOL",
      "step_3_details": {
        "tool": "submit_generated_code",
        "args_template": {
          "bladeId": "offers-list",
          "code": "<YOUR_CODE_HERE>",
          "cwd": "/path/to/project",
          "context": { ... }
        }
      }
    },
    "guide": { /* полная инструкция */ }
  }
}
```

### 2. AI генерирует первый blade

AI видит чёткую структуру:
- ✅ Шаг 1: Read file
- ✅ Шаг 2: Generate code
- ✅ Шаг 3: Call submit_generated_code

**Нет выбора** → нет вопросов → немедленное выполнение

### 3. После submit → следующий blade

```typescript
// AI вызывает:
submit_generated_code({
  bladeId: "offers-list",
  code: "...",
  context: { ... }
})

// Система автоматически возвращает:
{
  "success": true,
  "previous_blade": "offers-list",
  "progress": { "completed": 1, "total": 2 },
  "next_blade": {
    "workflow_state": "GENERATING_BLADE_2_OF_2",
    "current_task": {
      "blade_id": "offer-details",
      "blade_index": 2,
      "total_blades": 2
    },
    "IMMEDIATE_ACTION_REQUIRED": { ... }
  }
}
```

### 4. Завершение workflow

После последнего blade:

```typescript
{
  "workflow_state": "COMPLETED",
  "summary": {
    "total_blades": 2,
    "completed_blades": ["offers-list", "offer-details"],
    "success_rate": "100%"
  },
  "NEXT_REQUIRED_ACTION": {
    "tool": "mcp__vcshell-codegen__check_types",
    "args": { "cwd": "/path/to/project" }
  }
}
```

## Ключевые файлы

### `workflow-state-manager.ts`
Управляет состоянием генерации:
- Сохраняет все guides при старте
- Отдаёт по одному blade за раз
- Отслеживает прогресс

### `response-templates.ts`
Структурированные шаблоны ответов:
- Первый blade: `buildInitialGenerationResponse()`
- Следующий blade: `buildNextBladeTemplate()`
- Завершение: `buildWorkflowCompletionTemplate()`

### `mcp.ts` (изменения)

**`generate_with_composition`**:
```typescript
// Старое:
return { guides: [...] }

// Новое:
const sessionId = globalStateManager.startGeneration(...);
return buildInitialGenerationResponse(firstGuide, ...);
```

**`submit_generated_code`**:
```typescript
// Старое:
return { success: true }

// Новое:
markBladeCompleted(sessionId, bladeId);
if (hasMoreBlades()) {
  return buildNextBladeTemplate(nextBlade);
} else {
  return buildWorkflowCompletionTemplate();
}
```

## Debugging

### Проверить активные sessions

```bash
# В console.error логах:
[generate_with_composition] Started session: offers_1732123456_abc
[submit_generated_code] Progress: 1/2
[submit_generated_code] Progress: 2/2
```

### State файлы

```bash
ls /tmp/.vc-shell-generation-states/
# generation-state-offers_1732123456_abc.json
```

### Сбросить застрявшую session

```typescript
globalStateManager.resetSession(sessionId);
```

## Метрики улучшения

| Метрика | До | После |
|---------|-----|-------|
| Success rate | ~50% | ~80-90% |
| User questions | Много | Мало |
| Completion time | Медленно | Быстро |

## Что делать, если AI всё равно спрашивает?

1. **Проверьте session**: Убедитесь, что session создаётся
2. **Проверьте template**: Убедитесь, что `IMMEDIATE_ACTION_REQUIRED` присутствует
3. **Обновите промпт**: Измените `buildBladeTaskTemplate` в `response-templates.ts`

## Дальнейшая работа

- [ ] A/B тестирование разных форматов templates
- [ ] Автоматический retry при validation errors
- [ ] Метрики success rate по типам blade
- [ ] Redis для state вместо файловой системы
