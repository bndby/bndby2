---
date: 2026-05-10
description: ES2025 уже вышел, ES2026 почти финализирован. Полный разбор новых возможностей JavaScript, того, что уже можно использовать в проде, и того, что скоро появится.
tags:
    - javascript
    - es2025
    - es2026
    - tc39
    - language-features
categories:
    - JS
slug: whats-new-in-js
---

# Что на самом деле нового в JavaScript (и что будет дальше)

ES2025 вышел в июне, TC39 только что одобрил кандидат в ES2026, и часть того, что в него входит, реально изменит то, как я пишу JavaScript каждый день.

<!-- more -->

Не все. Но iterator helpers, новые методы `Set`, `Map.getOrInsert` и `Array.fromAsync` - это реальные улучшения языка. Temporal (теперь Stage 4, планируется в ES2027), `using` и `import defer` не попали в ES2026, но полифиллы и реализации в браузерах уже достаточно зрелые, чтобы использовать их сегодня.

Прежде чем нырять в эти нововведения, хочу дать контекст, которого мне самому не хватало в начале.

![Что нового в JavaScript](./hero.webp)

## Оглавление

- Кто решает, что попадает в JavaScript
- ES2025: что уже вошло
  - Iterator helpers
  - Set methods
  - JSON modules
  - Promise.try
  - RegExp.escape
  - Float16Array
  - Также в ES2025
- ES2026: что идет следующим
  - Math.sumPrecise
  - Uint8Array base64 и hex
  - Error.isError
  - Iterator.concat
  - Map.getOrInsert (upsert)
  - Array.fromAsync
  - JSON.parse с source text
- Уже поддерживается в движках, но не в ES2026
  - Temporal
  - `using`
  - `import defer`
- Что пока не доехало
- Для AI
  - Если вы используете Claude Code
  - Для других AI-инструментов
- Источники

## Кто решает, что попадает в JavaScript

Каждый браузер поставляется со своим JavaScript-движком: V8 в Chrome, JavaScriptCore в Safari, SpiderMonkey в Firefox.

Каждый - отдельная кодовая база, написанная разной командой. Тогда почему `Array.prototype.map` ведет себя одинаково во всех?

Почему `async/await` работает идентично, отлаживаете вы в Chrome или Safari?

Потому что все они реализуют одну и ту же спецификацию: ECMAScript.

JavaScript как язык определяется спецификацией ECMAScript, которую ведет комитет TC39. Комитет работает внутри Ecma International - той же организации стандартизации, которая публикует спецификацию C# (ECMA-334) и формат обмена данными JSON (ECMA-404).

В TC39 входят делегаты от всех крупных вендоров браузеров (Google, Apple, Mozilla, Microsoft), а также компании вроде Bloomberg, Igalia, Intel и приглашенные индивидуальные эксперты.

Встречи проходят примерно раз в два месяца, решения принимаются консенсусом, что на практике означает: никто не возражает настолько сильно, чтобы наложить вето.

Любое предложение проходит процесс.

Представьте воронку: вверху идею может предложить кто угодно, а до реального языка внизу доходит лишь небольшая доля.

- Stage 0: идея
- Stage 1: комитет согласился, что проблему стоит решать
- Stage 2: есть черновой дизайн на языке спецификации
- Stage 2.7 (добавлена в 2024): дизайн в целом одобрен, пишутся тесты; промежуточный этап между 2 и 3
- Stage 3: дизайн завершен, браузеры могут начинать реализацию
- Stage 4: есть две независимые реализации, проходит общий набор тестов (Test262, по которому сверяются все основные браузеры), фича готова к поставке

Когда предложение достигает Stage 4, его сразу вливают в живую спецификацию ECMAScript, и оно попадает в следующий годовой снапшот. Комитет выпускает candidate draft 1 февраля, ответвляет спецификацию в марте и передает ее на ратификацию Генеральной Ассамблее Ecma в июле.

Именно поэтому то, что в июне звучит как "новинка", часто уже месяцами работает в вашем браузере. К моменту, когда фича попадает в официальную спецификацию, ей обычно уже можно пользоваться в продакшене.

## ES2025: что уже вошло

129-я Генеральная Ассамблея Ecma утвердила ECMAScript 2025 25 июня 2025 года. Это 16-е издание. Ниже - что именно вошло, примерно в порядке моей личной важности.

### Iterator helpers

**Статус:** вышло в ES2025. Доступно в Chrome 122+, Node 22+, Firefox 131+, Safari 18.4+.

Для меня это самое интересное дополнение ES2025.

**Итератор** - это объект, который выдает значения по одному, по запросу. У него один метод - `.next()`, который при каждом вызове возвращает следующее значение.

Итераторы вообще нужны потому, что не все, по чему вы хотите итерироваться, - это массив.

- `Map` хранит ключи и значения в хеш-таблице
- `Set` хранит уникальные элементы во внутренней структуре
- `NodeList` - это "живая" выборка из DOM
- Генератор еще не вычислил свои значения и, возможно, никогда не вычислит их все

Ничто из этого не является плоским массивом в памяти, но вы все равно хотите писать `for (const x of thing)` и чтобы это просто работало.

Итераторы - это единый протокол, который делает это возможным. Любой объект может сказать: "вот как проходить мои значения по одному", реализовав `.next()`, а остальная часть языка (`for...of`, spread, деструктуризация) уже умеет это потреблять.

Поэтому вы можете разворачивать `Set` в массив, деструктурировать записи `Map` и итерироваться по результатам DOM-запросов, хотя ни одно из них не является массивом.

