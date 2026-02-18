---
date: 2026-02-18
description: 'Ошибки как значения в TypeScript: Без обёрток. Без исключений. Только объединения типов'
tags:
    - TypeScript
categories:
    - JS
slug: errore
---

# Ошибки как значения в TypeScript

<big>Без обёрток. Без исключений. Только объединения типов.</big>

**Ошибки** — это не что-то исключительное, а неизбежная часть кода. Вместо того чтобы бросать исключения и надеяться, что их кто-то поймает, возвращайте ошибки как значения. Делайте их частью сигнатуры типа. Пусть компилятор гарантирует, что каждая ошибка обработана.

<!-- more -->

```ts
const user = await getUser(id);
if (user instanceof NotFoundError) {
    console.error('Missing:', user.id);
    return;
}
if (user instanceof DbError) {
    console.error('DB failed:', user.reason);
    return;
}
console.log(user.username); // user имеет тип User, сужение выполнено
```

Функции возвращают ошибки прямо в сигнатуре типа. Вызывающий код проверяет результат через `instanceof Error`. TypeScript автоматически сужает тип. На этом всё.

```ts
// Возвращаемый тип говорит правду
async function getUser(id: string): Promise<NotFoundError | User> {
    const user = await db.find(id);
    if (!user) return new NotFoundError({ id });
    return user;
}
```

**Если забыть обработать ошибку, код не скомпилируется:**

```ts
const user = await getUser(id);
console.log(user.name);
//                ~~~~
// Ошибка: Property 'name' does not exist on type 'NotFoundError'
```

Что это даёт:

1.  **Безопасность на этапе компиляции.** Необработанные ошибки ловит TypeScript, а не пользователи в продакшене.
2.  **Самодокументируемые сигнатуры.** Возвращаемый тип точно показывает, что может пойти не так. Не нужно читать реализацию или надеяться на документацию.
3.  **Обработка ошибок как выражения.** Больше не нужно `let x; try { x = fn() } catch...`. Меньше переменных, меньше вложенности, ошибки обрабатываются там, где возникают.
4.  **Отслеживаемый поток ошибок.** Создавайте собственные классы ошибок и прослеживайте их по всему коду. Как в Effect, но без крутого порога входа.

**Выражения вместо блоков.** Обработка ошибок остаётся линейной:

```ts
// С errore: обработка ошибок — это выражение
const config = parseConfig(input);
if (config instanceof Error) return config;
const db = connectDB(config.dbUrl);
if (db instanceof Error) return db;

// ПЛОХО: с try-catch обработка ошибок превращается в блок
let config: Config;
let db: Database;
try {
    config = parseConfig(input);
    db = connectDB(config.dbUrl);
} catch (e) {
    // ...
}
```

**Лучше, чем в Go.** Это подход в стиле Go: ошибки как значения, а не исключения. Но есть ключевое отличие: два возвращаемых значения в Go позволяют проигнорировать ошибку и всё равно использовать значение. Единый union-тип делает это невозможным:

```go
// Go: можно забыть проверить err
user, err := fetchUser(id)
fmt.Println(user.Name)  // Компилируется без проблем. Падает в рантайме.
```

```ts
// TypeScript + errore: забыть нельзя
const user = await fetchUser(id);
console.log(user.name); // Не скомпилируется, пока не обработаете ошибку.
```

**Ошибки и null вместе.** `?.` и `??` работают естественно:

```ts
// Ошибки и null работают вместе естественно
function findUser(id: string): NotFoundError | User | null {
    if (id === 'invalid') return new NotFoundError({ id });
    if (id === 'missing') return null;
    return { id, name: 'Alice' };
}

const user = findUser(id);
if (user instanceof Error) return user;
const name = user?.name ?? 'Guest';
```

## Ошибки с тегами

Для более структурного подхода создавайте типизированные ошибки с интерполяцией `$variable`:

```ts
class NotFoundError extends errore.createTaggedError({
    name: 'NotFoundError',
    message: 'User $id not found',
}) {}

class NetworkError extends errore.createTaggedError({
    name: 'NetworkError',
    message: 'Request to $url failed',
}) {}

const err = new NotFoundError({ id: '123' });
err.message; // "User 123 not found"
err.id; // "123"
```

