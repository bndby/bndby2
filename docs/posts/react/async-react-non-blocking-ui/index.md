---
date: 2026-05-11
description: 'Async React в React 19: как useTransition и useActionState помогают строить неблокирующие и предсказуемые интерфейсы.'
tags:
    - react
    - javascript
    - async
    - usetransition
    - useactionstate
categories:
    - React
slug: async-react-non-blocking-ui
---

# Async React: создание неблокирующих UI с useTransition и useActionState

React — мощная open-source JavaScript-библиотека для построения пользовательских интерфейсов (UI), особенно для одностраничных приложений, где данные со временем меняются. Разработанная и поддерживаемая Meta (ранее Facebook), она совершила революцию в веб-разработке, представив компонентную архитектуру.

<!-- more -->

## В этой статье

- `useTransition`: приоритизация отзывчивости интерфейса
- `useActionState`: последовательные и атомарные обновления
- Принятие новых паттернов

Вместо того чтобы рассматривать сайт как единый документ, React позволяет разработчикам разбивать интерфейс на небольшие изолированные части кода — компоненты, которыми можно управлять независимо и переиспользовать по всему приложению.

Последняя версия технологии, React 19, вводит набор новых хуков, созданных для упрощения асинхронных операций и работы с формами, уходя от ручного отслеживания состояния (например, прокидывания `isLoading` через пропсы) к более декларативным паттернам. Эти новые паттерны позволяют фреймворку нативно обрабатывать состояния "pending" и жизненный цикл форм, уменьшая объем шаблонного кода и сохраняя отзывчивость UI. Этот сдвиг критически важен для современных data-intensive приложений, где важно давать пользователю стабильную обратную связь, но вручную это часто сложно поддерживать.

В экосистеме React 19 "Action" — это специальный технический термин, обозначающий асинхронную функцию, переданную в transition.

В этом гайде мы рассмотрим ключевые хуки, которые обеспечивают эти паттерны:

- `useTransition`: теперь нативно поддерживает async-функции, позволяя оборачивать любую асинхронную action в transition, чтобы управлять pending-состояниями без блокировки UI.
- `useActionState`: упрощает async-жизненный цикл, объединяя управление состоянием, результаты данных и автоматический pending-статус в один целостный хук.

Пока `useTransition` позволяет UI оставаться отзывчивым во время ожидания, `useActionState` гарантирует, что сложные обновления данных остаются атомарными и последовательными.

## useTransition: приоритизация отзывчивости интерфейса

