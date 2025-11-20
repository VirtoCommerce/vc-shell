# Frontmatter для всех примеров - Завершено ✅

## Обзор

Успешно добавлен frontmatter во **все 305 markdown файлов** в директории `/examples`.

## Что сделано

### 1. Автоматический скрипт добавления frontmatter

**Создан:** `cli/ai-codegen/scripts/add-frontmatter.cjs`

**Возможности:**
- Автоматическое определение типа примера (PROP, SLOT, EVENT, PATTERN, COMPOSITION, API)
- Извлечение метаданных из пути и имени файла
- Интеллектуальное определение complexity (SIMPLE, MODERATE, COMPLEX)
- Определение критических примеров
- Автоматическая генерация ID, title, description
- Поддержка Windows/Unix line endings

**Обработано:**
```
✅ Processed: 300 файлов
⏭️  Skipped: 5 файлов (уже имели frontmatter)
❌ Errors: 0
📝 Total: 305 файлов
```

### 2. Автоматическая генерация index.yaml

**Создан:** `cli/ai-codegen/scripts/generate-index.cjs`

**Возможности:**
- Сканирование всех markdown файлов с frontmatter
- Парсинг YAML frontmatter с поддержкой `\r\n`
- Категоризация по типам (capabilities, patterns, compositions, framework, etc.)
- Сортировка по критичности и алфавиту
- Генерация структурированного YAML индекса

**Результат:**
```yaml
📊 Generated index with:
   📦 Components: 29
   🔧 Capabilities: 242
   📋 Patterns: 9 (5 critical)
   🎼 Compositions: 12
   🛠️  Framework APIs: 5 (4 critical)
   🧩 Components: 29
   📃 Pages: 1
   🌐 API: 1
   📝 Total: 299 examples
```

### 3. Структура frontmatter

Все файлы теперь имеют единообразный frontmatter:

#### Для Capabilities (242 файла)

```yaml
---
id: vcselect-prop-modelValue
component: VcSelect
type: PROP
complexity: SIMPLE
category: component
tags: [prop, modelValue]
title: "VcSelect :modelValue prop"
description: "modelValue property for VcSelect"
---
```

#### Для Patterns (9 файлов)

```yaml
---
id: browser-unload-prevention
type: PATTERN
complexity: MODERATE
pattern_category: details
category: lifecycle
critical: true
related_rules: ["13"]
title: "Browser Unload Prevention"
description: "Use useBeforeUnload composable, not window.onbeforeunload"
---
```

#### Для Compositions (12 файлов)

```yaml
---
id: composition-details-form-basic
type: COMPOSITION
complexity: MODERATE
category: composition
tags: [composition, details]
title: "Form Basic"
description: "Form Basic composition for details blades"
---
```

#### Для Framework APIs (5 файлов)

```yaml
---
id: framework-useBeforeUnload
type: API
complexity: MODERATE
category: framework
tags: [composable, framework]
critical: true
title: "useBeforeUnload"
description: "useBeforeUnload composable API"
---
```

## Файловая структура

```
cli/ai-codegen/
├── scripts/
│   ├── add-frontmatter.cjs        ← Скрипт добавления frontmatter
│   ├── generate-index.cjs         ← Скрипт генерации index.yaml
│   └── copy-assets.sh             ← Копирование в dist
│
└── src/
    └── examples/
        ├── index.yaml                    ← Сгенерированный индекс (299 примеров)
        │
        ├── capabilities/                 ← 242 примера с frontmatter
        │   ├── VcSelect/
        │   │   ├── prop-modelValue.md
        │   │   ├── slot-option.md
        │   │   └── ...
        │   ├── VcTable/
        │   ├── VcInput/
        │   └── ...
        │
        ├── patterns/                     ← 9 паттернов с frontmatter (5 critical)
        │   ├── browser-unload-prevention.md   ⭐
        │   ├── domain-events.md               ⭐
        │   ├── module-registration.md         ⭐
        │   ├── unsaved-changes.md             ⭐
        │   ├── workspace-blade.md             ⭐
        │   ├── details-patterns.md
        │   ├── list-patterns.md
        │   ├── parent-child-communication.md
        │   └── widget-registration.md
        │
        ├── compositions/                 ← 12 композиций с frontmatter
        │   ├── details/
        │   ├── list/
        │   └── shared/
        │
        ├── framework/                    ← 5 framework APIs с frontmatter (4 critical)
        │   ├── composables/
        │   │   ├── useBeforeUnload/           ⭐
        │   │   ├── useBladeNavigation/        ⭐
        │   │   ├── useModificationTracker/    ⭐
        │   │   └── usePopup/                  ⭐
        │   └── utilities/
        │       └── notification/
        │
        ├── components/                   ← 29 демо компонентов
        ├── templates/                    ← Шаблоны
        └── pages/                        ← Страницы
```

