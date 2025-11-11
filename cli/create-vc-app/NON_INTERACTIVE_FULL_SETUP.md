# Non-Interactive Mode: Full App + Module Setup

> **How to create complete app with module (grid + details blades) in non-interactive mode**

---

## 🎯 Goal

Создать приложение с модулем, включающим **оба блейда** (grid и details), используя только CLI команды без интерактивных промптов.

---

## 📝 Current Limitation

**Одной командой нельзя создать оба блейда.**

CLI генерирует по одному blade за раз:
- `--type grid` → создает grid blade
- `--type details` → создает details blade

**Решение:** Выполнить команды последовательно.

---

## ✅ Recommended Approach

### Вариант 1: Создание Приложения + Модуль с Обоими Блейдами

```bash
# Шаг 1: Создать приложение БЕЗ модуля
npx create-vc-app my-shop \
  --package-name "my-shop" \
  --base-path "/apps/my-shop/" \
  --skip-module-gen

# Шаг 2: Перейти в директорию
cd my-shop

# Шаг 3: Создать grid blade (создаст новый модуль)
npx create-vc-app generate \
  --module products \
  --type grid \
  --name product \
  --form-fields '[{"name":"name","type":"text"},{"name":"sku","type":"text"},{"name":"price","type":"currency"},{"name":"status","type":"select"}]'

# Шаг 4: Добавить details blade к модулю
npx create-vc-app generate \
  --module products \
  --type details \
  --name product \
  --form-fields '[{"name":"name","type":"text"},{"name":"sku","type":"text"},{"name":"description","type":"editor"},{"name":"price","type":"currency"},{"name":"compareAtPrice","type":"currency"},{"name":"category","type":"select"},{"name":"tags","type":"multivalue"},{"name":"stock","type":"number"},{"name":"images","type":"gallery"},{"name":"active","type":"switch"}]'
```

**Результат:**
```
my-shop/
  src/
    modules/
      products/
        pages/
          products.vue          # ← Grid blade
          product-details.vue   # ← Details blade
        composables/
          useProductList.ts
          useProductDetails.ts
        locales/
          en.json
        index.ts
```

---

### Вариант 2: Через Скрипт (Рекомендуется для Автоматизации)

Создайте bash скрипт `create-full-app.sh`:

```bash
#!/bin/bash

APP_NAME="my-shop"
MODULE_NAME="products"
ENTITY_NAME="product"

# Grid fields (простые для списка)
GRID_FIELDS='[
  {"name":"name","type":"text"},
  {"name":"sku","type":"text"},
  {"name":"price","type":"currency"},
  {"name":"category","type":"select"},
  {"name":"stock","type":"number"},
  {"name":"status","type":"select"}
]'

# Details fields (полная форма)
DETAILS_FIELDS='[
  {"name":"name","type":"text"},
  {"name":"sku","type":"text"},
  {"name":"description","type":"editor"},
  {"name":"shortDescription","type":"textarea"},
  {"name":"price","type":"currency"},
  {"name":"compareAtPrice","type":"currency"},
  {"name":"costPrice","type":"currency"},
  {"name":"category","type":"select"},
  {"name":"brand","type":"text"},
  {"name":"tags","type":"multivalue"},
  {"name":"stock","type":"number"},
  {"name":"lowStockAlert","type":"number"},
  {"name":"weight","type":"number"},
  {"name":"images","type":"gallery"},
  {"name":"featured","type":"switch"},
  {"name":"active","type":"radio"},
  {"name":"seoTitle","type":"text"},
  {"name":"seoDescription","type":"textarea"}
]'

echo "🚀 Creating application: $APP_NAME"
npx --yes create-vc-app "$APP_NAME" \
  --package-name "$APP_NAME" \
  --base-path "/apps/$APP_NAME/" \
  --skip-module-gen

cd "$APP_NAME" || exit 1

echo ""
echo "📦 Creating module: $MODULE_NAME with grid blade"
npx --yes create-vc-app generate \
  --module "$MODULE_NAME" \
  --type grid \
  --name "$ENTITY_NAME" \
  --form-fields "$GRID_FIELDS"

echo ""
echo "📝 Adding details blade to module: $MODULE_NAME"
npx --yes create-vc-app generate \
  --module "$MODULE_NAME" \
  --type details \
  --name "$ENTITY_NAME" \
  --form-fields "$DETAILS_FIELDS"

echo ""
echo "✅ Done! Application created at: $APP_NAME"
echo ""
echo "Next steps:"
echo "  cd $APP_NAME"
echo "  yarn"
echo "  yarn serve"
```

**Запуск:**
```bash
chmod +x create-full-app.sh
./create-full-app.sh
```

---

### Вариант 3: Python Скрипт (Для Кросс-Платформенности)

