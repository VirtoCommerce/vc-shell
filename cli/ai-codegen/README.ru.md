# @vc-shell/ai-codegen

AI-генерация кода для VC-Shell приложений через Model Context Protocol (MCP).

Генерируйте готовые модули VC-Shell из простых текстовых промптов.

## Возможности

- 🤖 **AI-Powered**: Генерация через Cursor, VS Code, Claude Code или Codex
- 📦 **Production Ready**: На основе реальных паттернов из vendor-portal
- 🎨 **Гибкость**: Шаблоны для быстрого старта + Композиции для кастомизации
- ✅ **Type-Safe**: Полная поддержка TypeScript
- 🌐 **i18n Ready**: Все строки через vue-i18n
- 🔌 **MCP Integration**: 7 инструментов и 7 ресурсов для AI

## Быстрый Старт

### 1. Установка

```bash
npx @vc-shell/ai-codegen@latest init-mcp --client cursor
```

Поддерживаемые IDE:
- **Cursor** - AI-редактор кода
- **VS Code** - С AI расширениями
- **Claude Code** - AI-ассистент от Anthropic
- **Codex** - GitHub Copilot workspace

### 2. Перезапуск IDE

```bash
# Cursor
Command + Q → Перезапустить
# Затем: Settings → Features → MCP → Включить "vcshell"
```

### 3. Попробуйте

```
Создай управление вендорами с таблицей и формой
```

AI:
1. Сгенерирует UI-Plan JSON
2. Провалидирует и сохранит план
3. Сгенерирует модуль с blades, composables, i18n
4. Зарегистрирует модуль в main.ts

## Что Генерируется

Из промпта `"Создай управление вендорами"`:

```
src/modules/vendor-management/
├── pages/
│   ├── index.ts
│   ├── vendors-list.vue       # List blade с VcTable
│   └── vendor-details.vue     # Details blade с VcForm
├── composables/
│   ├── useVendorList.ts       # Управление данными списка
│   └── useVendorDetails.ts    # Управление данными деталей
├── locales/
│   ├── en.json                # Все переводы
│   └── index.ts               # Named exports
└── index.ts                   # Регистрация модуля
```

Всё с:
- TypeScript типами
- vee-validate валидацией
- Правильным роутингом (множ/един число)
- i18n для всех строк
- Composition API
- Реактивным состоянием

## Подходы к Генерации

### Шаблоны (Быстрый Старт)

5 production-ready шаблонов для стандартных случаев:
- `list-simple` - Базовая таблица с toolbar
- `list-filters` - С панелью фильтров
- `list-multiselect` - С bulk операциями
- `details-simple` - Базовая форма
- `details-validation` - С async валидацией

### Композиции (Unlimited Гибкость)

12 атомарных паттернов которые можно комбинировать:
- Создавайте любой layout (как Figma + shadcn)
- Комбинируйте паттерны по необходимости
- Не ограничены готовыми шаблонами

## CLI Команды

### Поиск Компонентов

```bash
vcgen search                    # Все компоненты
vcgen search "table"            # Fuzzy поиск
vcgen search --category Form    # Фильтр по категории
```

### Просмотр Деталей

```bash
vcgen view VcTable VcField      # Детальная информация
```

### Инициализация MCP

```bash
vcgen init-mcp --client cursor  # Настройка для вашей IDE
```

### Валидация UI-Plan

```bash
vcgen validate --plan __ai/ui-plan.json
```

### Генерация Кода

```bash
vcgen generate --plan __ai/ui-plan.json
```

## MCP Tools

AI-ассистенты могут использовать:

- `search_components` - Поиск с fuzzy matching
- `view_components` - Детали компонентов
- `get_component_examples` - Примеры и шаблоны
- `get_blade_template` - Production-ready шаблон
- `get_audit_checklist` - Чеклист проверки
- `validate_ui_plan` - Валидация UI-Plan JSON
- `scaffold_app` - Создание нового приложения

## Документация

- [Quick Start Guide](docs/QUICKSTART.md) - Детальная установка
- [Commands Reference](docs/COMMANDS.md) - Все CLI команды
- [MCP Setup](docs/MCP_SETUP.md) - Настройка MCP
- [Module Registration](docs/MODULE_REGISTRATION.md) - Регистрация модулей
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Решение проблем

### Гайды

- [Workflow Guide](docs/guides/workflow.md) - Процесс генерации модулей
- [Naming Guide](docs/guides/blade-naming.md) - Именование файлов и компонентов
- [Forms Guide](docs/guides/forms-guide.md) - Создание форм

## Ключевые Правила

### Именование Файлов

- List blade: `vendors-list.vue` → Component: `VendorList`
- Details blade: `vendor-details.vue` → Component: `VendorDetails`
- Import: `import VendorDetails from "./vendor-details.vue"` (единственное число!)

### URL Паттерны

- List blade: `/vendors` (множ. число) + `isWorkspace: true` + `menuItem`
- Details blade: `/vendor` (един. число, **без :id**) + без menuItem
- ID передается через: `openBlade({ param: id })`

### Компоненты

**42 реальных VC-Shell компонента:**

Organisms: VcBlade, VcTable, VcGallery, VcPopup

Molecules: VcForm, VcInput, VcTextarea, VcSelect, VcCheckbox, VcRadioButton, VcSwitch

Atoms: VcCard, VcContainer, VcRow, VcCol, VcButton, VcBadge, VcStatus, VcIcon, VcImage

**Важно:** VcField только для read-only отображения, НЕ для форм! Для форм используйте Field из vee-validate.

## Примеры

См. [src/examples/](src/examples/):
- `compositions/` - 12 атомарных композиционных паттернов
- `templates/` - 5 production-ready шаблонов
- `components/` - Демо компонентов
- `patterns/` - Гайды по выбору шаблонов

## Troubleshooting

### MCP Tools не видны?

**Быстрое решение:** Перезапустите Cursor полностью (Command+Q, не reload)

Если всё ещё не работает:
1. Проверьте сборку: `npm run build`
2. Проверьте MCP подключение: Settings → Features → MCP → зелёная точка
3. См. [Troubleshooting Guide](docs/TROUBLESHOOTING.md)

**Важно:** Пакет требует конкретные версии:
- `@modelcontextprotocol/sdk: ^1.0.4` (НЕ 1.21+)
- `zod: ^3.24.1` (НЕ 4.x)

## Версия

**Текущая:** 0.4.0  
**Статус:** Production Ready ✅

## Ссылки

- [GitHub Repository](https://github.com/VirtoCommerce/vc-shell)
- [VC-Shell Documentation](https://github.com/VirtoCommerce/vc-shell-docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## Лицензия

MIT

---

**Готово к использованию!** Установите, перезапустите IDE и начните генерировать модули с AI! 🚀
