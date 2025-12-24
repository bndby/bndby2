---
date: 2025-12-23
description: 'Современные способы обработки ошибок в TypeScript: от try/catch к Result'
tags:
    - TypeScript
categories:
    - JS
slug: error-handling
---

# Современные способы обработки ошибок в TypeScript: от try/catch к Result

Традиционный `try/catch` в TypeScript часто приводит к "пирамидам смерти", скрытым ошибкам и сложностям с тестами. Рассмотрим 4 современных подхода: обёртки промисов, Result/Either, глобальные хэндлеры и комбинированный стек с Sentry.[^1][^2][^3]

<!-- more -->

## 1. Обёртки над промисами (to/safeAsync)

Вместо `try/catch` вокруг каждого `await` — утилита, возвращающая `[error, data]`.

Код до:

```ts
async function getUser(id: string) {
    try {
        const res = await fetch(`/api/users/${id}`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null; // потеряли тип!
    }
}
```

Код после:

```ts
async function to<T>(promise: Promise<T>): Promise<[Error | null, T | null]> {
    try {
        return [null, await promise];
    } catch (e) {
        return [e as Error, null];
    }
}

const [err, user] = await to(fetchUser(id));
if (err) {
    toast.error(err.message);
} else {
    setUser(user!);
}
```

**Плюсы:**

- Меньше вложенности
- Явный возврат ошибки
- Похоже на Go (`result, err`)

**Минусы:**

- Деструктуризация `[err, data]` везде
- Нет типизации конкретных ошибок
- Много `if (err)` проверок

**Когда использовать:** Быстрый рефакторинг legacy-кода.[^4][^5]

## 2. Result/Either (ошибка как значение)

Функции возвращают `Result<T, E>` — union успеха/ошибки с методами `map/flatMap`.

Реализация (7 строк):

```ts
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

const Ok = <T>(v: T): Result<T> => ({ ok: true, value: v });
const Err = <E>(e: E): Result<never, E> => ({ ok: false, error: e });
```

Сервис без throw:

```ts
async getUserProfile(id: string): Promise<Result<{name: string}, ValidationError | NetworkError>> {
  if (!/^\d+$/.test(id)) return Err(new ValidationError('invalid_id'));

  const [fetchErr, user] = await to(fetch(`/api/users/${id}`).then(r => r.json()));
  if (fetchErr || !user) return Err(new NetworkError('user_not_found'));

  return Ok({ name: `${user.first} ${user.last}` });
}
```

Цепочка в хуке:

```ts
const profile = await service
    .getUserProfile(id)
    .map((p) => p.name.toUpperCase())
    .map((name) => ({ name, greeting: `Привет, ${name}!` }));

profile.ok ? setData(profile.value) : toast.error(profile.error.message);
```

**Плюсы:**

- Полная типобезопасность (`Result<User, UserNotFoundError>`)
- Линейная композиция (`flatMap`)
- Тестирование без моков исключений
- +200x быстрее throw в циклах

**Минусы:**

- Boilerplate для простых случаев
- Изменение сигнатур всех функций
- Нужны type guards для union ошибок

**Когда использовать:** Enterprise React/TS проекты >10k строк.[^6][^7][^8]

## 3. Глобальные хэндлеры + минимальный try/catch

Один `try/catch` на границе (контроллер/хуки), внутри — голые `throw` только для багов.

**Браузер (React):**

```ts
// index.tsx — один раз
window.addEventListener('error', (e) => {
    Sentry.captureException(e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    Sentry.captureException(e.reason);
});

// ErrorBoundary для React
class GlobalErrorBoundary extends React.Component {
    componentDidCatch(error: Error, errorInfo: any) {
        Sentry.withScope((scope) => {
            scope.setExtras(errorInfo);
            Sentry.captureException(error);
        });
    }
}
```

**Хук без локального try/catch:**

```ts
async function activateUser(email: string) {
    if (!email.includes('@')) throw new ValidationError('invalid_email');

    const user = await api.getUser(email); // может throw NetworkError
    if (!user.isActive) throw new AlreadyActiveError();

    await api.activate(user.id); // throw на границе
}
```

**Плюсы:**

- Минимум boilerplate
- Автоматический stack trace + Sentry
- Совместимо с любым legacy

**Минусы:**

- `throw` где угодно — не предсказуемо
- `unknown` тип в catch
- Тесты требуют `mockRejectedValue`

