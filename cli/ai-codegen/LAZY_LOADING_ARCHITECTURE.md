# Lazy-Loading Architecture: On-Demand Rule Fetching

## Проблема

В предыдущей версии Response Templating (v1) система отправляла **весь guide object** с embedded rules, patterns, и constraints в каждом ответе:

```json
{
  "workflow_started": {
    "guide": {
      "instructions": {
        "constraints": [...],  // 100+ строк
        "patterns": [...],     // 50+ паттернов с кодом
        "steps": [...]         // Детальные инструкции
      },
      "rules": {...},          // Все YAML rules
      "examples": {...}        // Все примеры
    }
  }
}
```

**Размер payload**: ~20-30K tokens на один blade

**Проблемы**:
1. ❌ Огромный размер ответа → медленная обработка
2. ❌ Дублирование данных между blade'ами
3. ❌ Невозможность обновить rules без пересборки всего guide
4. ❌ AI получает всё сразу → может игнорировать часть информации

## Решение: Lazy-Loading через MCP Tools

### Архитектура V2

Вместо embedding всех rules, система теперь:

1. ✅ Возвращает **минимальный контекст** (модуль, entity, features)
2. ✅ Даёт **явные инструкции** вызвать MCP tools для получения rules/templates
3. ✅ AI **сам запрашивает** только нужные данные
4. ✅ Rules загружаются **on-demand** через существующие MCP tools

### Используемые MCP Tools

#### 1. `mcp__vcshell-codegen__get_applicable_rules`

**Назначение**: Получить релевантные rules для конкретного blade

**Параметры**:
```typescript
{
  bladeType: "list" | "details",
  features: string[],
  isWorkspace: boolean,
  strategy: "AI_FULL"
}
```

**Возвращает**:
```json
{
  "critical_rules": [
    {
      "id": "workspace-blade-menu",
      "content": "...",  // Full YAML with examples
      "priority": "CRITICAL"
    },
    {
      "id": "api-client-usage",
      "content": "...",
      "priority": "HIGH"
    }
  ]
}
```

**Когда вызывается**: Step 1 в IMMEDIATE_ACTION_REQUIRED

#### 2. `mcp__vcshell-codegen__get_best_template`

**Назначение**: Получить готовый Vue SFC template, соответствующий features

**Параметры**:
```typescript
{
  bladeType: "list" | "details",
  features: string[],
  complexity: "simple" | "moderate" | "complex"
}
```

**Возвращает**:
```json
{
  "template": {
    "path": "examples/templates/list-with-filters.vue",
    "content": "...",  // Full Vue SFC code (150-400 lines)
    "features": ["filters", "multiselect"],
    "complexity": "moderate"
  }
}
```

**Когда вызывается**: Step 2 в IMMEDIATE_ACTION_REQUIRED

#### 3. `mcp__vcshell-codegen__get_relevant_patterns`

**Назначение**: Получить architectural patterns (опционально, для сложных случаев)

**Параметры**:
```typescript
{
  bladeType: "list" | "details" | "all",
  features: string[],
  isWorkspace: boolean,
  patterns: string[]  // Specific pattern IDs
}
```

**Возвращает**:
```json
{
  "patterns": [
    {
      "id": "workspace-blade",
      "content": "...",  // Full markdown with examples
      "category": "architectural"
    }
  ]
}
```

**Когда вызывается**: Опционально, при необходимости

## Новая структура BladeTaskTemplate

### Было (V1):

```typescript
interface BladeTaskTemplate {
  workflow_state: string;
  session_id: string;
  current_task: {...};
  IMMEDIATE_ACTION_REQUIRED: {
    step_1: "READ_FILE",
    step_2: "GENERATE_CODE",
    step_3: "CALL_TOOL"
  };
  guide: any;  // ❌ ОГРОМНЫЙ объект с ВСЕМИ rules
}
```

### Стало (V2):

```typescript
interface BladeTaskTemplate {
  workflow_state: string;
  session_id: string;
  current_task: {...};
  IMMEDIATE_ACTION_REQUIRED: {
    step_1: "FETCH_RULES",        // ✅ MCP tool call
    step_2: "FETCH_TEMPLATE",     // ✅ MCP tool call
    step_3: "READ_BASE_FILE",     // Обычный Read
    step_4: "GENERATE_CODE",      // Генерация
    step_5: "CALL_TOOL"           // Submit
  };
  context: {                      // ✅ Только minimal context
    module: string;
    entity: string;
    features: string[];
    isWorkspace: boolean;
    columns?: [...];
    fields?: [...];
  };
}
```

## Workflow с Lazy-Loading