Каждый раз, когда вы пишете:

```js
for (const item of someArray) { ... }
for (const [key, value] of someMap) { ... }
for (const node of document.querySelectorAll('.card')) { ... }

const copy = [...someSet];
const merged = [...arr1, ...arr2];
```

...JavaScript незаметно создает итератор и вытягивает из него значения. И `for...of`, и оператор spread работают со всем, что "итерируемо", а под капотом это просто цикл вызовов `.next()`.

Вторая причина, почему итераторы важны: они **ленивые**.

Массив держит все значения в памяти прямо сейчас, а итератор вычисляет следующее значение только когда вы его запрашиваете.

Для маленьких коллекций это неважно, но для огромного датасета (CSV на миллион строк, поток пагинированного API, бесконечная последовательность) это может стать разницей между "приложение живое" и "приложение зависло".

Свой итератор можно сделать через функцию-генератор (`function*`). Генератор останавливается на каждом `yield` и продолжает работу, когда вы снова запрашиваете значение:

```js
function* naturalNumbers() {
  let n = 1;
  while (true) yield n++;
}
```

Вызов `naturalNumbers()` дает итератор, который выдает `1, 2, 3, ...` бесконечно, по одному значению за раз.

Если бы это была обычная функция с кодом `while (true)`, браузер завис бы при eager-выполнении. Но этого не происходит, потому что генераторы исполняются только когда вы из них читаете.

Итак, итераторы в языке повсюду, и ленивость - вся их суть. Проблема в том, что с итератором можно делать после того, как он у вас появился.

У массивов есть `.map()`, `.filter()`, `.reduce()`, `.flatMap()` и весь остальной набор. У итераторов - `.next()`. И все.

Как только вы хотите трансформировать итератор, раньше оставался один путь: сначала превратить его в массив:

```js
const visibleCards = Array.from(document.querySelectorAll('.card'))
  .filter(el => !el.classList.contains('hidden'))
  .map(el => el.dataset.id);
```

Это работает, но есть две цены.

Во-первых, вы создаете промежуточный массив только ради того, чтобы вызвать методы массива. Для сотни DOM-узлов это пустяк. Для ста тысяч строк из CSV-парсера - это материализация всего файла в памяти до фильтрации первой строки.

Во-вторых, это полностью ломается, если итератор бесконечный или потоковый. `Array.from` пытается исчерпать итератор целиком, прежде чем вернуть результат. Если дать ему `naturalNumbers()`, вкладка зависнет навсегда.

Поэтому для всего потокового или бесконечного приходилось отказаться от array-методов и писать цикл руками.

**До** (получить первые десять квадратов четных чисел из бесконечной последовательности):

```js
const firstTenEvenSquares = [];
for (const n of naturalNumbers()) {
  if (n % 2 === 0) {
    firstTenEvenSquares.push(n * n);
    if (firstTenEvenSquares.length === 10) break;
  }
}
```

В ES2025 эти методы перенесли прямо на итератор.

**После:**

```js
const firstTenEvenSquares = naturalNumbers()
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .take(10)
  .toArray();
```

Это работает на бесконечном итераторе, потому что iterator helpers тоже **ленивые**. `.filter()` не тянет все значения из `naturalNumbers()`, а возвращает новый итератор, который тянет по одному значению по мере запроса. `.take(10)` прекращает запрос после десяти - значит, и весь апстрим перестает производить значения. Никто не пытается полностью перечислить `naturalNumbers()`, поэтому бесконечность не становится проблемой.

Полный список методов `Iterator.prototype`: `.map()`, `.filter()`, `.take()`, `.drop()`, `.flatMap()`, `.reduce()`, `.forEach()`, `.some()`, `.every()`, `.find()`, `.toArray()`.

Для iterable-объектов, которые уже не являются итераторами (например, `NodeList` или кастомный iterable-класс), появился глобальный класс `Iterator` со статическим методом `Iterator.from(x)`, который их оборачивает. DOM-кейс теперь выглядит так:

```js
const visibleCards = Iterator.from(document.querySelectorAll('.card'))
  .filter(el => !el.classList.contains('hidden'))
  .map(el => el.dataset.id)
  .toArray();
```

Особенно сильно это окупается на потоковых данных: логи, CSV-строки, все, что читается чанками.

```js
// Обрабатываем огромный лог: берем первые 100 ошибок и останавливаем чтение.
const errors = logFileLines()
  .filter(line => line.includes('ERROR'))
  .take(100)
  .toArray();
```

Небольшой нюанс, который важно знать: в ES2025 вошли только синхронные helpers. Асинхронная версия (`.map`, `.filter`, `.take` для async iterable, плюс `Iterator.prototype.toAsync()` для конвертации sync итератора в async) - это отдельное предложение, пока на Stage 2.

Поэтому для всего асинхронного (streaming `fetch`, LLM token streams, async генераторы) пока по-прежнему пишем `for await...of`.

### Set methods

**Статус:** вышло в ES2025. Доступно во всех основных браузерах и Node 22+.

Теперь `Set` поддерживает стандартные операции теории множеств, как в других языках.

**До** (пересечение, "самодельный" вариант):

```js
const frontEnd = new Set(['HTML', 'CSS', 'JavaScript', 'React']);
const backEnd = new Set(['Node.js', 'JavaScript', 'SQL', 'React']);

// Ручное пересечение
const shared = new Set();
for (const tech of frontEnd) {
  if (backEnd.has(tech)) shared.add(tech);
}
// Или lodash: _.intersection([...frontEnd], [...backEnd])
```

