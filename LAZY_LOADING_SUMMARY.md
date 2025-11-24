# Lazy Loading Architecture - Краткое Описание

## Что Изменилось?

### Проблема
При генерации модулей `generate_with_composition` возвращал **очень большие ответы** (>25000 токенов), которые обрезались MCP сервером, из-за чего AI не получал всю информацию.

### Решение
Реализована **архитектура отложенной загрузки (Lazy Loading)**:

1. **`generate_with_composition`** теперь возвращает **только метаданные** (имена, ID, описания)
   - Размер ответа сократился с ~34 KB до ~3 KB (**91.7% меньше!**)
   - Никогда не превышает лимит в 25000 токенов

2. **AI сам запрашивает** полный контент нужных ресурсов через существующие MCP tools:
   - `view_components()` - детали компонентов
   - `view_framework_apis()` - детали хуков/composables
   - `get_best_template()` - полный код шаблона
   - `get_relevant_patterns()` - полная документация паттернов

## Новый Workflow

### До (Old):
```
1. analyze_prompt_v2
2. discover_components_and_apis
3. create_ui_plan_from_analysis_v2
4. validate_ui_plan
5. generate_with_composition → ❌ ОГРОМНЫЙ ответ (34 KB), обрезается
```

### После (New):
```
1. analyze_prompt_v2
2. discover_components_and_apis
3. create_ui_plan_from_analysis_v2
4. validate_ui_plan
5. generate_with_composition → ✅ Легкий ответ (3 KB) с метаданными
6. AI читает метаданные и решает что нужно
7. AI вызывает view_components(['VcTable', ...]) → получает детали
8. AI вызывает get_best_template({bladeType, features}) → получает шаблон
9. AI генерирует код
10. submit_generated_code
```

## Что Получает AI?

### Lightweight Guide (3 KB):

```json
{
  "components": [
    {
      "name": "VcTable",
      "description": "Data table component for displaying tabular data",
      "confidence": 0.95
    }
  ],
  "hooks": [
    {
      "name": "useBladeNavigation",
      "import": "@vc-shell/framework",
      "description": "Core blade navigation system"
    }
  ],
  "template": {
    "id": "list-filters",
    "description": "List blade with advanced filtering",
    "complexity": "moderate"
  },
  "patterns": [
    {
      "id": "list-basic",
      "description": "Basic list blade structure",
      "features": ["table", "pagination"]
    }
  ],
  "instructions": "# AI Code Generation Instructions (Lazy Loading Mode)\n\nYou MUST fetch full content before generating:\n- view_components({components: ['VcTable']})\n- get_best_template({bladeType: 'list', features: ['filters']})\n..."
}
```

### Затем AI Запрашивает Детали:

```typescript
// Получить полную информацию о VcTable
const tableInfo = await mcp.view_components({
  components: ['VcTable']
});

// Теперь AI знает все props, slots, events, examples компонента VcTable
```

## Преимущества

### 1. **Избегание лимита токенов**
- Lightweight guide всегда умещается в лимит
- AI контролирует что запрашивать

### 2. **Оптимизация контекста**
- AI запрашивает только нужное
- Для простого blade - только VcTable
- Для сложного - VcTable + VcInput + VcSelect + паттерны

### 3. **Масштабируемость**
- Можно генерировать модули с 10+ блейдами
- Каждый blade генерируется отдельно по требованию

### 4. **Гибкость**
- AI сам решает порядок загрузки
- Может сначала изучить шаблон, потом компоненты
- Или наоборот

## Изменения в Коде

### [generate.ts](cli/ai-codegen/src/workflows/steps/generate.ts)

**Было:**
```typescript
components: relevantComponents.map((c) => ({
  name: c.item.component,
  props: c.item.props,           // ❌ Полный контент
  slots: c.item.slots,           // ❌ Полный контент
  capabilities: c.item.capabilities, // ❌ Полный контент
  examples: c.item.examples,     // ❌ Полный контент
}))
```

**Стало:**
```typescript
components: relevantComponents.map((c) => ({
  name: c.item.component,
  description: c.item.description,
  // ✅ Только метаданные
  // ⚠️ AI запросит детали через view_components()
}))
```

То же самое для hooks, templates, patterns, rules.

### [schemas.ts](cli/ai-codegen/src/mcp/handlers/schemas.ts)

Обновлено описание MCP tool `generate_with_composition` - теперь объясняет AI что это lazy loading mode и как запрашивать полный контент.

## Миграция

**Для пользователей (разработчиков):** Никаких изменений не требуется!

**Для AI:** Изменения автоматические:
1. AI получает lightweight guide
2. Читает поле `instructions` где объяснено что делать
3. Вызывает нужные MCP tools для загрузки деталей
4. Генерирует код

## Тестирование

Создан unit test который проверяет:
- ✅ Components не содержат props/slots/events
- ✅ Hooks не содержат methods/capabilities
- ✅ Template не содержит content
- ✅ Patterns не содержат markdown content
- ✅ Instructions объясняют lazy loading

**Результат теста:**
```
✅ All tests passed!
📦 Lightweight guide: 2.86 KB
📦 OLD guide: 34.43 KB
🎉 Size reduction: 91.7% smaller!
```

## Доступные MCP Tools

Все инструменты для fetching **уже реализованы**:

### Компоненты
- `view_components({components: ['VcTable', ...]})` - получить детали
- `get_component_capabilities({component: 'VcTable'})` - capabilities
- `get_component_examples({query: 'table pagination'})` - примеры

### Framework APIs
- `view_framework_apis({apis: ['useBladeNavigation', ...]})` - детали
- `get_framework_capabilities({api: 'useBladeNavigation'})` - capabilities
- `get_framework_examples({query: 'navigation'})` - примеры

### Knowledge Base
- `get_best_template({bladeType: 'list', features: [...]})` - шаблон
- `get_relevant_patterns({bladeType: 'list', features: [...]})` - паттерны
- `get_applicable_rules({bladeType: 'list', features: [...]})` - правила

## Следующие Шаги

Архитектура готова! При следующей генерации модуля AI автоматически:
1. Получит lightweight guide
2. Прочитает instructions
3. Запросит нужные детали
4. Сгенерирует код

Размер ответов теперь всегда умещается в лимиты MCP!