## Критические примеры (9)

### Patterns (5)
1. **browser-unload-prevention** - useBeforeUnload composable (Fix #4a)
2. **domain-events** - SignalR push notifications
3. **module-registration** - Automatic module registration (Fix #2)
4. **unsaved-changes** - onBeforeClose hook (Fix #4b)
5. **workspace-blade** - Menu in defineOptions (Fix #3)

### Framework APIs (4)
1. **useBeforeUnload** - Prevent browser unload with unsaved changes
2. **useBladeNavigation** - Open/close blades programmatically
3. **useModificationTracker** - Track form modifications
4. **usePopup** - Show confirmations and dialogs

## Использование

### Поиск примеров через ExamplesLoader

```typescript
import { ExamplesLoader } from "@vc-shell/ai-codegen";

const loader = new ExamplesLoader();

// Все критические примеры
const critical = await loader.getCriticalExamples();
console.log(`Found ${critical.length} critical examples`);

// Примеры для компонента
const selectExamples = await loader.getComponentExamples("VcSelect");
console.log(`VcSelect has ${selectExamples.length} examples`);

// Примеры для правила
const rule13Examples = await loader.getExamplesForRule("13");
console.log(`Rule #13 has ${rule13Examples.length} examples`);

// Поиск по типу и сложности
const moderateSlots = await loader.search({
  type: "SLOT",
  complexity: "MODERATE",
});
console.log(`Found ${moderateSlots.length} moderate slot examples`);

// Поиск по тегам
const formExamples = await loader.search({
  tags: ["forms", "validation"],
});
console.log(`Found ${formExamples.length} form-related examples`);
```

### Программный доступ к index

```typescript
import { ExamplesLoader } from "@vc-shell/ai-codegen";

const loader = new ExamplesLoader();
const index = await loader.loadIndex();

// Все компоненты
console.log("Components:", Object.keys(index.capabilities));

// Все критические patterns
const criticalPatterns = index.patterns.filter(p => p.critical);
console.log("Critical patterns:", criticalPatterns.map(p => p.id));

// Compositions для details блейдов
const detailsComps = index.compositions.filter(c =>
  c.tags?.includes("details")
);
console.log("Details compositions:", detailsComps.length);
```

## Добавление нового примера

### 1. Создать markdown файл с frontmatter

```bash
cat > src/examples/patterns/my-pattern.md << 'EOF'
---
id: my-pattern
type: PATTERN
complexity: MODERATE
category: pattern
tags: [pattern, custom]
critical: false
title: "My Custom Pattern"
description: "Description of my pattern"
---

# My Custom Pattern

## Overview
...

## Code
```vue
<template>
  <!-- example -->
</template>
```
EOF
```

### 2. Регенерировать index

```bash
node scripts/generate-index.cjs
```

### 3. Пересобрать пакет

```bash
yarn build
```

### 4. Готово!

Пример автоматически появится в:
- `dist/examples/patterns/my-pattern.md`
- `dist/examples/index.yaml` (в секции patterns)
- Доступен через `ExamplesLoader`

## Автоматизация

### Добавить frontmatter в новые файлы

Если добавлены новые markdown файлы без frontmatter:

```bash
node scripts/add-frontmatter.cjs
```

Скрипт:
- Пропустит файлы с frontmatter
- Добавит frontmatter в файлы без него
- Автоматически определит метаданные

### Регенерировать index

После добавления/изменения файлов:

```bash
node scripts/generate-index.cjs
```

Скрипт:
- Пересканирует все markdown файлы
- Обновит index.yaml
- Отсортирует по критичности и алфавиту

## Сборка

При запуске `yarn build`:

```bash
✓ Copied examples index (index.yaml)
✓ Copied example markdown files
✓ Copied pattern documentation
✓ Copied capability examples (242 files)
✓ Copied framework API examples (5 files)
✓ Copied rules (19 files)
✅ Asset copy complete!
```

Все файлы с frontmatter копируются в `dist/examples/` и доступны после установки пакета.

## Преимущества

| До | После |
|----|-------|
| 305 markdown файлов без метаданных | 305 файлов с frontmatter |
| Нет программного доступа | ExamplesLoader API |
| Нет поиска | Поиск по типу, компоненту, тегам, правилам |
| Нет категоризации | Автоматическая категоризация |
| Ручное обновление | Автогенерация index.yaml |
| Нет связи с rules | Связь через related_rules |
| Критические примеры не помечены | 9 критических примеров помечены |

## Статистика

| Метрика | Значение |
|---------|----------|
| Обработано файлов | 300 |
| Пропущено (уже с frontmatter) | 5 |
| Ошибок | 0 |
| Всего markdown файлов | 305 |
| Индексировано примеров | 299 |
| Компонентов | 29 |
| Capabilities | 242 |
| Patterns | 9 (5 critical) |
| Compositions | 12 |
| Framework APIs | 5 (4 critical) |
| Скриптов создано | 2 |
| Строк кода в скриптах | ~350 |

## Технические детали

### Поддержка line endings

Скрипты поддерживают оба формата:
- Unix (`\n`)
- Windows (`\r\n`)

Regex: `/^---\r?\n([\s\S]*?)\r?\n---/`

### Автоопределение метаданных

**По пути файла:**
- `capabilities/VcSelect/prop-*.md` → type: PROP, component: VcSelect
- `capabilities/VcSelect/slot-*.md` → type: SLOT, component: VcSelect
- `patterns/*.md` → type: PATTERN
- `compositions/details/*.md` → type: COMPOSITION, tags: [details]
- `framework/composables/*/` → type: API, tags: [composable]

**По имени файла:**
- `prop-modelValue.md` → tags: [prop, modelValue]
- `slot-option.md` → tags: [slot, option]
- `use*.md` в framework → critical: true

**По сложности:**
- PROP → SIMPLE
- SLOT → MODERATE
- PATTERN → MODERATE
- API → MODERATE

### Критичность

Автоматически помечаются как `critical: true`:
- Patterns: module-registration, workspace-blade, browser-unload-prevention, unsaved-changes, domain-events
- Framework APIs: useBeforeUnload, useBladeNavigation, usePopup, useModificationTracker

## Связь с Rules System

Примеры связаны с правилами через `related_rules`:

```yaml
# Pattern
---
id: browser-unload-prevention
related_rules: ["13"]
---

# Rule
id: "13"
name: "Browser Unload Prevention"
examples:
  - "patterns/browser-unload-prevention.md"
  - "framework/composables/useBeforeUnload/prevent-unload.md"
```

ExamplesLoader может найти все примеры для правила:

```typescript
const examples = await loader.getExamplesForRule("13");
// Returns all examples where related_rules includes "13"
```

## Интеграция с AI Code Generation

AI теперь имеет доступ к:

1. **Структурированным метаданным** через index.yaml
2. **Программному поиску** через ExamplesLoader
3. **Критическим примерам** для обязательного использования
4. **Связи с правилами** для контекстного применения

Пример использования в AI Generation Guide:

```typescript
import { ExamplesLoader } from "@vc-shell/ai-codegen";

const loader = new ExamplesLoader();

// Для details блейда с формой
const detailsExamples = await loader.search({
  type: "COMPOSITION",
  tags: ["details", "forms"],
});

// Для правила #13 (browser unload)
const rule13Examples = await loader.getExamplesForRule("13");

// Критические patterns для всех блейдов
const criticalPatterns = await loader.getCriticalExamples();
```

## Итог

✅ **Завершено успешно**
- 305 файлов обработано
- Frontmatter добавлен во все файлы
- Index.yaml с 299 примерами сгенерирован
- 2 скрипта для автоматизации созданы
- Пакет собран и готов к использованию
- 100% обратная совместимость

**Преимущества:**
- Программный доступ к примерам
- Поиск по метаданным
- Связь с правилами
- Автоматическая категоризация
- Критические примеры помечены
- Легко добавлять новые примеры

**Формат:**
```
Markdown (читаемо для людей и AI)
  + Frontmatter (метаданные)
  + index.yaml (быстрый поиск)
  + ExamplesLoader (программный доступ)
= Лучшее из всех миров! 🎉
```