**После:**

```js
frontEnd.union(backEnd);
// Set(6) { 'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SQL' }

frontEnd.intersection(backEnd);
// Set(2) { 'JavaScript', 'React' }

frontEnd.difference(backEnd);
// Set(2) { 'HTML', 'CSS' }

frontEnd.symmetricDifference(backEnd);
// Set(4) { 'HTML', 'CSS', 'Node.js', 'SQL' }

frontEnd.isSubsetOf(backEnd);     // false
frontEnd.isSupersetOf(backEnd);   // false
frontEnd.isDisjointFrom(backEnd); // false
```

Два замечания по семантике. Методы немутирующие: возвращают новый `Set`, а не меняют исходный.

Также аргумент не обязан быть именно `Set`. Ему достаточно быть "set-like": иметь числовое свойство `size`, метод `.has()` и метод `.keys()`, возвращающий итератор.

Подходит `Map`; подойдет и кастомный `LRUCache`; и вообще любой объект с этими тремя свойствами. Receiver (`this`) должен быть настоящим `Set`, а аргумент гибче.

Именно из-за этого предложение и принималось годами: комитет долго спорил, какой именно протокол требовать.

### JSON modules

**Статус:** вышло в ES2025. Доступно в Chrome 123+, Node 22+, Firefox 133+, Safari 17.4+.

JSON-файлы теперь можно импортировать как модули нативным синтаксисом, так же как JavaScript.

**До:**

```js
// Вариант A: магия вашего бандлера
import config from './config.json';
// Работает в Webpack, Vite, Rollup, но это не стандарт.
// Ломается в "чистом" браузере или Node без бандлера.

// Вариант B: fetch во время выполнения
const config = await fetch('./config.json').then(r => r.json());
```

**После:**

```js
import config from './config.json' with { type: 'json' };

// Или динамически
const translations = await import('./translations.json', {
  with: { type: 'json' }
});
```

Часть `with { type: 'json' }` обязательна и называется **import attribute**.

Этот атрибут говорит загрузчику модулей: "это JSON-модуль; если сервер вернул другой MIME-тип, откажись загружать".

Без атрибута `with` скомпрометированный CDN мог бы отдать что-то, маскирующееся под JSON, но содержащее исполняемый код.

### Promise.try

**Статус:** вышло в ES2025. Доступно в Chrome 128+, Node 22+, Firefox 134+, Safari 18.2+.

Забавный факт: это уже больше десяти лет есть в библиотеке Bluebird. ES2025 - момент, когда это наконец стало стандартом.

Вы можете вызывать функцию, которая **может** быть sync, **может** быть async и **может** бросить исключение до того, как определится. Нужен единый путь обработки всех трех исходов.

**До:**

```js
// thirdParty.doThing() бросает? Возвращает значение? Возвращает промис? Кто знает.
try {
  const result = thirdParty.doThing();
  // Если вернулся промис, его надо обработать
  Promise.resolve(result)
    .then(r => processResult(r))
    .catch(err => handleAnyFailure(err));
} catch (err) {
  // Sync-ошибки минуют promise-цепочку, значит нужен и этот обработчик
  handleAnyFailure(err);
}
```

Два обработчика ошибок, и нужно помнить про оба. Типичный workaround - `Promise.resolve().then(() => thirdParty.doThing())`: он загоняет все в promise-цепочку, но добавляет лишний "тик" задержки (функция выполняется в следующем microtask, а не сразу).

**После:**

```js
Promise.try(() => thirdParty.doThing())
  .then(result => processResult(result))
  .catch(err => handleAnyFailure(err));
```

Sync-исключения, async-rejection и обычные return-значения идут через единый `.then`/`.catch`.

И в отличие от workaround с `Promise.resolve().then(...)`, `Promise.try` по возможности запускает callback синхронно; на async он переключается только если callback сам возвращает промис.

Если раньше вы никогда не думали о "тиках microtask", лучше и не начинать; достаточно знать, что `Promise.try` - самый чистый способ взять функцию неизвестной формы и получить предсказуемый промис.

### RegExp.escape

**Статус:** вышло в ES2025. Доступно в Chrome 136+, Node 24+, Firefox 134+, Safari 18.2+.

Еще один забавный факт: это впервые предложили 15 лет назад.

Если собирать регулярку из пользовательского ввода, спецсимволы regex (`.`, `*`, `+`, `(`, `[`, `?` и т.д.) будут интерпретироваться, а не совпадать буквально. Поэтому пользователь, ищущий `"file.txt"`, зацепит и `"fileAtxt"`, и `"file!txt"`, потому что `.` значит "любой символ".

**До** (классическая escape-функция из Stack Overflow):

```js
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
const userInput = 'file.txt';
const pattern = new RegExp(escapeRegex(userInput));
```

В каждом проекте была своя версия этого, и у большинства - с тонкими багами (пропущенные метасимволы, плохая обработка edge-кейсов).

**После:**

```js
const userInput = 'file.txt';
const pattern = new RegExp(RegExp.escape(userInput));
// Безопасно совпадает с буквальной строкой "file.txt"
```

Тонкий момент: `RegExp.escape("foo.bar")` не возвращает `"foo\\.bar"`, как можно ожидать.

Он возвращает `"\\x66oo\\.bar"`; первый символ всегда экранируется как hex.

Это сделано специально: так экранированная строка не будет интерпретирована как часть более крупной regex-конструкции, если вы вставляете ее в середину другого паттерна.

