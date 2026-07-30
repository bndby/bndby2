---
date: 2026-07-25
description: 'Разбираемся, как Proxy перехватывает операции над объектами, как работают ловушки и Proxy.revocable, а также как Reflect помогает сохранять инварианты JavaScript.'
tags:
    - Javascript
categories:
    - JS
slug: proxy-and-reflect
---

# Proxy и Reflect

Объект — это набор свойств — _эй_! Только не закатывай глаза! Да, я знаю, что эта фраза уже приближается к уровню «митохондрии — электростанции клетки», но обещаю: сейчас мы подойдём к теме с новой стороны.

<!-- more -->

Кхм. _Объект — это набор свойств_, внутренних слотов и внутренних методов, которые позволяют взаимодействовать с этими свойствами. Когда вы вводите `({}).theProperty` в консоли разработчика, вы ожидаете, что запустится следующая операция в духе «выбери своё приключение»:

- Находится ли этот ключ где-нибудь в цепочке прототипов объекта?
    - Да.
        - Это свойство-данные?
            - Результатом будет значение из дескриптора свойства.
        - Это свойство-аксессор?
            - Вызывается геттер, а результатом становится значение, возвращённое этим методом.
    - Нет.
        - Результатом будет `undefined`.

Само использование синтаксиса доступа к свойству не представляет все эти шаги — скорее, точечная нотация является API, запускающим [внутреннюю операцию `[[Get]]`, определённую спецификацией](https://tc39.es/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots-get-p-receiver), а результат определяется шагами этой операции `[[Get]]`.

Мы не можем вмешаться и изменить конкретные шаги внутренних методов объекта — да и вряд ли захотели бы: это территория движка JavaScript. Зато мы можем _перехватить_ эти операции с помощью объекта-**прокси** и изменить, расширить или полностью _переопределить_ работу объекта на самом фундаментальном уровне.

Конструктор `Proxy` позволяет создать объект, выступающий прокси для целевого объекта. С его помощью можно перехватывать и переопределять операции над целевым объектом, используя прокси как посредника.

При вызове с `new` конструктор `Proxy` возвращает объект — ничего неожиданного. Он принимает два аргумента: **целевой объект** и **объект-обработчик**:

```js
const targetObject = {
    theProperty: 'A string.',
};
const handlerObject = {};
const theProxyObject = new Proxy(targetObject, handlerObject);

console.log(theProxyObject);

/* Result (Firefox, expanded):
Proxy { <target>: {…}, <handler>: {} }
  <target>: Object { theProperty: "A string." }
  <handler>: Object {  }
*/

/* Result (Chrome, expanded):
Proxy(Object) {theProperty: 'A string.'}
  [[Handler]]: Object
  [[Target]]: Object
  [[IsRevoked]]: false
*/
```

В консоли здесь нет ничего _слишком_ неожиданного. Только что созданный прокси содержит ссылку на целевой объект и набор внутренних слотов, обозначаемых `<>` или `[[]]` — в зависимости от браузера. Это показывает, что мы не должны взаимодействовать с этими слотами _напрямую_, как со строковым ключом свойства. `[[Target]]` — внутренний слот, представляющий объект, с которым мы хотим работать, включая определённое нами свойство. `[[Handler]]` представляет объект-обработчик, который служит посредником при взаимодействии с целевым объектом.

!!!info ""

    Уверен, вы сразу заметили `[[isRevoked]]` в Chrome. Не волнуйтесь, мы не столкнулись с серьёзным расхождением в поведении браузеров из эпохи 2010 года — это всего лишь различие в отображении внутреннего слота. Скоро мы до него доберёмся.

Если изменить значение свойства, определённого в целевом объекте, это изменение будет видно через ссылку на него из объекта-прокси:

```js
const targetObject = {
    theProperty: 'A string.',
};
const handlerObject = {};
const theProxyObject = new Proxy(targetObject, handlerObject);

targetObject.theProperty = 'Something else.';

console.log(theProxyObject);
/* Result (expanded):
Proxy { <target>: {…}, <handler>: {} }
  <target>: Object { theProperty: "Something else." }
  <handler>: Object {  }
*/
```

На первый взгляд это похоже на классическую работу «по ссылке»: «значения объектов хранятся по ссылке», «объекты — это набор свойств», «объекты — электростанции скрипта» и _так далее_. Однако помните: речь идёт не о переменных или свойствах — в данном случае сам объект-прокси является ссылкой на целевой объект. Этот прокси можно полностью использовать вместо целевого объекта:

```js
const targetObject = {
    theProperty: 'A string.',
};
const handlerObject = {};
const theProxyObject = new Proxy(targetObject, handlerObject);

console.log(theProxyObject.theProperty);

// Result: A string.
```

Доступ к свойству объекта-прокси фактически означает доступ к этому свойству целевого объекта _через_ прокси. Нельзя и обычным способом определить собственное свойство прокси — вместо этого свойство будет определено в целевом объекте:

```js
const targetObject = {
    theProperty: 'A string.',
};
const handlerObject = {};
const theProxyObject = new Proxy(targetObject, handlerObject);

theProxyObject.theOtherProperty = 'Another string';

console.log(theProxyObject);

/* Result (expanded):
Proxy { <target>: {…}, <handler>: {} }
  <target>: Object { theProperty: "A string.", theOtherProperty: "Another string" }
  <handler>: Object {  }
*/
```

В том виде, в котором мы использовали прокси до сих пор, мы фактически создали необычное ссылочное значение с лишними шагами. Это лишь потому, что мы не просили объект-обработчик _делать_ что-либо через прокси: здесь обработчик просто переводит с одного языка на тот же самый язык. Сценарий применения становится понятнее, когда мы начинаем создавать в обработчике **функции-обработчики**, иногда называемые **ловушками**:

```js
const targetObject = {
    theProperty: 'A string.',
};
const handlerObject = {
    get() {
        return 'Something else entirely.';
    },
};
const theProxyObject = new Proxy(targetObject, handlerObject);

console.log(theProxyObject.theProperty);
// Result: "Something else entirely." )
```

Для [каждой операции, которую можно выполнить над объектом, существует соответствующая ловушка](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions), причём имена у них достаточно предсказуемы. Метод `get()`, определённый в обработчике, — ловушка для внутреннего метода `[[Get]]`, который срабатывает при попытке получить значение свойства объекта. Возвращая таким способом явное значение, мы, по сути, нарушили нормальную операцию `[[Get]]`: перехватили её и изменили результат. Теперь независимо от того, что происходит с `targetObject`, попытка получить значение любого свойства вернёт именно то, что мы указали:

```js
const targetObject = {
    theProperty: 'A string.',
};
const handlerObject = {
    get() {
        return "You've just activated my trap function!";
    },
};
const theProxyObject = new Proxy(targetObject, handlerObject);

console.log(theProxyObject);

/* Result (expanded):
Proxy { <target>: {…}, <handler>: {…} }
  <target>: Object { theProperty: "A string." }
  <handler>: Object { get: get() }
*/

targetObject.newProperty = true;

console.log(theProxyObject);

/* Result (expanded):
Proxy { <target>: {…}, <handler>: {…} }
  <target>: Object { theProperty: "A string.", newProperty: true }
  <handler>: Object { get: get() }
*/

console.log(theProxyObject.newProperty);
// Result: You've just activated my trap function!

console.log(theProxyObject['newProperty']);
// Result: You've just activated my trap function!
```

Как и любая функция, эта ловушка может выполнять любые нужные нам действия:

```js
const targetObject = {
    theProperty: true,
};
const handlerObject = {
    get() {
        console.log('Psych!');
        return false;
    },
};
const theProxyObject = new Proxy(targetObject, handlerObject);

console.log(theProxyObject.theProperty);

/* Result:
Psych!
false
*/
```

Разумеется, это позволяет управлять результатами операций тоньше, чем с помощью `console.log` и строки. Метод `get()` объекта-обработчика принимает три аргумента: целевой объект, ключ свойства и «получатель» (`receiver`). Последний понятие более высокого уровня: аргумент `receiver` представляет значение `this` внутри геттера — ссылку на [объект, связанный с методом `get`](https://piccalil.li/blog/javascript-what-is-this/) [в момент вызова этого метода](https://piccalil.li/blog/javascript-when-is-this/). Это может звучать неоднозначно, как обычно бывает с `this`, но в большинстве случаев получателем будет целевой объект.

Используя эти аргументы, мы можем с помощью метода `get` получать и изменять значения свойств целевого объекта:

```js
const targetObject = {
    theProperty: 10,
};
const handlerObject = {
    get(target, propertyKey, receiver) {
        return target[propertyKey] * 2;
    },
};
const theDoubleObject = new Proxy(targetObject, handlerObject);

console.log(theDoubleObject.theProperty);
// Result: 20
```

!!!info "FYI"

    Вернёмся к `[[isRevoked]]`, теперь, когда вы знаете, что именно можно _отозвать_. Существует второй способ создать объект-прокси — фабричная функция `Proxy.revocable()`.

    ```js
    const targetObject = {};
    const handlerObject = {};
    const revocableProxy = Proxy.revocable(targetObject, handlerObject);
    ```

    Объект, возвращаемый вызовом `Proxy.revocable` (с теми же аргументами target и handler, что и `new Proxy`), содержит два свойства. Первое свойство, `proxy`, вполне предсказуемо содержит объект-прокси и имеет то же значение, что и прокси, созданный конструктором `Proxy` с такими же аргументами.

    Второе свойство — метод `revoke`, который можно использовать, чтобы отсоединить прокси от целевого объекта:

    ```js
    const revocableProxy = Proxy.revocable({}, {});

    console.log(revocableProxy);

    /* Result (expanded):
    Object { proxy: Proxy, revoke: () }
    proxy: Proxy { <target>: {}, <handler>: {} }
        <target>: Object {  }
        <handler>: Object {  }
    revoke: function ()
    */

    /* Result (Chrome, expanded):
    Object { proxy: Proxy, revoke: () }
    proxy: Proxy(Object)
        [[Handler]]: Object
        [[Target]]: Object
        [[IsRevoked]]: false
    revoke: ƒ ()
    */
    ```

    Вызов `revoke()` отменяет проксирование объекта: после вызова прокси, возвращённый `Proxy.revocable()`, больше не будет хранить ссылки на целевой объект и обработчик:

    ```js
    const revocableProxy = Proxy.revocable({}, {});

    revocableProxy.revoke();

    console.log(revocableProxy);

    /* Result (expanded):
    Object { proxy: Proxy, revoke: () }
    proxy: Proxy { <target>: {}, <handler>: {} }
        <target>: null
        <handler>: null
    revoke: function ()
    */

    /* Result (Chrome, expanded):
    Object { proxy: Proxy, revoke: () }
    proxy: Proxy(Object)
        [[Handler]]: null
        [[Target]]: null
        [[IsRevoked]]: true
    revoke: ƒ ()
    */
    ```

    Помните: «отозванный» означает именно _отозванный_ — после вызова `revoke` пути назад нет. Если других ссылок на прокси не существует, он становится доступен для сборки мусора; то же относится к целевому объекту и обработчику, если на них больше нигде нет ссылок.

    Насколько я понимаю, движок JavaScript в Chrome показывает внутренний слот `[[isRevoked]]` в консоли разработчика для быстрой отладки. В самом языке (пока) нет способа напрямую получить значение этого внутреннего слота. Отзыв прокси одинаково хорошо работает в обоих браузерах.

У каждого внутреннего метода объекта есть соответствующая ловушка. Это означает, что можно изменить базовое поведение _любого объекта, на любом уровне и во всём языке_:

```js
const targetObject = {
    theProperty: 'Still here.',
};

const handlerObject = {
    deleteProperty(target, key) {
        console.log('No.');
        return false;
    },
    has(target, key) {
        console.log('None of your business.');
        return false;
    },
    getPrototypeOf(target) {
        console.log('Who knows?');
        return null;
    },
};

const theImmovableObject = new Proxy(targetObject, handlerObject);

delete theImmovableObject.theProperty;
/* Result:
No.
false
*/

console.log(theImmovableObject.theProperty);
// Result: Still here.

console.log('theProperty' in theImmovableObject);
/* Result: 
None of your business.
false
*/

console.log(Object.getPrototypeOf(theImmovableObject));
/* Result: 
Who knows?
null
*/
```

Так что просто убедитесь, что делаете это правильно.

Никакого давления.

Кстати, раз уж заговорили:

## Reflect

В приведённых до сих пор примерах кода вы, возможно, заметили несколько вещей. Во-первых, мы веселимся так, будто на дворе 2009 год, — обращаемся к свойствам с помощью _старомодной_ скобочной нотации.

Во-вторых, немного странно выполнять `[[Get]]` для получения значения свойства в контексте изменения самой работы `[[Get]]`, используя как раз тот синтаксис, который мы меняем. Всё работает, но с точки зрения строгой технической эстетики что-то _не так_.

В-третьих, и это _безусловно_ самое важное: нарушение таких основополагающих предположений, как «если я создаю свойство объекта, всё произойдёт ожидаемым образом», _обязательно_ рано или поздно приведёт к проблемам в коде. Возможность изменять саму сущность объектов проводит тончайшую границу между «захватывающе» и «ужасающе», особенно с точки зрения будущей поддержки. Одна мысль о кодовой базе, заполненной объектами, которые _могут вести себя как объекты, а могут и не вести_, способна породить кошмары.

Поэтому [спецификация ES-262 предусмотрительно описывает следующие **инварианты**](https://tc39.es/ecma262/#sec-proxy-object-internal-methods-and-internal-slots-set-p-v-receiver) для `[[Set]]` — то есть правила, которым должна следовать операция `[[Set]]`:

!!!info ""

    - Результатом `[[Set]]` является логическое значение.
    - Нельзя изменить значение свойства на отличное от значения соответствующего свойства целевого объекта, если это собственное свойство-данные целевого объекта является недоступным для записи и настройки.
    - Нельзя установить значение свойства, если соответствующее свойство целевого объекта является ненастраиваемым собственным свойством-аксессором, у которого атрибут `[[Set]]` равен `undefined`.

Как только вы начинаете менять работу `[[Set]]`, соблюдение этих правил становится вашей ответственностью. Если написать что-то вроде следующего:

```js
const handlerObject = {
    set(target, propertyKey, value, receiver) {
        return (target[propertyKey] = value * 2);
    },
};

const setDoubler = new Proxy({}, handlerObject);

setDoubler.theProperty = 2;

console.log(setDoubler.theProperty);
// Result: 4
```

Моя операция `[[Set]]` не вернула логическое значение, которого требует JavaScript согласно священным инвариантам `[[Set]]`. Правда, этот фрагмент всё ещё _работает_: мы находимся не в строгом режиме, возвращённое значение приводится к Boolean и в данном случае оказывается истинным. Но в любом контексте это работать не будет:

```js
'use strict';
const handlerObject = {
    set(target, propertyKey, value, receiver) {
        return (target[propertyKey] = value * 2);
    },
};

const setDoubler = new Proxy({}, handlerObject);

setDoubler.theProperty = 0;

console.log(setDoubler.theProperty);

// Result: Uncaught TypeError: proxy set handler returned false for property '"theProperty"'
```

Разумеется, можно переписать код и явно вернуть ожидаемое логическое значение. Но даже при работе с таким простым методом обработчика мы оказываемся в ситуации «нужно всегда внимательно делать _это_ именно _так_», чтобы не добавить в кодовую базу принципиально неисправные объекты. Никому это не нужно.

Это подводит нас к объекту `Reflect` — набору статических методов, каждый из которых имеет то же имя и параметры, что и методы обработчика прокси. `Reflect` предоставляет ограничители, помогающие решить все перечисленные проблемы (включая не самые приятные ощущения), и набор методов для взаимодействия с объектами, гарантирующих, что мы не слишком далеко отклонимся от того, как объекты _должны_ работать.

`Reflect` — это **объект пространства имён**: обычный объект со статическими свойствами и методами, подобный объектам `Math` или [`Temporal`](https://piccalil.li/blog/date-is-out-and-temporal-is-in/):

```js
console.log(Reflect);

/* Result (expanded):
  apply: function apply()
  construct: function construct()
  defineProperty: function defineProperty()
  deleteProperty: function deleteProperty()
  get: function get()
  getOwnPropertyDescriptor: function getOwnPropertyDescriptor()
  getPrototypeOf: function getPrototypeOf()
  has: function has()
  isExtensible: function isExtensible()
  ownKeys: function ownKeys()
  preventExtensions: function preventExtensions()
  set: function set()
  setPrototypeOf: function setPrototypeOf()
  Symbol(Symbol.toStringTag): "Reflect"
*/
```

Каждый из этих методов соответствует имени метода обработчика прокси и принимает те же параметры в том же порядке. Их синтаксис гораздо лучше подходит для текущего контекста, чем скобочная нотация. Уже одно это, на мой взгляд, _заметно_ улучшает ситуацию:

```js
const handlerObject = {
    set(target, propertyKey, value) {
        return Reflect.set(target, propertyKey, value * 2);
    },
};

const setDoubler = new Proxy({}, handlerObject);

setDoubler.theProperty = 2;

console.log(setDoubler.theProperty);
// Result: 4
```

Никаких сложностей и, что самое важное, не нужно перечитывать спецификацию ES-262, чтобы убедиться, что мы случайно не нарушаем _правила игры для объектов_: `Reflect.set()` выполняет нужную нам операцию `[[Set]]` _и_ возвращает ожидаемое спецификацией логическое значение. С помощью `Proxy` мы меняем работу объектов, а с помощью `Reflect` убеждаемся, что изменённые объекты всё ещё работают так, как _должны_.

## Собираем всё вместе

Собрав всё вместе, мы можем использовать объекты-прокси и `Reflect` для таких задач, как проверка данных:

```js
const validationHandler = {
    set(target, propertyKey, value, receiver) {
        if (typeof value === 'string') {
            return Reflect.set(target, propertyKey, value);
        } else {
            console.error('This object only accepts strings.');
            return false;
        }
    },
};
const validatedObject = new Proxy({}, validationHandler);

validatedObject.newProperty = true;
// Result: This object only accepts strings.

console.log(validatedObject);
/* Result:
Proxy { <target>: {}, <handler>: {…} }
  <target>: Object {  }
  <handler>: Object { set: set(target, propertyKey, value, receiver) }
*/
```

…или [установки и поддержки внутреннего состояния объекта](https://codepen.io/Wilto/pen/dPNNKdJ), например количества обращений к определённому свойству объекта:

```js
const handlerObject = {
    accessCounter(target, accessed) {
        Reflect.set(target, 'timesAccessed', accessed ? accessed + 1 : 1);
    },
    set(target, key, value) {
        this.accessCounter(target, Reflect.get(target, 'timesAccessed'));

        return Reflect.set(target, key, value);
    },
    get(target, key) {
        this.accessCounter(target, Reflect.get(target, 'timesAccessed'));

        return Reflect.get(target, key);
    },
};

const stateObject = new Proxy({}, handlerObject);

console.log(stateObject);

/* Result (expanded):
Proxy { <target>: {…}, <handler>: {…} }
  <target>: Object {  }
  <handler>: Object { accessCounter: accessCounter(accessed), set: set(target, propertyKey, value, receiver), get: get(target, propertyKey, receiver) }
*/

stateObject.newProperty = true;
// Result: true

console.log(stateObject);
/* Result (expanded):
Proxy { <target>: {…}, <handler>: {…} }
  <target>: Object { timesAccessed: 1, newProperty: true }
  <handler>: Object { accessCounter: accessCounter(accessed), set: set(target, propertyKey, value, receiver), get: get(target, propertyKey, receiver) }
*/

console.log(stateObject.newProperty);
// Result: true

console.log(stateObject);
/* Result (expanded):
Proxy { <target>: {…}, <handler>: {…} }
  <target>: Object { timesAccessed: 2, newProperty: true }
  <handler>: Object { accessCounter: accessCounter(accessed), set: set(target, propertyKey, value, receiver), get: get(target, propertyKey, receiver) }
*/
```

При работе с одним объектом это, конечно, скорее любопытные приёмы. Но если применить [уже изученные подходы и синтаксис](https://piccalil.li/javascript-for-everyone) и добавить немного воображения, нетрудно представить, как с помощью ещё нескольких строк кода объекты-прокси могут создать целую _систему_ состояния без громоздких фреймворков и сторонних инструментов:

```js
function reactiveState(target) {
    const subscribed = new Map();

    return new Proxy(
        {
            ...target,
            subscribe(key, callbackFunc) {
                // Если ключа ещё нет, добавляем его в `subscribed`:
                if (!subscribed.has(key)) {
                    subscribed.set(key, []);
                }
                // Связываем функцию обратного вызова с подписанным объектом:
                subscribed.get(key).push(callbackFunc);
            },
        },
        {
            set(target, key, value, receiver) {
                const result = Reflect.set(target, key, value);

                // Если это свойство, на которое подписались...
                if (subscribed.has(key)) {
                    // ...вызываем функцию обратного вызова с явным значением `this` исходного объекта:
                    subscribed
                        .get(key)
                        .forEach((callbackFunc) =>
                            callbackFunc.call(receiver, key),
                        );
                }

                return result;
            },
        },
    );
}

// Объявляем функцию обратного вызова, вызываемую при изменении состояния объекта:
const callbackLogger = function (key) {
    const enCardinal = new Intl.PluralRules('en-US');
    const counter = this[key];
    const pluralize = (count) =>
        enCardinal.select(counter) === 'one' ? `` : `s`;

    console.info(
        `${this.component}.${key} has been changed ${counter} time${pluralize(counter)}.`,
    );
};

const widget = reactiveState({ component: 'widget', count: 0 });
const gizmo = reactiveState({ component: 'gizmo', otherCounter: 0 });

// При изменении свойства `count` объекта widget вызываем callbackLogger:
widget.subscribe('count', callbackLogger);

// При изменении свойства `otherCounter` объекта gizmo вызываем callbackLogger:
gizmo.subscribe('otherCounter', callbackLogger);

widget.count++;
// Result: widget.count has been changed 1 time.

widget.count++;
// Result: widget.count has been changed 2 times.

// Мы не подписывались на свойство `count` объекта gizmo, поэтому здесь ничего не происходит:
gizmo.count++;

// Но мы подписались на свойство `otherCounter` объекта gizmo:
gizmo.otherCounter++;
// Result: gizmo.otherCounter has been changed 1 time.

widget.count++;
// Result: widget.count has been changed 3 times.
```

Послушайте. Я не хочу добавлять сюда _ещё_ больше клише, но признаю: есть соблазн закончить этот урок призывом к умеренности — предупредить, что объекты-прокси «настолько же опасны, насколько могущественны», поговорить о «большой силе и большой ответственности» и _так далее_, а затем добавить, что `Reflect` хотя бы даёт некоторую сухую утешительную защиту. Этот импульс взялся не _из ниоткуда_: изменение работы базовых строительных блоков языка на фундаментальном уровне может _серьёзно_ всё сломать. Тут не поспоришь.

Но вы меня знаете: если бы я хотел тратить кортизол на «переживания из-за ошибок», я бы пошёл в медицинский или выучил PHP. По-моему, `Proxy` и `Reflect` — новые сияющие примеры неувядающего духа JavaScript: использовать язык, чтобы менять язык, и находить новые способы решать задачи, о которых даже не думали сотни людей, державших [мяч](https://262.ecma-international.org/16.0/index.html) в руках с 1995 года.

Объект `Reflect` даёт важные ограничители, которые помогут избежать головной боли в будущем. Конечно, ими стоит пользоваться — именно для этого они и существуют.

Но я не стану говорить вам «будьте осторожны». Идите и ломайте — лучшего способа учиться не существует. В конце концов, что не исправить перезагрузкой страницы?

<small>Источник: <https://piccalil.li/blog/proxy-and-reflect/></small>