**Сопоставление через `matchError`.** Оно исчерпывающее: компилятор выдаст ошибку, если забыть обработать один из случаев:

```ts
// Исчерпывающее сопоставление: если пропустите кейс,
// компилятор сообщит об ошибке
const message = errore.matchError(error, {
    NotFoundError: (e) => `User ${e.id} not found`,
    NetworkError: (e) => `Failed to reach ${e.url}`,
    Error: (e) => `Unexpected: ${e.message}`,
});

// Забыли NotFoundError? TypeScript пожалуется:
errore.matchError(error, {
    NetworkError: (e) => `...`,
    Error: (e) => `...`,
});
// Ошибка TS: в типе '{ NetworkError: ...; Error: ...; }'
// отсутствует свойство 'NotFoundError'
```

**То же самое с `instanceof`.** TypeScript отслеживает, какие ошибки вы уже обработали. Пропустите одну — и код не скомпилируется:

```ts
async function getUser(
    id: string,
): Promise<NotFoundError | NetworkError | ValidationError | User>;

const user = await getUser(id);
if (user instanceof NotFoundError) return 'not found';
if (user instanceof NetworkError) return 'network issue';
// Забыли ValidationError? TypeScript это знает:
return user.name;
//     ~~~~
// Ошибка TS: Property 'name' does not exist on type 'ValidationError'
```

Это гарантирует, что каждый путь ошибки обработан. Никаких тихих сбоев. Никаких забытых крайних случаев.

## Миграция

**`try-catch` с несколькими типами ошибок:**

```ts
try {
    const user = await getUser(id);
    const posts = await getPosts(user.id);
    const enriched = await enrichPosts(posts);
    return enriched;
} catch (e) {
    if (e instanceof NotFoundError) {
        console.warn('User not found', id);
        return null;
    }
    if (e instanceof NetworkError) {
        console.error('Network failed', e.url);
        return null;
    }
    if (e instanceof RateLimitError) {
        console.warn('Rate limited');
        return null;
    }
    throw e; // неизвестная ошибка, остаётся надеяться,
    // что её кто-то поймает
}
const user = await getUser(id);
if (user instanceof NotFoundError) {
    console.warn('User not found', id);
    return null;
}
if (user instanceof NetworkError) {
    console.error('Network failed', user.url);
    return null;
}

const posts = await getPosts(user.id);
if (posts instanceof NetworkError) {
    console.error('Network failed', posts.url);
    return null;
}
if (posts instanceof RateLimitError) {
    console.warn('Rate limited');
    return null;
}

const enriched = await enrichPosts(posts);
if (enriched instanceof Error) {
    console.error('Processing failed', enriched);
    return null;
}

return enriched;
```

**Параллельные операции с `Promise.all`:**

```ts
try {
    const [user, posts, stats] = await Promise.all([
        getUser(id),
        getPosts(id),
        getStats(id),
    ]);
    return { user, posts, stats };
} catch (e) {
    // Что именно упало? Неизвестно.
    console.error('Что-то пошло не так', e);
    return null;
}
const [user, posts, stats] = await Promise.all([
    getUser(id),
    getPosts(id),
    getStats(id),
]);

if (user instanceof Error) {
    console.error('User fetch failed', user);
    return null;
}
if (posts instanceof Error) {
    console.error('Posts fetch failed', posts);
    return null;
}
if (stats instanceof Error) {
    console.error('Stats fetch failed', stats);
    return null;
}

return { user, posts, stats };
```

**Оборачивание библиотек, которые бросают исключения:**

```ts
function parseConfig(input: string): Config {
    return JSON.parse(input); // бросает исключение при невалидном JSON
}
function parseConfig(input: string): ParseError | Config {
    const result = errore.try(() => JSON.parse(input));
    if (result instanceof Error)
        return new ParseError({ reason: result.message });
    return result;
}
```

**Валидация:**

```ts
function createUser(input: unknown): User {
    if (!input.email) throw new Error('Email required');
    if (!input.name) throw new Error('Name required');
    return { email: input.email, name: input.name };
}
function createUser(input: unknown): ValidationError | User {
    if (!input.email)
        return new ValidationError({ field: 'email', reason: 'required' });
    if (!input.name)
        return new ValidationError({ field: 'name', reason: 'required' });
    return { email: input.email, name: input.name };
}
```