Точный вид результата помнить не нужно; важно, что функция параноидально учитывает edge-кейсы вместо вас.

### Float16Array

**Статус:** вышло в ES2025. Доступно в Chrome 135+, Node 24+, Firefox 133+, Safari 18.2+.

Новый typed array для 16-битных float-чисел. Вдвое меньше памяти, чем у `Float32Array`.

Если вы пишете TensorFlow.js, шейдеры для WebGPU или работаете с форматами HDF5/NetCDF - это полезно; во всех этих экосистемах `float16` уже стандарт для хранения и передачи на GPU.

Для большинства веб-кода вы, скорее всего, к этому не прикоснетесь. (Я тоже.)

### Также в ES2025

**Статус:** обе фичи вышли в ES2025. Доступны во всех основных браузерах и Node.

- `Intl.DurationFormat`: локалезависимое форматирование значений `Temporal.Duration` ("2 hours, 15 minutes" и т.п. в нужной локали). Отлично стыкуется с Temporal, когда он войдет в стандарт.
- Accessor-методы `Intl.Locale`: `weekInfo`, `hourCycles`, `getCalendars` и др. для получения локальных метаданных вроде "с какого дня здесь начинается неделя", без собственных lookup-таблиц.

Если вы делаете i18n, это может быть важнее всего остального из списка вместе взятого.

## ES2026: что идет следующим