```
┌─────────────────────────────────────────────────────────────┐
│ 1. generate_with_composition                                 │
│    - Returns BladeTaskTemplate with MCP tool call templates  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AI receives template with step_1, step_2, ...           │
│    {                                                         │
│      step_1: "FETCH_RULES",                                 │
│      step_1_details: {                                      │
│        tool: "mcp__vcshell-codegen__get_applicable_rules",  │
│        args_template: { bladeType, features, ... }          │
│      }                                                       │
│    }                                                         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. AI calls get_applicable_rules                           │
│    - Receives ONLY relevant rules for this blade            │
│    - Размер: ~5K tokens (вместо 20K)                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. AI calls get_best_template                              │
│    - Receives ready-to-use Vue SFC template                 │
│    - Template already implements requested features         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. AI reads base file (Read tool)                          │
│    - Gets defineOptions() and route config                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AI generates code                                        │
│    - Uses template as base                                  │
│    - Applies rules from step 3                              │
│    - Preserves defineOptions from step 5                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. AI calls submit_generated_code                          │
│    - System validates and saves                             │
│    - Returns next blade (if any)                            │
└─────────────────────────────────────────────────────────────┘
```

## Преимущества

| Аспект | V1 (Embedded) | V2 (Lazy-Loading) |
|--------|---------------|-------------------|
| **Размер payload** | ~20-30K tokens | ~2-3K tokens (initial) |
| **Дублирование** | ❌ Да (каждый blade) | ✅ Нет (on-demand) |
| **Гибкость** | ❌ Rules в guide | ✅ Динамические rules |
| **Обновление rules** | ❌ Нужна пересборка | ✅ Сразу доступны |
| **Релевантность** | ❌ Всё сразу | ✅ Только нужное |
| **Maintainability** | ❌ Сложно отлаживать | ✅ Модульно |

## Реализация

### Изменённые файлы

#### 1. `response-templates.ts`

**Изменения**:
- Обновлён `BladeTaskTemplate` interface (добавлены step_1, step_2 для MCP tools)
- Убрано поле `guide: any`
- Добавлено поле `context` с minimal data
- Обновлён `buildBladeTaskTemplate()` для генерации MCP tool call templates

**Ключевой код**:
```typescript
IMMEDIATE_ACTION_REQUIRED: {
  step_1: "FETCH_RULES",
  step_1_details: {
    tool: "mcp__vcshell-codegen__get_applicable_rules",
    args_template: {
      bladeType: bladeType as "list" | "details",
      features,
      isWorkspace,
      strategy: "AI_FULL",
    },
    purpose: "Get critical rules: workspace blade patterns, module registration, validation, filters, etc.",
  },

  step_2: "FETCH_TEMPLATE",
  step_2_details: {
    tool: "mcp__vcshell-codegen__get_best_template",
    args_template: {
      bladeType: bladeType as "list" | "details",
      features,
      complexity: complexity as "simple" | "moderate" | "complex",
    },
    purpose: "Get production-ready Vue SFC template matching your features and complexity",
  },
  // ...
}
```

### Без изменений

- `workflow-state-manager.ts` - не требует изменений
- `mcp.ts` - handlers для MCP tools уже существуют
- `generate_with_composition` - использует `buildBladeTaskTemplate()` как прежде

## Метрики улучшения

| Метрика | V1 | V2 (ожидаемое) |
|---------|-----|----------------|
| Initial payload size | 20-30K tokens | 2-3K tokens |
| Total tokens (with MCP calls) | 20-30K | 10-15K |
| Response time | Медленно | Быстрее |
| Rule update latency | Требуется rebuild | Мгновенно |
| Relevance | Всё подряд | Только нужное |

## Тестирование

### 1. Build

```bash
cd cli/ai-codegen
npm run build
# ✅ Success
```

### 2. Сравнение размеров

```bash
# V1: Посмотреть размер response
# Ожидаемое: ~20-30K tokens в guide field

# V2: Посмотреть размер response
# Ожидаемое: ~2-3K tokens, без guide field
```

### 3. Workflow test

```bash
# 1. Вызвать generate_with_composition
# 2. Проверить, что AI вызывает:
#    - get_applicable_rules
#    - get_best_template
#    - Read
#    - submit_generated_code
# 3. Проверить, что rules загружаются on-demand
```

## Backward Compatibility

**Внимание**: Это **breaking change** для AI prompts.

Если AI ожидает `guide` field в ответе, он получит ошибку. Новый workflow требует:
1. AI должен следовать новым step_1, step_2 инструкциям
2. AI должен вызывать MCP tools перед генерацией

**Миграция**: Обновить AI промпты для работы с новым workflow.

## Дальнейшие улучшения

1. **Кеширование MCP responses**: Если AI запрашивает одни и те же rules для нескольких blade'ов, кешировать
2. **Progressive disclosure**: Возвращать краткие summaries rules, а не full YAML
3. **Rule dependencies**: Автоматически подгружать связанные rules
4. **Analytics**: Отслеживать, какие rules чаще всего запрашиваются

## Заключение

Lazy-Loading архитектура решает проблему огромных payload'ов через:
- ✅ On-demand fetching rules через MCP tools
- ✅ Minimal initial context
- ✅ Динамическая загрузка только релевантных данных
- ✅ Модульная структура, легко поддерживать

**Ожидаемое улучшение**: Размер payload уменьшится на **60-70%** (30K → 10-15K tokens).
