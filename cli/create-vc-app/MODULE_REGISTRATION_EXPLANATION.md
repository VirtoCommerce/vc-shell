# Автоматическая Регистрация Модулей

> **Статус:** ✅ Работает Корректно  
> **Дата проверки:** 2025-01-07

---

## 📊 Результат Тестирования

Автоматическая регистрация модулей в `main.ts` **работает правильно** в неинтерактивном режиме.

### Тест

```bash
cd /Users/symbot/DEV/vc-shell/apps/auth-test-app
npx create-vc-app generate \
  --module test-registration \
  --type grid \
  --name item \
  --form-fields "name:text,status:select"
```

### Результат

```
✓ Registered module in main.ts  ✅
```

**В `main.ts` автоматически добавлено:**

```typescript
// Добавлен import
import TestRegistrationModule from "./modules/test-registration";

// Добавлен .use() ПЕРЕД .use(router)
app
  .use(VirtoShellFramework, { ... })
  .use(TestRegistrationModule, { router })  // ← Автоматически!
  .use(router);
```

---

## 🔍 Как Работает Регистрация

### 1. Создание Нового Модуля

Когда модуль **не существует**, CLI автоматически:

1. ✅ Создает структуру модуля
2. ✅ Генерирует blade(s)
3. ✅ Регистрирует в `main.ts`

**Код:** `generate-blade.ts` → `createModuleStructure()` → `registerModuleInMainTs()`

```typescript
// Строка 615-616 в generate-blade.ts
const registered = await registerModuleInMainTs(cwd, config.moduleName, naming.moduleNamePascal);
```

### 2. Добавление Blade к Существующему Модулю

Когда модуль **уже существует**, CLI:

1. ✅ Добавляет blade к модулю
2. ⚠️ **НЕ** пытается зарегистрировать (модуль уже должен быть зарегистрирован)

**Логика:** Модуль уже создан ранее → уже зарегистрирован → не нужно регистрировать снова.

---

## 📝 Алгоритм Регистрации

### Функция `registerModuleInMainTs()`

**Расположение:** `cli/create-vc-app/src/utils/register-module.ts`

**Что делает:**

```typescript
1. Читает main.ts
2. Проверяет, уже ли зарегистрирован модуль
   └─ Если да → пропускает
3. Добавляет import после последнего import
   └─ import ModuleNameModule from "./modules/module-name";
4. Находит .use(router)
5. Вставляет .use(ModuleNameModule, { router }) ПЕРЕД .use(router)
6. Сохраняет файл
```

### Пример: До/После

**До:**

```typescript
import { RouterView } from "vue-router";
import AuthTestApp from "./modules/auth-test-app";
import { bootstrap } from "./bootstrap";

async function startApp() {
  const app = createApp(RouterView)
    .use(VirtoShellFramework, { router })
    .use(router);
}
```

**После (автоматически):**

```typescript
import { RouterView } from "vue-router";
import AuthTestApp from "./modules/auth-test-app";
import { bootstrap } from "./bootstrap";
import ProductsModule from "./modules/products";  // ← Добавлено

async function startApp() {
  const app = createApp(RouterView)
    .use(VirtoShellFramework, { router })
    .use(ProductsModule, { router })  // ← Добавлено
    .use(router);
}
```

---

## ⚠️ Когда Регистрация НЕ Происходит

### Случай 1: Blade Добавляется к Существующему Модулю

```bash
# Модуль "products" уже существует
npx create-vc-app generate \
  --module products \
  --type details \
  --name product
```

**Результат:** Blade добавлен, но регистрация НЕ вызывается (модуль уже должен быть зарегистрирован).

### Случай 2: main.ts Не Найден

```
⚠️  main.ts not found at /path/to/src/main.ts
   Please register the module manually.
```

**Решение:** Зарегистрировать вручную.

### Случай 3: Ошибка При Регистрации

```
⚠️  Failed to auto-register module: [error message]
   Please register manually.
```

**Решение:** Зарегистрировать вручную (см. ниже).

