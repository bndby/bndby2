---
date: 2026-04-07
description: 'Примерно год назад я начал давать имена функциям внутри useEffect. Это изменило то, как я читаю компоненты, как отлаживаю их и в итоге как вообще их структурирую.'
tags:
    - useeffect
categories:
    - react
slug: name-your-effects
---

# Начните давать имена функциям в `useEffect` и потом скажете себе спасибо

<big>Примерно год назад я начал давать имена функциям внутри `useEffect`. Это изменило то, как я читаю компоненты, как отлаживаю их и в итоге как вообще их структурирую.</big>

В прошлом месяце я открыл pull request от коллеги.

Там был компонент, который я раньше никогда не видел: около 200 строк, синхронизация инвентаря с API склада. В нем было четыре вызова `useEffect`. Я потратил целую минуту, чтобы внимательно пройтись по каждому: проследить массивы зависимостей, восстановить в голове, какой `state` к какому эффекту относится и что именно что запускает.

Я делал это сотни раз. Скорее всего, и вы тоже.

Меня раздражало не то, что код плохой. Он был написан хорошо, а эффекты действительно были корректно разделены по зонам ответственности.

Но мне все равно пришлось читать каждую строку каждого эффекта, чтобы понять, что делает компонент, потому что `useEffect(() => {` вообще ничего не говорит о намерении. Он говорит, _когда_ выполняется код. Но не говорит, _зачем_.

В некотором смысле это наследие эпохи class-компонентов. Когда у нас были только `componentDidMount` и `componentDidUpdate`, для побочного эффекта на конкретном этапе жизненного цикла буквально существовало одно-единственное место.

Это ограничение сформировало ментальную модель, где _где_ находится код, подсказывало _когда_ он выполняется, а для понимания _зачем_ приходилось полагаться на комментарии или внимательное чтение.

Хуки освободили нас от ограничений lifecycle, но анонимная стрелочная функция заменила их другой формой непрозрачности.

Вместо одного огромного lifecycle-метода у нас теперь шесть анонимных замыканий подряд, и чтобы понять, что делает каждое из них, нужно читать реализацию.

Примерно год назад я начал давать имена функциям эффектов. Это, пожалуй, самое маленькое изменение в том, как я пишу React-код, но влияние на то, как я его читаю, оказалось непропорционально большим.

## Проблема

Вот упрощенная версия того компонента синхронизации инвентаря:

```js
function InventorySync({ warehouseId, locationId, onStockChange }) {
  const [stock, setStock] = useState<StockLevel[]>([]);
  const [connected, setConnected] = useState(false);
  const prevLocationId = useRef(locationId);

  useEffect(() => {
    const ws = new WebSocket(`wss://inventory.api/ws/${warehouseId}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setStock(prev => prev.map(s =>
        s.sku === update.sku ? { ...s, quantity: update.quantity } : s
      ));
    };
    return () => ws.close();
  }, [warehouseId]);

  useEffect(() => {
    if (!connected) return;
    fetch(`/api/warehouses/${warehouseId}/stock?location=${locationId}`)
      .then(res => res.json())
      .then(setStock);
  }, [warehouseId, locationId, connected]);

  useEffect(() => {
    if (prevLocationId.current !== locationId) {
      setStock([]);
      prevLocationId.current = locationId;
    }
  }, [locationId]);

  useEffect(() => {
    if (stock.length > 0) {
      onStockChange(stock);
    }
  }, [stock, onStockChange]);

  // ... рендер
}
```

Четыре эффекта. Что делает каждый? Первый настраивает... WebSocket? Ладно. Второй что-то запрашивает... когда меняется `connected`? Третий сбрасывает остатки при смене локации. Четвертый... вызывает callback из props каждый раз, когда обновляется `stock`.

Ваш мозг только что сделал четыре прохода компиляции.

В code review на GitHub, где нельзя навести курсор и посмотреть типы, а diff приходится просматривать с ограниченным контекстом, именно здесь все начинает замедляться.

Теперь умножьте это на каждый компонент в pull request.

А теперь попробуйте прочитать тот же компонент, но с небольшими изменениями:

```js
function InventorySync({ warehouseId, locationId, onStockChange }) {
  const [stock, setStock] = useState<StockLevel[]>([]);
  const [connected, setConnected] = useState(false);
  const prevLocationId = useRef(locationId);

  useEffect(function connectToInventoryWebSocket() {
    const ws = new WebSocket(`wss://inventory.api/ws/${warehouseId}`);
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setStock(prev => prev.map(s =>
        s.sku === update.sku ? { ...s, quantity: update.quantity } : s
      ));
    };
    return () => ws.close();
  }, [warehouseId]);

  useEffect(function fetchInitialStock() {
    if (!connected) return;
    fetch(`/api/warehouses/${warehouseId}/stock?location=${locationId}`)
      .then(res => res.json())
      .then(setStock);
  }, [warehouseId, locationId, connected]);

  useEffect(function resetStockOnLocationChange() {
    if (prevLocationId.current !== locationId) {
      setStock([]);
      prevLocationId.current = locationId;
    }
  }, [locationId]);

  useEffect(function notifyParentOfStockUpdate() {
    if (stock.length > 0) {
      onStockChange(stock);
    }
  }, [stock, onStockChange]);

  // ... рендер
}
```

Теперь я могу просто пробежать глазами по четырем именам функций и понять весь поток данных: подключиться к WebSocket, получить начальный stock, сбросить его при смене локации, уведомить родителя.

Мне не нужно читать ни строчки кода, если только я не отлаживаю что-то конкретное.

Изменение здесь чисто синтаксическое. Вместо того чтобы передавать в `useEffect` анонимную стрелочную функцию, вы передаете именованное function expression:

```js
// анонимная стрелка (так пишут почти все)
useEffect(() => {
    document.title = `${count} items`;
}, [count]);