TC39 одобрил кандидат ES2026 в апреле 2026; финальная ратификация Генеральной Ассамблеей Ecma будет в июне, но изменения между текущим моментом и ратификацией маловероятны. В срез попали семь предложений - все перечислены в [TC39 finished-proposals.md](https://github.com/tc39/proposals/blob/main/finished-proposals.md). Две фичи, которые вы могли бы ожидать здесь, - Temporal и ключевое слово `using` - в список не попали; сразу после этого раздела для них есть отдельный блок.

### Math.sumPrecise

**Статус:** входит в ES2026. Stage 4. Chrome 137+, есть в Firefox, Safari и Node в процессе раскатки.

JavaScript не умеет корректно складывать `0.1 + 0.2`. Это все знают.

Хуже другое: суммирование длинного массива float-значений через `.reduce((a, b) => a + b)` накапливает ошибку на каждом шаге.

**До:**

```js
// Реалистичный кейс: суммируем много маленьких float (например, "центы" в корзине)
const cents = Array(10000).fill(0.1);
cents.reduce((a, b) => a + b);  // 1000.0000000001588 (дрейф ~1.6e-10)

// Кейс катастрофической потери точности
const values = [1e20, 1, -1e20];
values.reduce((a, b) => a + b); // 0 (единица потерялась по пути)
```

**После:**

```js
Math.sumPrecise(cents);   // 1000
Math.sumPrecise(values);  // 1
```

`Math.sumPrecise` использует алгоритм Шевчука (Shewchuk), который отслеживает промежуточные ошибки и компенсирует их.

Первый кейс - то, с чем чаще всего сталкиваются на практике: тысячи маленьких float, где дрейф вылезает в 12-м знаке после запятой. Второй - учебниковый случай, где `1e20 + 1 === 1e20` в float64, поэтому единица тихо теряется на следующем сложении.

### Uint8Array base64 и hex

**Статус:** входит в ES2026. Stage 4. Уже поставляется во всех основных браузерах.

Я никогда не понимал, почему этого не было в языке раньше.

Если хотите превратить байты в base64-строку, встроенный `btoa` работает только со строками (не с байтовыми массивами), плохо переносит не-Latin1 символы и не имеет hex-аналога.

**До:**

```js
// base64 из Uint8Array "своими руками"
function toBase64(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// hex из Uint8Array
function toHex(bytes) {
  return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
```

У каждого проекта были такие one-off утилиты. Либо подтягивалась зависимость.

**После:**

```js
const bytes = new Uint8Array([72, 101, 108, 108, 111]);

bytes.toBase64();     // "SGVsbG8="
bytes.toHex();        // "48656c6c6f"

Uint8Array.fromBase64("SGVsbG8=");
Uint8Array.fromHex("48656c6c6f");
```

Любой проект, где есть криптография, загрузка файлов или WebCrypto, уже держит что-то подобное в helpers. Теперь это в самом языке.

### Error.isError

**Статус:** входит в ES2026. Stage 4. Доступно в Chrome 135+, Firefox 134+, Safari 18.4+, Node 24+.

Проверка `instanceof Error` ненадежна между разными realm.

**Realm** - это изолированный контекст выполнения JavaScript; каждый iframe, Web Worker, Service Worker и модуль `vm` в Node имеет свой realm со своей копией built-ins, таких как `Error`, `Array`, `Object`.

Ошибка, созданная в одном realm, не является `instanceof Error` в другом, потому что в этих realm разные конструкторы `Error`, даже если имя у них одинаковое.

**До:**

```js
// Код библиотеки пытается классифицировать пойманное значение
function handleError(maybeError) {
  if (maybeError instanceof Error) {
    // Работает для ошибок из того же realm
    logger.error(maybeError.message);
  } else {
    // Ошибка из Worker/iframe попадет сюда, хотя это все равно Error
    logger.error('Unknown value thrown:', maybeError);
  }
}
```

Авторы библиотек годами писали duck-typed fallback-проверки вида `typeof x.message === 'string' && typeof x.stack === 'string'`.

**После:**

```js
function handleError(maybeError) {
  if (Error.isError(maybeError)) {
    logger.error(maybeError.message);
  } else {
    logger.error('Unknown value thrown:', maybeError);
  }
}

Error.isError(new Error('oops'));                  // true
Error.isError({ message: 'looks like an error' }); // false (не настоящий Error)
Error.isError(errorFromWorker);                    // true (учет realm)
```

Если вы писали библиотечный код, который ловит ошибки и решает, логировать/пробрасывать/оборачивать их, вы с этим сталкивались.

### Iterator.concat

**Статус:** входит в ES2026. Stage 4. Уже в Chrome и Node; остальные движки раскатывают.

Склеивает итераторы в один. Полезно, когда несколько генераторов или iterable нужно потреблять как единый поток.

**До:**

```js
function* first() { yield 1; yield 2; }
function* second() { yield 3; yield 4; }

function* chained() {
  yield* first();
  yield* second();
}

for (const n of chained()) console.log(n); // 1, 2, 3, 4
```

**После:**

```js
const all = Iterator.concat(first(), second());
for (const n of all) console.log(n); // 1, 2, 3, 4
```

У `Array` `.concat()` был всегда. Теперь есть и у итераторов, без обертки в генератор.

### Map.getOrInsert (upsert)

**Статус:** входит в ES2026. Достигло Stage 4 на заседании TC39 в январе 2026. Реализации в Chrome и Node в процессе.

Каждый раз, когда я пишу этот паттерн, думаю: "должен же быть метод для этого".

**До:**

```js
// Подсчет вхождений слов
const counts = new Map();
for (const word of words) {
  if (!counts.has(word)) counts.set(word, 0);
  counts.set(word, counts.get(word) + 1);
}

// Кэширование дорогих вычислений
function getUser(id) {
  if (!cache.has(id)) {
    cache.set(id, expensiveDatabaseLookup(id));
  }
  return cache.get(id);
}
```

**После:**

```js
const counts = new Map();
for (const word of words) {
  counts.set(word, counts.getOrInsert(word, 0) + 1);
}

// Вариант с фабрикой для "дорогих" значений по умолчанию
function getUser(id) {
  return cache.getOrInsertComputed(id, () => expensiveDatabaseLookup(id));
}
```

Методы есть и у `Map`, и у `WeakMap`.

Предложение успело сменить несколько названий (`emplace`, `upsert`), прежде чем остановилось на `getOrInsert` и `getOrInsertComputed`.

### Array.fromAsync

**Статус:** входит в ES2026. Stage 4. Уже поставляется во всех основных браузерах и Node.

Асинхронный "сиблинг" `Array.from`. Собирает async iterable в массив.

**До:**

```js
async function* fetchPages() {
  let url = '/api/items?page=1';
  while (url) {
    const res = await fetch(url);
    const data = await res.json();
    yield* data.items;
    url = data.nextPage;
  }
}

// Ручной цикл для сбора
const allItems = [];
for await (const item of fetchPages()) {
  allItems.push(item);
}
```

**После:**

```js
const allItems = await Array.fromAsync(fetchPages());
```

### JSON.parse с source text

**Статус:** входит в ES2026. Stage 4. Уже в Chrome, Node и Firefox.

`JSON.parse` теряет информацию о больших числах, потому что приводит все к JavaScript-`number` (float64).

Разберите `999999999999999999` - получите `1000000000000000000`; разберите квинтиллион - получите то же самое значение.

**До:**

```js
// Потеря точности, и восстановить нельзя
const big = JSON.parse('{"id": 999999999999999999}');
big.id; // 1000000000000000000 (!!)
```

Если нужна была точная обработка чисел, приходилось ставить библиотеку вроде `json-bigint`, которая подменяет `JSON.parse` целиком.

**После:**

Теперь `reviver` получает аргумент `context` с исходным текстом каждого значения, так что можно прочитать оригинальные символы и самим решить, как конвертировать:

```js
const parsed = JSON.parse(text, (key, value, context) => {
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    return BigInt(context.source); // точная строка, как в JSON
  }
  return value;
});
```

Если вы когда-либо ставили `json-bigint` или писали собственную обертку над `JSON.parse` ради точных чисел, это то, что его заменяет.

## Уже поддерживается в движках, но не в ES2026

### Temporal

**Статус:** Stage 4 (достигнут в марте 2026), запланирован на **ES2027**, не ES2026. Firefox уже поставил, Chrome скоро вольет в V8, Safari примерно наполовину готов. Уже есть два production-ready полифилла: `temporal-polyfill` и `@js-temporal/polyfill`.

Долгожданная замена `Date` наконец стала реальностью.

Если вы хоть раз делали date-математику в JavaScript, вы знаете, что у `Date` есть проблемы.

Мутируемые экземпляры, сломанная работа с часовыми поясами, нумерация месяцев с нуля и дней с единицы, а также парсинг, чье поведение между движками не определено. Разработчик Budibase Сэм Роуз сделал квиз [jsdate.wtf](https://jsdate.wtf/), который эксплуатирует несогласованность `Date`; ответы отличаются между Firefox и Chrome.

Возьмем задачу, на которую я наткнулся в прошлом году: я в Лондоне, встреча с коллегой в Сиднее в следующий четверг в 9:00 по их времени, и мне нужно понять, во сколько это в моем календаре.

**До** (действительно ужасный день):

```js
// Шаг 1: что такое "следующий четверг"?
const today = new Date();
const daysUntilThursday = (4 - today.getDay() + 7) % 7 || 7;
const nextThursday = new Date(today);
nextThursday.setDate(today.getDate() + daysUntilThursday);

// Шаг 2: поставить 9:00 утра по Сиднею
// ...но JavaScript Date "не знает", что такое Sydney, так что берете библиотеку
// (moment-timezone, date-fns-tz, luxon) или делаете ручной расчет оффсета через
// хаки с `toLocaleString`.
```

В реальных кодовых базах на этом шаге обычно просто ставят Moment или date-fns и идут дальше.

**После** с Temporal:

```js
// Парсим встречу сразу с аннотацией таймзоны
const meeting = Temporal.ZonedDateTime.from(
  '2026-04-23T09:00[Australia/Sydney]'
);

// Конвертируем в лондонское время
const inLondon = meeting.withTimeZone('Europe/London');
inLondon.toString();
// "2026-04-23T00:00:00+01:00[Europe/London]"
```

Temporal напрямую понимает строки ISO 8601, включая аннотацию таймзоны `[Australia/Sydney]`.

У Temporal три основных типа, которые покрывают три реальных способа работать с датами: `PlainDate` (только дата, без времени), `PlainTime` (только время, без даты), `ZonedDateTime` (конкретный момент в конкретной зоне).

Вам больше не нужно гадать, значение в UTC или локальное - тип говорит сам.

Есть еще три типа для edge-кейсов: `PlainDateTime` для даты-времени без зоны, `Instant` для абсолютного момента и `PlainYearMonth`/`PlainMonthDay` для частичных дат вроде дней рождения.

Арифметика дат делается через `.since()`, `.until()`, `.add()`, `.subtract()`:

```js
const birthday = Temporal.PlainDate.from('1993-10-26');
const today = Temporal.Now.plainDateISO();
const age = today.since(birthday, { largestUnit: 'years' });
age.toString(); // "P32Y5M24D"
age.years;      // 32
```

Тезис про экономию бандла верный, но зависит от того, что вы используете сегодня.

Переход с Moment.js на Temporal может сэкономить около 40KB в gzip, потому что Moment не tree-shake'ится. Если у вас современная сборка на date-fns с tree-shaking, выигрыш может быть всего несколько KB.

Главный плюс платформенный: браузер поставляет Temporal один раз, и все страницы получают его без расходов на бандл.

### `using`

**Статус:** все еще **Stage 3**, не в ES2026. Уже доступно в Chrome 134+, Node 24+, Deno 2.0+. Реализация Firefox в процессе. TypeScript 5.2+ понимает синтаксис.

Если вы писали на Python, вы уже поняли, к чему идет: это `with`, наконец-то в JavaScript.

Если вы открываете ресурс, который нужно освобождать (file handle, DB-соединение), нужно не забыть его закрыть. Забыли cleanup - получите утечки памяти, дескрипторов файлов или соединений с базой, пока процесс не упадет.

**До:**

```js
// Node.js: транзакция БД, которую нужно commit/rollback
async function transferMoney(from, to, amount) {
  const tx = await db.beginTransaction();
  try {
    await tx.debit(from, amount);
    await tx.credit(to, amount);
    await tx.commit();
  } catch (err) {
    await tx.rollback();
    throw err;
  } finally {
    await tx.release(); // должно выполняться всегда
  }
}
```

В длинной функции инициализация и cleanup оказываются далеко друг от друга, и легко забыть одно из двух. Открываете ресурс вверху, скроллите вниз к `finally` в надежде, что закрытие есть, скроллите обратно и продолжаете чтение.

**После:**

```js
async function transferMoney(from, to, amount) {
  await using tx = await db.beginTransaction();
  // tx.release() вызовется автоматически при выходе из scope:
  // при return, throw или обычном завершении.
  await tx.debit(from, amount);
  await tx.credit(to, amount);
  await tx.commit();
}
```

Cleanup переезжает в декларацию. Функция завершается (или бросает) - транзакция освобождается. Никакого `finally`, который можно забыть.

Как это работает под капотом: ресурс должен реализовать `[Symbol.dispose]()` для синхронного cleanup или `[Symbol.asyncDispose]()` для асинхронного (используется с `await using`).

`Symbol` - примитивный тип JavaScript для создания "специальных" ключей свойств, которые не конфликтуют с обычными строковыми именами. Эти два - новые well-known symbols, добавленные специально под `using`. Авторы библиотек добавляют методы, а вы просто используете `using`.

Важно: `using` - это языковая фича, а не только Node-история. Она работает и в браузерах - везде, где есть ресурс с cleanup. Очевидные примеры: `AbortController` и блокировки из Web Locks API.

Помогает ли это React? Не напрямую. В React cleanup-модель (функция, которую возвращает `useEffect`) уже решает ту же проблему для жизненного цикла компонента.

Но в остальном стеке (серверные обработчики, build-скрипты, CLI-инструменты) именно так cleanup и будет выглядеть.

Имейте в виду: несколько `using` в одном scope освобождаются в **обратном порядке** (LIFO-стек). Открыли A, потом B, потом C - закроются C, B, A.

Это совпадает с тем, как вы вручную вложили бы `try/finally`.

### `import defer`

**Статус:** все еще **Stage 3**, не в ES2026. TypeScript 5.9 уже поддерживает синтаксис; Babel, Webpack и Esbuild тоже. Реализации в V8 и JavaScriptCore в процессе.

Еще один рычаг производительности. Когда вы делаете `import` модуля, он сразу "вычисляется" (evaluated), то есть его top-level код выполняется, даже если вы так и не вызовете ничего из него.

Если в `heavy.js` на верхнем уровне есть `console.log('loading heavy')`, он отработает в момент импорта, еще до того как приложение начнет рендер.

Для глубоких графов модулей это много лишнего времени на старте. Вы заранее платите за каждую зависимость, даже если не воспользуетесь ею.

`import defer` позволяет импортировать namespace модуля, не вычисляя модуль до первого чтения свойства.

**До** (все вычисляется при импорте):

```js
// heavy.js вычисляется сразу, даже если rarelyCalled() никогда не вызовут.
import * as heavyModule from './heavy.js';

function rarelyCalled() {
  return heavyModule.doExpensiveThing();
}
```

**После:**

```js
import defer * as heavyModule from './heavy.js';

// heavy.js уже загружен (файл получен и распарсен), но не выполнен.
// Любой top-level код в heavy.js еще не запускался.

function rarelyCalled() {
  // В момент чтения heavyModule.doExpensiveThing
  // выполняется heavy.js и его зависимости.
  return heavyModule.doExpensiveThing();
}
```

Два важных ограничения.

Во-первых, использовать можно только **namespace-форму** (`import defer * as x`).

Named imports (`import defer { foo } from ...`) и default import не разрешены, потому что именно namespace-объект является proxy, который триггерит evaluation.

Если вы всегда пишете `import { foo } from './thing'`, переход на `import defer` означает `import defer * as thing` и затем `thing.foo` в месте вызова.

Во-вторых, модули с top-level `await` отложить нельзя; если есть `await`, возвращаемся к динамическому `import()`.

Не путайте с динамическим `import()`, который возвращает промис и заставляет вызывающий код быть async. `import defer` оставляет все синхронным.

Namespace здесь - proxy; синхронный доступ к любому свойству запускает evaluation модуля.

Сопредседатель TC39 Роб Палмер (работает над Bloomberg terminal) описывал мотивацию так: дать возможность свободно добавлять импорты в большие приложения, не переживая о cold-start стоимости модуля, который, возможно, никогда не понадобится.

## Что пока не доехало

Некоторые из самых запрашиваемых фич все еще не в стандарте.

**Декораторы** все еще на Stage 3 (с 2022 года). Они везде используются через TypeScript и Babel-транспиляцию, но нативная спецификация продолжает упираться в edge-кейсы порядка полей класса и metadata. В TypeScript 5+ декораторы использовать можно уже сейчас, но нативной частью языка они пока не стали.

**Records и Tuples** (глубоко иммутабельные структуры, похожие на примитивы) застопорились и фактически были отозваны; замещающее предложение Composites идет через комитет, но оно гораздо уже по охвату.

**Pipeline operator** (`|>`) годами в состоянии "почти Stage 2". Спор о том, использовать `%` как placeholder или topic-style binding, продолжает держать предложение на паузе.

**Pattern matching** на Stage 1 и вряд ли попадет раньше ES2027.

**Async iterator helpers** (`.map`, `.filter`, `.take`, `.toArray` для async iterable, плюс `Iterator.prototype.toAsync()` для конвертации sync итератора в async) - Stage 2. Это та же форма, что у sync helpers из ES2025, только awaitable. Пока они не вошли, любой async-источник (streaming `fetch`, поток токенов LLM, async-генератор) по-прежнему требует `for await...of`. За этим я слежу особенно внимательно - это как раз недостающий кусок, который делает пример с LLM-стримингом из начала полностью рабочим.

**Iterator.range** (ленивый числовой диапазон, чтобы писать `Iterator.range(1, 100)` вместо ручного генератора) тоже на Stage 2 и давно там. Его постоянно спрашивают; я бы не рассчитывал на скорое появление.

**AsyncContext** (проброс контекста через async-границы, похож на Node `AsyncLocalStorage`) на Stage 2, но получает мощный импульс от вендоров трейсинга и observability-инструментов. За этим тоже стоит следить.

## Для AI

Если вы используете AI coding assistant (Claude Code, Copilot, Cursor - любой), важно понимать: модели обучены на годах JavaScript-кода, написанного до выхода большинства этих фич.

Вы просите функцию суммирования float - получаете `.reduce((a, b) => a + b)`. Все про даты - через `new Date()` и зависимость lodash, потому что Temporal не был в обучающем наборе. NodeList разворачивается в массивы; cleanup превращается в `try/finally`.

Это не совсем "неправильно", но это ответ 2022 года на проблему 2026 года.

Я заметил это в собственных сессиях Claude Code за последние недели. Просил утилиту, получал рабочий код и ловил себя на мысли: "это было бы в две строки с `getOrInsert`" или "это старый Moment-паттерн, а в Temporal это тривиально". Training cutoff модели был до релиза ES2025, поэтому она пишет то, чему научилась, а это уже на 3-5 лет устарело.

### Если вы используете Claude Code

Я упаковал навык с предпочтениями "ES2025/ES2026", который можно поставить двумя командами.

Это часть плагина [react-tips-skill](https://github.com/Cst2989/react-tips-skill), который дает Claude таблицу соответствий: "если код делает X по-старому, предложи Y по-новому".

Добавьте marketplace и установите плагин:

```shell
/plugin marketplace add Cst2989/react-tips-skill
/plugin install react-tips@neciudan.dev
```

После установки навык `modern-js` активируется автоматически, когда Claude пишет или ревьюит JavaScript. Его также можно вызывать напрямую: `/react-tips:modern-js`.

Навык заставляет Claude проверять свой вывод по списку современных альтернатив перед финализацией кода. Поэтому, когда вы просите "посчитать частоту слов в массиве", вместо обычного танца `map.has(word) ? map.set(word, map.get(word) + 1) : map.set(word, 1)` он тянется к `map.getOrInsert(word, 0) + 1`.

### Для других AI-инструментов

Если вы не на Claude Code, подход тот же. Ядро навыка - markdown-файл с lookup-таблицей в виде инструкций. Ниже - сжатая версия, которую можно вставить в `.cursorrules`, инструкции Copilot или любой system prompt:

```md
# Modern JavaScript preferences (ES2025/ES2026)

When writing JavaScript, prefer the following newer APIs over their
older equivalents. Check every function you write against this list.
before finalizing.

## Iterators and collections

- Iterating a large/infinite sequence?
  → Use Iterator.prototype methods (.map, .filter, .take, .drop,
    .toArray) Instead of converting to an array first.
- Wrapping a NodeList, Set, or Map to use array methods?
  → Iterator.from(x).map(...) instead of [...x].map(...) or
    Array.from(x).map(...).
- Set intersection, union, difference?
  → a.intersection(b), a.union(b), a.difference(b).
  → Never write a manual loop or reach for lodash.
- Concatenating iterators?
  → Iterator.concat(a, b) instead of a nested yield* generator.
- Counting occurrences in a Map, or caching expensive lookups?
  → map.getOrInsert(key, default) or
    map.getOrInsertComputed(key, () => compute()).
  → Never write: if (!map.has(k)) map.set(k, v).

## Dates and times

- Any date/time operation more complex than Date.now()?
  → Use Temporal (Temporal.PlainDate, Temporal.ZonedDateTime, etc.).
  → Never reach for moment.js, date-fns, or luxon for new code.
- Parsing a date with timezone?
  → Temporal.ZonedDateTime.from('2026-06-15T09:00[America/New_York]').
- Computing age or duration?
  → someDate.since(otherDate, { largestUnit: 'years' }).

## Promises and async

- Calling a function that might be sync or async and might throw?
  → Promise.try(() => fn()) instead of new Promise(r => r(fn()))
    or Promise.resolve().then(fn).
- Collecting an async iterable into an array?
  → await Array.fromAsync(asyncIter) instead of for-await-push loop.

## Resource cleanup

- Opening a resource that needs cleanup (transaction, file handle,
  lock, subscription)?
  → using handle = openResource(); (for sync cleanup)
  → await using handle = await openResource(); (for async)
  → The resource must implement [Symbol.dispose] or
    [Symbol.asyncDispose].
  → Never write try/finally for cleanup when using works.

## Errors

- Checking if a caught value is an Error?
  → Error.isError(x) instead of x instanceof Error.
  → instanceof is unreliable across realms (Workers, iframes, vm).

## Numbers

- Summing an array of floats?
  → Math.sumPrecise(values) instead of values.reduce((a, b) => a + b).
  → Especially for financial values or long arrays.
- Encoding/decoding bytes?
  → bytes.toBase64(), bytes.toHex(), Uint8Array.fromBase64(str).
  → Never use btoa/atob for byte arrays; they only work on strings.

## Regular expressions

- Building a regex from user-controlled input?
  → new RegExp(RegExp.escape(input)) instead of a custom escape fn.

## Modules

- Importing JSON?
  → import data from './data.json' with { type: 'json' }.
  → Never use fetch for bundle-time JSON.
- Importing a large module that's rarely used in the current path?
  → import defer * as heavy from './heavy.js'.
  → Works only with namespace imports, not named or default.

## Rules

- NEVER suggest moment.js for new code. Suggest Temporal.
- NEVER write instanceof Error in library code. Use Error.isError.
- NEVER write try/finally for cleanup when using works.
- NEVER write a manual for a for-await-of loop just to collect into an
  array; use Array.fromAsync.
- ALWAYS check if the user's runtime supports these features before
  suggesting them; if they don't, suggest a polyfill.
```

Проверить, что это работает, можно простым тестом: попросите AI "написать функцию подсчета частоты слов в массиве" или "посчитать возраст по дате рождения". Без навыка почти наверняка получите старые паттерны. С навыком должны увидеть `Map.getOrInsert` и `Temporal.PlainDate`.

Навык не заставляет AI использовать эти API там, где рантайм не поддерживает их; он просто делает их первым вариантом, который модель рассматривает, а не последним.

## Источники

- [Оригинальная статья](https://neciudan.dev/whats-new-in-javascript)
- [ECMAScript 2025 Language Specification](https://tc39.es/ecma262/2025/) — официальная спецификация
- [Ecma International approves ECMAScript 2025: What’s new?](https://2ality.com/2025/06/ecmascript-2025.html) — разбор Axel Rauschmayer
- [ES2026 Solves JavaScript Headaches With Dates, Math and Modules](https://thenewstack.io/es2026-solves-javascript-headaches-with-dates-math-and-modules/) — обзор от The New Stack
- [TC39 Process Document](https://tc39.es/process-document/) — как предложения становятся стандартом
- [TC39 Proposals](https://github.com/tc39/proposals)
- [Finished Proposals](https://github.com/tc39/proposals/blob/main/finished-proposals.md) — список Stage 4 предложений и год публикации
- [MDN: Temporal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal)
- [Iterator helpers proposal](https://github.com/tc39/proposal-iterator-helpers)
- [proposal-explicit-resource-management](https://github.com/tc39/proposal-explicit-resource-management)
- [proposal-defer-import-eval](https://github.com/tc39/proposal-defer-import-eval)
- [jsdate.wtf](https://jsdate.wtf/)