```python
#!/usr/bin/env python3
"""
Create VC-Shell app with module (grid + details blades)
"""

import subprocess
import json
import sys
import os

APP_NAME = "my-shop"
MODULE_NAME = "products"
ENTITY_NAME = "product"

GRID_FIELDS = [
    {"name": "name", "type": "text"},
    {"name": "sku", "type": "text"},
    {"name": "price", "type": "currency"},
    {"name": "category", "type": "select"},
    {"name": "stock", "type": "number"},
    {"name": "status", "type": "select"}
]

DETAILS_FIELDS = [
    {"name": "name", "type": "text"},
    {"name": "sku", "type": "text"},
    {"name": "description", "type": "editor"},
    {"name": "shortDescription", "type": "textarea"},
    {"name": "price", "type": "currency"},
    {"name": "compareAtPrice", "type": "currency"},
    {"name": "costPrice", "type": "currency"},
    {"name": "category", "type": "select"},
    {"name": "brand", "type": "text"},
    {"name": "tags", "type": "multivalue"},
    {"name": "stock", "type": "number"},
    {"name": "lowStockAlert", "type": "number"},
    {"name": "weight", "type": "number"},
    {"name": "images", "type": "gallery"},
    {"name": "featured", "type": "switch"},
    {"name": "active", "type": "radio"},
    {"name": "seoTitle", "type": "text"},
    {"name": "seoDescription", "type": "textarea"}
]

def run_command(cmd, cwd=None):
    """Run command and handle errors"""
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Command failed: {result.stderr}")
        sys.exit(1)
    
    print(result.stdout)
    return result

def main():
    print(f"🚀 Creating application: {APP_NAME}")
    
    # Step 1: Create app
    run_command([
        "npx", "--yes", "create-vc-app", APP_NAME,
        "--package-name", APP_NAME,
        "--base-path", f"/apps/{APP_NAME}/",
        "--skip-module-gen"
    ])
    
    app_dir = os.path.join(os.getcwd(), APP_NAME)
    
    # Step 2: Create grid blade (creates module)
    print(f"\n📦 Creating module: {MODULE_NAME} with grid blade")
    run_command([
        "npx", "--yes", "create-vc-app", "generate",
        "--module", MODULE_NAME,
        "--type", "grid",
        "--name", ENTITY_NAME,
        "--form-fields", json.dumps(GRID_FIELDS)
    ], cwd=app_dir)
    
    # Step 3: Add details blade
    print(f"\n📝 Adding details blade to module: {MODULE_NAME}")
    run_command([
        "npx", "--yes", "create-vc-app", "generate",
        "--module", MODULE_NAME,
        "--type", "details",
        "--name", ENTITY_NAME,
        "--form-fields", json.dumps(DETAILS_FIELDS)
    ], cwd=app_dir)
    
    print("\n✅ Done! Application created at:", APP_NAME)
    print("\nNext steps:")
    print(f"  cd {APP_NAME}")
    print("  yarn")
    print("  yarn serve")

if __name__ == "__main__":
    main()
```

**Запуск:**
```bash
python3 create-full-app.py
```

---

## 🔍 Разбор Команд

### Создание Приложения

```bash
npx create-vc-app my-shop \
  --package-name "my-shop" \           # Имя пакета в package.json
  --base-path "/apps/my-shop/" \       # Базовый путь для роутинга
  --skip-module-gen                    # НЕ создавать модуль (создадим вручную)
```

**Что создается:**
```
my-shop/
  src/
    main.ts
    router/
    bootstrap.ts
    locales/
  package.json
  vite.config.ts
  tsconfig.json
```

### Создание Grid Blade (+ Модуль)

```bash
npx create-vc-app generate \
  --module products \                  # Название модуля
  --type grid \                        # Тип: grid (список)
  --name product \                     # Имя сущности (singular!)
  --form-fields '[...]'                # JSON с полями таблицы
```

**Что создается:**
```
src/modules/products/
  pages/
    products.vue                       # Grid blade (список)
  composables/
    useProductList.ts                  # Composable для grid
  locales/
    en.json
  index.ts                             # Module export
```

**И регистрируется в `main.ts`:**
```typescript
import ProductsModule from "./modules/products";
app.use(ProductsModule, { router });
```

### Добавление Details Blade

```bash
npx create-vc-app generate \
  --module products \                  # СУЩЕСТВУЮЩИЙ модуль
  --type details \                     # Тип: details (форма)
  --name product \                     # Та же сущность
  --form-fields '[...]'                # JSON с полями формы
```

**Что добавляется:**
```
src/modules/products/
  pages/
    products.vue                       # Grid (уже был)
    product-details.vue                # ← Details blade (новый)
  composables/
    useProductList.ts                  # Grid composable (уже был)
    useProductDetails.ts               # ← Details composable (новый)
  locales/
    en.json                            # Обновлен с новыми полями
  index.ts                             # Обновлен с экспортом Details
```

---

## 📋 Form Fields Format

### Короткий формат (простые типы)

```bash
--form-fields "name:text,price:currency,active:switch"
```

### JSON формат (полный контроль)

```bash
--form-fields '[
  {"name":"productName","type":"text","label":"Product Name"},
  {"name":"price","type":"currency"},
  {"name":"description","type":"editor"},
  {"name":"status","type":"select","props":"{\"options\":[\"draft\",\"active\"]}"}
]'
```

