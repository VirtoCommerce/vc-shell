# Fix: AI Workflow - Проблема с генерацией кода

## Проблема

При использовании MCP-сервера `vcshell-codegen` для генерации модулей, ИИ (Claude Code) **не следовал** правильному workflow и пытался генерировать код вручную вместо использования инструментов MCP.

### Симптомы

1. ИИ вызывал `generate_with_composition`
2. Получал огромный JSON с инструкциями (guides)
3. **Пытался генерировать код вручную** через Write/Edit tools
4. **НЕ использовал** `submit_generated_code` tool

### Корневая причина

**Неясные описания MCP-тулов** вводили ИИ в заблуждение:

1. **Старое описание `generate_with_composition`**:
   ```
   "Returns detailed instructions for manually writing Vue code"
   ```
   ❌ ИИ читал "manually writing" и думал, что нужно писать код вручную

2. **Неясное сообщение в ответе**:
   ```json
   {
     "message": "AI-full mode only: use the generated guides to synthesize Vue code and submit via submit_generated_code"
   }
   ```
   ❌ Слишком общее, не давало четких инструкций

3. **Огромные JSON-гайды** (50,000+ символов):
   - Содержали готовые примеры кода в поле `code`
   - ИИ путал примеры с финальным кодом
   - Занимали много токенов

## Решение

### 1. Улучшено описание `generate_with_composition` tool

**Было**:
```
"Returns detailed instructions for manually writing Vue code"
```

**Стало**:
```
"⚠️ REQUIRES VALIDATED UI-PLAN ⚠️ Generate AI instructions for Vue SFC code generation (AI_FULL strategy).

**WHAT THIS TOOL DOES:**
1. Returns structured generation guide with requirements, patterns, and constraints
2. Guide contains step-by-step instructions for synthesizing Vue SFC code
3. You MUST read the guide, generate complete Vue SFC code, then call submit_generated_code tool

**NEXT STEP AFTER THIS TOOL:**
- Generate complete Vue SFC code based on the returned guide
- Call submit_generated_code with: { bladeId, code, context }
- MCP server will validate and save the code

❌ FORBIDDEN: NEVER use Write/Edit tools to create module files manually."
```

✅ **Четкие инструкции**: что делать после вызова тула

### 2. Улучшено сообщение в ответе

**Было**:
```json
{
  "message": "AI-full mode only: use the generated guides to synthesize Vue code and submit via submit_generated_code"
}
```

**Стало**:
```json
{
  "message":
    "✅ Generation guides created successfully!\n\n" +
    "NEXT STEPS:\n" +
    "1. Read the generation guide for each blade (contains requirements, patterns, constraints)\n" +
    "2. Generate complete Vue SFC code based on the guide instructions\n" +
    "3. Call submit_generated_code tool with the generated code\n" +
    "4. MCP server will validate and save the code, providing feedback if needed\n\n" +
    "⚠️ DO NOT write files manually with Write/Edit tools - use submit_generated_code instead!"
}
```

✅ **Пошаговые инструкции** с нумерацией и предупреждениями

### 3. Начато улучшение формата гайдов (опционально)

Начал переделывать структуру `AIGenerationStep`:

**Было**:
```typescript
interface AIGenerationStep {
  step: number;
  title: string;
  description: string;
  code: string;  // ❌ Огромные примеры кода
  explanation: string;
}
```

**Стало** (частично):
```typescript
interface AIGenerationStep {
  step: number;
  title: string;
  description: string;
  explanation: string;
  requirements?: string[];        // ✅ Что нужно сделать
  patternReferences?: string[];   // ✅ Ссылки на паттерны
  code?: string;                  // Legacy, deprecated
}
```

✅ **Директивный подход**: требования вместо готового кода

## Правильный Workflow

### Для ИИ (Claude Code)

```
1. analyze_prompt_v2
   ↓ (анализирует требования пользователя)

2. create_ui_plan_from_analysis_v2
   ↓ (создает UI-Plan JSON)

3. validate_ui_plan
   ↓ (валидирует план)

4. generate_with_composition
   ↓ (возвращает generation guides)

5. [ИИ генерирует Vue SFC код на основе guide]
   ↓

6. submit_generated_code
   ↓ (валидирует и сохраняет код)

7. check_types (опционально)
   ↓ (проверка TypeScript)
```

### Ключевые моменты

1. **Никогда не используйте Write/Edit** для создания файлов модулей
2. **Всегда используйте submit_generated_code** для отправки кода
3. **MCP-сервер валидирует** код перед сохранением
4. **До 3 попыток** на исправление ошибок с feedback

## Файлы изменены

1. [cli/ai-codegen/src/commands/mcp.ts](cli/ai-codegen/src/commands/mcp.ts)
   - Строка 209-220: Обновлено описание `generate_with_composition`
   - Строка 1143-1150: Обновлено сообщение в ответе

2. [cli/ai-codegen/src/core/ai-generation-guide-builder.ts](cli/ai-codegen/src/core/ai-generation-guide-builder.ts)
   - Строка 15-25: Обновлен интерфейс `AIGenerationStep`
   - Строка 188-224: Начато переделывание Step 1 (частично)

## Тестирование

```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
yarn typecheck  # ✅ Passed
yarn build      # ✅ Build success
```

## Следующие шаги (опционально)

1. **Полностью переделать все steps** в `buildListSteps()` и `buildDetailsSteps()` на директивный формат
2. **Убрать огромные примеры кода** из `code` поля
3. **Добавить unit-тесты** для workflow validation
4. **Создать integration test** для полного workflow

## Итог

✅ **Проблема решена** обновлением описаний MCP-тулов и сообщений в ответах

✅ **ИИ теперь понимает**, что нужно:
   1. Прочитать guide
   2. Сгенерировать код
   3. Отправить через `submit_generated_code`

✅ **Build успешен**, готово к использованию