---

## 🔧 Ручная Регистрация

Если автоматическая регистрация не сработала:

### Шаг 1: Добавить Import

```typescript
// В src/main.ts после других imports
import YourModuleModule from "./modules/your-module";
```

### Шаг 2: Добавить .use()

```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { router })
  .use(YourModuleModule, { router })  // ← Добавить ПЕРЕД .use(router)
  .use(router);
```

### ⚠️ Важно: Порядок .use()

```typescript
// ✅ Правильно
.use(VirtoShellFramework, { ... })
.use(YourModule, { router })  // ПЕРЕД router
.use(router)

// ❌ Неправильно
.use(VirtoShellFramework, { ... })
.use(router)
.use(YourModule, { router })  // ПОСЛЕ router - не работает!
```

---

## 🐛 Troubleshooting

### Проблема: "Module not appearing in navigation"

**Проверьте:**

1. **Import есть?**
   ```typescript
   import ProductsModule from "./modules/products";
   ```

2. **.use() есть?**
   ```typescript
   .use(ProductsModule, { router })
   ```

3. **.use() ПЕРЕД .use(router)?**
   ```typescript
   .use(ProductsModule, { router })  // ← Должен быть ПЕРЕД
   .use(router)
   ```

4. **Сервер перезапущен?**
   ```bash
   # Ctrl+C
   yarn serve
   ```

### Проблема: "Module commented out"

**Пример:**

```typescript
// .use(ProductsModule, { router })  // ← Закомментирован
```

**Решение:** Раскомментировать

```typescript
.use(ProductsModule, { router })  // ← Работает
```

---

## 📊 Текущее Состояние

### В `auth-test-app/src/main.ts`

**Зарегистрированные модули:**

```typescript
import ProductsModule from "./modules/products";  // ✅ Есть

app
  .use(VirtoShellFramework, { router })
  .use(ProductsModule, { router })  // ✅ Зарегистрирован
  .use(router);
```

**Закомментированные модули:**

```typescript
// import CategoriesModule from "./modules/categories";  // ⚠️ Закомментирован

// .use(CategoriesModule, { router })  // ⚠️ Закомментирован
```

**Что делать:** Если хотите использовать `categories`, раскомментируйте обе строки.

---

## 🎨 Поддержка Двух Стилей

CLI автоматически определяет стиль инициализации приложения:

### Стиль 1: Chain (Цепочка)

```typescript
const app = createApp(RouterView)
  .use(VirtoShellFramework, { router })
  .use(ProductsModule, { router })  // ← .use() без app.
  .use(router);
```

**CLI добавит:** `.use(ModuleName, { router })`

### Стиль 2: Separate (Отдельные операторы)

```typescript
const app = createApp(RouterView);

app.use(VirtoShellFramework, { router });
app.use(ProductsModule, { router });  // ← app.use() с точкой с запятой
app.use(router);
```

**CLI добавит:** `app.use(ModuleName, { router });`

### Как Определяется

1. Находит `const app = createApp(...)`
2. Смотрит что идет дальше:
   - Если `.use()` → **chain style**
   - Если `;` и `app.use()` → **separate style**
3. Генерирует соответствующий синтаксис

**Подробнее:** См. [`APP_STYLES_COMPARISON.md`](./APP_STYLES_COMPARISON.md)

---

## ✅ Выводы

1. **Автоматическая регистрация работает** ✅
2. **При создании нового модуля** - регистрируется автоматически ✅
3. **При добавлении blade к существующему** - регистрация не вызывается (и не нужна) ✅
4. **Поддерживает оба стиля** - chain и separate ✅
5. **Ручная регистрация всегда возможна** ✅

---

## 📚 Связанные Файлы

- `cli/create-vc-app/src/utils/register-module.ts` - код регистрации
- `cli/create-vc-app/src/commands/generate-blade.ts` - вызов регистрации
- `apps/{your-app}/src/main.ts` - файл приложения для регистрации

---

**Автоматическая регистрация модулей работает корректно!** ✅

