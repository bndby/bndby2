---
date: 2026-05-10
description: Что реально вошло в ES2025, что готовится в ES2026 и какие фичи уже можно закладывать в production-практики JavaScript.
tags:
    - javascript
    - es2025
    - es2026
    - tc39
categories:
    - JS
slug: whats-new-in-js
---

# Что на самом деле нового в JavaScript (и что будет дальше)

ES2025 уже стандартизирован, ES2026 практически финализирован, а часть ключевых возможностей уже доступна в браузерах и Node.js. Ниже - сжатый и очищенный разбор: что вошло в язык, что на подходе и что пока осталось за пределами релиза.

<!-- more -->

![Что нового в JavaScript](./hero.webp)

## Кто решает, что попадает в JavaScript

JavaScript как язык определяется спецификацией ECMAScript, которую ведет комитет TC39. Движки браузеров (`V8`, `JavaScriptCore`, `SpiderMonkey`) реализуют одну и ту же спецификацию, поэтому поведение языка согласовано между платформами.

Процесс принятия фич идет по стадиям:

- Stage 0: идея
- Stage 1: проблема признана важной
- Stage 2: есть черновой дизайн
- Stage 2.7: дизайн в принципе согласован, пишутся тесты
- Stage 3: можно внедрять в движки
- Stage 4: две независимые реализации + прохождение Test262

После Stage 4 предложение попадает в "живую" спецификацию и входит в ближайший годовой снапшот ECMAScript.

## ES2025: что уже вошло

### Iterator helpers

На `Iterator.prototype` появились методы:

- `.map()`
- `.filter()`
- `.take()`
- `.drop()`
- `.flatMap()`
- `.reduce()`
- `.forEach()`
- `.some()`
- `.every()`
- `.find()`
- `.toArray()`

Плюс `Iterator.from(x)` для оборачивания iterable-объектов (`NodeList`, `Set`, кастомных iterable).

Главный эффект: ленивые цепочки без промежуточной материализации массивов, что особенно важно для стримов и потенциально бесконечных источников.

```js
function* naturalNumbers() {
    let n = 1;
    while (true) yield n++;
}

const firstTenEvenSquares = naturalNumbers()
    .filter((n) => n % 2 === 0)
    .map((n) => n * n)
    .take(10)
    .toArray();
```

### Set methods

В `Set` появились стандартные операции теории множеств:

- `union`
- `intersection`
- `difference`
- `symmetricDifference`
- `isSubsetOf`
- `isSupersetOf`
- `isDisjointFrom`

Методы не мутируют исходный `Set`, а возвращают новый.

### JSON modules

Импорт JSON теперь стандартный, через import attributes:

```js
import config from "./config.json" with { type: "json" };
```

Атрибут `with { type: "json" }` обязателен и повышает безопасность загрузки.

### Promise.try

`Promise.try` унифицирует поведение для sync/async функций и sync throw:

```js
Promise.try(() => thirdParty.doThing())
    .then((result) => processResult(result))
    .catch((err) => handleAnyFailure(err));
```

### RegExp.escape

Безопасный способ экранировать пользовательский ввод при сборке регулярки:

```js
const pattern = new RegExp(RegExp.escape(userInput));
```

### Float16Array

Добавлен `Float16Array`: полезен для графики/ML/WebGPU и форматов, где нужен `float16` с меньшим потреблением памяти.

### Также в ES2025

- `Intl.DurationFormat`
- accessors в `Intl.Locale` (`weekInfo`, `hourCycles`, `getCalendars` и др.)

## ES2026: что идет следующим

### Math.sumPrecise

Точное суммирование float-значений с компенсацией ошибок округления:

```js
Math.sumPrecise([0.1, 0.2, 0.3]); // стабильнее reduce((a, b) => a + b)
```

### Uint8Array: base64 и hex

Нативные методы кодирования/декодирования:

```js
const bytes = new Uint8Array([72, 101, 108, 108, 111]);
bytes.toBase64(); // "SGVsbG8="
bytes.toHex(); // "48656c6c6f"
Uint8Array.fromBase64("SGVsbG8=");
Uint8Array.fromHex("48656c6c6f");
```

### Error.isError

Кросс-realm проверка ошибки (в отличие от ненадежного `instanceof Error`):

```js
if (Error.isError(maybeError)) {
    logger.error(maybeError.message);
}
```

### Iterator.concat

Объединение итераторов в один поток:

```js
const all = Iterator.concat(first(), second());
```

### Map.getOrInsert (upsert-паттерн)

Удобный API для кэшей и счетчиков:

```js
counts.set(word, counts.getOrInsert(word, 0) + 1);
cache.getOrInsertComputed(id, () => expensiveLookup(id));
```

### Array.fromAsync

Сбор async iterable в массив:

```js
const allItems = await Array.fromAsync(fetchPages());
```

### JSON.parse с source text в reviver

`reviver` получает `context.source`, что позволяет корректно обрабатывать большие числа:

```js
const parsed = JSON.parse(text, (key, value, context) => {
    if (typeof value === "number" && !Number.isSafeInteger(value)) {
        return BigInt(context.source);
    }
    return value;
});
```

## Уже поддерживается в движках, но не в ES2026

### Temporal

Замена `Date` с нормальной моделью времени/таймзон. Формально уже Stage 4, но ожидается в составе ES2027.

### `using`

Управление ресурсами на уровне языка (`[Symbol.dispose]` / `[Symbol.asyncDispose]`), сейчас Stage 3.

### `import defer`

Отложенная оценка модулей до первого обращения к namespace, тоже Stage 3.

## Что пока не доехало

- Декораторы (все еще Stage 3)
- Полноценные immutable Records/Tuples (текущий вариант не вошел)
- Pipeline operator (`|>`)
- Pattern matching (Stage 1)
- Async iterator helpers (Stage 2)

## Практический вывод

Если вы обновляете кодовую базу в 2026 году, уже имеет смысл:

1. Использовать iterator helpers для ленивых цепочек и больших потоков данных.
2. Заменять ручные операции над `Set` и `Map` на нативные методы.
3. Переходить на `Array.fromAsync`, `Error.isError`, `RegExp.escape`.
4. Проверять поддержку `Temporal`, `using`, `import defer` и готовить постепенное внедрение (с полифиллами при необходимости).

Так вы убираете legacy-паттерны 2020-2022 годов и пишете код, ближе к современному стандарту языка.

## Источники

- [Оригинальная статья](https://neciudan.dev/whats-new-in-javascript)
- [TC39 Proposals](https://github.com/tc39/proposals)
- [ECMAScript Specification](https://tc39.es/ecma262/)
- [MDN: Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)
