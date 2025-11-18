# MCP scaffold_app Tool - Usage Clarification

## Дата: 2025-11-17

## Проблема

При попытке создать новое VC-Shell приложение, AI использовал **прямой вызов через Bash**:

```bash
cd /Users/symbot/DEV/vc-shell/gen-apps && npx @vc-shell/create-vc-app offers-management --yes
```

**Проблема:** Флаг `--yes` не отключает интерактивный blade generator, который запускается автоматически после создания приложения. Это приводит к зависанию команды в ожидании пользовательского ввода.

## Правильный подход

Для создания приложения нужно использовать **MCP tool `scaffold_app`**, который:

1. Автоматически добавляет флаг `--skip-module-gen` ✅
2. Добавляет флаг `--overwrite` для перезаписи существующих файлов
3. Создает только базовую структуру приложения без модулей
4. После создания пользователь может генерировать модули через `generate_complete_module`

**Код tool (mcp.ts:1155-1159):**
```typescript
const result = await execa("npx", [
  "@vc-shell/create-vc-app@latest",
  projectName,
  "--skip-module-gen",  // ✅ Ключевой флаг!
  "--overwrite"
], {
  cwd: targetDir,
  stdio: "pipe",
});
```

## Решение

### 1. Улучшено описание MCP tool

**Файл:** `src/commands/mcp.ts:156-157`

**Было:**
```typescript
description: "Create a new VC-Shell application from scratch using create-vc-app. This initializes a complete project structure with TypeScript, Vue 3, and all necessary dependencies."
```

**Стало:**
```typescript
description: "Create a new VC-Shell application from scratch using create-vc-app. IMPORTANT: Always use this tool (NOT bash/npx) when user asks to 'create new app', 'scaffold app', or 'initialize VC-Shell project'. This tool automatically uses --skip-module-gen flag to create base app structure only. After app creation, user can generate modules using generate_complete_module tool."
```

### 2. Ключевые улучшения в description:

1. ✅ **"IMPORTANT: Always use this tool (NOT bash/npx)"** - явно указывает AI не использовать прямые команды
2. ✅ **Перечислены триггерные фразы:** "create new app", "scaffold app", "initialize VC-Shell project"
3. ✅ **Объяснен флаг --skip-module-gen:** "automatically uses --skip-module-gen flag"
4. ✅ **Указан workflow:** сначала scaffold_app, потом generate_complete_module

## Правильный workflow для создания приложения

### Шаг 1: Создать базовое приложение
```
User prompt: "Create new VC-Shell app called offers-management"

AI должен:
→ Использовать MCP tool: scaffold_app
→ Параметры: { projectName: "offers-management", targetDirectory: "/path/to/gen-apps" }
```

**Результат:** Приложение создано БЕЗ модулей, с базовой структурой.

### Шаг 2: Установить зависимости
```bash
cd offers-management
yarn install
```

### Шаг 3: Сгенерировать модули
```
User prompt: "Create offers management module with list and details blades"

AI должен:
1. Вызвать analyze_prompt_v2 для анализа промпта
2. Вызвать create_ui_plan_from_analysis_v2 для создания UI-Plan
3. Вызвать generate_complete_module или generate_with_composition для генерации кода
```

## Документация

Этот workflow уже документирован в README.md:

**Секция "Option 2: Create New VC-Shell App"** (строки 95-128):
```
#### 3. Create App via AI

**Prompt in Cursor:**
Create new VC-Shell app called "my-vendor-portal"

**AI will automatically:**
1. Call `scaffold_app` tool  ✅
2. Tool runs: `npx @vc-shell/create-vc-app@latest my-vendor-portal --skip-module-gen`
3. App created with base structure (no modules yet)
```

## Тестирование

После этого исправления, AI должен:

1. ✅ При запросе "Create new VC-Shell app" → использовать MCP tool `scaffold_app`
2. ✅ НЕ использовать прямой вызов `npx @vc-shell/create-vc-app`
3. ✅ Приложение создается без интерактивных промптов
4. ✅ После создания пользователь может генерировать модули

## Файлы изменены

1. `src/commands/mcp.ts` - улучшено описание tool `scaffold_app` (строка 156-157)

## Статус: ✅ ИСПРАВЛЕНО

MCP tool `scaffold_app` теперь имеет четкое описание, которое поможет AI правильно использовать его для создания новых приложений.

---

## Для пользователей Claude Code

Если вы хотите, чтобы AI мог создавать приложения без запроса разрешения, добавьте в настройки pre-approved tools:

```
mcp__vcshell-codegen__scaffold_app
```

Но даже без этого, улучшенное описание поможет AI понять, что нужно использовать именно этот tool, а не Bash команды.
