# Lazy Loading Architecture

## Проблема

При генерации модулей с несколькими блейдами, MCP tool `generate_with_composition` возвращал очень большие ответы (>25000 токенов), которые обрезались, из-за чего AI не получал всю необходимую информацию.

**Причина:** Инструмент возвращал полный контент всех ресурсов:
- Полные определения компонентов (props, slots, events, capabilities, examples)
- Полные определения хуков (methods, state, capabilities, examples)
- Полный код шаблонов (.vue файлы)
- Полный контент паттернов (markdown документация)
- Полный контент правил (YAML файлы)

## Решение: Lazy Loading (Отложенная Загрузка)

### Новый Workflow

Теперь workflow состоит из двух фаз:

#### Фаза 1: Планирование (Lightweight Response)

`generate_with_composition` возвращает **только метаданные**:

```json
{
  "components": [
    {
      "name": "VcTable",
      "description": "Data table component...",
      "confidence": 0.95
      // ❌ НЕТ props, slots, events, capabilities, examples
    }
  ],
  "hooks": [
    {
      "name": "useBladeNavigation",
      "import": "@vc-shell/framework",
      "description": "Navigation composable..."
      // ❌ НЕТ methods, capabilities, examples
    }
  ],
  "template": {
    "id": "list-filters",
    "complexity": "moderate",
    "description": "List with filters..."
    // ❌ НЕТ content (full .vue file)
  },
  "patterns": [
    {
      "id": "list-basic",
      "description": "Basic list pattern...",
      "features": ["table", "pagination"]
      // ❌ НЕТ content (markdown)
    }
  ]
}
```

#### Фаза 2: Fetching (Full Content)

AI получает lightweight guide и **самостоятельно запрашивает** полный контент нужных ресурсов:

```typescript
// 1. Получить полную информацию о компонентах
view_components({
  components: ["VcTable", "VcButton"]
})

// 2. Получить полную информацию о хуках
view_framework_apis({
  apis: ["useBladeNavigation", "useApiClient"]
})

// 3. Получить полный шаблон
get_best_template({
  bladeType: "list",
  features: ["filters", "pagination"]
})

// 4. Получить полные паттерны
get_relevant_patterns({
  bladeType: "list",
  features: ["filters"]
})
```

## Преимущества

### 1. Сокращение размера ответа на 91.7%

- **До:** 34.43 KB (полный контент)
- **После:** 2.86 KB (только метаданные)
- **Экономия:** 31.57 KB

### 2. Избегание лимита 25000 токенов

Lightweight guide всегда умещается в лимит, AI сам решает что запросить.

### 3. Контроль контекста

AI запрашивает только то, что реально нужно для генерации:
- Для простого list blade - только VcTable
- Для сложного с фильтрами - VcTable + VcInput + VcSelect

### 4. Возможность пагинации

Если даже после lazy loading контекст большой, AI может:
- Сначала сгенерировать blade
- Потом сгенерировать composable
- Потом API client

## Изменения в Коде

### 1. GenerateStepExecutor ([generate.ts](src/workflows/steps/generate.ts))

**До:**
```typescript
components: relevantComponents.map((c) => ({
  name: c.item.component,
  props: c.item.props,        // ❌ Полный контент
  slots: c.item.slots,        // ❌ Полный контент
  events: c.item.events,      // ❌ Полный контент
  capabilities: c.item.capabilities, // ❌ Полный контент
  examples: c.item.examples,  // ❌ Полный контент
}))
```

**После:**
```typescript
components: relevantComponents.map((c) => ({
  name: c.item.component,
  description: c.item.description,
  // ✅ Только метаданные
  // AI запросит детали через view_components()
}))
```

### 2. MCP Tool Description ([schemas.ts](src/mcp/handlers/schemas.ts))

Обновлено описание `generate_with_composition`:

```typescript
description: `⚠️ REQUIRES VALIDATED UI-PLAN ⚠️ Generate AI instructions...

**🚀 LAZY LOADING MODE (New!):**
- This tool now returns LIGHTWEIGHT guides with only metadata
- NO full content for templates, patterns, examples
- You MUST fetch full content using MCP tools BEFORE generating code:
  * view_components({components: ["VcTable", ...]})
  * view_framework_apis({apis: ["useBladeNavigation", ...]})
  * get_best_template({bladeType, features})
  * get_relevant_patterns({bladeType, features})
