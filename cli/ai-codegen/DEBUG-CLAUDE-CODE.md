# 🔍 MCP Debug для Claude Code

## ✅ Логирование теперь включено по умолчанию!

Debug логирование работает **автоматически** для всех MCP вызовов.

### 📍 Где смотреть логи?

#### 1. Live Debug Log (в реальном времени)
```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
npm run mcp:watch

# Или напрямую:
tail -f /tmp/mcp-debug.log
```

#### 2. Metrics JSON (статистика)
```bash
cat /Users/symbot/DEV/vc-shell/cli/ai-codegen/.mcp-metrics.json | jq .
```

---

## 🚀 Как использовать прямо сейчас:

### Шаг 1: Перезапустите Claude Code
В Cursor нажмите **Cmd+Shift+P** → `Reload Window`

Или полностью перезапустите Cursor (Cmd+Q)

### Шаг 2: Запустите watcher
```bash
cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
npm run mcp:watch
```

### Шаг 3: Используйте Claude Code
Когда Claude Code обращается к MCP инструментам, вы сразу увидите в watcher:

```
[MCP DEBUG 2025-01-19T18:30:15.123Z]
============================================================
[MCP DEBUG 2025-01-19T18:30:15.123Z] Tool call: search_components
[MCP DEBUG 2025-01-19T18:30:15.124Z] Arguments: {
  "query": "table",
  "limit": 10
}
[MCP DEBUG 2025-01-19T18:30:15.125Z]
============================================================
[MCP DEBUG 2025-01-19T18:30:15.140Z] ✓ Tool completed successfully: search_components
```

---

## 📊 Что логируется?

### Все MCP инструменты:

**Discovery (поиск компонентов):**
- `search_components` - поиск компонентов
- `view_components` - просмотр деталей
- `get_component_examples` - примеры использования
- `get_component_capabilities` - возможности компонента
- `search_components_by_intent` - семантический поиск

**Framework APIs:**
- `search_framework_apis` - поиск API
- `view_framework_apis` - детали API
- `get_framework_capabilities` - возможности
- `get_framework_examples` - примеры

**Workflow (генерация кода):**
- `analyze_prompt_v2` - анализ запроса
- `create_ui_plan_from_analysis_v2` - создание UI-Plan
- `validate_ui_plan` - валидация плана
- `generate_with_composition` - генерация инструкций
- `submit_generated_code` - отправка кода

---

## 🎨 Цветовая кодировка в watcher

- 🔵 **Cyan** - Tool call (вызов инструмента)
- 🟢 **Green** - Success (успешное выполнение)
- 🔴 **Red** - Error (ошибка)
- 🟡 **Yellow** - Arguments (аргументы)
- 🟣 **Magenta** - Separators (разделители)

---

## 🛠️ Полезные команды

### Просмотр последних логов:
```bash
tail -50 /tmp/mcp-debug.log
```

### Поиск конкретного инструмента:
```bash
grep "search_components" /tmp/mcp-debug.log
```

### Подсчет вызовов:
```bash
grep "Tool call:" /tmp/mcp-debug.log | cut -d' ' -f7 | sort | uniq -c
```

### Просмотр статистики:
```bash
cat .mcp-metrics.json | jq '.toolStats'
```

### Очистка логов:
```bash
> /tmp/mcp-debug.log
```

### Убить старые MCP процессы:
```bash
npm run mcp:clean
```

---

## ⚙️ Отключение логирования (если нужно)

Если логирование мешает, можно отключить:

```bash
export DEBUG_MCP=false
```

Или в коде [mcp.ts:127](src/commands/mcp.ts#L127) поменять:
```typescript
const debugMode = false; // Отключить логирование
```

---

## 📈 Анализ производительности

### Топ инструментов по вызовам:
```bash
cat .mcp-metrics.json | jq '.toolStats | sort_by(-.callCount) | .[] | {name, calls: .callCount, avgTime: .avgDuration}'
```

### Workflow последовательность:
```bash
cat .mcp-metrics.json | jq '.workflow[] | {tool: .toolName, success: .success}'
```

### Время сессии:
```bash
cat .mcp-metrics.json | jq '{start: .sessionStart, duration_sec: (.sessionDuration / 1000)}'
```

---

## ❓ Troubleshooting

### Логи не появляются?

1. **Проверьте, что проект пересобран:**
   ```bash
   cd /Users/symbot/DEV/vc-shell/cli/ai-codegen
   npm run build
   ```

2. **Убейте старые MCP процессы:**
   ```bash
   npm run mcp:clean
   ```

3. **Перезагрузите Cursor:**
   - Cmd+Shift+P → `Reload Window`
   - Или полностью: Cmd+Q

4. **Проверьте, что файл создается:**
   ```bash
   ls -la /tmp/mcp-debug.log
   ```

5. **Проверьте запущенные MCP серверы:**
   ```bash
   ps aux | grep "vcshell.*mcp" | grep -v grep
   ```

### Слишком много логов?

Можно уменьшить детализацию, закомментировав в [mcp.ts:361](src/commands/mcp.ts#L361):
```typescript
// debugLog(`Arguments:`, JSON.stringify(args, null, 2));
```

---

## 🎯 Важно!

- Логирование работает **автоматически** после пересборки
- **НЕ нужно** настраивать переменные окружения
- **НЕ нужно** искать конфиг Claude Code
- Просто пересоберите проект и перезагрузите Cursor!

**Готово! Теперь все MCP вызовы логируются в `/tmp/mcp-debug.log` 🎉**