В React 18 `useTransition` в основном использовался для сохранения отзывчивости UI за счет пометки синхронных обновлений состояния (например, фильтрации списка) как не срочных. Для глубокого разбора исходного поведения `useTransition` в React 18, связанного с concurrent rendering и приоритизацией UI, очень рекомендую официальную документацию: [Official React 18 Transition Documentation](https://react.dev/reference/react/useTransition).

В React 19 `useTransition` расширен и нативно поддерживает Async Actions.

Раньше, если вы пытались использовать async-функцию внутри `startTransition`, состояние "pending" завершалось в момент первого `await`. В React 19 `isPending` теперь остается `true` на протяжении всей асинхронной операции. Это делает `useTransition` основным инструментом для управления индикаторами "занятости" по всему приложению.

Чтобы понять изменения в React 19, сравним стандартный функционал поиска по товарам. Ниже сопоставлены традиционный подход — с ручным отслеживанием состояния — и новый паттерн Async Action с `useTransition`. Обратите внимание, как современный подход заменяет "state soup" нативно управляемым жизненным циклом.

---

🚀 Рабочий пример: полный код и live-демо со сравнением традиционного подхода и паттернов React 19: [Filtering Results using useTransition](https://codesandbox.io/p/sandbox/hwh49r?file=%2Fsrc%2FUseTransitionExample.js%3A19%2C34)

До (до React 19)

```
 const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  // MANUAL LOADING STATE PATTERN:
  // Problem: Need separate state to track loading status manually
  const [isLoading, setIsLoading] = useState(false);

  const getFilteredProducts = async (term) => {
    // MANUAL LOADING STATE MANAGEMENT:
    // Problem: Must manually set loading to true before async operation
    setIsLoading(true);

    try {
      const data = await fetchFilteredProducts(term);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      // MANUAL LOADING STATE CLEANUP:
      // Problem: Must remember to manually set loading to false after operation
      // Problem: Risk of forgetting to reset loading state in complex try/catch logic
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    getFilteredProducts(value);
  };

  return (
    <div>
      <h3>Traditional Method</h3>
      <div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* MANUAL LOADING STATE DISPLAY: */}
        {/* Problem: Uses manually managed loading state which adds boilerplate */}
        {isLoading && <p>Searching Catalog...</p>}
        {!isLoading && (
          <ul>
            {filteredProducts.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

```

После (`useTransition`)

```
const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(products);

  // REACT 19 AUTOMATIC PENDING STATE:
  // Benefit: isPending is automatically managed by React, eliminating the need for manual 'isLoading' state.
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // REACT 19 ASYNC TRANSITION PATTERN:
    // Benefit: startTransition now supports async functions natively.
    // Benefit: isPending automatically becomes true when the async operation begins.
    startTransition(async () => {
      try {
        const data = await fetchFilteredProducts(value);
        setFilteredProducts(data);
      } catch (error) {
        console.error("Search failed", error);
      }

      // AUTOMATIC PENDING STATE CLEANUP:
      // Benefit: isPending automatically becomes false when the promise resolves.
      // Benefit: State updates inside the transition are bundled and prioritized correctly.
    });
  };

  return (
    <div>
      <h3>useTransition Example</h3>
      <div>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* AUTOMATIC PENDING STATE DISPLAY: */}
        {/* Benefit: Uses the built-in isPending state to show feedback without extra boilerplate. */}
        {isPending && <p>Searching Catalog...</p>}

        {!isPending && (
          <ul>
            {filteredProducts.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

```

В целом, для стандартных вызовов `useQuery` или `useMutation` в библиотеках вроде Apollo Client или TanStack Query (React Query), `useTransition` избыточен, потому что эти библиотеки уже нативно управляют асинхронным жизненным циклом и предоставляют собственные состояния `isLoading` или `isPending`.

Императивные клиентские вызовы: когда вы используете `client.mutate()` или `client.query()` напрямую внутри функции (вне стандартного жизненного цикла хуков).

Последовательные мутации: если вам нужно выполнить три разные мутации подряд, `useTransition` может дать единое состояние `isPending`, покрывающее всю последовательность.

Ручные обновления кэша: когда после мутации вы выполняете сложную логику локального обновления Apollo Cache, оборачивание этой логики в transition помогает сохранить интерактивность UI во время пересчета кэша.

### Понимание параллельного выполнения и синхронизации UI

Важно понимать, как `useTransition` управляет конкурентностью, когда одновременно происходит несколько обновлений. Если вы запускаете несколько transition подряд в быстром темпе, React выполняет их параллельно, а не ждет завершения предыдущего async-запроса. На протяжении всей этой последовательности `isPending` остается общим — он будет `true`, пока не завершится самая последняя action в цепочке.

Однако при том, что `isPending` отслеживает общую длительность, React нативно не гарантирует последовательную согласованность этих transition. Они работают параллельно, поэтому встроенного механизма, гарантирующего, что порядок результатов совпадает с порядком запросов, нет.

В примере Product List, если вы быстро печатаете "ap", React отправляет два отдельных запроса: для "a" и для "ap". Если запрос для "ap" вернется за 500 мс, а более ранний запрос для "a" задержится и займет 5 секунд, состояние UI обновится последним именно медленным запросом "a". В результате на экране окажутся результаты для "a", хотя вашим последним намерением был "ap". Такое поведение может приводить к багам устаревших данных, где старые результаты перезаписывают новые.

### Выход за пределы сетевых запросов

Распространенное заблуждение — что transition нужны только для сетевых запросов. На практике `useTransition` может давать обратную связь для любой Promise-based операции на клиенте:

- Обработка изображений: оборачивание операций Canvas API (например, изменение размера аватара пользователя или применение фильтра) в transition, чтобы UI не подтормаживал при тяжелой пиксельной обработке.
- Обработка файлов: чтение больших файлов через FileReader API или генерация PDF на клиенте. `isPending` дает мгновенную обратную связь, пока браузер "перемалывает" данные файла.
- Web Workers: сохранение отзывчивости UI, пока воркер обрабатывает тяжелый CSV или считает сложную физику.
- Локальное хранилище: управление жизненным циклом сложного дискового I/O, например при синхронизации локальной базы данных.

---

🛠️ Live-демо: как `useTransition` обрабатывает не-сетевые задачи, например сохранение состояния редактора в browser indexDB: [Managing Non-Network Async Actions with useTransition](https://codesandbox.io/p/sandbox/29p62r)

---

### Критически важная оговорка: обработка state после await

Обновления состояния, происходящие после `await` внутри `startTransition`, теряют свой неблокирующий статус. Чтобы сохранить контекст transition, нужно обернуть конкретные post-await обновления в дополнительный `startTransition`. Команда React ожидает автоматизировать это поведение в будущих релизах, чтобы вся async-цепочка оставалась в контексте.

### Преимущества миграции на useTransition

Переход на `useTransition` заменяет ручной "state soup" нативно управляемым жизненным циклом. Использование этого хука дает несколько архитектурных преимуществ по сравнению с традиционными паттернами `isLoading`:

- Убирает ручное состояние загрузки: больше не нужен `useState` для отслеживания loading-статусов.
- Упрощает асинхронные операции: прямую поддержку async-функций внутри transition.
- Улучшает пользовательский опыт: UI остается отзывчивым при тяжелых async-операциях (диск, воркеры или сеть).
- Уменьшает объем шаблонного кода: для распространенных async-паттернов требуется заметно меньше кода.

Хотя `useTransition` — идеальный инструмент для "fire-and-forget" сценариев или простых обновлений, где нужно только отслеживать pending-жизненный цикл, у него есть пределы. Если вашей асинхронной action нужно вернуть в UI конкретные данные — например, ошибки валидации на сервере, payload успешного ответа или результат вычисления — более надежным выбором становится `useActionState`. Он строится на фундаменте transition, интегрируя управление состоянием прямо в исполнение action.

## useActionState: последовательные и атомарные обновления

В React 19 `useActionState` — это хук, который принимает Action-функцию и начальное состояние, а возвращает текущее состояние этой action (данные, возвращенные функцией) и "обернутую" версию action, которую можно вызывать. По сути, он объединяет управление состоянием, обработку ошибок и pending-статус в одной строке кода.

```
const [state, formAction, isPending] = useActionState(fn, initialState);
```

Хук `useActionState` возвращает массив из трех частей, который дает полный контроль над данными и жизненным циклом Action. Переменная `state` содержит текущее значение, возвращенное вашей async-функцией (начинается с `initialState` и обновляется каждый раз, когда action завершается). `formAction` — это "обернутая" версия вашей функции, которую вы передаете в атрибут `action` формы или вызываете через `startTransition`; именно она захватывает выполнение и управляет фоновой работой.

Наконец, `isPending` — встроенный boolean-флаг, который React переключает автоматически. Он остается `true` с момента запуска action до обработки финального обновления состояния, что позволяет показывать индикаторы загрузки без какой-либо ручной state-логики.

### Выполнение action: transitions и формы

При использовании `useActionState` важно понимать, как именно запускать возвращаемую action-функцию. Чтобы раскрыть всю силу управления жизненным циклом в React 19, action-функция должна вызываться внутри контекста Transition. Это происходит автоматически, если вы передаете функцию напрямую в атрибут `action` формы.

Однако, если вы запускаете action вне формы (например, из `button onClick` или любого event handler), нужно обернуть вызов в `startTransition`. Если этого не сделать, React не будет отслеживать pending-состояние, а UI не получит автоматические преимущества обратной связи, которые дает хук.

---

💡 Рабочий пример: как React 19 заменяет ручную координацию состояния и "залипшие спиннеры" атомарным жизненным циклом — в сравнительном демо кнопки "Like": [Basic Example for useActionState](https://codesandbox.io/p/sandbox/xtzz26)

---

Чтобы понять сдвиг в React 19, сравним функцию переключения "Like". Ниже сопоставлены традиционный паттерн — требующий ручной синхронизации состояния и управления жизненным циклом — и новый Action-паттерн с `useActionState`. Обратите внимание, как современный подход заменяет "ручную координацию" нативно управляемым жизненным циклом.

До (до React 19)

```
  // MANUAL STATE PATTERN:
  // Problem: Requires 5 separate states to track a single logical "Like" operation.
  // Problem: High risk of these variables getting out of sync with each other.
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(120);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleToggleLike = async () => {
    // MANUAL LIFECYCLE MANAGEMENT:
    // Problem: You must remember to reset every state variable manually before starting.
    // Problem: If you forget to clear 'isError', the UI might show an old error during a new attempt.
    setIsPending(true);
    setMessage("");
    setIsError(false);

    try {
      const newStatus = await toggleLikeInDB(postId, isLiked);

      // MANUAL STATE SYNCHRONIZATION:
      // Problem: These are separate renders. If one fails, the UI becomes inconsistent.
      // Problem: This is boilerplate logic that must be duplicated for every similar feature.
      setIsLiked(newStatus);
      setLikeCount((prev) => (newStatus ? prev + 1 : prev - 1));
      setMessage(newStatus ? "Liked!" : "Unliked.");
    } catch (e) {
      // MANUAL ERROR HANDLING:
      // Problem: Requires explicit boilerplate to catch and transform errors into state.
      setIsError(true);
      setMessage("Error: " + e.message);
    } finally {
      // MANUAL LIFECYCLE CLEANUP:
      // Problem: You MUST remember the 'finally' block, or the button stays disabled forever.
      // Problem: This "stuck loader" bug is one of the most common issues in traditional React.
      setIsPending(false);
    }
  };

  return (
    <div>
      <div style={{ margin: "30px" }}>Traditional Way</div>
      <div
        style={{
          padding: "15px",
          border: "1px solid #333",
          borderRadius: "8px",
          minWidth: "250px",
        }}
      >
        <h4>Post Id: 1</h4>
        <p>Likes: {likeCount}</p>

        {/* MANUAL PENDING UI: */}
        {/* Problem: The disabled state depends on a manual boolean, not the actual transition lifecycle. */}
        <button onClick={handleToggleLike} disabled={isPending}>
          {isPending ? "Updating..." : isLiked ? "❤️ Unlike" : "🤍 Like"}
        </button>

        {/* MANUAL FEEDBACK DISPLAY: */}
        {/* Problem: Success and Error logic is handled via fragile string/boolean checks. */}
        {message && (
          <p style={{ color: isError ? "red" : "green", marginTop: "10px" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );

```

После (`useActionState`)

```
 // REACT 19 ACTION STATE PATTERN:
  // Benefit: Manages current state, the trigger (formAction), and lifecycle (isPending) in one hook.
  // Benefit: 'state' acts as the single source of truth returned by your async logic.
  const [state, formAction, isPending] = useActionState(
    async (prevState, id) => {
      // REACT 19 ASYNC ACTION LOGIC:
      // Benefit: Supports async utility calls directly within the Action body.
      try {
        const newStatus = await toggleLikeInDB(id, prevState.isLiked);

        // ATOMIC STATE UPDATE:
        // Benefit: likeCount and isLiked are updated in a single transaction, ensuring UI consistency.
        return {
          isLiked: newStatus,
          likeCount: newStatus
            ? prevState.likeCount + 1
            : prevState.likeCount - 1,
          message: newStatus ? "Liked!" : "Unliked.",
          isError: false,
        };
      } catch (e) {
        // CONSISTENT ERROR HANDLING:
        // Benefit: We return the error state directly to the UI without separate error state hooks.
        // Benefit: isPending is guaranteed to flip to false even if the API throws an error.
        return {
          ...prevState,
          message: "Error: " + e.message,
          isError: true,
        };
      }
    },
    // INITIAL STATE:
    { isLiked: false, likeCount: 120, message: "", isError: false }
  );

  return (
    <div>
      <div style={{ margin: "30px" }}>Using useActionState</div>
      <div
        style={{
          padding: "15px",
          border: "1px solid #333",
          borderRadius: "8px",
          minWidth: "250px",
        }}
      >
        <h4>Post Id: 1</h4>
        <p>
          Likes: <strong>{state.likeCount}</strong>
        </p>

        {/* REACT 19 ACTION TRIGGER: */}
        {/* Benefit: startTransition allows useActionState to track the pending status manually. */}
        <button
          onClick={() => startTransition(() => formAction(postId))}
          disabled={isPending} // AUTOMATIC PENDING STATE
        >
          {/* AUTOMATIC PENDING UI FEEDBACK: */}
          {/* Benefit: isPending is automatically true as long as the async Action is in flight. */}
          {isPending ? "Updating..." : state.isLiked ? "❤️ Unlike" : "🤍 Like"}
        </button>

        {/* AUTOMATIC STATE FEEDBACK: */}
        {/* Benefit: The UI automatically reflects the message or error returned by the latest Action. */}
        {state.message && (
          <p
            style={{
              color: state.isError ? "red" : "green",
              marginTop: "10px",
            }}
          >
            {state.message}
          </p>
        )}
      </div>
    </div>
  );

```

Этот современный подход лучше по трем ключевым причинам:

- Нативная синхронизация жизненного цикла: `isPending` — прямое окно в статус Promise. Он `true` во время выполнения и `false` после завершения. Нельзя "забыть" выключить loader.
- Cleanup без шаблонного кода: больше не нужен `finally { setIsPending(false) }`. Удаление этого шаблона убирает распространенный баг "залипшего спиннера".
- Декларативная логика: вы определяете трансформацию (старое состояние → новое состояние), а не процедуру (старт → fetch → update → stop). Это упрощает тестирование и рассуждение о логике.

### Очередь Action: последовательная согласованность

Когда несколько action запускаются быстро подряд, React 19 управляет ими через внутреннюю очередь action. В отличие от традиционных async-паттернов, где ответы не по порядку могут вызывать race condition, `useActionState` обеспечивает последовательную согласованность. Каждая action ждет завершения предыдущей перед началом следующей, гарантируя, что каждая action получает максимально точный `previousState`.

Для стабильности UI React 19 выполняет атомарный commit. Пока action выполняются по одной в фоне, React батчит результаты и обновляет UI только когда вся очередь становится пустой. Это предотвращает "мерцание" интерфейса через промежуточные состояния, а флаг `isPending` остается `true` на всем процессе синхронизации, сигнализируя, что фоновая работа еще завершается.

Рассмотрим пример GameShop, где игрок тратит золото на экипировку. Это идеальный кейс для `useActionState`, потому что каждая покупка зависит от "иссякающего ресурса" (Gold), и успех одной покупки полностью зависит от результата предыдущей.

---

🎮 Рабочий пример: проверьте последовательную согласованность и логику траты золота в интерактивном демо магазина: [GameShop Action Queue Sandbox](https://codesandbox.io/p/sandbox/p9smxc)

---

Последовательная согласованность: в GameShop `useActionState` обеспечивает последовательную согласованность и предотвращает баги "двойной траты". Если игрок с 500g быстро покупает Sword (200g), а затем Shield (150g), покупка Shield вынужденно ждет результат Sword, чтобы корректно посчитать оставшиеся 300g. Эта логика остается надежной даже при ошибках: если покупка Sword не проходит из-за нехватки золота, очередь передает этот неизмененный баланс следующему предмету — например, более дешевому Potion — позволяя ему выполниться на основе точных данных в реальном времени.

Атомарный commit: чтобы избежать мерцания промежуточных значений золота, `useActionState` использует атомарный commit. Он обрабатывает каждый кликнутый предмет в фоне, но ждет, пока очередь полностью опустеет, прежде чем обновить экран. Это обеспечивает стабильный UI, который сразу переходит к финальному состоянию, тогда как локальный state (`queuedItems`) дает мгновенную обратную связь, что каждый клик зарегистрирован.

### Преимущества миграции на useActionState

Перенос data-heavy взаимодействий на `useActionState` — это не только про более чистый код; это про использование внутреннего движка React для обработки сложной синхронизации состояния. Этот переход от процедурной логики (управление переменными) к декларативной (описание преобразований состояния) дает следующие преимущества:

- Надежность: автоматическое управление состоянием устраняет человеческие ошибки, вроде забытого сброса loader или старой ошибки.
- Производительность: встроенные оптимизации и batching состояния обеспечивают эффективные и неблокирующие обновления UI.
- Поддерживаемость: логика состояния централизуется внутри Action-функции, компонент легче читать и отлаживать.
- Готовность к будущему: код идеально согласован с архитектурным направлением React, особенно в части Server Components и concurrent rendering.
- Опыт разработчика: заметно меньше шаблонного кода и более ясное намерение; код описывает, что должно произойти, а не как вручную управлять переменными.
- Тестирование: значительно проще тестировать "Actions" как чистые функции независимо от UI-компонента.
- Согласованность: гарантированные переходы состояния — если action выбрасывает ошибку, `isPending` автоматически становится `false`, а UI остается в последнем валидном состоянии, а не в "сломленной" полу-загруженной фазе.

## Примите новые паттерны

Переход к стандарту "Async React" с transitions и action states позволяет разработчикам устранить распространенные баги "залипшего спиннера" и ручной cleanup-логики. Эти инструменты дают архитектурную надежность и производительность за счет централизации state-логики и гарантии последовательной согласованности. Принятие этих паттернов гарантирует, что ваше приложение будет модульным, легко тестируемым и полностью согласованным с будущим concurrent rendering.

## Связанные статьи

- Оригинал статьи на Rubrik: [Async React: Building Non-Blocking UIs with useTransition and useActionState](https://www.rubrik.com/blog/architecture/26/2/async-react-building-non-blocking-uis-with-usetransition-and-useactionstate)