## Сравнение с neverthrow / better-result

Эти библиотеки заворачивают значения в контейнер `Result<T, E>`. Вы создаёте результат через `ok()` и `err()`, а затем распаковываете через `.value` и `.error`:

```ts
// neverthrow / better-result
import { ok, err, Result } from 'neverthrow';

function getUser(id: string): Result<User, NotFoundError> {
    const user = db.find(id);
    if (!user) return err(new NotFoundError({ id }));
    return ok(user); // обязательно оборачивать
}

const result = getUser('123');
if (result.isErr()) {
    console.log(result.error); // обязательно распаковывать
    return;
}
console.log(result.value.name); // обязательно распаковывать
// errore
function getUser(id: string): User | NotFoundError {
    const user = db.find(id);
    if (!user) return new NotFoundError({ id });
    return user; // просто возвращаете значение
}

const user = getUser('123');
if (user instanceof Error) {
    console.log(user); // это уже сама ошибка
    return;
}
console.log(user.name); // это уже сам пользователь
```

**Ключевая идея:** `T | Error` уже кодирует успех/ошибку. Сужение типов в TypeScript делает всё остальное. Обёртка не нужна.

neverthrow требует [eslint-плагин](https://github.com/mdbetancourt/eslint-plugin-neverthrow), чтобы ловить необработанные результаты. С errore сам TypeScript не позволит использовать значение, пока ошибка не проверена.

## Сравнение с Effect.ts

Effect — это не просто обработка ошибок, а полноценный фреймворк функционального программирования: dependency injection, конкурентность, управление ресурсами и многое другое:

```ts
// Effect.ts — смена парадигмы
import { Effect, pipe } from 'effect';

const program = pipe(
    fetchUser(id),
    Effect.flatMap((user) => fetchPosts(user.id)),
    Effect.map((posts) => posts.filter((p) => p.published)),
    Effect.catchTag('NotFoundError', () => Effect.succeed([])),
);

const result = await Effect.runPromise(program);
// errore — обычный TypeScript
const user = await fetchUser(id);
if (user instanceof Error) return [];

const posts = await fetchPosts(user.id);
if (posts instanceof Error) return [];

return posts.filter((p) => p.published);
```

**Используйте Effect**, когда нужны DI, структурированная конкурентность и полноценный FP-подход. **Используйте errore**, когда нужна только типобезопасная обработка ошибок без переписывания кодовой базы.

## Философия нулевых зависимостей

errore — это скорее **способ писать код**, чем библиотека. Базовый паттерн вообще ничего не требует:

```ts
// Это можно написать вообще без установки errore
class NotFoundError extends Error {
    readonly _tag = 'NotFoundError';
    constructor(public id: string) {
        super(`User ${id} not found`);
    }
}

async function getUser(id: string): Promise<User | NotFoundError> {
    const user = await db.find(id);
    if (!user) return new NotFoundError(id);
    return user;
}

const user = await getUser('123');
if (user instanceof Error) return user;
console.log(user.name);
```

Пакет `errore` даёт удобства: `createTaggedError` уменьшает boilerplate, `matchError` даёт исчерпывающее сопоставление, `tryAsync` ловит исключения. Но сам паттерн — **ошибки как union-типы** — работает без каких-либо зависимостей.

## Идеально для библиотек

Этот подход особенно удобен для авторов библиотек. Вместо того чтобы заставлять пользователей принимать ваш фреймворк обработки ошибок:

```ts
// ❌ Библиотека, которая навязывает зависимость
import { Result } from 'some-result-lib';
export function parse(input: string): Result<AST, ParseError>;

// Пользователи должны установить и изучить 'some-result-lib'
// ✓ Библиотека на обычных union-типах TypeScript
export function parse(input: string): AST | ParseError;

// Пользователи обрабатывают ошибки стандартным instanceof
// Никаких новых зависимостей, никаких новых концепций
```

Ваша библиотека остаётся лёгкой. Пользователи получают типобезопасные ошибки без внедрения навязчивой обёртки.

<small>Источник: <https://errore.org/></small>
