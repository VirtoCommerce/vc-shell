# Examples System with Index & Frontmatter ✅

## Что сделано

Улучшена система примеров с сохранением Markdown формата:
- ✅ Добавлен `examples/index.yaml` с метаданными
- ✅ Добавлен frontmatter в критические примеры
- ✅ Создан `ExamplesLoader` для программного доступа
- ✅ Созданы недостающие критические паттерны
- ✅ Связаны rules с examples

## Архитектура

### Markdown + Frontmatter

Примеры остаются в Markdown (читаемо для людей и AI), но с добавленными метаданными:

```markdown
---
id: vcselect-slot-option
component: VcSelect
type: SLOT
complexity: MODERATE
tags: [slot, custom-rendering]
critical: true
related_rules: ["11"]
---

# Capability: option

## Example
```vue
<template #option="{ opt, selected }">
  {{ opt.label }}
</template>
```
```

### Index для быстрого поиска

`examples/index.yaml` содержит метаданные всех примеров:

```yaml
capabilities:
  VcSelect:
    - id: vcselect-slot-option
      file: capabilities/VcSelect/slot-option.md
      type: SLOT
      complexity: MODERATE
      critical: true
      related_rules: ["11"]

patterns:
  - id: module-registration
    file: patterns/module-registration.md
    type: PATTERN
    critical: true
    related_rules: ["09"]
```

### ExamplesLoader для программного доступа

```typescript
import { ExamplesLoader } from "@vc-shell/ai-codegen";

const loader = new ExamplesLoader();

// Получить пример по ID
const example = await loader.getExample("vcselect-slot-option");

// Поиск примеров
const critical = await loader.search({ critical: true });
const forRule = await loader.search({ related_rule: "13" });

// Примеры для компонента
const selectExamples = await loader.getComponentExamples("VcSelect");

// Паттерны для details блейдов
const patterns = await loader.getPatterns("details");
```

## Структура

```
examples/
├── index.yaml                    ← Метаданные всех примеров
│
├── capabilities/                 ← Примеры компонентов (242 файла)
│   └── VcSelect/
│       └── slot-option.md        ← С frontmatter
│
├── patterns/                     ← Архитектурные паттерны
│   ├── module-registration.md    ← Новый (Fix #2)
│   ├── workspace-blade.md        ← Новый (Fix #3)
│   ├── browser-unload-prevention.md  ← Новый (Fix #4a)
│   ├── unsaved-changes.md        ← Новый (Fix #4b)
│   ├── domain-events.md
│   ├── list-patterns.md
│   └── details-patterns.md
│
├── compositions/                 ← Композиции
│   ├── list/
│   ├── details/
│   │   └── modified-tracking.md  ← С frontmatter
│   └── shared/
│
└── framework/                    ← Framework API
    └── composables/
        ├── useBeforeUnload.md    ← С frontmatter
        └── onBeforeClose.md      ← С frontmatter
```

## Новые файлы

### TypeScript

- `src/core/examples-types.ts` - Интерфейсы для примеров
- `src/core/examples-loader.ts` - Загрузчик примеров (250 строк)

### Паттерны (Markdown)

- `patterns/module-registration.md` - Автоматическая регистрация модулей
- `patterns/workspace-blade.md` - Меню в defineOptions
- `patterns/browser-unload-prevention.md` - useBeforeUnload
- `patterns/unsaved-changes.md` - onBeforeClose

### Индекс

- `examples/index.yaml` - Метаданные 25+ критических примеров

## Связь с Rules

Rules теперь ссылаются на examples через ID:

```yaml
# rules/critical/13-browser-unload.yaml
id: "13"
name: "Browser Unload Prevention"
examples:
  - "patterns/browser-unload-prevention.md"
  - "compositions/details/modified-tracking.md"
  - "framework/composables/useBeforeUnload.md"
```

ExamplesLoader может найти все примеры для правила:

```typescript
const examples = await loader.getExamplesForRule("13");
// Возвращает все примеры, где related_rules содержит "13"
```

## Преимущества

### ✅ Лучшее из обоих миров

| Markdown | YAML Index |
|----------|------------|
| Читаемо для людей | Структурированный поиск |
| AI понимает код | Быстрая фильтрация |
| Длинные описания | Метаданные отдельно |
| Syntax highlighting | Программный доступ |

### ✅ Программный доступ

```typescript
// Критические примеры
const critical = await loader.getCriticalExamples();

// Примеры для правила
const forRule13 = await loader.getExamplesForRule("13");

// Поиск по тегам
const forms = await loader.search({ tags: ["forms"] });

// Фильтрация по сложности
const simple = await loader.search({ complexity: "SIMPLE" });
```

### ✅ Frontmatter опциональный

Старые примеры без frontmatter продолжают работать.
Метаданные можно хранить только в index.yaml.

## Использование

### Добавить новый пример

#### 1. Создать Markdown файл