### Доступные типы полей

| Type | Component | Example |
|------|-----------|---------|
| `text` | VcInput | `{"name":"title","type":"text"}` |
| `textarea` | VcTextarea | `{"name":"notes","type":"textarea"}` |
| `editor` | VcEditor | `{"name":"description","type":"editor"}` |
| `number` | VcInput (number) | `{"name":"quantity","type":"number"}` |
| `currency` | VcInputCurrency | `{"name":"price","type":"currency"}` |
| `date` | VcInput (date) | `{"name":"publishDate","type":"date"}` |
| `select` | VcSelect | `{"name":"category","type":"select"}` |
| `multivalue` | VcMultivalue | `{"name":"tags","type":"multivalue"}` |
| `switch` | VcSwitch | `{"name":"active","type":"switch"}` |
| `radio` | VcRadioButton | `{"name":"status","type":"radio"}` |
| `checkbox` | VcCheckbox | `{"name":"featured","type":"checkbox"}` |
| `gallery` | VcGallery | `{"name":"images","type":"gallery"}` |
| `image` | VcImage | `{"name":"thumbnail","type":"image"}` |

---

## 🚀 Complete Example

### E-commerce Products Module

```bash
#!/bin/bash

# 1. Create app
npx --yes create-vc-app ecommerce-app \
  --package-name "ecommerce-app" \
  --base-path "/apps/ecommerce/" \
  --skip-module-gen

cd ecommerce-app

# 2. Create products module with grid blade
npx --yes create-vc-app generate \
  --module products \
  --type grid \
  --name product \
  --form-fields '[
    {"name":"name","type":"text"},
    {"name":"sku","type":"text"},
    {"name":"price","type":"currency"},
    {"name":"category","type":"select"},
    {"name":"stock","type":"number"},
    {"name":"status","type":"select"}
  ]'

# 3. Add details blade
npx --yes create-vc-app generate \
  --module products \
  --type details \
  --name product \
  --form-fields '[
    {"name":"name","type":"text"},
    {"name":"sku","type":"text"},
    {"name":"description","type":"editor"},
    {"name":"shortDescription","type":"textarea"},
    {"name":"price","type":"currency"},
    {"name":"compareAtPrice","type":"currency"},
    {"name":"costPrice","type":"currency"},
    {"name":"category","type":"select"},
    {"name":"brand","type":"text"},
    {"name":"tags","type":"multivalue"},
    {"name":"stock","type":"number"},
    {"name":"lowStockAlert","type":"number"},
    {"name":"weight","type":"number"},
    {"name":"images","type":"gallery"},
    {"name":"featured","type":"switch"},
    {"name":"status","type":"radio"},
    {"name":"seoTitle","type":"text"},
    {"name":"seoDescription","type":"textarea"}
  ]'

# 4. Install and run
yarn
yarn serve
```

---

## ⚠️ Important Notes

### 1. Порядок Важен

```bash
# ✅ Правильно: Сначала grid, потом details
npx create-vc-app generate --module products --type grid --name product
npx create-vc-app generate --module products --type details --name product

# ✅ Тоже работает: Сначала details, потом grid
npx create-vc-app generate --module products --type details --name product
npx create-vc-app generate --module products --type grid --name product
```

Первая команда создаст модуль, вторая добавит blade.

### 2. Имя Сущности (Entity Name)

**ВАЖНО:** Используйте **singular** (единственное число):

```bash
# ✅ Правильно
--name product      # → products.vue, product-details.vue

# ❌ Неправильно
--name products     # → productss.vue (двойная s!)
```

### 3. Регистрация Модуля

CLI автоматически регистрирует модуль в `main.ts` при первой генерации:

```typescript
// Автоматически добавляется:
import ProductsModule from "./modules/products";
app.use(ProductsModule, { router });
```

### 4. JSON Escaping

В bash/shell нужно правильно экранировать JSON:

```bash
# Используйте одинарные кавычки снаружи
--form-fields '[{"name":"title","type":"text"}]'

# Или экранируйте двойные кавычки
--form-fields "[{\"name\":\"title\",\"type\":\"text\"}]"
```

---

## 📚 См. Также

- [CLI Usage Guide](./cli-usage.md) - Полный CLI референс
- [Quick Start Scenarios](./prompts/quick-start-scenarios.md) - Готовые промпты
- [Form Builder Guide](./form-builder.md) - Типы полей
- [Module Registration](./MODULE_REGISTRATION_EXPLANATION.md) - Как работает регистрация

---

## ✅ Quick Checklist

Для создания полного приложения с модулем:

- [ ] Создать приложение с `--skip-module-gen`
- [ ] `cd` в директорию приложения
- [ ] Создать grid blade (создаст модуль)
- [ ] Добавить details blade к модулю
- [ ] Запустить `yarn && yarn serve`
- [ ] Проверить что модуль зарегистрирован в `main.ts`

---

**Используйте скрипты для автоматизации!** Bash или Python скрипт = одна команда для полного setup. 🚀