// именованное function expression (именно за это я и агитирую)
useEffect(
    function updateDocumentTitle() {
        document.title = `${count} items`;
    },
    [count],
);
```

Можно, конечно, объявить функцию отдельно и передать ее по имени (`useEffect(updateDocumentTitle, [count])`), но мне больше нравится inline-вариант, потому что имя находится прямо в месте вызова. Не нужно подниматься выше по файлу и искать объявление.

Есть и выигрыш для отладки.

Когда анонимная стрелка падает с ошибкой, в сообщении вы видите `at (anonymous) @ InventorySync.tsx:14`.

Если в файле четыре эффекта, пользы от этого никакой.

Именованная функция дает `at connectToInventoryWebSocket @ InventorySync.tsx:14`, и вы сразу понимаете, какой именно эффект сломался, даже не открывая файл.

Это особенно важно, когда вы разбираете отчеты об ошибках в инструменте мониторинга вроде Sentry с телефона, далеко от редактора. Это важно и в профилировании React DevTools: именованные функции отображаются по имени, а анонимные выглядят как... анонимные.

## Имена показывают лишнюю ответственность

Аргумента о читаемости уже достаточно, но когда я начал давать имена эффектам, произошло кое-что еще. Это изменило то, как я их пишу.

Попробуйте дать имя вот этому:

```js
useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    if (user?.preferences?.theme) {
        document.body.className = user.preferences.theme;
    }

    return () => window.removeEventListener('resize', handleResize);
}, [user?.preferences?.theme]);
```

Как вы его назовете? `syncWidthAndApplyTheme`? Вот это `and` уже тревожный сигнал. Оно означает, что эффект делает две несвязанные вещи.

В тот момент, когда вам трудно назвать эффект без слов `and` или `also`, сам эффект подсказывает, что его пора разделить.

```js
useEffect(function trackWindowWidth() {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);

useEffect(
    function applyUserTheme() {
        if (user?.preferences?.theme) {
            document.body.className = user.preferences.theme;
        }
    },
    [user?.preferences?.theme],
);
```

Если вы не можете назвать эффект ясно, значит, он делает слишком много. React и сам рекомендует разделять эффекты по ответственности, а не по фазам lifecycle.

Имя делает этот принцип видимым так, как комментарии никогда не смогут, потому что комментарии устаревают, а имена читают.

Это работает не только для `useEffect`. Такой же выигрыш в читаемости есть и у `useCallback`, `useMemo`, и у reducer-функций.

Везде, где вы передаете в хук анонимную функцию, имя помогает следующему человеку, который будет читать код. Но `useEffect` дает максимальную отдачу, потому что эффекты хуже всего понимаются с первого взгляда. Они запускаются в неочевидные моменты, содержат скрытую семантику cleanup и заставляют вас мысленно восстанавливать, какие зависимости их триггерят.

И cleanup-функциям тоже можно давать имена. Вместо того чтобы возвращать анонимную стрелку, верните именованную функцию:

```js
useEffect(
    function pollServerForUpdates() {
        const intervalId = setInterval(() => {
            fetch(`/api/status/${serverId}`)
                .then((res) => res.json())
                .then(setServerStatus);
        }, 5000);

        return function stopPollingServer() {
            clearInterval(intervalId);
        };
    },
    [serverId],
);
```

Я не всегда даю имя cleanup-части, потому что чаще всего по контексту и так все очевидно. Но когда завершение делает что-то нетривиальное, симметрия между `pollServerForUpdates` и `stopPollingServer` мгновенно проясняет обе половины.

## Имена показывают эффекты, которым вообще не стоит существовать

Некоторые эффекты упорно не хотят нормально называться, и это сопротивление само по себе уже сигнал.

Если вы тянетесь к чему-то вроде `updateStateBasedOnOtherState` или `syncDerivedValue`, остановитесь.

Обычно такая расплывчатость означает, что этому коду не место в эффекте. Имя дается тяжело, потому что эффект делает то, что вообще не должно быть эффектом.

```js
// Скорее всего, это вам не нужно
useEffect(
    function syncFullName() {
        setFullName(`${firstName} ${lastName}`);
    },
    [firstName, lastName],
);

// Просто вычислите значение
const fullName = `${firstName} ${lastName}`;
```

Почему вариант с эффектом хуже? Потому что он запускает лишний цикл рендера.

React рендерит компонент, затем выполняет эффект, тот вызывает `setFullName`, и это запускает _еще один_ рендер уже с обновленным значением.

Экран обновляется дважды вместо одного раза, и вы получаете кадр, в котором `fullName` еще устарел.

Вариант с вычислением получает значение прямо во время рендера, поэтому оно всегда корректно, всегда синхронно и не создает для React никакой лишней работы.

```js
// Скорее всего, это вам тоже не нужно
useEffect(
    function resetFormOnSubmit() {
        if (submitted) {
            setName('');
            setEmail('');
            setSubmitted(false);
        }
    },
    [submitted],
);

// Делайте это в обработчике события
function handleSubmit() {
    submitForm({ name, email });
    setName('');
    setEmail('');
}
```

Сброс формы - это случай для event handler: пользователь нажал submit, это пользовательское действие, значит, и обрабатывать его нужно там, где это действие происходит. Вариант с эффектом реагирует на изменение флага `submitted`, и этот лишний промежуточный шаг только усложняет поток.

Я видел компоненты с восемью или девятью эффектами, где половина была просто синхронизацией одного state с другим, хотя эффектами это вообще быть не должно.

Инструменты AI-генерации кода усугубляют проблему, потому что они обучены на миллионах примеров неправильного использования эффектов и уверенно воспроизводят те же анти-паттерны. Ошибочное использование снова попадает в обучающие данные, и цикл продолжается.

Вернемся к примеру `InventorySync`. Четвертый эффект, `notifyParentOfStockUpdate`, как раз хорошо подходит для такой проверки.

Вызов родительского callback внутри эффекта, который реагирует на изменения state, React-документация прямо отмечает как один из паттернов в _"You Might Not Need an Effect"_.

Родитель мог бы сам получать эти данные, либо обновление stock могло бы вызывать callback в месте происхождения события: в обработчике WebSocket и в `.then` после `fetch`.

Я оставил этот пример в статье, потому что в реальных кодовых базах он встречается постоянно, но именно имя сделало проблему заметной. `notifyParentOfStockUpdate` честно говорит, что делает эффект, и именно эта честность заставляет спросить: а должен ли он вообще существовать?

Есть общий паттерн у имен, которые проходят такую проверку. Эффекты, действительно синхронизирующиеся с внешними системами, обычно имеют ясные, конкретные имена: `connectToWebSocket`, `initializeMapInstance`, `subscribeToGeolocation`. Глаголы подсказывают, что это за тип эффекта: `subscribe` и `listen` означают событийную природу, `synchronize` и `apply` - поддержание внешней системы в актуальном состоянии, `initialize` - одноразовую инициализацию.

Если лучшее имя, которое вы можете придумать, звучит как перекладывание внутреннего state, значит, этому коду, скорее всего, место где-то еще.

React 19 заходит еще дальше: мутации обрабатывают Actions, `use()` занимается загрузкой данных, а Server Components вообще убирают клиентские эффекты из процесса загрузки данных.

Эффекты, которые остаются в современном React-приложении, и есть настоящие точки синхронизации. Вот их-то и стоит называть хорошо.

## Имена vs пользовательские хуки

Кайл Шевлин написал отличный текст под названием `useEncapsulation`, где утверждает, что любое использование `useEffect` должно жить внутри пользовательского хука.

Его аргументация начинается с реальной проблемы: по мере того как в компоненте становится больше хуков, детали одной ответственности разъезжаются между несвязанными объявлениями других хуков.

Пользовательские хуки исправляют это, потому что собирают состояние, эффекты и обработчики для одной ответственности в одном месте:

```js
function useWindowWidth() {
    const [width, setWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 0,
    );

    useEffect(function trackWindowWidth() {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return width;
}
```

(Проверка `typeof window !== 'undefined'` нужна для SSR-фреймворков вроде Next.js, где `window` не существует в момент первого серверного рендера компонента. Если вы пишете чисто клиентское приложение, можно использовать `window.innerWidth` напрямую.)

Но обратите внимание на `useWindowWidth`: даже внутри пользовательского хука я все равно дал имя `useEffect`.

В пользовательском хуке тоже может быть несколько эффектов, и когда вы отлаживаете такой хук изнутри, именованные функции в стеке вызовов все так же помогают.

При этом не все подряд нужно выносить в пользовательский хук. Иногда у компонента есть одноразовый эффект, специфичный только для его поведения и никогда больше не переиспользуемый.

Вынести его в `useCloseOnEscapeKeyForThisSpecificModal` - значит добавить лишний уровень косвенности без пользы. React-документация и сама предостерегает от преждевременной абстракции: то, что function components становятся длиннее по мере роста логики, нормально, и не каждый кусок кода нужно переносить в отдельный файл в ту же секунду, как он появился.

Обычно я пользуюсь такой формулой: если эффект управляет собственным состоянием и потенциально может переиспользоваться, делайте из него пользовательский хук. Если это одноразовый эффект без связанного состояния, дайте функции имя и оставьте ее inline.

В обоих случаях давайте функции имя. При желании можно еще и вынести основную логику в отдельный модуль, чтобы тестировать ее юнитами без рендера компонента; это особенно хорошо работает для эффектов, взаимодействующих со сторонними SDK или сложными внешними системами.

## Пять эффектов превратились в три

Небольшая история. Примерно год назад я работал над Next.js-проектом, где был компонент, синхронизирующий экземпляр Mapbox с состоянием приложения. В нем было пять эффектов: один инициализировал экземпляр карты, один синхронизировал zoom, один синхронизировал координаты центра карты, один обрабатывал клики по маркерам, и еще один удалял обработчики событий, когда менялся набор выбранных маркеров.

Каждый раз, открывая этот файл, я тратил секунд 30, чтобы заново сориентироваться: проматывал вверх-вниз и вспоминал, какой анонимный эффект за что отвечает.

Я дал им имена: `initializeMapSDK`, `synchronizeZoomLevel`, `synchronizeCenterPosition`, `handleMarkerInteractions`, `cleanupStaleMarkerListeners`. Сразу стало понятно, куда смотреть при любой конкретной отладке.

Но имена дали и еще один эффект.

Когда я увидел все пять имен списком, стало ясно, что `cleanupStaleMarkerListeners` на самом деле не является отдельной ответственностью по сравнению с `handleMarkerInteractions`.

Это была cleanup-половина той же самой синхронизации: одна часть добавляла обработчики, а эта удаляла старые.

Я объединил их в один эффект с нормальным cleanup через `return`, и компонент стал проще. Потом я заметил, что `synchronizeZoomLevel` и `synchronizeCenterPosition` одинаково зависят от готовности экземпляра карты и фактически всегда выполняются вместе. Я объединил их в `synchronizeMapViewport`.

Пять эффектов превратились в три, и границы у этих трех стали намного яснее, чем у исходных пяти.

Серхио Ксаламбри писал о том, что функциям в `useEffect` стоит давать имена, еще в 2020 году. Кори Хаус говорил то же самое. Это не новая мысль. Но почти никто так не делает, потому что сообщество коллективно усвоило `useEffect(() => {` как единственный способ писать эффекты.

Мы копируем из документации, из туториалов, из AI-сгенерированного кода. Анонимная стрелка стала значением по умолчанию, а от значений по умолчанию трудно уйти.

Цена перехода почти нулевая. Вам не нужна новая библиотека или плагин сборки. Нужно просто добавить имя функции, и вы заметите разницу в первый же раз, когда откроете старый файл и вам не придется перечитывать каждый эффект, чтобы вспомнить, что он делает.

Давайте имена своим эффектам.

## Ссылки

- Kyle Shevlin, [`useEncapsulation`](https://kyleshevlin.com/use-encapsulation/) - аргумент в пользу того, чтобы оборачивать все хуки в пользовательские хуки, плюс ESLint-плагин `eslint-plugin-use-encapsulation`
- Документация React, [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- Документация React, [Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- Legacy-документация React, [Rules of Hooks](https://legacy.reactjs.org/docs/hooks-rules.html) - использует именованные function expressions в примерах
- Dan Abramov, [A Complete Guide to useEffect](https://overreacted.io/a-complete-guide-to-useeffect/)
- Sergio Xalambrí, [Pro Tip: Name your useEffect functions](https://sergiodxa.com/articles/pro-tip-name-your-useeffect-functions)
- Nate Liu, [1 second refactor tip: readability and maintainability by naming your function](https://liunate.medium.com/1-second-refactoring-readability-and-maintainability-by-naming-your-function-e-g-react-useeffect-77c7a92d37aa)
- deckstar, [React Pro Tip #1 - Name your useEffect!](https://dev.to/deckstar/react-pro-tip-1-name-your-useeffect-54ck)

<small>Источник - <https://neciudan.dev/name-your-effects></small>