```markdown
---
id: my-example
type: PATTERN
complexity: MODERATE
critical: false
tags: [custom]
---

# My Example

## Description
...

## Code
```vue
<template>
  <!-- example -->
</template>
```
```

#### 2. Добавить в index.yaml

```yaml
patterns:
  - id: my-example
    file: patterns/my-example.md
    type: PATTERN
    complexity: MODERATE
    tags: [custom]
```

#### 3. Пересобрать

```bash
yarn build
```

### Найти пример

```typescript
// По ID
const example = await loader.getExample("my-example");
console.log(example.content);  // Markdown content
console.log(example.frontmatter);  // Parsed YAML

// По поиску
const found = await loader.search({ tags: ["custom"] });
```

## ExamplesLoader API

### Основные методы

```typescript
// Загрузить индекс
await loader.loadIndex(): Promise<ExamplesIndex>

// Получить пример по ID
await loader.getExample(id: string): Promise<Example | null>

// Получить содержимое по пути
await loader.getExampleByPath(path: string): Promise<string>

// Поиск
await loader.search(query: ExampleSearchQuery): Promise<ExampleMetadata[]>

// Критические примеры
await loader.getCriticalExamples(): Promise<ExampleMetadata[]>

// Примеры для правила
await loader.getExamplesForRule(ruleId: string): Promise<ExampleMetadata[]>

// Примеры для компонента
await loader.getComponentExamples(component: string): Promise<CapabilityExample[]>

// Паттерны
await loader.getPatterns(category?: string): Promise<PatternExample[]>

// Композиции
await loader.getCompositions(bladeType?: "list" | "details"): Promise<CompositionExample[]>

// Framework API
await loader.getFrameworkExamples(apiName?: string): Promise<FrameworkAPIExample[]>
```

### Поисковые фильтры

```typescript
interface ExampleSearchQuery {
  component?: string;
  type?: "PROP" | "SLOT" | "EVENT" | "PATTERN" | "COMPOSITION" | "API";
  complexity?: "SIMPLE" | "MODERATE" | "COMPLEX";
  category?: string;
  tags?: string[];
  critical?: boolean;
  related_rule?: string;
  blade_type?: "list" | "details" | "all";
  text?: string;  // Search in title/description
}
```

## Индекс примеров

Текущий index.yaml содержит:

- **13 capability examples** (VcSelect, VcTable, VcGallery)
- **9 pattern examples** (module-registration, domain-events, и т.д.)
- **3 composition examples** (modified-tracking, validation, gallery)
- **5 framework API examples** (useBeforeUnload, onBeforeClose, и т.д.)

**Всего: 30 индексированных примеров**

Все критические примеры помечены `critical: true` и связаны с rules через `related_rules`.

## Интеграция с Rules

Rules могут ссылаться на examples:

```yaml
# Rule ссылается на examples
id: "13"
examples:
  - "patterns/browser-unload-prevention.md"
  - "framework/composables/useBeforeUnload.md"
```

ExamplesLoader находит обратную связь:

```typescript
// Найти все примеры для правила
const examples = await loader.search({ related_rule: "13" });
// Возвращает примеры, где указано related_rules: ["13"]
```

## Сборка

```bash
cd cli/ai-codegen
yarn build
```

Вывод:
```
✓ Copied examples index (index.yaml)
✓ Copied example markdown files
✓ Copied pattern documentation
✓ Copied capability examples (242 files)
✓ Copied rules (19 files)
✅ Asset copy complete!
```

## Статистика

| Метрика | Значение |
|---------|----------|
| Создано TypeScript файлов | 2 (types, loader) |
| Создано Markdown файлов | 4 (patterns) |
| Добавлен frontmatter в | 1+ файлов |
| Индексировано примеров | 30 |
| Строк кода | ~500 |
| Формат примеров | Markdown ✅ |
| Программный доступ | Есть ✅ |
| Обратная совместимость | 100% ✅ |

## Будущие улучшения

### Можно добавить

1. **Автогенерация index.yaml** - сканировать frontmatter и генерировать индекс
2. **Валидация примеров** - проверять код в примерах на корректность
3. **Поиск по коду** - искать в содержимом примеров
4. **Категоризация** - автоматическая категоризация по контенту
5. **Связи между примерами** - граф связей
6. **Метрики** - сколько раз пример использовался

## Итог

✅ **Examples система улучшена**
- Markdown остался читаемым
- Добавлена структура через frontmatter
- Создан index.yaml для быстрого поиска
- ExamplesLoader для программного доступа
- Связи с rules через related_rules
- Обратная совместимость 100%

**Преимущества:**
- Легко искать примеры
- Фильтрация по метаданным
- Связь с правилами
- Критические примеры отмечены
- API для программы, Markdown для людей

**Формат:**
```
/rules     → YAML (правила, валидация)
/examples  → Markdown + frontmatter (примеры кода)
```

Лучшее из обоих миров! 🎉
