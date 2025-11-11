# MCP Server Setup для Cursor IDE

## Быстрая установка

### 1. Соберите пакет

```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
yarn install
yarn build
```

### 2. Проверьте что файлы на месте

```bash
# Должны существовать:
ls -la dist/index.js
ls -la dist/schemas/component-registry.json
ls -la dist/schemas/ui-plan.v1.schema.json
ls -la dist/examples/*.md
```

### 3. Настройте Cursor

Файл: `/Users/symbot/DEV/vc-shell/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "vcshell-codegen": {
      "command": "node",
      "args": [
        "/Users/symbot/DEV/vc-shell/cli/ai-codegen/dist/index.js",
        "mcp"
      ],
      "env": {},
      "description": "VC-Shell AI Code Generation"
    }
  }
}
```

**Важно**: Используйте **абсолютный путь** к `dist/index.js`!

### 4. Перезапустите Cursor

1. **Полностью закройте** Cursor (Command+Q на Mac)
2. Откройте Cursor снова
3. Подождите 10-15 секунд для инициализации MCP
4. Откройте проект vc-shell

### 5. Проверьте логи MCP

1. В Cursor откройте **View → Output** (или `Cmd+Shift+U`)
2. В dropdown выберите **"MCP: vcshell-codegen"**
3. Должно быть: `VC-Shell MCP Server started`

Если видите ошибки - смотрите раздел Troubleshooting ниже.

## Тестирование

### Тест 1: Список компонентов

В Cursor чате напишите:
```
@vcshell-codegen list available components
```

**Ожидается**: AI покажет список компонентов из Component Registry.

### Тест 2: Валидация UI-Plan

```
Validate this UI-Plan:
{
  "$schema": "https://vc-shell.dev/schemas/ui-plan.v1.json",
  "module": "test-module",
  "blades": [
    {
      "id": "test-list",
      "route": "/test",
      "layout": "grid",
      "title": "Test"
    }
  ]
}
```

**Ожидается**: AI валидирует план через MCP инструмент `validate_ui_plan`.

### Тест 3: Генерация модуля

```
Create vendor management with list and details
```

**Ожидается**: AI:
1. Генерирует UI-Plan JSON
2. Валидирует его
3. Генерирует Vue SFC файлы
4. Создает composables
5. Создает i18n файлы

## Troubleshooting

### Ошибка: "ENOENT: no such file or directory"

**Причина**: Неправильные пути к schemas/examples

**Решение**:
```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
yarn build  # Пересоберите пакет
```

Проверьте что файлы скопированы:
```bash
ls -la dist/schemas/
ls -la dist/examples/
```

### Ошибка: "MCP server unavailable"

**Решение**:
1. Полностью закройте Cursor (Command+Q)
2. Откройте терминал и проверьте сервер:
   ```bash
   cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
   node dist/index.js mcp
   ```
   Должно быть: `VC-Shell MCP Server started`
3. Если работает - перезапустите Cursor
4. Если не работает - смотрите ошибку в терминале

### Ошибка: "Cannot find module '@modelcontextprotocol/sdk'"

**Решение**:
```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
yarn install  # Переустановите зависимости
yarn build
```

### Проверка версии Node.js

```bash
node --version
```

Требуется: **v18.0.0 или выше**

Если версия старая:
```bash
nvm install 22  # или используйте nvm/fnm для установки
nvm use 22
```

## MCP Resources

MCP сервер предоставляет следующие ресурсы:

- `vcshell://component-registry` - Реестр компонентов с примерами
- `vcshell://ui-plan-schema` - JSON Schema для UI-Plan
- `vcshell://blade-list-pattern` - Паттерн list blade
- `vcshell://blade-details-pattern` - Паттерн details blade
- `vcshell://composable-list-pattern` - Паттерн list composable
- `vcshell://composable-details-pattern` - Паттерн details composable

## MCP Tools

MCP сервер предоставляет следующие инструменты:

### validate_ui_plan

Валидирует UI-Plan JSON против схемы и Component Registry.

**Пример использования в промпте**:
```
Validate this UI-Plan: {...}
```

### get_component_list

Возвращает список всех доступных VC-Shell компонентов.

**Пример использования в промпте**:
```
Show me available components
```

## Структура файлов после сборки

```
dist/
├── index.js              # Главный файл (вся логика CLI + MCP)
├── index.d.ts            # TypeScript типы
├── schemas/              # Скопированы из src/schemas/
│   ├── component-registry.json
│   ├── component-registry.v1.json
│   └── ui-plan.v1.schema.json
└── examples/             # Скопированы из src/examples/
    ├── blade-list-pattern.md
    ├── blade-details-pattern.md
    ├── composable-list-pattern.md
    └── composable-details-pattern.md
```

## Логи MCP в Cursor

Для отладки:
1. View → Output (`Cmd+Shift+U`)
2. Dropdown → "MCP: vcshell-codegen"
3. Смотрите логи:
   - `VC-Shell MCP Server started` - сервер запущен
   - `Resource request: vcshell://...` - AI читает ресурс
   - `Tool call: validate_ui_plan` - AI вызывает инструмент
   - Ошибки будут видны красным цветом

## Полезные команды

```bash
# Проверка CLI
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
node dist/index.js --help

# Запуск MCP сервера вручную (для отладки)
node dist/index.js mcp
# Ctrl+C для остановки

# Проверка что файлы скопированы
ls -la dist/schemas/
ls -la dist/examples/

# Пересборка
yarn build

# Чистая переустановка
rm -rf node_modules dist
yarn install
yarn build
```

## Что дальше?

После успешной настройки MCP:

1. **Используйте промпты** в Cursor для генерации модулей
2. **Изучите примеры** в `src/examples/` для понимания паттернов
3. **Настройте свои компоненты** в Component Registry
4. **Добавьте свои паттерны** для кастомных blade'ов

## Ссылки

- [README](../README.md) - Основная документация
- [llms.txt](./llms.txt) - Гайд для AI ассистентов
- [Component Registry](../src/schemas/component-registry.json)
- [UI-Plan Schema](../src/schemas/ui-plan.v1.schema.json)
- [Blade Examples](../src/examples/)

