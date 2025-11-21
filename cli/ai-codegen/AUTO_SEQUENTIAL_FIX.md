# Auto-Sequential Generation Fix

## Проблема

При вызове `generate_with_composition` **без** параметра `bladeId`, когда в плане несколько blade'ов (например, `offers-list` и `offer-details`), система:

1. ❌ Проверяла размер ответа (estimated ~32K tokens для 2 blades)
2. ❌ **Возвращала ошибку** и **не создавала файлы**
3. ❌ Требовала от пользователя вручную вызывать с `bladeId` для каждого blade

```json
{
  "success": false,
  "error": "Response too large",
  "bladesCount": 2,
  "estimatedTokens": 32000,
  "maxTokens": 25000,
  "suggestion": "Use 'bladeId' parameter to generate one blade at a time.",
  "note": "⚠️ NO FILES WERE CREATED. Generate blades one at a time using bladeId parameter."
}
```

**Результат**: AI получал ошибку и **не мог продолжить** автоматически.

## Решение

Изменили логику в [mcp.ts:1114-1130](cli/ai-codegen/src/commands/mcp.ts#L1114-L1130):

### ДО (старый код):

```typescript
if (!bladeId && bladesToGenerate.length > 1) {
  if (estimatedTotalTokens > 20000) {
    return {  // ❌ Возвращаем ошибку и ОСТАНАВЛИВАЕМСЯ
      success: false,
      error: "Response too large",
      ...
    };
  }
}
```

### ПОСЛЕ (новый код):

```typescript
if (!bladeId && bladesToGenerate.length > 1) {
  if (estimatedTotalTokens > 20000) {
    console.error(
      `[generate_with_composition] Multiple blades detected (${bladesToGenerate.length}). ` +
      `Using sequential workflow with state manager.`
    );

    // ✅ НЕ возвращаем ошибку - продолжаем генерацию
    // Workflow с state manager обработает это автоматически
  }
}
```

## Как это работает теперь

### Сценарий: 2 blade'а в плане

```typescript
// AI вызывает:
generate_with_composition({
  cwd: "/path/to/project",
  // НЕТ bladeId - генерируем все
})

// Система:
// 1. Обнаруживает 2 blade'а
// 2. Логирует: "Multiple blades detected. Using sequential workflow."
// 3. Создаёт session с WorkflowStateManager
// 4. Генерирует базовые файлы для ОБОИХ blade'ов через create-vc-app
// 5. Возвращает ТОЛЬКО первый blade с инструкциями

// AI получает:
{
  "session_id": "offers_123",
  "workflow_started": {
    "workflow_state": "GENERATING_BLADE_1_OF_2",
    "current_task": { "blade_id": "offers-list" },
    "IMMEDIATE_ACTION_REQUIRED": { ... }
  }
}

// AI генерирует код для blade #1 и вызывает submit_generated_code

// Система автоматически возвращает blade #2:
{
  "success": true,
  "next_blade": {
    "workflow_state": "GENERATING_BLADE_2_OF_2",
    "current_task": { "blade_id": "offer-details" },
    "IMMEDIATE_ACTION_REQUIRED": { ... }
  }
}

// AI генерирует код для blade #2 и вызывает submit_generated_code

// Система возвращает completion:
{
  "workflow_state": "COMPLETED",
  "summary": { "completed_blades": ["offers-list", "offer-details"] },
  "NEXT_REQUIRED_ACTION": { "tool": "check_types" }
}
```

## Преимущества

| Аспект | До | После |
|--------|-----|-------|
| **User experience** | ❌ Ошибка → ручной retry | ✅ Автоматическая обработка |
| **File creation** | ❌ Нет файлов при ошибке | ✅ Создаются сразу все базовые файлы |
| **Workflow** | ❌ Прерывается | ✅ Продолжается автоматически |
| **AI confusion** | ❌ Не знает, что делать | ✅ Получает чёткие инструкции |

## Интеграция с Response Templating

Это исправление **дополняет** основной Response Templating approach:

1. **Убирает блокировку** при множественных blade'ах
2. **Позволяет workflow'у работать** как задумано
3. **Автоматически переключается** в sequential mode

## Тестирование

```bash
# 1. Build
npm run build

# 2. Test с модулем из 2 blade'ов
# Вызов generate_with_composition БЕЗ bladeId
# Ожидаемый результат:
# - Console log: "Multiple blades detected. Using sequential workflow."
# - Создаются базовые файлы для обоих blade'ов
# - Возвращается первый blade с session_id
# - После submit автоматически возвращается второй blade
```

## Файлы изменены

- [mcp.ts:1114-1130](cli/ai-codegen/src/commands/mcp.ts#L1114-L1130) - убрана блокировка с error return

## Связанные документы

- [RESPONSE_TEMPLATING_APPROACH.md](RESPONSE_TEMPLATING_APPROACH.md) - основной подход
- [QUICK_START_RESPONSE_TEMPLATING.md](QUICK_START_RESPONSE_TEMPLATING.md) - быстрый старт
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - технический summary

## Дата

2024-11-20