`
```

### 3. Instructions ([generate.ts](src/workflows/steps/generate.ts))

Новый метод `buildLazyLoadingInstructions()` объясняет AI:
1. Что guide содержит только метаданные
2. Какие MCP tools использовать для загрузки полного контента
3. Какие параметры передавать в каждый tool

## Existing MCP Tools (Уже Доступны)

Все необходимые инструменты уже реализованы:

### Компоненты
- ✅ `view_components` - получить детали компонентов по именам
- ✅ `get_component_capabilities` - получить capabilities конкретного компонента
- ✅ `get_component_examples` - получить примеры использования

### Framework APIs
- ✅ `view_framework_apis` - получить детали хуков по именам
- ✅ `get_framework_capabilities` - получить capabilities конкретного хука
- ✅ `get_framework_examples` - получить примеры использования

### Knowledge Base
- ✅ `get_best_template` - получить полный шаблон
- ✅ `get_relevant_patterns` - получить полные паттерны
- ✅ `get_applicable_rules` - получить полные правила

## Тестирование

Создан тест [test-lazy-guide.ts](./test-lazy-guide.ts):

```bash
npm run build
npx tsx test-lazy-guide.ts
```

**Результат:**
```
✅ PASS: Components are lightweight
✅ PASS: Hooks are lightweight
✅ PASS: Template is lightweight
✅ PASS: Patterns are lightweight
✅ PASS: Rules are lightweight
✅ PASS: Instructions explain lazy loading

📦 Lightweight guide size: 2.86 KB
📦 OLD guide size: 34.43 KB
🎉 Size reduction: 91.7% smaller!
```

## Миграция

Для AI (Claude) изменения **прозрачны** - MCP server автоматически:
1. Возвращает lightweight guide
2. В `instructions` поле объясняет что делать дальше
3. AI читает instructions и вызывает нужные MCP tools

Никаких изменений в prompt engineering не требуется!

## Будущие Улучшения

### 1. Smart Defaults (уже в описании tool)
- Для больших модулов (>2 blades) автоматически генерировать по одному blade за раз
- Возвращать `nextSteps` с конкретными tool calls

### 2. Кеширование
- Кешировать полный контент компонентов/хуков между запросами
- Использовать Claude's prompt caching для переиспользования контента

### 3. Приоритизация
- В lightweight guide добавить `priority` / `relevance` score
- AI сначала загружает most relevant ресурсы

## Примеры Использования

### Пример 1: Простой List Blade

```typescript
// 1. AI получает lightweight guide
const guide = await generate_with_composition({ plan, cwd });

// guide.components = [{ name: "VcTable", description: "..." }]
// guide.hooks = [{ name: "useBladeNavigation", description: "..." }]

// 2. AI запрашивает детали
const tableDetails = await view_components({ components: ["VcTable"] });
const navDetails = await view_framework_apis({ apis: ["useBladeNavigation"] });
const template = await get_best_template({ bladeType: "list", features: ["table"] });

// 3. AI генерирует код используя полученные детали
const code = generateVueSFC(guide, tableDetails, navDetails, template);

// 4. AI отправляет код на валидацию
await submit_generated_code({ bladeId, code, context });
```

### Пример 2: Сложный Blade с Фильтрами

```typescript
// 1. Lightweight guide (2-3 KB)
const guide = await generate_with_composition({ plan, cwd });

// 2. AI видит features: ["table", "filters", "pagination", "search"]

// 3. AI запрашивает релевантные детали
const components = await view_components({
  components: ["VcTable", "VcInput", "VcSelect", "VcButton"]
});

const hooks = await view_framework_apis({
  apis: ["useBladeNavigation", "useApiClient", "useTableSort"]
});

const patterns = await get_relevant_patterns({
  bladeType: "list",
  features: ["filters", "pagination"],
  patterns: ["list-filters", "custom-column-slots"] // specific IDs from guide
});

// 4. Генерация и submit
const code = generateComplexBlade(guide, components, hooks, patterns);
await submit_generated_code({ bladeId, code, context });
```

## Заключение

Lazy Loading архитектура решает проблему размера ответов и дает AI полный контроль над тем, какую информацию запрашивать. Это делает workflow более гибким и масштабируемым.

**Ключевое преимущество:** AI сам решает что нужно, вместо получения всего сразу.