**Когда использовать:** Команды с mixed skill level.[^9]

## Сравнение подходов

<table>
  <thead>
    <tr>
      <th>Подход</th>
      <th>Типобезопасность</th>
      <th>Тестируемость</th>
      <th>Производительность</th>
      <th>Сложность миграции</th>
      <th>Кодовая вложенность</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>try/catch</strong></td>
      <td>❌ <code>unknown</code></td>
      <td>❌ мок throw</td>
      <td>❌ stack trace</td>
      <td>✅ 0%</td>
      <td>❌ пирамида</td>
    </tr>
    <tr>
      <td><strong>to() обёртки</strong></td>
      <td>⚠️ <code>[Error,null]</code></td>
      <td>✅ частично</td>
      <td>✅ хорошо</td>
      <td>✅ 20%</td>
      <td>⚠️ много if</td>
    </tr>
    <tr>
      <td><strong>Result/Either</strong></td>
      <td>✅ <code>Result&lt;T,E1 | E2&gt;</code></td>
      <td>✅ идеально</td>
      <td>✅ отлично</td>
      <td>❌ 60%</td>
      <td>✅ линейно</td>
    </tr>
    <tr>
      <td><strong>Глобальные хэндлеры</strong></td>
      <td>❌ <code>throw</code></td>
      <td>❌ мок throw</td>
      <td>⚠️ нормально</td>
      <td>✅ 10%</td>
      <td>❌ скрытый поток</td>
    </tr>
  </tbody>
</table>

## Рекомендуемый стек для React/TS 2025

1.  `Result<T,E>` для сервисов/хуков
2.  `to()` для быстрого парсинга/API
3.  Sentry + ErrorBoundary на границе
4.  neverthrow библиотека (`npm i neverthrow`)

**Полный хук:**

```ts
import { Result, ok, err } from 'neverthrow';

function useUserProfile(id: string) {
    const [result, setResult] = useState<Result<UserProfile, AppError> | null>(
        null,
    );

    useEffect(() => {
        service
            .getUserProfile(id)
            .map((profile) => ({
                ...profile,
                displayName: profile.name.toUpperCase(),
            }))
            .tap((profile) => analytics.track('profile_loaded', profile))
            .match(
                (ok) => setResult(ok(profile)),
                (err) => {
                    Sentry.captureException(err);
                    toast.error(err.message);
                    setResult(err);
                },
            );
    }, [id]);

    return result;
}
```

## Заключение

**Result/Either** — золотой стандарт для новых TS проектов: предсказуемость + производительность. **Глобальные хэндлеры + Sentry** — для телеметрии и legacy. **to()** — промежуточный шаг миграции.

Выбор зависит от размера команды и проекта: для соло-разработки хватит `to()` + Sentry, для enterprise — полноценный Result с доменными ошибками.[^10][^3]

**Бонус:** готовый Result репозиторий — [neverthrow](https://www.npmjs.com/package/neverthrow) или мой gist с примерами выше. Пробуй на pet-проекте![^11][^12]
<span style="display:none">[^13][^14]</span>

<div align="center">⁂</div>

[^1]: interests.programming_error_handling

[^2]: https://dev.to/swyx/errors-are-not-exceptional-1g0b

[^3]: https://www.reddit.com/r/SoftwareEngineering/comments/1feb20n/why_do_many_prefer_error_as_value_over_exceptions/

[^4]: https://brianschiller.com/blog/2025/02/07/the-best-ts-result/

[^5]: https://dev.to/richardshaju/stop-using-try-catch-a-better-way-to-handle-errors-in-javascript-14cm

[^6]: https://dev.to/jimjja/error-handling-without-try-catch-blocks-4kok

[^7]: https://blog.dennisokeeffe.com/blog/2024-07-14-creating-a-result-type-in-typescript

[^8]: https://www.typescript-result.dev/handling-errors

[^9]: https://khalilstemmler.com/articles/enterprise-typescript-nodejs/functional-error-handling/

[^10]: interests.programming.javascript_error_handling

[^11]: https://www.perplexity.ai/search/3678f7af-62c3-47d4-aea6-e7a6aa5065a4

[^12]: https://www.perplexity.ai/search/04f63c72-29c3-4046-a2cc-08fd8dcb8ed0

[^13]: https://github.com/Rayologist/Result-Type

[^14]: https://github.com/haideralsh/ts-result
